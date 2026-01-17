import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MarketplaceContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filters: {
        status: string | null;  // 'Off-plan' | 'Secondary'
        saleStatus: string | null; // 'On Sale' | 'Presale'
        priceRange: string | null;
        bedrooms: string | null;
    };
    updateFilter: (key: keyof MarketplaceContextType['filters'], value: string | null) => void;
    resetFilters: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<MarketplaceContextType['filters']>({
        status: 'Off-plan',
        saleStatus: null,
        priceRange: null,
        bedrooms: null,
    });

    const updateFilter = (key: keyof MarketplaceContextType['filters'], value: string | null) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            status: 'Off-plan',
            saleStatus: null,
            priceRange: null,
            bedrooms: null,
        });
        setSearchQuery('');
    };

    return (
        <MarketplaceContext.Provider value={{ searchQuery, setSearchQuery, filters, updateFilter, resetFilters }}>
            {children}
        </MarketplaceContext.Provider>
    );
};

export const useMarketplace = () => {
    const context = useContext(MarketplaceContext);
    if (!context) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider');
    }
    return context;
};
