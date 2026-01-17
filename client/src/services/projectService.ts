import api from '../lib/api';

export interface Project {
    id: string;
    name: string;
    eligibilityMode: boolean;
    eoiAmount: number;
    maxEOIsPerUnit: number;
    eoiExpiryHours: number;
    assets?: { id: string; type: string; url: string; label?: string }[];
    brochureUrl?: string;

    // Rich Data (Optional for create, present on fetch)
    units?: any[]; // Relaxed for build debugging
    paymentPlan?: { name: string; percentage: number }[];
    amenities?: { name: string }[] | string[];
    gallery?: string[]; // Payload only

    createdAt: string;
}

export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

export const createProject = async (data: Partial<Project>) => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const joinProject = async (projectId: string) => {
    const response = await api.post('/projects/join', { projectId });
    return response.data;
};

export const downloadProjectPDF = async (projectId: string, projectName: string) => {
    const response = await api.get(`/projects/${projectId}/pdf`, {
        responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};
