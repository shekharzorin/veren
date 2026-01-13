import React, { useState } from 'react';
import { createProject } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';

const CreateProject: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        eoiAmount: 49500,
        maxEOIsPerUnit: 3,
        eoiExpiryHours: 24,
        eligibilityMode: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProject({
                ...formData,
                eoiAmount: Number(formData.eoiAmount),
                maxEOIsPerUnit: Number(formData.maxEOIsPerUnit),
                eoiExpiryHours: Number(formData.eoiExpiryHours)
            });
            navigate('/projects');
        } catch (error) {
            console.error('Failed to create project', error);
            alert('Failed to create project');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
            <form onSubmit={handleSubmit} className="space-y-4 premium-card p-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Project Name</label>
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="eoiAmount" className="block text-sm font-medium mb-1">EOI Amount (₹)</label>
                        <input
                            id="eoiAmount"
                            type="number"
                            name="eoiAmount"
                            value={formData.eoiAmount}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxEOIsPerUnit" className="block text-sm font-medium mb-1">Max EOIs per Unit</label>
                        <input
                            id="maxEOIsPerUnit"
                            type="number"
                            name="maxEOIsPerUnit"
                            value={formData.maxEOIsPerUnit}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="eoiExpiryHours" className="block text-sm font-medium mb-1">EOI Expiry (Hours)</label>
                    <input
                        id="eoiExpiryHours"
                        type="number"
                        name="eoiExpiryHours"
                        value={formData.eoiExpiryHours}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="eligibilityMode"
                        checked={formData.eligibilityMode}
                        onChange={handleChange}
                        id="eligibilityMode"
                    />
                    <label htmlFor="eligibilityMode" className="text-sm">Enable Eligibility Mode</label>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90">
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
