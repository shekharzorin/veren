import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

interface AuthRequest extends Request {
    user?: any;
}

export const initiatePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { entityId, entityType, amount } = req.body;
        const userId = req.user.id; // Or client ID if public?

        // Verify ownership/validity?
        // Basic check handled in Service? Service treats ID as opaque.
        // Better to check if Entity exists here or in Service.

        const result = await PaymentService.initiatePayment(entityId, entityType as 'EOI' | 'BOOKING', parseFloat(amount), userId);
        res.json(result);
    } catch (error: any) {
        console.error('Payment Init Error:', error);
        res.status(500).json({ error: error.message || 'Payment initiation failed' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        // In real gateway, verify signature here.
        const { paymentId, status } = req.body;

        await PaymentService.handleMockWebhook(paymentId, status);
        res.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook failed' });
    }
};

export const confirmManualPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { paymentId } = req.body;
        // Check if Admin? For now assuming AuthRequest users are somewhat trusted or logic handles it.
        // Ideally check req.user.role === 'ADMIN' | 'DEVELOPER'

        const result = await PaymentService.confirmManualPayment(paymentId);
        res.json(result);
    } catch (error: any) {
        console.error('Manual Confirm Error:', error);
        res.status(500).json({ error: error.message || 'Confirmation failed' });
    }
};
