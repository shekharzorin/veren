import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEOI } from '../../services/transactionService';
import { getProjects, type Project } from '../../services/projectService';
import { getClients, type Client } from '../../services/clientService';
import { initiatePayment } from '../../services/paymentService';

const CreateEOI: React.FC = () => {
    const navigate = useNavigate();
    // Logic to read query params
    const query = new URLSearchParams(window.location.search);

    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        projectId: query.get('projectId') || '',
        clientId: query.get('clientId') || '',
        amount: 49500, // Default amount
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

    const handleGenerateLink = async () => {
        try {
            // 1. Create EOI (without redirecting to pay)
            // Note: createEOI just creates record.
            const eoi = await createEOI({
                ...formData,
                amount: Number(formData.amount)
            });

            // 2. Generate Link
            const link = `${window.location.origin}/pay/${eoi.id}`;
            alert(`Payment Link Generated:\n${link}\n\nShare this with your client.`);
            // Copy to clipboard
            navigator.clipboard.writeText(link);
            navigate('/dashboard');

        } catch (error) {
            console.error('Link Generation Failed', error);
            alert('Failed to generate link');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Check which button triggered? Or just use separate buttons.
        // I will change form onSubmit to standard and buttons onClick.
        // Default submit is "Pay Now"
        await handlePayNow();
    };

    const handlePayNow = async () => {
        try {
            // 1. Create EOI
            const eoi = await createEOI({
                ...formData,
                amount: Number(formData.amount)
            });

            // 2. Initiate Payment
            const paymentResult = await initiatePayment(eoi.id, 'EOI', Number(formData.amount));

            // 3. Handle Action based on Mode (OFF used MANUAL_INSTRUCTION, MOCK uses REDIRECT)
            if (paymentResult.action === 'REDIRECT' && paymentResult.gatewayUrl) {
                navigate(`${paymentResult.gatewayUrl}?amount=${formData.amount}`);
            } else if (paymentResult.action === 'MANUAL_INSTRUCTION') {
                alert(paymentResult.message || "Payment initiated manually. Please contact developer.");
                navigate('/dashboard'); // Or to a success page
            } else {
                // Fallback
                alert("Payment initiated successfully.");
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('EOI Process Failed', error);
            alert('Failed to process request');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Expression of Interest (EOI)</h1>

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

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount</label>
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

                {/* Unit ID (Optional) */}
                <div>
                    <label htmlFor="unitId" className="block text-sm font-medium mb-1">Unit ID (Optional)</label>
                    <input
                        id="unitId"
                        type="text"
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        placeholder="e.g. A-101"
                    />
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                    <button type="button" onClick={handleGenerateLink} className="w-full border border-primary text-primary py-3 rounded font-bold hover:bg-gray-50">
                        Generate Link
                    </button>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded font-bold hover:bg-primary/90">
                        Pay & Create
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEOI;
