import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Save, RefreshCw } from 'lucide-react';

interface SystemSetting {
    key: string;
    value: string;
    description?: string;
}

const GlobalSettings = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            // If no settings exist yet, we might want to show defaults or empty
            setSettings(res.data);
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (setting: SystemSetting) => {
        setEditing(setting.key);
        setTempValue(setting.value);
    };

    const handleSave = async (key: string) => {
        try {
            await api.post('/admin/settings', { key, value: tempValue });
            setEditing(null);
            fetchSettings();
        } catch (error) {
            alert('Failed to save setting');
        }
    };

    if (loading) return <div>Loading Settings...</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Global System Configuration</h2>
                <button title="Refresh Settings" onClick={fetchSettings} className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-lg border">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                        <tr>
                            <th className="p-4">Setting Key</th>
                            <th className="p-4">Value</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {settings.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                    No custom settings defined yet. defaults are active.
                                    <div className="mt-2 text-xs">System will auto-create keys when modified.</div>
                                </td>
                            </tr>
                        )}
                        {settings.map(s => (
                            <tr key={s.key} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-sm text-slate-700">{s.key}</td>
                                <td className="p-4">
                                    {editing === s.key ? (
                                        <input
                                            title="Edit Value"
                                            className="border rounded px-2 py-1 w-full max-w-[200px]"
                                            value={tempValue}
                                            onChange={e => setTempValue(e.target.value)}
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-900">{s.value}</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-slate-500">{s.description || '-'}</td>
                                <td className="p-4 text-right">
                                    {editing === s.key ? (
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 border rounded">Cancel</button>
                                            <button onClick={() => handleSave(s.key)} className="text-xs px-2 py-1 bg-primary text-white rounded flex items-center gap-1">
                                                <Save className="w-3 h-3" /> Save
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(s)} className="text-primary hover:underline text-sm font-medium">
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Add Section for Developers/Admins to add new keys if needed */}
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Initialize New Setting</h3>
                <NewSettingForm onSave={fetchSettings} />
            </div>
        </div>
    );
};

const NewSettingForm = ({ onSave }: { onSave: () => void }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [desc, setDesc] = useState('');

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/settings', { key, value, description: desc });
            onSave();
            setKey(''); setValue(''); setDesc('');
        } catch (e) {
            alert('Failed');
        }
    };

    return (
        <form onSubmit={create} className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Key</label>
                <input required title="Setting Key" placeholder="MY_CONFIG_KEY" className="w-full p-2 border rounded text-xs" value={key} onChange={e => setKey(e.target.value)} />
            </div>
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Value</label>
                <input required title="Setting Value" placeholder="0.5" className="w-full p-2 border rounded text-xs" value={value} onChange={e => setValue(e.target.value)} />
            </div>
            <div className="flex-[2]">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input title="Setting Description" placeholder="What does this do?" className="w-full p-2 border rounded text-xs" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <button title="Add Setting" type="submit" className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold h-[34px]">Add</button>
        </form>
    );
}

export default GlobalSettings;
