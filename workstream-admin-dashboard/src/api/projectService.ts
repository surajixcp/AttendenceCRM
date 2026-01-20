import api from './api';
import { Project } from '../../types';

export const projectService = {
    getAllProjects: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    createProject: async (data: Omit<Project, 'id'>) => {
        const response = await api.post('/projects', data);
        return response.data;
    },

    updateProject: async (id: string, data: Partial<Project>) => {
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    }
};
