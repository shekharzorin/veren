import api from '../lib/api';

export interface Project {
    id: string;
    name: string;
    eligibilityMode: boolean;
    eoiAmount: number;
    maxEOIsPerUnit: number;
    eoiExpiryHours: number;
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
