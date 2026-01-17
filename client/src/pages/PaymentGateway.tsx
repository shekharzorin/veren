import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { mockPaymentCallback } from '../services/paymentService';

const PaymentGateway = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const amount = searchParams.get('amount') || '0';

    // Note: In real world, we'd fetch details from server using paymentId to show them securely. 
    // Here relying on params or just ID.

    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');

    const handlePayment = async (result: 'SUCCESS' | 'FAILED') => {
        if (!paymentId) return;
        setStatus('PROCESSING');
        try {
            await mockPaymentCallback(paymentId, result);
            setStatus(result);
            setTimeout(() => {
                navigate(`/transactions/${paymentId}/success`);
            }, 2000);
        } catch (error) {
            console.error(error);
            setStatus('FAILED');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">AMOG Secure Gateway</h1>
                    <p className="text-sm text-gray-500">Completing your transaction securely</p>
                </div>

                <div className="flex justify-between py-4 mb-6 border-b border-gray-100">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                </div>

                {/* Check search param or just show unknown if not passed from redirect. 
                    Ideally backend redirects with query params. 
                */}
                <div className="flex justify-between py-4 mb-8">
                    <span className="text-lg font-semibold text-gray-700">Amount</span>
                    <span className="text-2xl font-bold text-blue-600">₹ {amount}</span>
                </div>

                {status === 'IDLE' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => handlePayment('SUCCESS')}
                            className="w-full px-4 py-3 font-bold text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Pay Now
                        </button>
                        <button
                            onClick={() => handlePayment('FAILED')}
                            className="w-full px-4 py-3 font-bold text-red-600 transition bg-white border border-red-200 rounded-lg hover:bg-red-50"
                        >
                            Cancel Transaction
                        </button>
                    </div>
                )}

                {status === 'PROCESSING' && (
                    <div className="text-center text-blue-600 animate-pulse">Processing Payment...</div>
                )}

                {status === 'SUCCESS' && (
                    <div className="text-center text-green-600">
                        <h3 className="text-xl font-bold">Payment Successful!</h3>
                        <p>Redirecting back to AMOG...</p>
                    </div>
                )}

                {status === 'FAILED' && (
                    <div className="text-center text-red-600">
                        <h3 className="text-xl font-bold">Payment Failed</h3>
                        <p>Redirecting back...</p>
                    </div>
                )}
            </div>

            <p className="mt-8 text-xs text-center text-gray-400">
                This is a secure mock gateway environment. No real money is deducted.
            </p>
        </div>
    );
};

export default PaymentGateway;
