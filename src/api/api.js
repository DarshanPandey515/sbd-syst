// src/api/api.js
import axios from 'axios';

const createApiClient = (baseURL) => {
    const api = axios.create({
        baseURL,
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
    });

    // Request interceptor
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
                    localStorage.setItem('access_token', response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (err) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    // window.location.href = '/login';
                    return Promise.reject(err);
                }
            }

            return Promise.reject(error);
        }
    );


    return api;
};
    
const api = createApiClient('http://127.0.0.1:8000/api/');

// API endpoints
const createCrudEndpoints = (resource) => ({
    getAll: () => api.get(`${resource}/`),
    getById: (id) => api.get(`${resource}/${id}/`),
    create: (data) => api.post(`${resource}/`, data),
    update: (id, data) => api.put(`${resource}/${id}/`, data),
    delete: (id) => api.delete(`${resource}/${id}/`),
});

export const authApi = {
    login: (credentials) => api.post('admin/login/', credentials),
    logout: (data) => api.post('admin/logout/', data),
    refreshToken: (refresh) => api.post('admin/token/refresh/', { refresh }),
};

export const meetApi = {
    ...createCrudEndpoints('meets'),
    getParticipants: (meetId) => api.get('participants/', { params: { meet_id: meetId } }),
};

export const participantApi = createCrudEndpoints('participants');
export const liftApi = createCrudEndpoints('lift-attempts');
export const venueApi = createCrudEndpoints('venues');
export const weightClassApi = createCrudEndpoints('weight-classes');
export const teamApi = createCrudEndpoints('teams');