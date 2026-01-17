import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/transactionService';
import { getProjects, type Project } from '../../services/projectService';
import { getClients, type Client } from '../../services/clientService';
import { initiatePayment } from '../../services/paymentService';

const CreateBooking: React.FC = () => {
    const navigate = useNavigate();
    const query = new URLSearchParams(window.location.search);

    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        projectId: query.get('projectId') || '',
        clientId: query.get('clientId') || '',
        amount: 100000,
        unitPrice: 0,
        unitId: query.get('unitId') || ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, clientsData] = await Promise.all([
                    getProjects(),
                    getClients()
                ]);
                setProjects(projectsData);
                setClients(clientsData);
            } catch (error) {
                console.error('Failed to load data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create Booking
            const booking = await createBooking({
                ...formData,
                amount: Number(formData.amount),
                unitPrice: Number(formData.unitPrice)
            });

            // 2. Initiate Payment
            const paymentResult = await initiatePayment(booking.id, 'BOOKING', Number(formData.amount));

            // 3. Redirect
            if (paymentResult.gatewayUrl) {
                navigate(`${paymentResult.gatewayUrl}?amount=${formData.amount}`);
            } else {
                alert('Booking Created but Payment init failed');
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Booking Failed', error);
            const msg = error.response?.data?.error || 'Failed to create Booking';
            alert(msg);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Booking</h1>

            <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6">
                {/* Project Selection */}
                <div>
                    <label htmlFor="projectId" className="block text-sm font-medium mb-1">Select Project</label>
                    <select
                        id="projectId"
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                    >
                        <option value="">-- Select Project --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Client Selection */}
                <div>
                    <label htmlFor="clientId" className="block text-sm font-medium mb-1">Select Client</label>
                    <select
                        id="clientId"
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                    >
                        <option value="">-- Select Client --</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                    </select>
                </div>

                {/* Unit ID (Required for Booking) */}
                <div>
                    <label htmlFor="unitId" className="block text-sm font-medium mb-1">Unit ID <span className="text-red-500">*</span></label>
                    <input
                        id="unitId"
                        type="text"
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                        placeholder="e.g. A-101"
                    />
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">Booking Amount</label>
                    <input
                        id="amount"
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>

                {/* Unit Price (Total Deal Value) */}
                <div>
                    <label htmlFor="unitPrice" className="block text-sm font-medium mb-1">Total Unit Price (Deal Value)</label>
                    <input
                        id="unitPrice"
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                        placeholder="e.g. 7500000"
                    />
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded font-bold hover:bg-primary/90">
                        Create Booking
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBooking;
