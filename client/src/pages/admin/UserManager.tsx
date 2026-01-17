import React, { useEffect, useState } from 'react';
import api from '../../lib/api'; // Assuming we have this or use axios directly if needed
import { Plus } from 'lucide-react';

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'DEVELOPER_ADMIN',
        phone: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', formData);
            alert('User Created!');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'DEVELOPER_ADMIN', phone: '' });
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create user');
        }
    };

    if (loading) return <div>Loading Users...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">User Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-900">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'AMOG_ADMIN' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'DEVELOPER_ADMIN' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-600">{user.phone || '-'}</td>
                                <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create New User</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input className="w-full border rounded p-2" required
                                    placeholder="Full Name"
                                    title="User Name"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" className="w-full border rounded p-2" required
                                    placeholder="user@example.com"
                                    title="User Email"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input type="password" className="w-full border rounded p-2" required
                                    placeholder="******"
                                    title="User Password"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input className="w-full border rounded p-2"
                                    placeholder="+91..."
                                    title="User Phone"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select className="w-full border rounded p-2"
                                    title="User Role"
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="DEVELOPER_ADMIN">Developer Admin</option>
                                    <option value="BROKERAGE_ADMIN">Brokerage Admin</option>
                                    <option value="AMOG_ADMIN">Super Admin</option>
                                    <option value="AGENT">Agent</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded hover:bg-primary/90">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
