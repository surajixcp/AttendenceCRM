import api from './api';

export const projectService = {
    getMyProjects: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    updateProgress: async (id: string, progress: number) => {
        const response = await api.put(`/projects/${id}/progress`, { progress });
        return response.data;
    }
};
