import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export const useOrganizationDetails = (enabled: boolean) => {
    return useQuery({
        queryKey: ['organization'],
        queryFn: async () => {
            const response = await api.get('/payments/organization');
            return response.data.data;
        },
        enabled,
    });
};

export const useBillingInfo = () => {
    return useQuery({
        queryKey: ['billing'],
        queryFn: async () => {
            const response = await api.get('/user/billing');
            return response.data.data;
        },
    });
};

export const usePurchaseHistory = () => {
    return useQuery({
        queryKey: ['purchaseHistory'],
        queryFn: async () => {
            const response = await api.get('/payments/history');
            return response.data.data || [];
        },
    });
};

export const useOrganizationMembers = (enabled: boolean) => {
    return useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const response = await api.get('/payments/members');
            return response.data.data || [];
        },
        enabled,
    });
};
