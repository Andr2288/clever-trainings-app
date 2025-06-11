// Централізований API сервіс для FitApp
import { axiosInstance } from "../lib/axios.js";
import { nutritionAPI, nutritionUtils } from "./nutritionAPI.js";
import { workoutAPI, workoutUtils } from "./workoutAPI.js";

// API сервіс для автентифікації (розширений)
export const authAPI = {
    // Реєстрація
    signup: async (userData) => {
        const response = await axiosInstance.post("/auth/signup", userData);
        return response.data;
    },

    // Вхід
    login: async (credentials) => {
        const response = await axiosInstance.post("/auth/login", credentials);
        return response.data;
    },

    // Вихід
    logout: async () => {
        const response = await axiosInstance.post("/auth/logout");
        return response.data;
    },

    // Перевірка автентифікації
    checkAuth: async () => {
        const response = await axiosInstance.get("/auth/check");
        return response.data;
    },

    // Оновлення профілю
    updateProfile: async (profileData) => {
        const response = await axiosInstance.put("/auth/update-profile", profileData);
        return response.data;
    },

    // Статистика користувача
    getUserStats: async () => {
        const response = await axiosInstance.get("/auth/stats");
        return response.data;
    }
};

// Загальний API сервіс
export const api = {
    auth: authAPI,
    nutrition: nutritionAPI,
    workouts: workoutAPI,

    // Утиліти
    utils: {
        nutrition: nutritionUtils,
        workouts: workoutUtils
    },

    // Перевірка здоров'я API
    healthCheck: async () => {
        try {
            const response = await axiosInstance.get("/health");
            return response.data;
        } catch (error) {
            console.error("Health check failed:", error);
            throw error;
        }
    },

    // Обробка помилок API
    handleError: (error) => {
        if (error.response) {
            // Сервер відповів з помилкою
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    return data.message || "Неправильні дані запиту";
                case 401:
                    return "Потрібна авторизація";
                case 403:
                    return "Немає прав доступу";
                case 404:
                    return "Ресурс не знайдено";
                case 422:
                    return data.message || "Помилка валідації";
                case 500:
                    return "Внутрішня помилка сервера";
                default:
                    return data.message || `Помилка ${status}`;
            }
        } else if (error.request) {
            // Запит був відправлений, але відповіді немає
            return "Сервер не відповідає. Перевірте з'єднання.";
        } else {
            // Щось інше
            return error.message || "Невідома помилка";
        }
    }
};

// Експорт окремих сервісів для зручності
export { nutritionAPI, workoutAPI, authAPI };
export { nutritionUtils, workoutUtils };

// Default export
export default api;