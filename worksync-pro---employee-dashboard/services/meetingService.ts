import api from './api';

export const meetingService = {
    getMyMeetings: async () => {
        const response = await api.get('/meetings');
        return response.data;
    }
};
