import api from './api';
import { Meeting } from '../../types';

export const meetingService = {
    getAllMeetings: async () => {
        const response = await api.get('/meetings');
        return response.data;
    },

    createMeeting: async (data: Omit<Meeting, 'id'>) => {
        const response = await api.post('/meetings', data);
        return response.data;
    },

    updateMeeting: async (id: string, data: Partial<Meeting>) => {
        const response = await api.put(`/meetings/${id}`, data);
        return response.data;
    },

    deleteMeeting: async (id: string) => {
        const response = await api.delete(`/meetings/${id}`);
        return response.data;
    }
};
