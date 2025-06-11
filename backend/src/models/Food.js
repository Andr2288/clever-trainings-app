import BaseModel from './BaseModel.js';

class FoodCategory extends BaseModel {
    constructor() {
        super('food_categories');
    }

    // Отримати всі категорії з кількістю продуктів
    async getAllWithProductCount() {
        const query = `
            SELECT 
                fc.*,
                COUNT(fi.id) as product_count
            FROM food_categories fc
            LEFT JOIN food_items fi ON fc.id = fi.category_id
            GROUP BY fc.id
            ORDER BY fc.name
        `;
        return await this.executeCustomQuery(query);
    }
}

class FoodItem extends BaseModel {
    constructor() {
        super('food_items');
    }

    // Отримати всі продукти з категоріями
    async getAllWithCategories() {
        const query = `
            SELECT 
                fi.*,
                fc.name as category_name,
                fc.description as category_description
            FROM food_items fi
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            ORDER BY fi.name
        `;
        return await this.executeCustomQuery(query);
    }

    // Пошук продуктів за назвою
    async searchByName(searchTerm) {
        const query = `
            SELECT 
                fi.*,
                fc.name as category_name
            FROM food_items fi
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            WHERE fi.name LIKE ?
            ORDER BY fi.name
        `;
        return await this.executeCustomQuery(query, [`%${searchTerm}%`]);
    }

    // Отримати продукти за категорією
    async getByCategory(categoryId) {
        const query = `
            SELECT 
                fi.*,
                fc.name as category_name
            FROM food_items fi
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            WHERE fi.category_id = ?
            ORDER BY fi.name
        `;
        return await this.executeCustomQuery(query, [categoryId]);
    }

    // Отримати популярні продукти (найчастіше вживані)
    async getPopular(limit = 10) {
        const query = `
            SELECT 
                fi.*,
                fc.name as category_name,
                COUNT(dm.id) as usage_count
            FROM food_items fi
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            LEFT JOIN daily_meals dm ON fi.id = dm.food_item_id
            GROUP BY fi.id
            ORDER BY usage_count DESC, fi.name
            LIMIT ?
        `;
        return await this.executeCustomQuery(query, [limit]);
    }

    // Розрахувати калорії для кількості
    calculateNutrients(foodItem, quantity) {
        const factor = quantity / 100;
        return {
            calories: Math.round(foodItem.calories_per_100g * factor * 100) / 100,
            protein: Math.round(foodItem.protein_per_100g * factor * 100) / 100,
            fat: Math.round(foodItem.fat_per_100g * factor * 100) / 100,
            carbs: Math.round(foodItem.carbs_per_100g * factor * 100) / 100
        };
    }
}

class DailyMeal extends BaseModel {
    constructor() {
        super('daily_meals');
    }

    // Додати їжу до щоденного раціону
    async addMeal(userId, foodItemId, quantity, mealDate = null) {
        const currentDate = mealDate || new Date().toISOString().split('T')[0];

        return await this.create({
            user_id: userId,
            food_item_id: foodItemId,
            quantity_grams: quantity,
            meal_date: currentDate
        });
    }

    // Отримати всі прийоми їжі за день
    async getDayMeals(userId, date) {
        const query = `
            SELECT 
                dm.*,
                fi.name as food_name,
                fi.calories_per_100g,
                fi.protein_per_100g,
                fi.fat_per_100g,
                fi.carbs_per_100g,
                fc.name as category_name,
                
                -- Розраховані значення для кількості
                ROUND((fi.calories_per_100g * dm.quantity_grams / 100), 2) as total_calories,
                ROUND((fi.protein_per_100g * dm.quantity_grams / 100), 2) as total_protein,
                ROUND((fi.fat_per_100g * dm.quantity_grams / 100), 2) as total_fat,
                ROUND((fi.carbs_per_100g * dm.quantity_grams / 100), 2) as total_carbs
                
            FROM daily_meals dm
            JOIN food_items fi ON dm.food_item_id = fi.id
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            WHERE dm.user_id = ? AND dm.meal_date = ?
            ORDER BY dm.consumed_at DESC
        `;
        return await this.executeCustomQuery(query, [userId, date]);
    }

    // Отримати статистику за день
    async getDayStats(userId, date) {
        const query = `
            SELECT 
                COUNT(*) as meal_count,
                SUM(ROUND((fi.calories_per_100g * dm.quantity_grams / 100), 2)) as total_calories,
                SUM(ROUND((fi.protein_per_100g * dm.quantity_grams / 100), 2)) as total_protein,
                SUM(ROUND((fi.fat_per_100g * dm.quantity_grams / 100), 2)) as total_fat,
                SUM(ROUND((fi.carbs_per_100g * dm.quantity_grams / 100), 2)) as total_carbs
            FROM daily_meals dm
            JOIN food_items fi ON dm.food_item_id = fi.id
            WHERE dm.user_id = ? AND dm.meal_date = ?
        `;
        const result = await this.executeCustomQuery(query, [userId, date]);
        return result[0] || {
            meal_count: 0,
            total_calories: 0,
            total_protein: 0,
            total_fat: 0,
            total_carbs: 0
        };
    }

    // Отримати історію харчування
    async getMealHistory(userId, limit = 30) {
        const query = `
            SELECT 
                dm.meal_date,
                COUNT(*) as meal_count,
                SUM(ROUND((fi.calories_per_100g * dm.quantity_grams / 100), 2)) as total_calories,
                SUM(ROUND((fi.protein_per_100g * dm.quantity_grams / 100), 2)) as total_protein,
                SUM(ROUND((fi.fat_per_100g * dm.quantity_grams / 100), 2)) as total_fat,
                SUM(ROUND((fi.carbs_per_100g * dm.quantity_grams / 100), 2)) as total_carbs
            FROM daily_meals dm
            JOIN food_items fi ON dm.food_item_id = fi.id
            WHERE dm.user_id = ?
            GROUP BY dm.meal_date
            ORDER BY dm.meal_date DESC
            LIMIT ?
        `;
        return await this.executeCustomQuery(query, [userId, limit]);
    }

    // Оновити кількість їжі
    async updateQuantity(mealId, newQuantity) {
        return await this.update(mealId, { quantity_grams: newQuantity });
    }

    // Видалити всі прийоми їжі за день
    async clearDay(userId, date) {
        const query = `DELETE FROM ${this.tableName} WHERE user_id = ? AND meal_date = ?`;
        return await this.executeCustomQuery(query, [userId, date]);
    }
}

export const foodCategoryModel = new FoodCategory();
export const foodItemModel = new FoodItem();
export const dailyMealModel = new DailyMeal();