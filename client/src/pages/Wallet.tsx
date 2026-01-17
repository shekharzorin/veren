import { useEffect, useState } from 'react';
import { getMyWallet, requestWithdrawal } from '../services/walletService';
import { format } from 'date-fns/format';

const Wallet = () => {
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        loadWallet();
    }, []);

    const loadWallet = async () => {
        try {
            const data = await getMyWallet();
            setWallet(data);
        } catch (error) {
            console.error('Failed to load wallet', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!wallet || wallet.balance <= 0) return;

        const amountStr = prompt(`Enter amount to withdraw (Max ₹${wallet.balance})`, wallet.balance);
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0 || amount > wallet.balance) {
            alert('Invalid amount');
            return;
        }

        setWithdrawing(true);
        try {
            await requestWithdrawal(amount);
            alert('Withdrawal processed!');
            loadWallet(); // Refresh
        } catch (error: any) {
            alert('Withdrawal failed: ' + error.response?.data?.error || error.message);
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Wallet...</div>;
    if (!wallet) return <div className="p-8 text-center text-red-500">Failed to load wallet.</div>;

    const pendingAmount = wallet.transactions
        .filter((t: any) => t.status === 'PENDING')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 text-white shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl">
                    <h2 className="mb-2 text-indigo-100">Available Balance</h2>
                    <div className="text-4xl font-bold">₹ {wallet.balance.toLocaleString()}</div>
                    <div className="mt-4">
                        <span className="text-sm opacity-80">Pending: ₹ {pendingAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <button
                        onClick={handleWithdraw}
                        disabled={wallet.balance <= 0 || withdrawing}
                        className={`px-8 py-3 text-lg font-semibold text-white rounded-lg shadow-md transition-all
                            ${wallet.balance > 0
                                ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                                : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {withdrawing ? 'Processing...' : 'Requests Withdrawal'}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-sm text-gray-500 bg-gray-50">
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {wallet.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No transactions yet
                                    </td>
                                </tr>
                            ) : (
                                wallet.transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {format(new Date(tx.timestamp), 'dd MMM yyyy, HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {tx.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 text-xs rounded-full 
                                                ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {tx.category}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right 
                                            ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'DEBIT' ? '-' : '+'} ₹ {tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full
                                                ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                                                    tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Wallet;