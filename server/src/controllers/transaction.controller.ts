import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

            // Create Booking
            const booking = await tx.booking.create({
                data: {
                    projectId,
                    clientId,
                    unitId,
                    amount: parseFloat(amount),
                    agentId
                }
            });

            // Optional: Auto-refund or status update other EOIs for this unit?
            // keeping MVP simple for now.

            return booking;
        });

        res.status(201).json(result);
    } catch (error: any) {
        if (error.message === 'Unit already booked') {
            return res.status(409).json({ error: 'Unit already booked' });
        }
        console.error('Booking Error:', error);
        res.status(500).json({ error: 'Booking failed' });
    }
};
