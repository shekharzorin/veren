import { useEffect, useState } from 'react';
import { getAdminTransactions } from '../../services/adminService';

const TransactionList = () => {
    const [activeTab, setActiveTab] = useState<'EOI' | 'BOOKING' | 'PAYMENT'>('EOI');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        setData([]);
        try {
            const result = await getAdminTransactions({ type: activeTab });
            if (activeTab === 'EOI') setData(result.eois || []);
            if (activeTab === 'BOOKING') setData(result.bookings || []);
            if (activeTab === 'PAYMENT') setData(result.payments || []);
        } catch (error) {
            console.error('Fetch Error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Global Transactions</h3>
                <div className="flex space-x-2">
                    {['EOI', 'BOOKING', 'PAYMENT'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-3 py-1 rounded text-sm font-medium ${activeTab === tab ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading records...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client (Agent)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-400">No records found</td></tr>
                            )}
                            {data.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {activeTab === 'PAYMENT' ? (
                                            `Prov: ${item.provider}`
                                        ) : (
                                            <>
                                                <div className="font-medium">{item.project?.name}</div>
                                                <div className="text-xs text-gray-500">Unit: {item.unitId || 'N/A'}</div>
                                                {item.tokenNumber && <div className="text-xs text-blue-600">Token #{item.tokenNumber}</div>}
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {activeTab === 'PAYMENT' ? '-' : (
                                            <>
                                                <div>{item.client?.name}</div>
                                                {item.client?.agent && <div className="text-xs text-gray-500">Ag: {item.client.agent.name}</div>}
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ₹{item.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(item.status === 'PAID' || item.status === 'SUCCESS' || item.status === 'CONVERTED') ? 'bg-green-100 text-green-800' :
                                            item.status === 'REFUNDED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TransactionList;
