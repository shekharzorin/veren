import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

/**
 * Get All Wallets (AMOG_ADMIN only)
 */
export const getAllWallets = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'AMOG_ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const wallets = await prisma.wallet.findMany({
            include: {
                user: { select: { name: true, email: true, role: true } },
                project: { select: { name: true } }
            }
        });
        res.json(wallets);
    } catch (error) {
        console.error('Fetch All Wallets Error:', error);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
};

/**
 * Get Global Transactions Ledger (AMOG_ADMIN only)
 */
export const getGlobalTransactions = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'AMOG_ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const transactions = await prisma.transaction.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100, // Limit for MVP
            include: {
                wallet: {
                    select: {
                        type: true,
                        user: { select: { name: true } },
                        project: { select: { name: true } }
                    }
                }
            }
        });
        res.json(transactions);
    } catch (error) {
        console.error('Fetch Global Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch ledger' });
    }
};
