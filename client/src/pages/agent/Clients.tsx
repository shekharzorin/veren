import React, { useEffect, useState } from 'react';
import {
    Users, Plus, Search, Phone, Mail,
    ArrowUpRight, UserPlus
} from 'lucide-react';
import { getClients, createClient, updateClient, type Client } from '../../services/clientService';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // New Client Form State
    const [formData, setFormData] = useState<{
        name: string;
        phone: string;
        email: string;
        status: Client['status'];
        notes: string;
    }>({
        name: '',
        phone: '',
        email: '',
        status: 'NEW',
        notes: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await getClients();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClient(formData);
            setShowAddModal(false);
            setFormData({ name: '', phone: '', email: '', status: 'NEW', notes: '' }); // Reset
            fetchClients(); // Refresh list
        } catch (error) {
            alert('Failed to create client. Phone number might be taken.');
        }
    };

    const handleStatusChange = async (id: string, newStatus: Client['status']) => {
        try {
            await updateClient(id, { status: newStatus });
            // Optimistic update
            setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'INTERESTED': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'BOOKING': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'CLOSED': return 'bg-green-100 text-green-700 border-green-200';
            case 'LOST': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) return <div className="p-8">Loading CRM...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        My Clients
                    </h1>
                    <p className="text-slate-500 text-sm">Manage your leads and customer pipeline</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add New Client
                </button>
            </div>

            {/* Stats/Metrics Row (Optional Future) */}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm"
                    />
                </div>
                {/* Could add filters here */}
            </div>

            {/* Client List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Client Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Added</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50/80 transition group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{client.name}</div>
                                        <div className="text-xs text-slate-400">ID: {client.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            title="Client Status"
                                            value={client.status}
                                            onChange={(e) => handleStatusChange(client.id, e.target.value as Client['status'])}
                                            className={`text-xs font-bold px-3 py-1 rounded-full border appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition ${getStatusColor(client.status)}`}
                                        >
                                            <option value="NEW">New Lead</option>
                                            <option value="CONTACTED">Contacted</option>
                                            <option value="INTERESTED">Interested</option>
                                            <option value="BOOKING">Booking</option>
                                            <option value="CLOSED">Closed/Won</option>
                                            <option value="LOST">Lost</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                {client.phone}
                                            </div>
                                            {client.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {client.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button title="View Details" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                            <UserPlus className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="font-medium">No clients found</p>
                                        <p className="text-xs">Add your first client to start tracking leads.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Add New Client</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Status</label>
                                <select
                                    title="Initial Status"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="NEW">New Lead</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="INTERESTED">Interested</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    rows={3}
                                    placeholder="Any details..."
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
                                    Save Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
