import prisma from '../utils/prisma';
import { WalletService } from './wallet.service';
import { AuditService } from './audit.service';

export class CommissionService {

    /**
     * Calculate and record commission for a confirmed booking.
     */
    static async processBookingCommission(bookingId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { project: true }
        });

        if (!booking) throw new Error('Booking not found');

        const { project, agentId, amount, unitPrice } = booking;

        // Calculate Commission
        // Basis: unitPrice if > 0, else booking amount (failsafe)
        const basisAmount = unitPrice > 0 ? unitPrice : amount;
        const commissionAmount = (basisAmount * project.commissionRate) / 100;

        if (commissionAmount <= 0) return;

        // IDEMPOTENCY CHECK
        const existingCommission = await prisma.transaction.findFirst({
            where: {
                referenceId: bookingId,
                referenceType: 'BOOKING',
                category: 'COMMISSION',
                type: 'CREDIT' // Agent credit
            }
        });

        if (existingCommission) {
            console.log('Commission already processed for booking:', bookingId);
            return;
        }

        // Ensure Agent Wallet
        const agentWallet = await WalletService.ensureWallet(agentId, 'AGENT');

        // Ensure Developer Wallet
        const developerWallet = await WalletService.ensureWallet(project.developerId, 'DEVELOPER');

        // Determine Status based on Project Mode
        const isAuto = project.commissionSettlementMode === 'AUTO';
        const status = isAuto ? 'SUCCESS' : 'PENDING';

        await prisma.$transaction(async (tx) => {
            // 1. Credit Agent Wallet (Pending or Success)
            // If Pending, it shows in ledger but maybe not in disposable balance?
            // PRD: "Wallet balance = sum of settled commissions".
            // Implementation: We credit the Transaction, but maybe Wallet.balance only updates if Success?
            // Let's modify WalletService.credit to handle 'PENDING' status (optional arg) or just logic here.

            // Actually, we should only increment balance if status is SUCCESS.

            if (isAuto) {
                // Atomic Transfer
                // Debit Developer
                // Credit Agent
                await WalletService.debit(
                    developerWallet.id,
                    commissionAmount,
                    'COMMISSION',
                    bookingId,
                    'BOOKING',
                    `Commission for Unit ${booking.unitId}`,
                    tx
                );

                await WalletService.credit(
                    agentWallet.id,
                    commissionAmount,
                    'COMMISSION',
                    bookingId,
                    'BOOKING',
                    `Commission for Unit ${booking.unitId}`,
                    tx
                );
            } else {
                // Log 'PENDING' transaction for Agent (No Balance Update)
                await tx.transaction.create({
                    data: {
                        walletId: agentWallet.id,
                        amount: commissionAmount,
                        type: 'CREDIT',
                        category: 'COMMISSION',
                        status: 'PENDING',
                        referenceId: bookingId,
                        referenceType: 'BOOKING',
                        description: `Pending Commission for Unit ${booking.unitId}`
                    }
                });

                // Maybe also log 'PENDING' debit for Developer to show liability?
                await tx.transaction.create({
                    data: {
                        walletId: developerWallet.id,
                        amount: commissionAmount,
                        type: 'DEBIT',
                        category: 'COMMISSION',
                        status: 'PENDING',
                        referenceId: bookingId,
                        referenceType: 'BOOKING',
                        description: `Pending Commission Liability for Unit ${booking.unitId}`
                    }
                });
            }

            // Audit Log
            AuditService.logEvent('COMMISSION_CREATED', {
                bookingId,
                agentId,
                amount: commissionAmount,
                status
            }, agentId);
        });
    }

    /**
     * Settle a pending commission (Manual Action by Developer).
     */
    static async settleCommission(transactionId: string) {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { wallet: true }
        });

        if (!transaction || transaction.status !== 'PENDING' || transaction.category !== 'COMMISSION') {
            throw new Error('Invalid commission transaction');
        }

        // Must be Agent Wallet Transaction
        if (transaction.wallet.type !== 'AGENT') {
            throw new Error('Transaction is not for an agent wallet');
        }

        // Find corresponding Developer Transaction (Liability)
        // This is tricky without a link. 
        // Simpler: Just debit developer now and update agent transaction.

        // We need the Project to find Developer, or just lookup from Booking Reference.
        if (transaction.referenceType === 'BOOKING' && transaction.referenceId) {
            const booking = await prisma.booking.findUnique({
                where: { id: transaction.referenceId },
                include: { project: true }
            });

            if (!booking) throw new Error('Booking ref not found');

            const developerWallet = await WalletService.ensureWallet(booking.project.developerId, 'DEVELOPER');

            await prisma.$transaction(async (tx) => {
                // 1. Debit Developer (Real Debit now)
                await WalletService.debit(
                    developerWallet.id,
                    transaction.amount,
                    'COMMISSION',
                    booking.id,
                    'BOOKING',
                    `Settlement of Commission for Unit ${booking.unitId}`,
                    tx
                );

                // 2. Credit Agent (Real Credit via New Transaction)
                // DO NOT update the old Pending tx. Create a new SUCCESS one.
                // We can mark the old one as processed if we want, or just leave it as record of "Pending entitlement".
                // But better to "close" it? Or just create a new one.
                // The prompt says: Create a new Transaction record representing settlement confirmation. Keep original immutable.

                await WalletService.credit(
                    transaction.walletId,
                    transaction.amount,
                    'COMMISSION_SETTLEMENT', // Distinct category? Or just COMMISSION? Using SETTLEMENT to distinguish.
                    booking.id,
                    'BOOKING',
                    `Settlement Paid for Unit ${booking.unitId}`,
                    tx
                );

                // Audit Log
                AuditService.logEvent('COMMISSION_SETTLED', {
                    bookingId: booking.id,
                    amount: transaction.amount,
                    originalTransactionId: transaction.id
                }, transaction.wallet.userId || undefined);
            });
        }
    }
}
