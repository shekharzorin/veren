import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Share2, Heart, CheckCircle2, Phone, MessageSquare,
    Download, ExternalLink, ShieldCheck, UserPlus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getProjects, joinProject } from '../../services/projectService';

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project?.gallery) {
            setActiveImageIndex((prev) => (prev + 1) % project.gallery.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project?.gallery) {
            setActiveImageIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length);
        }
    };

    // Auth: Read directly from storage (consistent with DashboardLayout)
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Mock rich data (would usually come from DB)
    const mockDetails = {
        description: "Rise by Blanco Thornton is a masterpiece of modern architecture, offering a collection of ultra-luxury residences with breathtaking views of the city skyline. Designed for those who appreciate the finer things in life, this development combines state-of-the-art amenities with timeless elegance.",
        developer: "Blanco Thornton",
        completion: "Q4 2026",
        location: "Business Bay, Dubai",
        units: [
            { type: "1 Bedroom", size: "780 sq.ft", price: "₹ 1.8 Cr", availability: "Available" },
            { type: "2 Bedroom", size: "1,250 sq.ft", price: "₹ 2.9 Cr", availability: "Limited" },
            { type: "3 Bedroom", size: "1,800 sq.ft", price: "₹ 4.2 Cr", availability: "Sold Out" },
            { type: "Penthouse", size: "3,500 sq.ft", price: "₹ 12.5 Cr", availability: "Available" },
        ],
        amenities: [
            "Infinity Pool", "Private Gym", "Concierge Service",
            "Valet Parking", "Smart Home System", "Rooftop Garden"
        ],
        paymentPlan: [
            { stage: "Booking", percentage: 10 },
            { stage: "During Construction", percentage: 50 },
            { stage: "On Handover", percentage: 40 },
        ],
        agent: {
            name: "Shaik Suleman",
            role: "Senior Property Consultant",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80",
            phone: "+91 98765 43210",
            verified: true
        },
        gallery: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&auto=format&fit=crop&q=80"
        ]
    };

    useEffect(() => {
        // Simulate fetch
        const fetchProject = async () => {
            try {
                // Ideally fetch by ID, for now just getting list and finding one or using mock
                // In real app: const data = await getProjectById(id);
                const projects = await getProjects();
                const found = projects.find((p: any) => p.id === id) || projects[0];

                if (found) {
                    // Merge: Use Mock as base for missing fields, but carefully handle overrides
                    const merged = { ...mockDetails, ...found };

                    // Fix Object vs String collisions
                    if (typeof merged.developer === 'object' && merged.developer?.name) {
                        merged.developer = merged.developer.name;
                    }

                    // Fix Unit Availability (DB doesn't have it on UnitType, calculate or mock)
                    if (merged.units && Array.isArray(merged.units)) {
                        merged.units = merged.units.map((u: any) => ({
                            ...u,
                            availability: u.availability || 'Available' // Default for DB data
                        }));
                    }

                    setProject(merged);
                }
            } catch (error) {
                console.error("Failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!project) return <div>Project not found</div>;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            {/* Breadcrumb / Top Nav */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center gap-1">
                    ← Back to Projects
                </button>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600" aria-label="Share">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600" aria-label="Save">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">

                {/* LEFT COLUMN - CONTENT (Scrollable) */}
                <div className="lg:col-span-8 flex flex-col gap-10">

                    {/* Hero Section */}
                    {/* Main Active Image */}
                    <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm mb-4 bg-slate-100 group">
                        <img
                            src={project.gallery[activeImageIndex]}
                            alt={`Gallery ${activeImageIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                        />

                        {/* Overlay Controls (Desktop) */}
                        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={prevImage}
                                aria-label="Previous Image"
                                className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 hidden md:block"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                aria-label="Next Image"
                                className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 hidden md:block"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Image Counter Badge */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                {activeImageIndex + 1} / {project.gallery.length}
                            </span>
                        </div>

                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-lg text-slate-900">
                                Off-Plan
                            </span>
                            <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold rounded-lg">
                                Handover {project.completion}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Thumbnail Strip */}
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
                        {project.gallery.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`flex-shrink-0 h-20 w-32 rounded-xl overflow-hidden border-2 transition-all snap-start ${activeImageIndex === idx
                                    ? 'border-primary ring-2 ring-primary/20 scale-95 opacity-100'
                                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-100'
                                    }`}
                            >
                                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Overview */}
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>{project.location}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
                                    <span>by <span className="text-primary font-semibold">{project.developer}</span></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Starting from</p>
                                <p className="text-2xl font-bold text-slate-900">₹ {project.eoiAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h3 className="font-semibold text-lg mb-3">Description</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {project.description}
                                <button className="text-primary font-semibold ml-2 hover:underline">Read more</button>
                            </p>
                        </div>
                    </div>

                    {/* Units & Availability */}
                    <div id="units">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Units & Availability</h3>
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="grid grid-cols-4 bg-slate-50 p-4 font-semibold text-sm text-slate-500 border-b border-slate-200">
                                <div>Unit Type</div>
                                <div>Size</div>
                                <div>Price</div>
                                <div>Status</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {project.units.map((unit: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-4 p-4 items-center hover:bg-slate-50 transition text-sm">
                                        <div className="font-medium text-slate-900">{unit.type}</div>
                                        <div className="text-slate-600">{unit.size}</div>
                                        <div className="text-slate-900 font-semibold">{unit.price}</div>
                                        <div>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${unit.availability === 'Available' ? 'bg-green-100 text-green-700' :
                                                unit.availability === 'Limited' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {unit.availability}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Plan */}
                    <div id="payment-plan">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Payment Plan</h3>
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex h-4 rounded-full overflow-hidden mb-6">
                                {project.paymentPlan.map((plan: any, idx: number) => (
                                    <div
                                        key={idx}
                                        // eslint-disable-next-line
                                        style={{ width: `${plan.percentage}%` }}
                                        className={`${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-indigo-300' : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {project.paymentPlan.map((plan: any, idx: number) => (
                                    <div key={idx} className="text-center">
                                        <p className="text-2xl font-bold text-slate-900 mb-1">{plan.percentage}%</p>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{plan.stage}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Features & Amenities</h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {project.amenities.map((amenity: string) => (
                                <div key={amenity} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 text-center gap-2 hover:border-primary/50 transition cursor-default">
                                    <span className="text-2xl">✨</span>
                                    <span className="text-xs font-medium text-slate-700">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN - STICKY SIDEBAR */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">

                    {/* Agent Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <img src={project.agent.image} alt={project.agent.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-1">
                                    {project.agent.name}
                                    {project.agent.verified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />}
                                </h4>
                                <p className="text-xs text-slate-500">{project.agent.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition">
                                <Phone className="w-4 h-4" />
                                Call Agent
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-600 transition">
                                <MessageSquare className="w-4 h-4" />
                                WhatsApp
                            </button>
                        </div>

                        <div className="text-center">
                            <button className="text-xs text-slate-500 hover:text-primary underline">View Agent Profile</button>
                        </div>
                    </div>

                    {/* Agent Join Action (If User is Agent) */}
                    {user?.role === 'AGENT' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-slate-900">Partner with us</h3>
                            <p className="text-sm text-slate-600 mb-4">Start selling inventory in this project and earn commissions.</p>
                            <button
                                onClick={async () => {
                                    setJoining(true);
                                    try {
                                        await joinProject(project.id);
                                        alert('Successfully joined project!');
                                    } catch (err: any) {
                                        alert(err.message || 'Failed to join');
                                    } finally {
                                        setJoining(false);
                                    }
                                }}
                                disabled={joining}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition disabled:opacity-70"
                            >
                                <UserPlus className="w-4 h-4" />
                                {joining ? 'Joining...' : 'Join as Channel Partner'}
                            </button>
                        </div>
                    )}

                    {/* Booking Action */}
                    <div className="premium-card p-6 bg-gradient-to-br from-primary/5 to-white border-primary/20">
                        <h3 className="font-bold text-lg mb-2 text-primary">Interested in this project?</h3>
                        <p className="text-sm text-slate-600 mb-6">Secure your unit today with a refundable EOI payment.</p>

                        <div className="flex items-center justify-between mb-6 p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 uppercase font-semibold">Booking Amount</div>
                            <div className="font-bold text-slate-900">₹ {project.eoiAmount.toLocaleString()}</div>
                        </div>

                        <button
                            onClick={() => navigate(`/transactions/eoi/create?projectId=${project.id}`)}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all mb-4"
                        >
                            Book Now
                        </button>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Secure Payment via AMOG Gateway
                        </div>
                    </div>

                    {/* Download Brochure (Existing) */}
                    <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition group mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition">
                                <Download className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-900">Project Brochure</p>
                                <p className="text-xs text-slate-500">PDF, 12 MB</p>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Download PDF Summary (New) */}
                    <button
                        onClick={() => {
                            const btn = document.getElementById('btn-download-pdf');
                            if (btn) btn.innerText = 'Generating...';
                            import('../../services/projectService').then(mod => {
                                mod.downloadProjectPDF(project.id, project.name)
                                    .finally(() => { if (btn) btn.innerText = 'Download Summary PDF'; });
                            });
                        }}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                                <Download className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-900" id="btn-download-pdf">Download Summary PDF</p>
                                <p className="text-xs text-slate-500">Auto-generated Report</p>
                            </div>
                        </div>
                    </button>

                </div>

            </div>



            {/* Lightbox Overlay */}

        </div>
    );
};

export default ProjectDetails;
