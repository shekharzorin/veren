import axios from 'axios';

const API_URL = 'http://localhost:4000/api/payments';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const initiatePayment = async (entityId: string, entityType: 'EOI' | 'BOOKING', amount: number) => {
    const response = await axios.post(`${API_URL}/initiate`, { entityId, entityType, amount }, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Mock Webhook (Called by Gateway Page)
export const mockPaymentCallback = async (paymentId: string, status: 'SUCCESS' | 'FAILED') => {
    const response = await axios.post(`${API_URL}/webhook`, { paymentId, status });
    return response.data;
};
