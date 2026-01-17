import prisma from '../utils/prisma';

export class SettingsService {
    static async get(key: string, defaultValue: any): Promise<any> {
        const setting = await prisma.systemSetting.findUnique({ where: { key } });
        if (!setting) return defaultValue;

        try {
            // Try parsing if it looks like JSON/Number
            const val = setting.value;
            if (!isNaN(Number(val))) return Number(val);
            if (val === 'true') return true;
            if (val === 'false') return false;
            return val;
        } catch (e) {
            return setting.value;
        }
    }

    static async set(key: string, value: any, description?: string) {
        const strValue = String(value);
        return prisma.systemSetting.upsert({
            where: { key },
            update: { value: strValue, description },
            create: { key, value: strValue, description }
        });
    }

    static async getAll() {
        return prisma.systemSetting.findMany({
            orderBy: { key: 'asc' }
        });
    }
}
