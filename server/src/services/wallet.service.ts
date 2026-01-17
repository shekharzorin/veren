import prisma from '../utils/prisma';
import { Wallet, Transaction, Prisma } from '@prisma/client';

export class WalletService {

    /**
     * Ensure a wallet exists for a user or project.
     */
    static async ensureWallet(entityId: string, type: 'DEVELOPER' | 'AGENT' | 'BROKERAGE' | 'ESCROW', isProject = false, tx?: Prisma.TransactionClient): Promise<Wallet> {
        const client = tx || prisma;
        const where = isProject ? { projectId: entityId } : { userId: entityId };

        let wallet = await client.wallet.findFirst({ where });

        if (!wallet) {
            wallet = await client.wallet.create({
                data: {
                    type,
                    ...where,
                    balance: 0.0
                }
            });
        }
        return wallet;
    }

    /**
     * Get wallet balance and recent transactions.
     */
    static async getWalletDetails(walletId: string) {
        return prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                transactions: {
                    take: 20,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });
    }

    /**
     * Credit funds to a wallet.
     */
    static async credit(walletId: string, amount: number, category: string, referenceId?: string, referenceType?: string, description?: string, tx?: Prisma.TransactionClient) {
        const client = tx || prisma;

        return client.wallet.update({
            where: { id: walletId },
            data: {
                balance: { increment: amount },
                transactions: {
                    create: {
                        amount,
                        type: 'CREDIT',
                        category,
                        referenceId,
                        referenceType,
                        description
                    }
                }
            }
        });
    }

    /**
     * Debit funds from a wallet. Throws if insufficient funds.
     */
    static async debit(walletId: string, amount: number, category: string, referenceId?: string, referenceType?: string, description?: string, tx?: Prisma.TransactionClient) {
        const client = tx || prisma;

        // Check balance first
        const wallet = await client.wallet.findUnique({ where: { id: walletId } });
        if (!wallet || wallet.balance < amount) {
            throw new Error('Insufficient funds');
        }

        return client.wallet.update({
            where: { id: walletId },
            data: {
                balance: { decrement: amount },
                transactions: {
                    create: {
                        amount,
                        type: 'DEBIT',
                        category,
                        referenceId,
                        referenceType,
                        description
                    }
                }
            }
        });
    }

    /**
     * Transfer funds between wallets atomically.
     */
    static async transfer(fromWalletId: string, toWalletId: string, amount: number, category: string, referenceId?: string, referenceType?: string, description?: string) {
        return prisma.$transaction(async (tx) => {
            await this.debit(fromWalletId, amount, category, referenceId, referenceType, `Transfer Out: ${description}`, tx);
            await this.credit(toWalletId, amount, category, referenceId, referenceType, `Transfer In: ${description}`, tx);
        });
    }

    /**
     * Map User Role to Wallet Type.
     */
    static getWalletTypeFromRole(role: string): 'DEVELOPER' | 'AGENT' | 'BROKERAGE' | 'ESCROW' {
        switch (role) {
            case 'DEVELOPER_ADMIN': return 'DEVELOPER';
            case 'BROKERAGE_ADMIN': return 'BROKERAGE';
            case 'AMOG_ADMIN': return 'ESCROW';
            case 'AGENT':
            default:
                return 'AGENT';
        }
    }
}
