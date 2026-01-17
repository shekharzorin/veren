import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, Image as ImageIcon, DollarSign, Building2,
    ArrowRight, ArrowLeft, CheckCircle2, Plus, Trash2, Save
} from 'lucide-react';
import { createProject } from '../../services/projectService';

const ProjectBuilder: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Basics
        name: '',
        developerId: '', // Ideally select from list, mocking for now
        location: '',
        description: '',

        // Media (Mock)
        heroImage: '',
        gallery: [''],

        // Sales Config (Real DB fields)
        eoiAmount: 49500,
        maxEOIsPerUnit: 3,
        eoiExpiryHours: 24,
        eligibilityMode: true,
        commissionRate: 2.0,

        // Inventory (Mock)
        paymentPlan: [{ name: 'Booking', percentage: 10 }],
        unitTypes: [{ name: '1 BHK', size: '800 sqft', price: 0 }]
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: string, index: number, value: any, subField?: string) => {
        setFormData(prev => {
            const arr = [...(prev as any)[field]];
            if (subField) {
                arr[index] = { ...arr[index], [subField]: value };
            } else {
                arr[index] = value;
            }
            return { ...prev, [field]: arr };
        });
    };

    const addArrayItem = (field: string, initialValue: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev as any)[field], initialValue]
        }));
    };

    const removeArrayItem = (field: string, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev as any)[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Map to actual backend schema
            const payload = {
                name: formData.name,
                eoiAmount: Number(formData.eoiAmount),
                maxEOIsPerUnit: Number(formData.maxEOIsPerUnit),
                eoiExpiryHours: Number(formData.eoiExpiryHours),
                eligibilityMode: formData.eligibilityMode,
                brochureUrl: formData.heroImage, // Using hero as brochure wrapper for now or separate? 
                // Using hero as generic asset, loop below handles gallery.

                // Rich Data
                units: formData.unitTypes.map(u => ({
                    ...u,
                    price: String(u.price), // Convert to string as per schema/interface
                    type: u.name, // Mapping name to type for consistency if needed, or stick to schema
                    count: 10 // Default per type until UI has field
                })),
                paymentPlan: formData.paymentPlan,
                gallery: formData.gallery.filter(g => g.trim() !== ''),
                amenities: [] // Placeholder
            };

            await createProject(payload);
            navigate('/admin'); // Redirect to Admin Dashboard
        } catch (error) {
            console.error('Failed to create project', error);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    // Steps Configuration
    const steps = [
        { id: 1, title: 'Basics', icon: Layout },
        { id: 2, title: 'Media & Visuals', icon: ImageIcon },
        { id: 3, title: 'Sales Config', icon: DollarSign },
        { id: 4, title: 'Inventory & Plans', icon: Building2 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-900">Project Builder</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Step {step} of 4</span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-primary transition-all duration-500 ease-out ${step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 px-6 grid grid-cols-12 gap-8">

                {/* Sidebar Navigation */}
                <div className="col-span-3 space-y-2">
                    {steps.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setStep(s.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${step === s.id
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-white/50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${step === s.id ? 'bg-primary/10' : 'bg-slate-100'}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            {s.title}
                            {step > s.id && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="col-span-9">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[500px] flex flex-col">

                        {/* STEP 1: BASICS */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Essentials</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        placeholder="e.g. Rise by Blanco"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        placeholder="e.g. Business Bay, Dubai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={5}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                        placeholder="Detailed project description..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: MEDIA */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Visual Assets</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.heroImage}
                                        onChange={(e) => handleChange('heroImage', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl mb-2"
                                        placeholder="https://..."
                                    />
                                    {formData.heroImage && (
                                        <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-100">
                                            <img src={formData.heroImage} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Gallery Images</label>
                                    <div className="space-y-3">
                                        {formData.gallery.map((url, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={url}
                                                    onChange={(e) => handleArrayChange('gallery', idx, e.target.value)}
                                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                                    placeholder="Image URL"
                                                />
                                                <button title="Remove Image" onClick={() => removeArrayItem('gallery', idx)} className="p-3 text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => addArrayItem('gallery', '')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                                            <Plus className="w-4 h-4" /> Add Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SALES CONFIG */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Sales & Commission</h2>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">EOI Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.eoiAmount}
                                            onChange={(e) => handleChange('eoiAmount', e.target.value)}
                                            title="EOI Amount"
                                            className="w-full p-3 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Commission Rate (%)</label>
                                        <input
                                            type="number"
                                            value={formData.commissionRate}
                                            onChange={(e) => handleChange('commissionRate', e.target.value)}
                                            title="Commission Rate"
                                            className="w-full p-3 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Max EOIs per Unit</label>
                                        <input
                                            type="number"
                                            value={formData.maxEOIsPerUnit}
                                            onChange={(e) => handleChange('maxEOIsPerUnit', e.target.value)}
                                            title="Max EOIs"
                                            className="w-full p-3 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">EOI Expiry (Hours)</label>
                                        <input
                                            type="number"
                                            value={formData.eoiExpiryHours}
                                            onChange={(e) => handleChange('eoiExpiryHours', e.target.value)}
                                            title="EOI Expiry"
                                            className="w-full p-3 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        checked={formData.eligibilityMode}
                                        onChange={(e) => handleChange('eligibilityMode', e.target.checked)}
                                        title="Toggle Eligibility Mode"
                                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-900">Enable Eligibility Mode</p>
                                        <p className="text-xs text-slate-500">System will auto-check client eligibility before booking</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: INVENTORY & PAYMENT */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Inventory & Payment Plan</h2>

                                {/* Payment Plan */}
                                <div>
                                    <h3 className="text-md font-semibold text-slate-800 mb-3">Payment Milestones</h3>
                                    <div className="space-y-3">
                                        {formData.paymentPlan.map((item, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={(item as any).name}
                                                    onChange={(e) => handleArrayChange('paymentPlan', idx, e.target.value, 'name')}
                                                    placeholder="Stage Name"
                                                    title="Stage Name"
                                                    className="flex-1 p-3 border border-slate-200 rounded-xl"
                                                />
                                                <input
                                                    type="number"
                                                    value={item.percentage}
                                                    onChange={(e) => handleArrayChange('paymentPlan', idx, Number(e.target.value), 'percentage')}
                                                    placeholder="%"
                                                    title="Percentage"
                                                    className="w-24 p-3 border border-slate-200 rounded-xl"
                                                />
                                                <button title="Remove Milestone" onClick={() => removeArrayItem('paymentPlan', idx)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addArrayItem('paymentPlan', { name: '', percentage: 0 })}
                                            className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
                                        >
                                            <Plus className="w-4 h-4" /> Add Milestone
                                        </button>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 my-6" />

                                {/* Unit Types */}
                                <div>
                                    <h3 className="text-md font-semibold text-slate-800 mb-3">Unit Configuration</h3>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-600 font-medium">
                                                <tr>
                                                    <th className="p-3 text-left">Type</th>
                                                    <th className="p-3 text-left">Size</th>
                                                    <th className="p-3 text-left">Base Price</th>
                                                    <th className="p-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {formData.unitTypes.map((unit, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-2">
                                                            <input
                                                                value={unit.name}
                                                                onChange={(e) => handleArrayChange('unitTypes', idx, e.target.value, 'name')}
                                                                title="Unit Type Name"
                                                                className="w-full p-2 border border-transparent hover:border-slate-200 rounded bg-transparent"
                                                                placeholder="e.g. 1 BHK"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                value={unit.size}
                                                                onChange={(e) => handleArrayChange('unitTypes', idx, e.target.value, 'size')}
                                                                title="Unit Size"
                                                                className="w-full p-2 border border-transparent hover:border-slate-200 rounded bg-transparent"
                                                                placeholder="e.g. 800 sqft"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={unit.price}
                                                                onChange={(e) => handleArrayChange('unitTypes', idx, e.target.value, 'price')}
                                                                title="Unit Price"
                                                                className="w-full p-2 border border-transparent hover:border-slate-200 rounded bg-transparent"
                                                                placeholder="Price"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button title="Remove Unit Type" onClick={() => removeArrayItem('unitTypes', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                                            <button
                                                onClick={() => addArrayItem('unitTypes', { name: '', size: '', price: 0 })}
                                                className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
                                            >
                                                <Plus className="w-4 h-4" /> Add Unit Type
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Footer Controls */}
                        <div className="mt-auto pt-8 flex justify-between items-center border-t border-slate-100 mt-8">
                            <button
                                onClick={() => setStep(s => Math.max(1, s - 1))}
                                disabled={step === 1}
                                className="px-6 py-2 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Previous
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={() => setStep(s => Math.min(4, s + 1))}
                                    className="px-6 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition flex items-center gap-2"
                                >
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectBuilder;
