import api from './api';
import { SalaryRecord } from '../../types';

export const salaryService = {
    getAllSalaries: async () => {
        const response = await api.get('/salaries');
        return response.data;
    },

    createSalary: async (data: Omit<SalaryRecord, 'id'>) => {
        const response = await api.post('/salaries', data);
        return response.data;
    },

    updateSalary: async (id: string, data: Partial<SalaryRecord>) => {
        const response = await api.put(`/salaries/${id}`, data);
        return response.data;
    },

    deleteSalary: async (id: string) => {
        const response = await api.delete(`/salaries/${id}`);
        return response.data;
    },

    generateBatch: async (month: number, year: number) => {
        const response = await api.post('/salaries/generate-batch', { month, year });
        return response.data;
    }
};
