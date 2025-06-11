import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
    withCredentials: true,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor для логування
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor для обробки помилок
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

        // Якщо помилка 401 (Unauthorized), можна тут обробити
        if (error.response?.status === 401) {
            // Можна очистити локальне сховище або перенаправити на логін
            console.warn('🔒 Помилка авторизації. Потрібно увійти в систему.');
        }

        return Promise.reject(error);
    }
);