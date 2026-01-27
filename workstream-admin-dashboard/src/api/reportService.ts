import api from './api';

export const reportService = {
    getAllReports: async (filters: { startDate?: string; endDate?: string; userId?: string } = {}) => {
        const response = await api.get('/reports/admin', { params: filters });
        return response.data;
    }
};
