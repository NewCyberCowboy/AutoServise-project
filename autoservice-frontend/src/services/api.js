import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7058/api'
});


api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role) {
        config.headers['X-User-Role'] = user.role;
    }
    return config;
});

export default api;