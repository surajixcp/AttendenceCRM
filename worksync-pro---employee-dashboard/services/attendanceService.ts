import api from './api';

export const attendanceService = {
    checkIn: async () => {
        const response = await api.post('/attendance/checkin');
        return response.data;
    },

    checkOut: async () => {
        const response = await api.post('/attendance/checkout');
        return response.data;
    },

    getDailyAttendance: async (userId: string) => {
        const response = await api.get(`/attendance/daily/${userId}`);
        return response.data;
    },

    // For Dashboard charts or history
    getMonthlyAttendance: async (userId: string, month: number, year: number) => {
        const response = await api.get(`/attendance/monthly/${userId}`, {
            params: { month, year }
        });
        return response.data;
    }
};
