import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { PaymentService } from '../services/payment.service';

export const getPublicTransaction = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { type } = req.query; // EOI or BOOKING (Optional, or infer from DB?)

        // We'll search both if not specified, or just EOI for now as per plan
        // Let's support EOI primarily for public links

        let transaction: any = null;
        let entityType = 'EOI';

        // Try EOI first
        transaction = await prisma.eOI.findUnique({
            where: { id },
            include: {
                project: { select: { name: true, developer: { select: { name: true } } } },
                client: { select: { name: true, phone: true } }
            }
        });

        if (!transaction) {
            // Try Booking?
            transaction = await prisma.booking.findUnique({
                where: { id: id as string },
                include: {
                    project: { select: { name: true } },
                    client: { select: { name: true } }
                }
            });
            if (transaction) entityType = 'BOOKING';
        }

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or expired' });
        }

        // Sanitize response - don't send everything publicly
        const responseData = {
            id: transaction.id,
            type: entityType,
            amount: transaction.amount,
            status: transaction.status,
            clientName: transaction.client.name,
            projectName: transaction.project.name,
            tokenNumber: transaction.tokenNumber // If paid already
        };

        res.json(responseData);
    } catch (error) {
        console.error('Public fetch error', error);
        res.status(500).json({ error: 'Failed to fetch details' });
    }
};

export const initiatePublicPayment = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const entityType = req.body.entityType as 'EOI' | 'BOOKING';

        let amount = 0;
        let userId = '';

        if (entityType === 'EOI') {
            const eoi = await prisma.eOI.findUnique({ where: { id } });
            if (!eoi) return res.status(404).json({ error: 'Not found' });
            if (eoi.status === 'PAID' || eoi.status === 'CONVERTED') return res.status(400).json({ error: 'Already Paid' });
            amount = eoi.amount;
            userId = eoi.clientId;
        } else if (entityType === 'BOOKING') {
            const booking = await prisma.booking.findUnique({ where: { id } });
            if (!booking) return res.status(404).json({ error: 'Not found' });
            amount = booking.amount;
            userId = booking.clientId;
        } else {
            return res.status(400).json({ error: 'Invalid entity type' });
        }

        const result = await PaymentService.initiatePayment(id, entityType, amount, userId);
        res.json(result);

    } catch (error) {
        console.error('Public pay error', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};
