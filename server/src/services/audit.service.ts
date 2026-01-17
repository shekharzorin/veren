import prisma from '../utils/prisma';

export const AuditService = {
    logEvent: async (type: string, details: any, userId?: string, ipAddress?: string) => {
        try {
            await prisma.auditEvent.create({
                data: {
                    type,
                    details: typeof details === 'string' ? details : JSON.stringify(details),
                    userId,
                    ipAddress
                }
            });
        } catch (error) {
            console.error('Audit Logging Failed:', error);
        }
    }
};
