import React, { useRef, useEffect, useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { usePreferences, type Currency, type UnitSystem } from '../../context/PreferencesContext';

const PreferencesPopover: React.FC = () => {
    const {
        mode, currency, unit, location,
        setMode, setCurrency, setUnit, setLocation
    } = usePreferences();

    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative" ref={popoverRef}>
            <button
                title="Preferences"
                onClick={toggleOpen}
                className={`p-2.5 rounded-xl border transition-all ${isOpen || true ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-fade-in p-2">
                    <div className="p-4 space-y-4">
                        {/* Location */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
                            <select
                                title="Select Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="Dubai">Dubai</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="London">London</option>
                                <option value="New York">New York</option>
                            </select>
                        </div>

                        {/* Units */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Measure Units</label>
                            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                                {(['ft²', 'm²'] as UnitSystem[]).map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u)}
                                        className={`py-1.5 text-sm font-medium rounded-md transition-all ${unit === u ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Currency</label>
                            <select
                                title="Select Currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as Currency)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="INR">INR (Indian Rupee)</option>
                                <option value="USD">USD (United States Dollar)</option>
                                <option value="AED">AED (UAE Dirham)</option>
                            </select>
                        </div>

                        {/* Mode */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Info Display Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setMode('AGENT')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${mode === 'AGENT'
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <Eye className="w-4 h-4" /> Agent
                                </button>
                                <button
                                    onClick={() => setMode('CLIENT')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${mode === 'CLIENT'
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <EyeOff className="w-4 h-4" /> Client
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                {mode === 'CLIENT'
                                    ? "Client mode hides developer contacts, commissions, and other sensitive details."
                                    : "Agent mode shows full project details including earnings and contacts."}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                        >
                            Apply Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreferencesPopover;
