import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Info, ArrowUpRight } from 'lucide-react';
import type { Project } from '../../services/projectService';
import { usePreferences } from '../../context/PreferencesContext';

// Extend Project type for UI demo purposes if needed, or use intersection type
interface ProjectCardProps {
    project: Omit<Project, 'paymentPlan'> & {
        paymentPlan?: Project['paymentPlan'] | string;
        // UI specific mock properties (fallback if not in DB yet)
        imageUrl?: string;
        completionDate?: string;
        developerName?: string;
        status?: 'Presale' | 'On Sale' | 'Sold Out';
        isRecommended?: boolean;
        location?: string;
    };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const navigate = useNavigate();
    const { mode, convertPrice } = usePreferences();

    // Mock data fallbacks for premium UI feeling
    const imageUrl = project.imageUrl || `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60`;
    const status = project.status || 'Presale';
    const developer = project.developerName || 'Meraki Developers';
    const completion = project.completionDate || 'Q2 2027';
    // Handle rich payment plan (Array) vs Mock string
    const displayPaymentPlan = Array.isArray(project.paymentPlan)
        ? 'Linked'
        : (typeof project.paymentPlan === 'string' ? project.paymentPlan : '50/50');

    return (
        <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image Header */}
            <div className="relative h-56 w-full overflow-hidden">
                <img
                    src={imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold rounded-lg shadow-sm uppercase tracking-wide">
                        {status}
                    </span>
                    <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-sm">
                        {completion}
                    </span>
                    {project.isRecommended && (
                        <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-sm animate-pulse">
                            Recommended
                        </span>
                    )}
                </div>

                {/* Like Button */}
                <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white rounded-full text-white hover:text-red-500 transition-all duration-200 group/heart" aria-label="Add to favorites">
                    <Heart className="w-4 h-4 fill-transparent group-hover/heart:fill-current" />
                </button>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col flex-1">
                {/* Developer Info - Hidden in Client Mode */}
                {mode === 'AGENT' && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {developer.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{developer}</span>
                    </div>
                )}

                {/* Title & Location */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight group-hover:text-primary transition-colors">
                        {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {project.location || 'Dubai Marina, Dubai'}
                    </p>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-100 my-auto mb-4" />

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Starting Price</p>
                        <p className="text-lg font-bold text-slate-900 flex items-baseline gap-1">
                            {convertPrice(project.eoiAmount)}
                        </p>
                    </div>

                    {/* Only show Payment Plan/Commission hints in Agent Mode? 
                        The requirement says Client Mode hides commissions. 
                        Payment Plan is usually sales info so allowed, but 'Commission' would be hidden. 
                        If I added Commission here, it would be wrapped in {mode === 'AGENT' && ...}.
                        For now just keeping Payment Plan safe.
                    */}
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-end gap-1">
                            Payment Plan <Info className="w-3 h-3" />
                        </p>
                        <p className="text-lg font-bold text-slate-900">{displayPaymentPlan}%</p>
                    </div>
                </div>

                {/* Action */}
                <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="mt-auto w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                    View Details
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
