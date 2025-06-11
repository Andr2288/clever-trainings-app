import { create } from 'zustand';
import { authAPI } from '../services/api.js';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
    // Стан
    authUser: null,
    userStats: null,

    // Стан завантаження
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    isLoadingStats: false,

    // Стан помилок
    error: null,

    // АВТЕНТИФІКАЦІЯ

    // Перевірка автентифікації при завантаженні додатку
    checkAuth: async () => {
        try {
            set({ isCheckingAuth: true, error: null });
            const response = await authAPI.checkAuth();

            // API повертає користувача напряму без обгортки success
            set({ authUser: response });
            return response;
        } catch (error) {
            set({ authUser: null });
            console.log("Користувач не авторизований");
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // Реєстрація
    signup: async (credentials) => {
        set({ isSigningUp: true, error: null });
        try {
            const response = await authAPI.signup(credentials);

            // API повертає об'єкт з user
            if (response.user) {
                set({ authUser: response.user });
                toast.success(response.message || "Реєстрація успішна!");
                return response.user;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    // Вхід
    login: async (credentials) => {
        set({ isLoggingIn: true, error: null });
        try {
            const response = await authAPI.login(credentials);

            // API повертає об'єкт з user
            if (response.user) {
                set({ authUser: response.user });
                toast.success(response.message || "Вхід успішний!");
                return response.user;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    // Вихід
    logout: async () => {
        try {
            await authAPI.logout();
            set({
                authUser: null,
                userStats: null,
                error: null
            });
            toast.success("Вихід успішний!");
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error("Logout error:", error);
        }
    },

    // Оновлення профілю
    updateProfile: async (profileData) => {
        set({ isUpdatingProfile: true, error: null });
        try {
            const response = await authAPI.updateProfile(profileData);

            // API повертає об'єкт з user
            if (response.user) {
                set({ authUser: response.user });
                toast.success(response.message || "Профіль оновлено!");
                return response.user;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // СТАТИСТИКА КОРИСТУВАЧА

    // Завантажити статистику користувача
    loadUserStats: async () => {
        try {
            set({ isLoadingStats: true, error: null });
            const response = await authAPI.getUserStats();

            // API повертає статистику напряму
            set({ userStats: response });
            return response;
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            console.error('Помилка завантаження статистики:', error);
        } finally {
            set({ isLoadingStats: false });
        }
    },

    // УТИЛІТАРНІ МЕТОДИ

    // Очистити автентифікацію
    clearAuth: () => {
        set({
            authUser: null,
            userStats: null,
            error: null
        });
    },

    // Перевірити чи користувач авторизований
    isAuthenticated: () => {
        return !!get().authUser;
    },

    // Отримати ім'я користувача
    getUserName: () => {
        const user = get().authUser;
        if (!user) return '';

        // Backend використовує full_name
        return user.full_name || user.fullName || user.email || '';
    },

    // Отримати email користувача
    getUserEmail: () => {
        const user = get().authUser;
        return user?.email || '';
    },

    // Отримати ID користувача
    getUserId: () => {
        const user = get().authUser;
        return user?.id || null;
    },

    // Перевірити чи заповнений профіль
    isProfileComplete: () => {
        const user = get().authUser;
        if (!user) return false;

        // Перевіряємо основні поля профілю
        return !!(
            user.full_name &&
            user.email &&
            user.age &&
            user.weight &&
            user.height &&
            user.gender &&
            user.activity_level
        );
    },

    // Розрахувати рекомендовану калорійність
    getRecommendedCalories: () => {
        const user = get().authUser;
        if (!user || !user.weight || !user.height || !user.age) return null;

        // BMR calculation using Mifflin-St Jeor equation
        let bmr;
        if (user.gender === 'male') {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
        } else {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
        }

        // TDEE calculation based on activity level
        let multiplier;
        switch (user.activity_level) {
            case 'low':
                multiplier = 1.2;
                break;
            case 'moderate':
                multiplier = 1.55;
                break;
            case 'high':
                multiplier = 1.725;
                break;
            default:
                multiplier = 1.2;
        }

        return Math.round(bmr * multiplier);
    },

    // Отримати вік користувача
    getUserAge: () => {
        const user = get().authUser;
        return user?.age || null;
    },

    // Отримати вагу користувача
    getUserWeight: () => {
        const user = get().authUser;
        return user?.weight || null;
    },

    // Отримати зріст користувача
    getUserHeight: () => {
        const user = get().authUser;
        return user?.height || null;
    },

    // Отримати рівень активності
    getActivityLevel: () => {
        const user = get().authUser;
        return user?.activity_level || 'moderate';
    },

    // Отримати стать користувача
    getUserGender: () => {
        const user = get().authUser;
        return user?.gender || null;
    },

    // ОБРОБКА ПОМИЛОК

    // Очистити помилки
    clearError: () => set({ error: null }),

    // Встановити помилку
    setError: (error) => set({ error }),

    // ІНІЦІАЛІЗАЦІЯ

    // Ініціалізувати store (викликається при старті додатку)
    initialize: async () => {
        await get().checkAuth();

        // Якщо користувач авторизований, завантажуємо статистику
        if (get().authUser) {
            await get().loadUserStats();
        }
    },

    // Оновити всі дані користувача
    refresh: async () => {
        if (get().authUser) {
            await Promise.all([
                get().checkAuth(),
                get().loadUserStats()
            ]);
        }
    }
}));