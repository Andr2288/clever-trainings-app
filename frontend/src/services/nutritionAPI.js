import { axiosInstance } from "../lib/axios.js";

// API сервіс для роботи з харчуванням
export const nutritionAPI = {
    // ПРОДУКТИ ХАРЧУВАННЯ

    // Отримати всі продукти харчування
    getAllFoodItems: async () => {
        const response = await axiosInstance.get("/nutrition/foods");
        return response.data;
    },

    // Пошук продуктів за назвою
    searchFoodItems: async (searchTerm, categoryId = null) => {
        const params = new URLSearchParams({ q: searchTerm });
        if (categoryId) {
            params.append('category_id', categoryId);
        }
        const response = await axiosInstance.get(`/nutrition/foods/search?${params}`);
        return response.data;
    },

    // Отримати всі категорії продуктів
    getFoodCategories: async () => {
        const response = await axiosInstance.get("/nutrition/categories");
        return response.data;
    },

    // ЩОДЕННИЙ РАЦІОН

    // Отримати раціон на дату (за замовчуванням сьогодні)
    getDailyMeals: async (date = null) => {
        const params = date ? `?date=${date}` : '';
        const response = await axiosInstance.get(`/nutrition/daily${params}`);
        return response.data;
    },

    // Додати продукт до щоденного раціону
    addDailyMeal: async (foodItemId, quantityGrams) => {
        const response = await axiosInstance.post("/nutrition/daily", {
            food_item_id: foodItemId,
            quantity_grams: quantityGrams
        });
        return response.data;
    },

    // Оновити кількість продукту в раціоні
    updateDailyMeal: async (mealId, quantityGrams) => {
        const response = await axiosInstance.put(`/nutrition/daily/${mealId}`, {
            quantity_grams: quantityGrams
        });
        return response.data;
    },

    // Видалити продукт з раціону
    deleteDailyMeal: async (mealId) => {
        const response = await axiosInstance.delete(`/nutrition/daily/${mealId}`);
        return response.data;
    },

    // Очистити весь день
    clearDailyMeals: async (date = null) => {
        const data = date ? { date } : {};
        const response = await axiosInstance.delete("/nutrition/daily", { data });
        return response.data;
    },

    // ІСТОРІЯ ХАРЧУВАННЯ

    // Отримати історію харчування
    getMealHistory: async (limit = 30) => {
        const response = await axiosInstance.get(`/nutrition/history?limit=${limit}`);
        return response.data;
    }
};

// Утилітарні функції для роботи з даними харчування
export const nutritionUtils = {
    // Розрахувати калорії для кількості
    calculateNutrients: (foodItem, quantity) => {
        const factor = quantity / 100;
        return {
            calories: Math.round(foodItem.calories_per_100g * factor * 100) / 100,
            protein: Math.round(foodItem.protein_per_100g * factor * 100) / 100,
            fat: Math.round(foodItem.fat_per_100g * factor * 100) / 100,
            carbs: Math.round(foodItem.carbs_per_100g * factor * 100) / 100
        };
    },

    // Розрахувати загальну статистику для списку прийомів їжі
    calculateTotals: (meals) => {
        return meals.reduce((totals, meal) => ({
            calories: totals.calories + (parseFloat(meal.total_calories) || 0),
            protein: totals.protein + (parseFloat(meal.total_protein) || 0),
            fat: totals.fat + (parseFloat(meal.total_fat) || 0),
            carbs: totals.carbs + (parseFloat(meal.total_carbs) || 0)
        }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
    },

    // Форматувати продукт для фронтенду
    formatFoodItem: (item) => ({
        id: item.id,
        name: item.name,
        calories: item.calories_per_100g,
        protein: item.protein_per_100g,
        fat: item.fat_per_100g,
        carbs: item.carbs_per_100g,
        category: item.category_name || 'Без категорії',
        description: item.description || ''
    }),

    // Форматувати приймання їжі для фронтенду
    formatMeal: (meal) => ({
        id: meal.id,
        name: meal.food_name,
        calories: meal.calories_per_100g,
        protein: meal.protein_per_100g,
        fat: meal.fat_per_100g,
        carbs: meal.carbs_per_100g,
        quantity: meal.quantity_grams,
        category: meal.category_name || 'Без категорії',
        totalCalories: parseFloat(meal.total_calories) || 0,
        totalProtein: parseFloat(meal.total_protein) || 0,
        totalFat: parseFloat(meal.total_fat) || 0,
        totalCarbs: parseFloat(meal.total_carbs) || 0,
        consumedAt: meal.consumed_at,
        date: meal.meal_date
    })
};