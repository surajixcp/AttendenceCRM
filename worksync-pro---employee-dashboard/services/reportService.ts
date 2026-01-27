import api from './api';

export const reportService = {
    submitSOD: async (sod: string) => {
        const response = await api.post('/reports/sod', { sod });
        return response.data;
    },

    submitEOD: async (eod: string) => {
        const response = await api.post('/reports/eod', { eod });
        return response.data;
    },

    getMyReports: async () => {
        const response = await api.get('/reports/my');
        return response.data;
    }
};
