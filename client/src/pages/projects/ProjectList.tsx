import React, { useEffect, useState } from 'react';
import { getProjects, type Project } from '../../services/projectService';
import MarketplaceFilters from '../../components/marketplace/MarketplaceFilters';
import ProjectCard from '../../components/marketplace/ProjectCard';
import { MarketplaceProvider, useMarketplace } from '../../context/MarketplaceContext';

interface RichProject extends Project {
    status: string;
    isRecommended: boolean;
    developerName: string;
    completionDate: string;
    paymentPlanString: string; // Helper for display
    imageUrl: string;
}

const ProjectListContent: React.FC = () => {
    const [projects, setProjects] = useState<RichProject[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery, filters } = useMarketplace();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();

                // MOCK DATA AUGMENTATION (Moved here so we can filter it)
                const enrichedData = data.map((project: Project, index: number) => ({
                    ...project,
                    imageUrl: [
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60',
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
                        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=60',
                        'https://images.unsplash.com/photo-1600596542815-2a429b08b3b9?w=800&auto=format&fit=crop&q=60'
                    ][index % 4],
                    status: index % 3 === 0 ? 'On Sale' : 'Presale',
                    isRecommended: index === 0,
                    developerName: ['Emaar', 'Damac', 'Sobha', 'Meraas'][index % 4],
                    completionDate: ['Q4 2026', 'Q2 2027', 'Q1 2025'][index % 3],
                    paymentPlanString: ['60/40', '50/50', 'Post-Handover'][index % 3]
                }));

                setProjects(enrichedData);
            } catch (error) {
                console.error('Failed to fetch projects', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Filter Logic
    const filteredProjects = projects.filter(project => {
        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = project.name.toLowerCase().includes(query);
            const matchesDev = project.developerName.toLowerCase().includes(query);
            if (!matchesName && !matchesDev) return false;
        }

        // Tabs (Status)
        if (filters.status && filters.status === 'Secondary') {
            // For now, assume all fetched are Off-plan unless mocked otherwise. 
            // If we had a "type" field we would use it. 
            // Implementation Detail: Just showing empty for secondary as demo
            return false;
        }

        // Dropdown Filters
        if (filters.saleStatus && project.status !== filters.saleStatus) return false;
        // Add more filters here as data structure allows (Price, Bed, etc)

        return true;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in pb-10">
            {/* Header / Filters Section */}
            <MarketplaceFilters />

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={{
                            ...project,
                            paymentPlan: [{ name: 'Standard', percentage: 100 }] // Adapter for Card prop type
                        }}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <span className="text-2xl">🏙️</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
                    <p className="text-slate-500 max-w-md">
                        We couldn't find any projects matching your criteria. Try adjusting your filters or search terms.
                    </p>
                </div>
            )}
        </div>
    );
};

const ProjectList: React.FC = () => {
    return (
        <MarketplaceProvider>
            <ProjectListContent />
        </MarketplaceProvider>
    );
};

export default ProjectList;
