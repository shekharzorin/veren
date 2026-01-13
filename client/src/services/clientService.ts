import api from '../lib/api';

export interface Client {
    id: string;
    name: string;
    phone: string;
    agentId: string;
    createdAt: string;
}

export const getClients = async () => {
    const response = await api.get('/clients');
    return response.data;
};

export const createClient = async (data: { name: string; phone: string }) => {
    const response = await api.post('/clients', data);
    return response.data;
};
