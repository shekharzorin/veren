import React, { useState } from 'react';
import { createClient } from '../../services/clientService';
import { useNavigate } from 'react-router-dom';

const AddClient: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClient(formData);
            navigate('/clients');
        } catch (error) {
            console.error('Failed to create client', error);
            alert('Failed to create client');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add New Client</h1>
            <form onSubmit={handleSubmit} className="space-y-4 premium-card p-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Client Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                        required
                        placeholder="+91..."
                    />
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90">
                        Add Client
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddClient;
