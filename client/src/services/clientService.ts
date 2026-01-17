import api from '../lib/api';

export interface Client {
    id: string;
    name: string;
    phone: string;
    email?: string;
    status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'BOOKING' | 'CLOSED' | 'LOST';
    notes?: string;
    agentId: string;
    createdAt: string;
}

export const getClients = async () => {
    const response = await api.get('/clients/my'); // Ensure we hit /my not / (which doesn't exist yet)
    // Actually existing implementation of getClients in controller is mounted at /my? No, route /my points to getMyClients
    // But route / points to nothing in previous file view?
    // Route file: router.get('/my', getMyClients);
    // Service existing: api.get('/clients') -> likely wrong or redirected?
    // Let's use /clients/my for getClients.
    return response.data;
};

export const createClient = async (data: Partial<Client>) => {
    const response = await api.post('/clients', data);
    return response.data;
};

export const updateClient = async (id: string, data: Partial<Client>) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
};
