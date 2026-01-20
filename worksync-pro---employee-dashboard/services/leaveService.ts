import api from './api';

export const leaveService = {
    getMyLeaves: async () => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        // Fallback or error if no user
        if (!user.id && !user._id) return [];
        const id = user.id || user._id;
        const response = await api.get(`/leaves/list/${id}`);
        return response.data;
    },

    applyLeave: async (data: any) => {
        const response = await api.post('/leaves/apply', data);
        return response.data;
    }
};
