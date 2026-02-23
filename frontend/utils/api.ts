import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for HttpOnly Cookies
});

// Request interceptor: we no longer manually attach the token
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 503 Maintenance Mode globally to prevent runtime crashes
        if (error.response && error.response.status === 503) {
            return Promise.resolve({
                data: {
                    success: false,
                    message: 'System is under maintenance',
                    maintenance: true
                }
            });
        }

        // Handle 429 Too Many Requests globally to prevent runtime crashes
        if (error.response && error.response.status === 429) {
            console.warn('Rate limit reached. Requests are being throttled.');
            return Promise.resolve({
                data: {
                    success: false,
                    // Forward the actual backend message so the UI can display it
                    message: error.response.data?.message || 'Too many requests. Please slow down.'
                }
            });
        }

        if (error.response && error.response.status === 401) {
            // Check if we are already on the login page to avoid loops
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                console.warn('Unauthorized access detected. Redirecting to login.');
                localStorage.removeItem('user'); // Only remove non-sensitive data
                window.location.href = '/login';
            }
        }

        // Handle 403 Forbidden (e.g. Plan Limit Reached)
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
