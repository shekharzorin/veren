import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WalletService } from '../services/wallet.service';
import { SettingsService } from '../services/settings.service';

const prisma = new PrismaClient();
import { AuditService } from '../services/audit.service';

interface AuthRequest extends Request {
    user?: any;
}

export const createEOI = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, clientId, amount, unitId } = req.body;
        const agentId = req.user.id;

        // 1. Fetch Project Details
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // 2. Check logic if Eligibility Mode is enabled
        if (project.eligibilityMode) {
            const client = await prisma.client.findUnique({
                where: { id: clientId }
            });

            if (!client) return res.status(404).json({ error: 'Client not found' });

            const isBlocked = await prisma.blockedClient.findFirst({
                where: {
                    projectId,
                    phone: client.phone
                }
            });

            if (isBlocked) {
                return res.status(403).json({ error: 'Client is not eligible for this project (Direct/Protected)' });
            }
        }

        // 3. Check Max EOIs per Unit limit
        if (unitId) {
            const unit = await prisma.unit.findUnique({ where: { id: unitId } });
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            const existingEOIs = await prisma.eOI.count({
                where: { projectId, unitId }
            });

            if (existingEOIs >= project.maxEOIsPerUnit) {
                return res.status(400).json({ error: 'Max EOIs reached for this unit' });
            }
        }

        // 4. Create EOI
        const eoi = await prisma.eOI.create({
            data: {
                projectId,
                clientId,
                amount: parseFloat(amount),
                unitId: unitId || null,
                status: 'HELD',
                expiresAt: new Date(Date.now() + project.eoiExpiryHours * 60 * 60 * 1000)
            }
        });

        res.status(201).json(eoi);
    } catch (error) {
        console.error('EOI Creation Error:', error);
        res.status(500).json({ error: 'Failed to create EOI' });
    }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, clientId, unitId, amount } = req.body;
        const agentId = req.user.id;

        // 1. Transactional Integrity for Booking
        const result = await prisma.$transaction(async (tx) => {
            // Check if already booked
            const existing = await tx.booking.findFirst({
                where: { projectId, unitId }
            });

            if (existing) {
                throw new Error('Unit already booked');
            }

            // 2. Create Booking
            const booking = await tx.booking.create({
                data: {
                    projectId,
                    clientId,
                    unitId,
                    amount: parseFloat(amount),
                    unitPrice: req.body.unitPrice ? parseFloat(req.body.unitPrice) : 0,
                    agentId
                }
            });

            // Mark Unit as BOOKED
            await tx.unit.update({
                where: { id: unitId },
                data: { status: 'BOOKED' }
            });


            // 3. ALLOCATION LOGIC (The Truth Engine)

            // A. Check for Winning EOI validity (Earliest PAID for this Unit)
            const earliestPaidEOI = await tx.eOI.findFirst({
                where: { projectId, unitId, status: 'PAID' },
                orderBy: { createdAt: 'asc' }
            });

            if (earliestPaidEOI && earliestPaidEOI.clientId !== clientId) {
                throw new Error('This unit is allocated to another client (Earliest EOI wins).');
            }

            // A. Find Winning EOI (Same Client, Same Unit, Status PAID)
            // Note: If multiple EOIs from same client for same unit, take the earliest one.
            const winningEOI = await tx.eOI.findFirst({
                where: {
                    projectId,
                    clientId,
                    unitId,
                    status: 'PAID'
                },
                orderBy: { tokenNumber: 'asc' } // Or createdAt
            });

            if (winningEOI) {
                await tx.eOI.update({
                    where: { id: winningEOI.id },
                    data: { status: 'CONVERTED' }
                });
                // Note: EOI Money is usually adjusted in Booking Amount or Refunded?
                // PRD: "Booking -> applied or refunded". 
                // Let's assume for this logic we just mark converted.
                // If applied, we might need to move funds from Escrow -> Developer.
                // Let's do that transfer: EOI Amount -> Developer Wallet.

                // Only if Escrow has funds? 
                // We should credit Developer with EOI Amount (part of booking).
                const project = await tx.project.findUnique({ where: { id: projectId } });
                if (project) {
                    const developerWallet = await WalletService.ensureWallet(project.developerId, 'DEVELOPER');
                    const escrowWallet = await WalletService.ensureWallet(projectId, 'ESCROW', true);
                    const platformWallet = await WalletService.ensureWallet('AMOG_PLATFORM', 'AMOG' as any); // Using 'AMOG' type (need to handle if not in Enum or just String)

                    // Fee Calculation
                    const PLATFORM_FEE_PERCENT = await SettingsService.get('PLATFORM_FEE_PERCENT', 0.05);
                    const feeAmount = winningEOI.amount * PLATFORM_FEE_PERCENT;
                    const netDeveloperAmount = winningEOI.amount - feeAmount;

                    // 1. Debit Escrow (Full Amount)
                    await tx.wallet.update({
                        where: { id: escrowWallet.id },
                        data: {
                            balance: { decrement: winningEOI.amount },
                            transactions: {
                                create: {
                                    amount: winningEOI.amount,
                                    type: 'DEBIT',
                                    category: 'BOOKING_ADJUSTMENT',
                                    referenceId: booking.id,
                                    referenceType: 'BOOKING',
                                    description: `EOI Consolidated Debit for Unit ${unitId}`
                                }
                            }
                        }
                    });

                    // 2. Credit Developer (Net Amount)
                    await tx.wallet.update({
                        where: { id: developerWallet.id },
                        data: {
                            balance: { increment: netDeveloperAmount },
                            transactions: {
                                create: {
                                    amount: netDeveloperAmount,
                                    type: 'CREDIT',
                                    category: 'BOOKING_ADJUSTMENT',
                                    referenceId: booking.id,
                                    referenceType: 'BOOKING',
                                    description: `Net EOI Credit (minus 5% fee) for Unit ${unitId}`
                                }
                            }
                        }
                    });

                    // 3. Credit Platform (Fee Amount)
                    await tx.wallet.update({
                        where: { id: platformWallet.id },
                        data: {
                            balance: { increment: feeAmount },
                            transactions: {
                                create: {
                                    amount: feeAmount,
                                    type: 'CREDIT',
                                    category: 'PLATFORM_FEE',
                                    referenceId: booking.id,
                                    referenceType: 'BOOKING',
                                    description: `5% Platform Fee from Unit ${unitId}`
                                }
                            }
                        }
                    });
                }
            }

            // B. Find Losing EOIs (Other Clients, Same Unit, Status PAID)
            const losingEOIs = await tx.eOI.findMany({
                where: {
                    projectId,
                    unitId,
                    status: 'PAID',
                    id: { not: winningEOI?.id } // Exclude winner
                }
            });

            for (const eoi of losingEOIs) {
                // Mark Refunded
                await tx.eOI.update({
                    where: { id: eoi.id },
                    data: { status: 'REFUNDED' }
                });

                // Auto-Refund Wallet Logic (Escrow -> Debit)
                const escrowWallet = await WalletService.ensureWallet(projectId, 'ESCROW', true, tx);

                await tx.wallet.update({
                    where: { id: escrowWallet.id },
                    data: {
                        balance: { decrement: eoi.amount },
                        transactions: {
                            create: {
                                amount: eoi.amount,
                                type: 'DEBIT',
                                category: 'REFUND',
                                referenceId: eoi.id,
                                referenceType: 'EOI',
                                description: `Auto-Refund: Unit ${unitId} allocated to another`
                            }
                        }
                    }
                });
            }

            // if it starts a NEW transaction. It expects booking to exist.
            // Since we are inside a tx, the booking is not committed yet.
            // We should run it AFTER this tx commits.

            return booking;
        });

        // Post-Transaction: Trigger Commission
        try {
            const { CommissionService } = require('../services/commission.service');
            // Dynamic import to avoid circular dep if any, or just import top level.
            // Better to import top level.
            await CommissionService.processBookingCommission(result.id);
        } catch (commError) {
            console.error('Commission Error (Non-blocking):', commError);
            // Don't fail the request, just log. Admin can retry.
        }


        // Audit Log
        AuditService.logEvent('BOOKING_CONFIRMATION', { bookingId: result.id, amount: result.amount, unitId }, req.user.id);

        res.status(201).json(result);
    } catch (error: any) {
        if (error.message === 'Unit already booked') {
            return res.status(409).json({ error: 'Unit already booked' });
        }
        console.error('Booking Error:', error);
        res.status(500).json({ error: 'Booking failed: ' + error.message });
    }
};

export const getTransactionDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const type = req.query.type as string; // EOI or BOOKING

        if (type === 'EOI') {
            const eoi = await prisma.eOI.findUnique({
                where: { id: id as string },
                include: { project: true, client: true }
            });

            if (!eoi) return res.status(404).json({ error: 'EOI not found' });

            // Queue Logic: If it has unitId, find position among PAID/HELD
            let queuePosition = null;
            if (eoi.unitId && (eoi.status === 'PAID' || eoi.status === 'HELD')) {
                const count = await prisma.eOI.count({
                    where: {
                        projectId: eoi.projectId,
                        unitId: eoi.unitId,
                        status: { in: ['PAID', 'HELD'] },
                        createdAt: { lt: eoi.createdAt }
                    }
                });
                queuePosition = count + 1;
            }

            return res.json({ ...eoi, queuePosition });
        } else if (type === 'BOOKING') {
            const booking = await prisma.booking.findUnique({
                where: { id: id as string },
                include: { project: true, client: true }
            });

            if (!booking) return res.status(404).json({ error: 'Booking not found' });

            return res.json(booking);
        }

        res.status(400).json({ error: 'Invalid type' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
};
export const getMyTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const agentId = req.user.id;

        // Fetch EOIs
        const eois = await prisma.eOI.findMany({
            where: {
                // Determine if we show ALL EOIs where user is agent?
                // EOI has clientId. Client belongs to Agent.
                // We should filter by clients belonging to agent OR link EOI to agent?
                // Our schema: EOI -> Project, Client. Client -> Agent.
                // So we find EOIs where client.agentId = req.user.id
                client: { agentId }
            },
            include: { project: true, client: true },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch Bookings
        const bookings = await prisma.booking.findMany({
            where: { agentId },
            include: { project: true, client: true },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich EOIs with Queue Position
        const enrichedEOIs = await Promise.all(eois.map(async (eoi) => {
            let queuePosition = null;
            if (eoi.unitId && (eoi.status === 'PAID' || eoi.status === 'HELD')) {
                const count = await prisma.eOI.count({
                    where: {
                        projectId: eoi.projectId,
                        unitId: eoi.unitId,
                        status: { in: ['PAID', 'HELD'] },
                        createdAt: { lt: eoi.createdAt }
                    }
                });
                queuePosition = count + 1;
            }
            return { ...eoi, queuePosition };
        }));

        res.json({ eois: enrichedEOIs, bookings });
    } catch (error) {
        console.error('Fetch My Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
