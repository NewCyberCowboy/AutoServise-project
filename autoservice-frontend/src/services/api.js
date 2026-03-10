import axios from 'axios';

// Базовый URL API из переменной окружения или конфига
const API_BASE_URL = 'https://localhost:7058'; // Измените на ваш порт

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000
});

// Функция для получения полного URL (для изображений, QR-кодов и т.д.)
export const getFullUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

// Перехватчики для логирования
api.interceptors.request.use(request => {
    console.log('Starting Request:', request.url);
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('Response:', response.status);
        return response;
    },
    error => {
        console.error('Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default api;