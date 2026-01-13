import React, { useEffect, useState } from 'react';
import { getProjects, type Project } from '../../services/projectService';
import { Link } from 'react-router-dom';

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error('Failed to fetch projects', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <Link to="/projects/create" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
                    Create Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="premium-card p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                        <div className="text-sm text-gray-500 space-y-1">
                            <p>EOI Amount: ₹{project.eoiAmount}</p>
                            <p>Max EOIs: {project.maxEOIsPerUnit}</p>
                            <p>Expiry: {project.eoiExpiryHours}h</p>
                        </div>
                    </div>
                ))}
            </div>
            {projects.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    No projects found. Create one to get started.
                </div>
            )}
        </div>
    );
};

export default ProjectList;
