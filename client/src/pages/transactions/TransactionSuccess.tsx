import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransactionDetails } from '../../services/transactionService';

const TransactionSuccess = () => {
    const { id } = useParams<{ id: string }>();
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                // Try fetching as EOI first, if fails maybe Booking? 
                // Actually we don't know the type from URL. 
                // We'll try EOI first as it has Tokens.
                const eoiData = await getTransactionDetails(id, 'EOI');
                if (eoiData) {
                    setDetails({ ...eoiData, type: 'EOI' });
                } else {
                    const bookingData = await getTransactionDetails(id, 'BOOKING');
                    setDetails({ ...bookingData, type: 'BOOKING' });
                }
            } catch (error) {
                console.error("Failed to fetch transaction details", error);

                // Fallback: If 400 invalid type, try the other one?
                // Or just show generic success.
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="text-red-500 text-xl font-bold mb-4">Transaction Not Found</div>
                <Link to="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
            </div>
        );
    }

    const isEOI = details.type === 'EOI';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 mb-8">Your transaction has been securely processed.</p>

                {isEOI && details.tokenNumber && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg mb-8 transform scale-105 shadow-lg">
                        <div className="text-sm opacity-90 uppercase tracking-wider mb-1">Your Token Number</div>
                        <div className="text-6xl font-black">#{details.tokenNumber}</div>
                        <div className="text-sm mt-2 opacity-90">Project: {details.project?.name}</div>
                    </div>
                )}

                <div className="border-t border-b border-gray-100 py-4 mb-8 text-left space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-mono text-xs text-gray-800 bg-gray-100 p-1 rounded">{details.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid</span>
                        <span className="font-bold text-gray-800">₹ {details.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="text-gray-800">{new Date(details.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/projects"
                        className="block w-full border border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Browse Projects
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TransactionSuccess;
