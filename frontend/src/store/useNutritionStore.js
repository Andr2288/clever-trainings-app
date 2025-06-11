import { create } from 'zustand';
import { nutritionAPI, nutritionUtils } from '../services/nutritionAPI.js';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export const useNutritionStore = create((set, get) => ({
    // Стан
    dailyMeals: [],
    mealHistory: [],
    foodItems: [],
    foodCategories: [],

    // Стан завантаження
    isLoading: false,
    isLoadingMeals: false,
    isLoadingHistory: false,

    // Стан помилок
    error: null,

    // ПРОДУКТИ ХАРЧУВАННЯ

    // Завантажити всі продукти
    loadFoodItems: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await nutritionAPI.getAllFoodItems();

            if (response.success) {
                const formattedFoods = response.data.map(nutritionUtils.formatFoodItem);
                set({ foodItems: formattedFoods });
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            console.error('Помилка завантаження продуктів:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Завантажити категорії продуктів
    loadFoodCategories: async () => {
        try {
            const response = await nutritionAPI.getFoodCategories();

            if (response.success) {
                set({ foodCategories: response.data });
            }
        } catch (error) {
            console.error('Помилка завантаження категорій:', error);
        }
    },

    // Пошук продуктів
    searchFoodItems: async (searchTerm, categoryId = null) => {
        try {
            if (!searchTerm || searchTerm.length < 2) {
                return [];
            }

            const response = await nutritionAPI.searchFoodItems(searchTerm, categoryId);

            if (response.success) {
                return response.data.map(nutritionUtils.formatFoodItem);
            }
            return [];
        } catch (error) {
            console.error('Помилка пошуку продуктів:', error);
            return [];
        }
    },

    // ЩОДЕННИЙ РАЦІОН

    // Завантажити раціон на дату
    loadDailyMeals: async (date = null) => {
        try {
            set({ isLoadingMeals: true, error: null });
            const response = await nutritionAPI.getDailyMeals(date);

            if (response.success) {
                const formattedMeals = response.data.meals.map(nutritionUtils.formatMeal);
                set({ dailyMeals: formattedMeals });
                return response.data;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            console.error('Помилка завантаження раціону:', error);
        } finally {
            set({ isLoadingMeals: false });
        }
    },

    // Додати продукт до раціону
    addMeal: async (product, quantity = 100) => {
        try {
            set({ isLoadingMeals: true });

            // Якщо це локальний продукт (з foodList.js), використовуємо його ID
            // Якщо це продукт з API, у нього вже є правильний ID
            const foodItemId = product.id;

            const response = await nutritionAPI.addDailyMeal(foodItemId, quantity);

            if (response.success) {
                const formattedMeal = nutritionUtils.formatMeal(response.data);

                set(state => ({
                    dailyMeals: [...state.dailyMeals, formattedMeal]
                }));

                toast.success(`${product.name} додано до раціону`);
                return formattedMeal;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка додавання до раціону:', error);
        } finally {
            set({ isLoadingMeals: false });
        }
    },

    // Оновити кількість продукту
    updateMealQuantity: async (mealId, newQuantity) => {
        try {
            const response = await nutritionAPI.updateDailyMeal(mealId, newQuantity);

            if (response.success) {
                const updatedMeal = nutritionUtils.formatMeal(response.data);

                set(state => ({
                    dailyMeals: state.dailyMeals.map(meal =>
                        meal.id === mealId ? updatedMeal : meal
                    )
                }));

                toast.success('Кількість оновлено');
                return updatedMeal;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка оновлення кількості:', error);
        }
    },

    // Видалити продукт з раціону
    removeMeal: async (mealId) => {
        try {
            const response = await nutritionAPI.deleteDailyMeal(mealId);

            if (response.success) {
                set(state => ({
                    dailyMeals: state.dailyMeals.filter(meal => meal.id !== mealId)
                }));

                toast.success('Продукт видалено з раціону');
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка видалення з раціону:', error);
        }
    },

    // Очистити день
    clearDay: async (date = null) => {
        try {
            const response = await nutritionAPI.clearDailyMeals(date);

            if (response.success) {
                set({ dailyMeals: [] });
                toast.success('День очищено');
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка очищення дня:', error);
        }
    },

    // ІСТОРІЯ ХАРЧУВАННЯ

    // Завантажити історію харчування
    loadMealHistory: async (limit = 30) => {
        try {
            set({ isLoadingHistory: true, error: null });
            const response = await nutritionAPI.getMealHistory(limit);

            if (response.success) {
                set({ mealHistory: response.data });
                return response.data;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            console.error('Помилка завантаження історії:', error);
        } finally {
            set({ isLoadingHistory: false });
        }
    },

    // ОБЧИСЛЮВАНІ ЗНАЧЕННЯ

    // Отримати загальну калорійність за день
    getTotalCalories: () => {
        const meals = get().dailyMeals;
        return meals.reduce((total, meal) => total + (meal.totalCalories || 0), 0);
    },

    // Отримати загальні макроелементи за день
    getTotalNutrients: () => {
        const meals = get().dailyMeals;
        return meals.reduce((totals, meal) => ({
            protein: totals.protein + (meal.totalProtein || 0),
            fat: totals.fat + (meal.totalFat || 0),
            carbs: totals.carbs + (meal.totalCarbs || 0)
        }), { protein: 0, fat: 0, carbs: 0 });
    },

    // Отримати статистику за день
    getDayStats: () => {
        const meals = get().dailyMeals;
        const totals = get().getTotalNutrients();
        const totalCalories = get().getTotalCalories();

        return {
            meal_count: meals.length,
            total_calories: Math.round(totalCalories * 100) / 100,
            total_protein: Math.round(totals.protein * 100) / 100,
            total_fat: Math.round(totals.fat * 100) / 100,
            total_carbs: Math.round(totals.carbs * 100) / 100
        };
    },

    // УТИЛІТИ

    // Очистити помилки
    clearError: () => set({ error: null }),

    // Ініціалізація (завантажити початкові дані)
    initialize: async () => {
        const store = get();
        await Promise.all([
            store.loadFoodItems(),
            store.loadFoodCategories(),
            store.loadDailyMeals()
        ]);
    },

    // Оновити все
    refresh: async () => {
        const store = get();
        await Promise.all([
            store.loadDailyMeals(),
            store.loadMealHistory()
        ]);
    }
}));