import api from './api';

export interface LeaveRequest {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    leaveType: string;
    reason: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export const leaveService = {
    // Get all leaves with optional status filter
    getAllLeaves: async (status: string = 'All') => {
        const params: any = {};
        if (status !== 'All') {
            params.status = status;
        }
        const response = await api.get('/leaves/all', { params });
        return response.data;
    },

    approveLeave: async (id: string) => {
        const response = await api.post(`/leaves/approve/${id}`);
        return response.data;
    },

    rejectLeave: async (id: string) => {
        const response = await api.post(`/leaves/reject/${id}`);
        return response.data;
    }
};
