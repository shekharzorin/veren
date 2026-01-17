import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

const PublicPaymentPage = () => {
    const { id } = useParams<{ id: string }>();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                // Remove auth header for this request? 
                // Or backend public route ignores it.
                // Our api client might attach token if present. 
                // For Incognito it won't be present.
                const res = await api.get(`/public/transactions/${id}`);
                setTransaction(res.data);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to load transaction');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handlePay = async () => {
        try {
            setLoading(true);
            const res = await api.post(`/public/transactions/${id}/pay`, { entityType: transaction.type });
            if (res.data.gatewayUrl) {
                window.location.href = `${res.data.gatewayUrl}?amount=${transaction.amount}`;
            }
        } catch (err: any) {
            console.error(err);
            alert('Payment initiation failed');
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;

    if (transaction.status === 'PAID' || transaction.status === 'CONVERTED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="bg-white p-8 rounded shadow text-center">
                    <h1 className="text-2xl font-bold text-green-600 mb-2">Already Paid</h1>
                    <p>This transaction has been completed.</p>
                    {transaction.tokenNumber && <p className="mt-4 text-xl font-mono">Token: #{transaction.tokenNumber}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                <div className="bg-primary text-white p-6 text-center">
                    <h1 className="text-xl font-bold">Secure Payment</h1>
                    <p className="text-primary-foreground/80 text-sm">AMOG Real Estate</p>
                </div>

                <div className="p-8">
                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase">Project</label>
                        <div className="text-lg font-medium">{transaction.projectName}</div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase">Client Name</label>
                        <div className="text-lg font-medium">{transaction.clientName}</div>
                    </div>

                    <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹ {transaction.amount?.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handlePay}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition"
                    >
                        Pay Now
                    </button>
                </div>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    Secured by Mock Gateway
                </div>
            </div>
        </div>
    );
};

export default PublicPaymentPage;
