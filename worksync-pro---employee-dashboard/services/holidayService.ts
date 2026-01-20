import api from './api';

export const holidayService = {
    getAllHolidays: async () => {
        const response = await api.get('/holidays');
        return response.data;
    }
};
