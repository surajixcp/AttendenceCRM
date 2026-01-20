import api from './api';

export const uploadService = {
    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    },

    uploadCompanyLogo: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    }
};
