import api from './api';
import { Holiday } from '../../types';

export const holidayService = {
    getAllHolidays: async () => {
        const response = await api.get('/holidays');
        return response.data;
    },

    createHoliday: async (data: Omit<Holiday, 'id'>) => {
        const response = await api.post('/holidays', data);
        return response.data;
    },

    updateHoliday: async (id: string, data: Partial<Holiday>) => {
        const response = await api.put(`/holidays/${id}`, data);
        return response.data;
    },

    deleteHoliday: async (id: string) => {
        const response = await api.delete(`/holidays/${id}`);
        return response.data;
    }
};
