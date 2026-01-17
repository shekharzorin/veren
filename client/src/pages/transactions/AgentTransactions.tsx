import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { getMyTransactions } from '../../services/transactionService';

const AgentTransactions: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'EOI' | 'BOOKING'>('EOI');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ eois: any[], bookings: any[] }>({ eois: [], bookings: [] });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await getMyTransactions();
                setData(response);
            } catch (error) {
                console.error('Failed to fetch transactions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'HELD': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'REFUNDED': return 'bg-slate-100 text-slate-500 border-slate-200';
            case 'CONVERTED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleConvert = (eoi: any) => {
        // Navigate to booking creation with pre-filled data
        navigate(`/transactions/booking/create?projectId=${eoi.projectId}&clientId=${eoi.clientId}&unitId=${eoi.unitId || ''}`);
    };

    if (loading) return <div className="p-8">Loading Transactions...</div>;

    const list = activeTab === 'EOI' ? data.eois : data.bookings;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        My Transactions
                    </h1>
                    <p className="text-slate-500 text-sm">Track your Deals, EOIs, and Bookings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('EOI')}
                    className={`pb-3 px-4 text-sm font-semibold transition relative ${activeTab === 'EOI' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Expressions of Interest (EOI)
                    {activeTab === 'EOI' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('BOOKING')}
                    className={`pb-3 px-4 text-sm font-semibold transition relative ${activeTab === 'BOOKING' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Bookings & Closures
                    {activeTab === 'BOOKING' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            {/* Transaction List */}
            <div className="grid gap-4">
                {list.length > 0 ? (
                    list.map((item: any) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary/30 transition shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

                            {/* Left: Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeTab === 'EOI' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {activeTab === 'EOI' ? <Clock className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900">{item.project?.name || 'Unknown Project'}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Client: <span className="font-medium text-slate-700">{item.client?.name}</span> • Unit: <span className="font-medium text-slate-700">{item.unitId || 'N/A'}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                                    </p>

                                    {/* Queue Position */}
                                    {item.queuePosition && (
                                        <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                            Queue Position: #{item.queuePosition}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Middle: Amount */}
                            <div className="text-right md:text-left">
                                <p className="text-xs text-slate-400 uppercase font-semibold">Amount</p>
                                <p className="text-lg font-bold text-slate-900">₹ {item.amount.toLocaleString()}</p>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex gap-2 w-full md:w-auto">
                                {activeTab === 'EOI' && item.status === 'PAID' && (
                                    <button
                                        onClick={() => handleConvert(item)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                                    >
                                        Convert to Booking <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                                {activeTab === 'EOI' && item.status === 'HELD' && (
                                    <button
                                        onClick={() => navigate(`/pay/${item.id}`)}
                                        className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
                                    >
                                        Share Payment Link
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentTransactions;
