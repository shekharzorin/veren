import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { CommissionService } from '../services/commission.service';
import prisma from '../utils/prisma';

interface AuthRequest extends Request {
    user?: any;
}

export const getMyWallet = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const walletType = WalletService.getWalletTypeFromRole(req.user.role);
        const wallet = await WalletService.ensureWallet(userId, walletType);
        const details = await WalletService.getWalletDetails(wallet.id);
        res.json(details);
    } catch (error: any) {
        console.error('Wallet Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        const walletType = WalletService.getWalletTypeFromRole(req.user.role);
        const wallet = await WalletService.ensureWallet(userId, walletType);

        await WalletService.debit(
            wallet.id,
            parseFloat(amount),
            'WITHDRAWAL',
            undefined,
            undefined,
            'Withdrawal Request'
        );
        // Note: Real withdrawal should be PENDING until Admin approves. 
        // For now, we debit immediately (Auto-Withdrawal Mock).

        res.json({ success: true, message: 'Withdrawal processed' }); // or requested
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const settleCommission = async (req: AuthRequest, res: Response) => {
    try {
        // SECURITY: Allow only DEVELOPER_ADMIN and AMOG_ADMIN
        const allowedRoles = ['DEVELOPER_ADMIN', 'AMOG_ADMIN'];
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Unauthorized: Only Developers or Admins can settle commissions.' });
        }

        const { transactionId } = req.body;
        await CommissionService.settleCommission(transactionId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
