import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionList from './TransactionList';
import CommissionManager from './CommissionManager';
import UserManager from './UserManager';
import GlobalSettings from './GlobalSettings';
import { getProjects, type Project } from '../../services/projectService';
import { Plus, Building2, LayoutDashboard, Wallet, Users, Settings } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'PROJECTS' | 'TRANSACTIONS' | 'COMMISSIONS' | 'USERS' | 'SETTINGS'>('PROJECTS');
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState({ revenue: 0, bookings: 0, users: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'PROJECTS') {
            loadProjects();
        }
        loadStats();
    }, [activeTab]);

    const loadStats = async () => {
        try {
            // Assume we have an api method or use axios directly for now if not in service
            const res = await fetch('http://localhost:4000/api/admin/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
                    <p className="text-gray-600">Manage projects, financial transactions, and commissions.</p>
                </div>
                {activeTab === 'PROJECTS' && (
                    <button
                        onClick={() => navigate('/projects/create')}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg">
                    <div className="text-slate-400 text-sm font-medium mb-1">Platform Revenue</div>
                    <div className="text-3xl font-bold">₹ {stats.revenue?.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mt-2">Total Accumulated Fees (5%)</div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Bookings</div>
                    <div className="text-3xl font-bold text-slate-900">{stats.bookings}</div>
                    <div className="text-xs text-green-600 mt-2 font-medium">Across all projects</div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-slate-900">{stats.users}</div>
                    <div className="text-xs text-slate-500 mt-2">Agents & Admins</div>
                </div>
            </div>

            <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('PROJECTS')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'PROJECTS' ? 'bg-white text-slate-900 shadow ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                >
                    <Building2 className="w-4 h-4" /> Projects
                </button>
                <button
                    onClick={() => setActiveTab('TRANSACTIONS')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'TRANSACTIONS' ? 'bg-white text-slate-900 shadow ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Transactions
                </button>
                <button
                    onClick={() => setActiveTab('COMMISSIONS')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'COMMISSIONS' ? 'bg-white text-slate-900 shadow ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                >
                    <Wallet className="w-4 h-4" /> Commissions
                </button>
                <button
                    onClick={() => setActiveTab('USERS')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-white text-slate-900 shadow ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                >
                    <Users className="w-4 h-4" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'SETTINGS' ? 'bg-white text-slate-900 shadow ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                >
                    <Settings className="w-4 h-4" /> Settings
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                {activeTab === 'PROJECTS' && (
                    <div className="p-1">
                        {loading ? (
                            <div className="p-10 text-center text-slate-500">Loading projects...</div>
                        ) : projects.length === 0 ? (
                            <div className="p-10 text-center">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900">No Projects Found</h3>
                                <p className="text-slate-500 mb-4">Get started by creating your first real estate project.</p>
                                <button
                                    onClick={() => navigate('/projects/create')}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Create Project Now
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold bg-slate-50/50">
                                            <th className="p-4 rounded-tl-xl">Project Name</th>
                                            <th className="p-4">EOI Amount</th>
                                            <th className="p-4">Commission</th>
                                            <th className="p-4 rounded-tr-xl text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {projects.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition group">
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-900">{p.name}</div>
                                                    <div className="text-xs text-slate-500">Created {new Date(p.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4 font-mono text-slate-700">₹{p.eoiAmount.toLocaleString()}</td>
                                                <td className="p-4 text-slate-700">2.0%</td> {/* Hardcoded for now based on schema default */}
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/projects/${p.id}`)}
                                                        className="text-sm font-medium text-slate-500 hover:text-primary transition"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'TRANSACTIONS' && <TransactionList />}
                {activeTab === 'COMMISSIONS' && <CommissionManager />}
                {activeTab === 'USERS' && <UserManager />}
                {activeTab === 'SETTINGS' && <GlobalSettings />}
            </div>
        </div>
    );
};

export default AdminDashboard;
