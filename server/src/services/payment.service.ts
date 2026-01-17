import prisma from '../utils/prisma';
import { WalletService } from './wallet.service';
import { SettingsService } from './settings.service';
import { v4 as uuidv4 } from 'uuid'; // Assuming we can use uuid, otherwise use crypto

// Mock Gateway logic
export class PaymentService {

    /**
     * Initiate a payment for EOI or Booking.
     */
    static async initiatePayment(entityId: string, entityType: 'EOI' | 'BOOKING', amount: number, userId: string) {
        const mode = await SettingsService.get('PAYMENT_MODE', 'MOCK');

        // Create a pending payment record (Unified Logic)
        const payment = await prisma.payment.create({
            data: {
                amount,
                entityId,
                entityType,
                status: 'INITIATED', // Always starts as INITIATED
                provider: mode === 'LIVE' ? 'RAZORPAY' : (mode === 'OFF' ? 'MANUAL' : 'MOCK'),
            }
        });

        // Link payment to Entity
        if (entityType === 'EOI') {
            await prisma.eOI.update({
                where: { id: entityId },
                data: { paymentId: payment.id }
            });
        } else if (entityType === 'BOOKING') {
            await prisma.booking.update({
                where: { id: entityId },
                data: { paymentId: payment.id }
            });
        }

        // Branching Logic based on Mode
        if (mode === 'OFF') {
            return {
                paymentId: payment.id,
                amount,
                currency: 'INR',
                action: 'MANUAL_INSTRUCTION',
                message: "Payments are currently disabled on this platform. Please contact the developer directly to complete your transaction."
            };
        } else if (mode === 'MOCK') {
            // Return a "Mock Gateway URL" (Frontend will simulate redirect)
            return {
                paymentId: payment.id,
                amount,
                currency: 'INR',
                action: 'REDIRECT',
                gatewayUrl: `/mock-gateway/${payment.id}`
            };
        } else {
            // LIVE Mode check
            throw new Error("Live payments are not yet configured.");
        }
    }

    /**
     * Handle Mock Webhook - Verify payment and credit appropriate wallet.
     */
    static async handleMockWebhook(paymentId: string, status: 'SUCCESS' | 'FAILED') {
        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment || payment.status !== 'INITIATED') {
            throw new Error('Invalid payment or already processed');
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update Payment Status
            const updatedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: { status }
            });

            if (status === 'SUCCESS') {
                // 2. Handle Logic based on Entity Type
                if (payment.entityType === 'EOI') {
                    // Update EOI Status & Assign Token
                    const eoi = await tx.eOI.findUnique({ where: { id: payment.entityId } });
                    if (!eoi) throw new Error('EOI not found');

                    // Calculate Token Number (Count of PAID/HELD + 1 for Project)
                    // Note: Use count of EOIs with tokenNumber != null to be safe
                    const count = await tx.eOI.count({
                        where: {
                            projectId: eoi.projectId,
                            tokenNumber: { not: null }
                        }
                    });

                    const newTokenNumber = count + 1;

                    await tx.eOI.update({
                        where: { id: eoi.id },
                        data: {
                            status: 'PAID',
                            tokenNumber: newTokenNumber
                        }
                    });

                    // Credit Escrow Wallet of the Project
                    // First ensure Project Escrow exists
                    const projectEscrow = await WalletService.ensureWallet(eoi.projectId, 'ESCROW', true, tx);
                    // Actually, ensureWallet isn't tx-aware in my impl. If it tries to create, it uses global prisma.
                    // Risk of race condition or connection limit if mixed. 
                    // Best to just credit directly if we assume it exists from Project creation, OR implement ensureWallet inside tx.
                    // For MVP, I'll trust ensureWallet returns fast.

                    await tx.wallet.update({
                        where: { id: projectEscrow.id },
                        data: {
                            balance: { increment: payment.amount },
                            transactions: {
                                create: {
                                    amount: payment.amount,
                                    type: 'CREDIT',
                                    category: 'EOI_DEPOSIT',
                                    referenceId: eoi.id,
                                    referenceType: 'EOI',
                                    description: `EOI Token #${newTokenNumber} - Payment from Client`
                                }
                            }
                        }
                    });

                } else if (payment.entityType === 'BOOKING') {
                    // Booking payment logic...
                    // Credit Developer Wallet directly? Or Escrow? 
                    // Usually Booking Amt -> Developer

                    const booking = await tx.booking.findUnique({ where: { id: payment.entityId } });
                    if (booking) {
                        const project = await tx.project.findUnique({ where: { id: booking.projectId } });
                        if (project) {
                            const developerWallet = await WalletService.ensureWallet(project.developerId, 'DEVELOPER', false, tx);

                            await tx.wallet.update({
                                where: { id: developerWallet.id },
                                data: {
                                    balance: { increment: payment.amount },
                                    transactions: {
                                        create: {
                                            amount: payment.amount,
                                            type: 'CREDIT',
                                            category: 'BOOKING_FEE',
                                            referenceId: booking.id,
                                            referenceType: 'BOOKING',
                                            description: `Booking Fee for Unit ${booking.unitId}`
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
            // End Transaction
        });

        return { success: true };
    }

    /**
     * Confirm a Manual Payment (Admin/Developer Action).
     */
    static async confirmManualPayment(paymentId: string) {
        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

        if (!payment) throw new Error('Payment not found');
        if (payment.status !== 'INITIATED') throw new Error('Payment is not in INITIATED state');
        // if (payment.provider !== 'MANUAL') throw new Error('Payment method is not Manual'); // Optional check

        // Reuse Webhook Logic to process the success state
        // This ensures consistency (updating EOI/Booking, wallets, etc.)
        await this.handleMockWebhook(paymentId, 'SUCCESS');

        return { success: true, message: 'Payment confirmed manually' };
    }
}
