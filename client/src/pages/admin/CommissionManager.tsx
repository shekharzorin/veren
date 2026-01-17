import { useEffect, useState } from 'react';
import { getAdminTransactions, settleCommission } from '../../services/adminService';

const CommissionManager = () => {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const data = await getAdminTransactions({ type: 'COMMISSION' });
            // API returns object with keys, probably data.commissions
            setCommissions(data.commissions || []);
        } catch (error) {
            console.error('Failed to fetch commissions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const handleSettle = async (id: string) => {
        if (!confirm('Are you sure you want to settle this commission? This will transfer funds to the agent.')) return;
        try {
            await settleCommission(id);
            alert('Commission Settled Successfully');
            fetchCommissions(); // Refresh
        } catch (error) {
            alert('Failed to settle commission');
            console.error(error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Commission Ledger</h3>
                <button onClick={fetchCommissions} className="text-sm text-primary hover:underline">Refresh</button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading commissions...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref (Unit)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {commissions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No commission records found</td>
                                </tr>
                            )}
                            {commissions.map((comm) => (
                                <tr key={comm.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(comm.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {comm.wallet?.user?.name || 'Unknown Agent'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                        ₹{comm.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comm.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                            comm.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {comm.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {comm.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {comm.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleSettle(comm.id)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition-colors"
                                            >
                                                Settle
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CommissionManager;
