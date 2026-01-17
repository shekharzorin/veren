import React, { createContext, useContext, useState } from 'react';

export type UserMode = 'AGENT' | 'CLIENT';
export type Currency = 'USD' | 'AED' | 'INR';
export type UnitSystem = 'ft²' | 'm²';

interface PreferencesState {
    mode: UserMode;
    currency: Currency;
    unit: UnitSystem;
    location: string;
}

interface PreferencesContextType extends PreferencesState {
    setMode: (mode: UserMode) => void;
    setCurrency: (currency: Currency) => void;
    setUnit: (unit: UnitSystem) => void;
    setLocation: (location: string) => void;
    convertPrice: (amountInINR: number) => string;
    convertArea: (sqft: string) => string;
}

// Exchange Rates (Mock)
const RATES = {
    INR: 1,
    USD: 0.012, // 1 INR = 0.012 USD
    AED: 0.044, // 1 INR = 0.044 AED
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load defaults from localStorage or use fallbacks
    const [mode, setModeState] = useState<UserMode>(() => (localStorage.getItem('pref_mode') as UserMode) || 'AGENT');
    const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem('pref_currency') as Currency) || 'INR');
    const [unit, setUnitState] = useState<UnitSystem>(() => (localStorage.getItem('pref_unit') as UnitSystem) || 'ft²');
    const [location, setLocationState] = useState(() => localStorage.getItem('pref_location') || 'Dubai');

    // Persistence wrappers
    const setMode = (m: UserMode) => { setModeState(m); localStorage.setItem('pref_mode', m); };
    const setCurrency = (c: Currency) => { setCurrencyState(c); localStorage.setItem('pref_currency', c); };
    const setUnit = (u: UnitSystem) => { setUnitState(u); localStorage.setItem('pref_unit', u); };
    const setLocation = (l: string) => { setLocationState(l); localStorage.setItem('pref_location', l); };

    // Helpers
    const convertPrice = (amountInINR: number): string => {
        const value = amountInINR * RATES[currency];
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(value);
    };

    const convertArea = (sqftStr: string): string => {
        // Simple parse assuming standard format "1,234 sqft"
        const num = parseFloat(sqftStr.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return sqftStr;

        if (unit === 'ft²') return `${num.toLocaleString()} ft²`;
        // Only convert if m2 requested (1 sqft = 0.0929 m2)
        return `${Math.round(num * 0.0929).toLocaleString()} m²`;
    };

    return (
        <PreferencesContext.Provider value={{
            mode, currency, unit, location,
            setMode, setCurrency, setUnit, setLocation,
            convertPrice, convertArea
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
    return context;
};
