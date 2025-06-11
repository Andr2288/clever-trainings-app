// src/store/useNutritionStore.js
import { create } from 'zustand';

const STORAGE_KEY = 'fitapp_nutrition_data';

const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving nutrition data:', error);
    }
};

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { dailyMeals: [], mealHistory: [] };
    } catch (error) {
        console.error('Error loading nutrition data:', error);
        return { dailyMeals: [], mealHistory: [] };
    }
};

const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

export const useNutritionStore = create((set, get) => ({
    // Стан
    dailyMeals: loadFromStorage().dailyMeals || [],
    mealHistory: loadFromStorage().mealHistory || [],

    // Дії
    addMeal: (product, quantity = 100) => {
        const meal = {
            id: Date.now(),
            ...product,
            quantity,
            consumedAt: new Date().toISOString(),
            date: getTodayDate()
        };

        const currentMeals = get().dailyMeals;
        const updatedMeals = [...currentMeals, meal];

        set({ dailyMeals: updatedMeals });

        const data = {
            dailyMeals: updatedMeals,
            mealHistory: get().mealHistory
        };
        saveToStorage(data);
    },

    removeMeal: (mealId) => {
        const currentMeals = get().dailyMeals;
        const updatedMeals = currentMeals.filter(meal => meal.id !== mealId);

        set({ dailyMeals: updatedMeals });

        const data = {
            dailyMeals: updatedMeals,
            mealHistory: get().mealHistory
        };
        saveToStorage(data);
    },

    updateMealQuantity: (mealId, newQuantity) => {
        const currentMeals = get().dailyMeals;
        const updatedMeals = currentMeals.map(meal =>
            meal.id === mealId ? { ...meal, quantity: newQuantity } : meal
        );

        set({ dailyMeals: updatedMeals });

        const data = {
            dailyMeals: updatedMeals,
            mealHistory: get().mealHistory
        };
        saveToStorage(data);
    },

    saveDayToHistory: () => {
        const today = getTodayDate();
        const currentMeals = get().dailyMeals;
        const currentHistory = get().mealHistory;

        if (currentMeals.length === 0) return;

        const dayRecord = {
            date: today,
            meals: [...currentMeals],
            totalCalories: get().getTotalCalories(),
            createdAt: new Date().toISOString()
        };

        const updatedHistory = [...currentHistory.filter(day => day.date !== today), dayRecord];

        set({
            mealHistory: updatedHistory,
            dailyMeals: [] // Очищаємо день після збереження
        });

        const data = {
            dailyMeals: [],
            mealHistory: updatedHistory
        };
        saveToStorage(data);
    },

    clearDay: () => {
        set({ dailyMeals: [] });

        const data = {
            dailyMeals: [],
            mealHistory: get().mealHistory
        };
        saveToStorage(data);
    },

    // Обчислювані значення
    getTotalCalories: () => {
        const meals = get().dailyMeals;
        return meals.reduce((total, meal) => {
            return total + ((meal.calories * meal.quantity) / 100);
        }, 0);
    },

    getTotalNutrients: () => {
        const meals = get().dailyMeals;
        return meals.reduce((totals, meal) => {
            const factor = meal.quantity / 100;
            return {
                protein: totals.protein + (meal.protein * factor),
                fat: totals.fat + (meal.fat * factor),
                carbs: totals.carbs + (meal.carbs * factor)
            };
        }, { protein: 0, fat: 0, carbs: 0 });
    },

    getMealsByDate: (date) => {
        const history = get().mealHistory;
        const dayRecord = history.find(day => day.date === date);
        return dayRecord ? dayRecord.meals : [];
    }
}));