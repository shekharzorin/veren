import api from '../lib/api';

export const getAdminTransactions = async (params: { type?: string, project?: string, status?: string }) => {
    try {
        const response = await api.get('/admin/transactions', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const settleCommission = async (transactionId: string) => {
    try {
        const response = await api.post('/admin/commissions/settle', { transactionId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProjectWallets = async () => {
    try {
        const response = await api.get('/admin/wallets/projects');
        return response.data;
    } catch (error) {
        throw error;
    }
};
