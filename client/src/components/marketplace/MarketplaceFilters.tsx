import React from 'react';
import { Search, Map, SlidersHorizontal, ChevronDown, X, Heart, MapPin, Wallet, Ruler, UserCheck, EyeOff } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import PreferencesPopover from '../common/PreferencesPopover';
import { useMarketplace } from '../../context/MarketplaceContext';
import { cn } from '../../lib/utils';

const MarketplaceFilters: React.FC = () => {
    const { mode, currency, location, unit } = usePreferences();
    const { searchQuery, setSearchQuery, filters, updateFilter, resetFilters } = useMarketplace();

    return (
        <div className="flex flex-col gap-4 mb-8">
            {/* Top Bar: Tabs & Main Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => updateFilter('status', 'Off-plan')}
                        className={cn(
                            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                            filters.status === 'Off-plan' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        Off-plan
                    </button>
                    <button
                        onClick={() => updateFilter('status', 'Secondary')}
                        className={cn(
                            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                            filters.status === 'Secondary' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        Secondary
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Scrollable Area for buttons/pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 px-1 border-r border-slate-100 pr-4 mr-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-all whitespace-nowrap">
                            <Heart className="w-4 h-4 text-slate-400" /> Saved
                        </button>

                        {/* Dynamic Preference Pills */}
                        <div className="flex items-center gap-2">
                            {/* Mock "Dropdown" look for Location/Currency/Units */}
                            <div className="hidden md:flex items-center gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all">
                                    <MapPin className="w-4 h-4 text-slate-500" /> {location}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all">
                                    <Wallet className="w-4 h-4 text-slate-500" /> {currency}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all">
                                    <Ruler className="w-4 h-4 text-slate-500" /> {unit}
                                </button>
                            </div>

                            {/* Mode Badge - Dark */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'AGENT' ? 'bg-slate-900 text-white' : 'bg-primary text-white shadow-sm'
                                }`}>
                                {mode === 'AGENT' ? <UserCheck className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {mode === 'AGENT' ? 'Agent Mode' : 'Client Mode'}
                            </div>
                        </div>
                    </div>

                    {/* Fixed (Non-scrollable) Settings Trigger */}
                    <div className="flex-shrink-0">
                        <PreferencesPopover />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                        <Map className="w-4 h-4" />
                        Map
                    </button>
                    <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search & filters"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Filter options">
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar flex-1 min-w-0">
                    <button
                        onClick={() => updateFilter('saleStatus', filters.saleStatus === 'On Sale' ? null : 'On Sale')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                            filters.saleStatus === 'On Sale'
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        )}
                    >
                        On Sale Status
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>

                    {['Price', 'Size', 'Unit type', 'Dev Status', 'Bedrooms'].map((filter) => (
                        <button key={filter} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all whitespace-nowrap group">
                            {filter}
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                        </button>
                    ))}
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-all whitespace-nowrap ml-auto lg:ml-0"
                    >
                        Reset all
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceFilters;
