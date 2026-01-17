import api from '../lib/api';

export const getMyWallet = async () => {
    const response = await api.get('/wallets/me');
    return response.data;
};

export const requestWithdrawal = async (amount: number) => {
    const response = await api.post('/wallets/withdraw', { amount });
    return response.data;
};

export const settleCommission = async (transactionId: string) => {
    const response = await api.post('/wallets/settle-commission', { transactionId });
    return response.data;
};
