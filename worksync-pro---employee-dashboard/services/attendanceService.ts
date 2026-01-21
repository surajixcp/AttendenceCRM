import api from './api';

export const attendanceService = {
    checkIn: async (location?: { lat: number; lng: number }) => {
        const response = await api.post('/attendance/checkin', { location });
        return response.data;
    },

    checkOut: async (location?: { lat: number; lng: number }) => {
        const response = await api.post('/attendance/checkout', { location });
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
