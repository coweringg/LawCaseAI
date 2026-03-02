import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 503) {
            return Promise.resolve({
                data: {
                    success: false,
                    message: 'System is under maintenance',
                    maintenance: true
                }
            });
        }

        if (error.response && error.response.status === 429) {
            console.warn('Rate limit reached. Requests are being throttled.');
            return Promise.resolve({
                data: {
                    success: false,
                    message: error.response.data?.message || 'Too many requests. Please slow down.'
                }
            });
        }

        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                console.warn('Unauthorized access detected. Redirecting to login.');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        if (error.response && error.response.status === 403) {
            return Promise.resolve({
                data: {
                    success: false,
                    message: error.response.data?.message || 'Access denied or limit reached.'
                }
            });
        }

        return Promise.reject(error);
    }
);

export default api;
