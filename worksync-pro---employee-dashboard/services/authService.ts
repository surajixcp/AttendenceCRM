import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // The backend returns user data flat with token
            const userData = { ...response.data };
            // We might want to separate token?
            // But storing the whole object is fine as long as we know structure.
            localStorage.setItem('user', JSON.stringify(userData));
        }
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/me'); // Corrected endpoint
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/auth/profile', data);
        if (response.data) {
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
