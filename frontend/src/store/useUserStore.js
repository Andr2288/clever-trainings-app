// src/store/useUserStore.js
import { create } from 'zustand';

const STORAGE_KEY = 'fitapp_user_data';

// Функції для роботи з localStorage
const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
};

export const useUserStore = create((set, get) => ({
    // Стан
    user: loadFromStorage(),
    isLoading: false,

    // Дії
    setUser: (userData) => {
        set({ user: userData });
        saveToStorage(userData);
    },

    updateUser: (newData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...newData };
        set({ user: updatedUser });
        saveToStorage(updatedUser);
    },

    clearUser: () => {
        set({ user: null });
        localStorage.removeItem(STORAGE_KEY);
    },

    // Обчислювані значення
    getCalculatedCalories: () => {
        const user = get().user;
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
        switch (user.activity) {
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
    }
}));