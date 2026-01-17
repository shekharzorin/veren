import api from '../lib/api';

export interface CreateEOIPayload {
    projectId: string;
    clientId: string;
    amount: number;
    unitId?: string;
}

export interface CreateBookingPayload {
    projectId: string;
    clientId: string;
    unitId: string;
    amount: number;
    unitPrice?: number;
}

export const createEOI = async (data: CreateEOIPayload) => {
    const response = await api.post('/eoi', data);
    return response.data;
};

export const createBooking = async (data: CreateBookingPayload) => {
    const response = await api.post('/booking', data);
    return response.data;
};

export const getTransactionDetails = async (id: string, type: 'EOI' | 'BOOKING') => {
    // Backend changed to /transactions/details/:id to avoid conflict with /my
    const response = await api.get(`/transactions/details/${id}?type=${type}`);
    return response.data;
};

export const getMyTransactions = async () => {
    const response = await api.get('/transactions/my');
    return response.data;
};
