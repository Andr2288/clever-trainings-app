import { executeQuery } from "../config/database.js";

// Отримати всі продукти харчування
const getAllFoodItems = async (req, res) => {
    try {
        const query = `
            SELECT 
                fi.*,
                fc.name as category_name
            FROM food_items fi
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            ORDER BY fi.name
        `;

        const foodItems = await executeQuery(query);

        return res.status(200).json({
            success: true,
            data: foodItems
        });
    } catch (error) {
        console.error("Помилка в getAllFoodItems:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати всі категорії продуктів
const getFoodCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                fc.*,
                COUNT(fi.id) as product_count
            FROM food_categories fc
            LEFT JOIN food_items fi ON fc.id = fi.category_id
            GROUP BY fc.id
            ORDER BY fc.name
        `;

        const categories = await executeQuery(query);

        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Помилка в getFoodCategories:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Пошук продуктів за назвою
const searchFoodItems = async (req, res) => {
    try {
        const { q: searchTerm, category_id } = req.query;

        if (!searchTerm || searchTerm.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Пошуковий запит повинен містити мінімум 2 символи"
            });
        }

        let query = `
            SELECT 
                fi.*,
                fc.name as category_name
            FROM food_items fi
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            WHERE fi.name LIKE ?
        `;

        const params = [`%${searchTerm}%`];

        // Додаємо фільтр по категорії якщо передано
        if (category_id) {
            query += ` AND fi.category_id = ?`;
            params.push(category_id);
        }

        query += ` ORDER BY fi.name LIMIT 20`;

        const foodItems = await executeQuery(query, params);

        return res.status(200).json({
            success: true,
            data: foodItems
        });
    } catch (error) {
        console.error("Помилка в searchFoodItems:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Додати продукт до щоденного раціону
const addDailyMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { food_item_id, quantity_grams } = req.body;

        if (!food_item_id || !quantity_grams) {
            return res.status(400).json({
                success: false,
                message: "food_item_id та quantity_grams обов'язкові"
            });
        }

        if (quantity_grams <= 0) {
            return res.status(400).json({
                success: false,
                message: "Кількість повинна бути більше 0"
            });
        }

        // Перевіряємо чи існує продукт
        const foodItem = await executeQuery(
            "SELECT * FROM food_items WHERE id = ?",
            [food_item_id]
        );

        if (foodItem.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Продукт не знайдено"
            });
        }

        // Додаємо до щоденного раціону
        const currentDate = new Date().toISOString().split('T')[0];

        const result = await executeQuery(
            `INSERT INTO daily_meals (user_id, food_item_id, quantity_grams, meal_date) 
             VALUES (?, ?, ?, ?)`,
            [userId, food_item_id, quantity_grams, currentDate]
        );

        // Повертаємо додану страву з повною інформацією
        const query = `
            SELECT 
                dm.*,
                fi.name as food_name,
                fi.calories_per_100g,
                fi.protein_per_100g,
                fi.fat_per_100g,
                fi.carbs_per_100g,
                fc.name as category_name,
                ROUND((fi.calories_per_100g * dm.quantity_grams / 100), 2) as total_calories,
                ROUND((fi.protein_per_100g * dm.quantity_grams / 100), 2) as total_protein,
                ROUND((fi.fat_per_100g * dm.quantity_grams / 100), 2) as total_fat,
                ROUND((fi.carbs_per_100g * dm.quantity_grams / 100), 2) as total_carbs
            FROM daily_meals dm
            JOIN food_items fi ON dm.food_item_id = fi.id
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            WHERE dm.id = ?
        `;

        const [addedMeal] = await executeQuery(query, [result.insertId]);

        return res.status(201).json({
            success: true,
            message: "Продукт додано до раціону",
            data: addedMeal
        });

    } catch (error) {
        console.error("Помилка в addDailyMeal:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати щоденний раціон
const getDailyMeals = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;

        const targetDate = date || new Date().toISOString().split('T')[0];

        const query = `
            SELECT 
                dm.*,
                fi.name as food_name,
                fi.calories_per_100g,
                fi.protein_per_100g,
                fi.fat_per_100g,
                fi.carbs_per_100g,
                fc.name as category_name,
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

        const meals = await executeQuery(query, [userId, targetDate]);

        // Розраховуємо загальну статистику за день
        const totals = meals.reduce((acc, meal) => ({
            calories: acc.calories + parseFloat(meal.total_calories || 0),
            protein: acc.protein + parseFloat(meal.total_protein || 0),
            fat: acc.fat + parseFloat(meal.total_fat || 0),
            carbs: acc.carbs + parseFloat(meal.total_carbs || 0)
        }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

        return res.status(200).json({
            success: true,
            data: {
                date: targetDate,
                meals,
                totals: {
                    calories: Math.round(totals.calories * 100) / 100,
                    protein: Math.round(totals.protein * 100) / 100,
                    fat: Math.round(totals.fat * 100) / 100,
                    carbs: Math.round(totals.carbs * 100) / 100,
                    meal_count: meals.length
                }
            }
        });

    } catch (error) {
        console.error("Помилка в getDailyMeals:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Оновити кількість продукту в раціоні
const updateDailyMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mealId } = req.params;
        const { quantity_grams } = req.body;

        if (!quantity_grams || quantity_grams <= 0) {
            return res.status(400).json({
                success: false,
                message: "Кількість повинна бути більше 0"
            });
        }

        // Перевіряємо чи належить страва користувачу
        const meal = await executeQuery(
            "SELECT * FROM daily_meals WHERE id = ? AND user_id = ?",
            [mealId, userId]
        );

        if (meal.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Запис не знайдено"
            });
        }

        // Оновлюємо кількість
        await executeQuery(
            "UPDATE daily_meals SET quantity_grams = ? WHERE id = ? AND user_id = ?",
            [quantity_grams, mealId, userId]
        );

        // Повертаємо оновлений запис
        const query = `
            SELECT 
                dm.*,
                fi.name as food_name,
                fi.calories_per_100g,
                fi.protein_per_100g,
                fi.fat_per_100g,
                fi.carbs_per_100g,
                fc.name as category_name,
                ROUND((fi.calories_per_100g * dm.quantity_grams / 100), 2) as total_calories,
                ROUND((fi.protein_per_100g * dm.quantity_grams / 100), 2) as total_protein,
                ROUND((fi.fat_per_100g * dm.quantity_grams / 100), 2) as total_fat,
                ROUND((fi.carbs_per_100g * dm.quantity_grams / 100), 2) as total_carbs
            FROM daily_meals dm
            JOIN food_items fi ON dm.food_item_id = fi.id
            LEFT JOIN food_categories fc ON fi.category_id = fc.id
            WHERE dm.id = ? AND dm.user_id = ?
        `;

        const [updatedMeal] = await executeQuery(query, [mealId, userId]);

        return res.status(200).json({
            success: true,
            message: "Кількість оновлено",
            data: updatedMeal
        });

    } catch (error) {
        console.error("Помилка в updateDailyMeal:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Видалити продукт з раціону
const deleteDailyMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mealId } = req.params;

        // Перевіряємо чи належить страва користувачу
        const meal = await executeQuery(
            "SELECT * FROM daily_meals WHERE id = ? AND user_id = ?",
            [mealId, userId]
        );

        if (meal.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Запис не знайдено"
            });
        }

        // Видаляємо запис
        await executeQuery(
            "DELETE FROM daily_meals WHERE id = ? AND user_id = ?",
            [mealId, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Продукт видалено з раціону"
        });

    } catch (error) {
        console.error("Помилка в deleteDailyMeal:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Очистити весь день
const clearDailyMeals = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.body;

        const targetDate = date || new Date().toISOString().split('T')[0];

        const result = await executeQuery(
            "DELETE FROM daily_meals WHERE user_id = ? AND meal_date = ?",
            [userId, targetDate]
        );

        return res.status(200).json({
            success: true,
            message: `Очищено ${result.affectedRows} записів за ${targetDate}`
        });

    } catch (error) {
        console.error("Помилка в clearDailyMeals:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати історію харчування
const getMealHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 30 } = req.query;

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

        const history = await executeQuery(query, [userId, parseInt(limit)]);

        return res.status(200).json({
            success: true,
            data: history.map(day => ({
                ...day,
                total_calories: Math.round(parseFloat(day.total_calories || 0) * 100) / 100,
                total_protein: Math.round(parseFloat(day.total_protein || 0) * 100) / 100,
                total_fat: Math.round(parseFloat(day.total_fat || 0) * 100) / 100,
                total_carbs: Math.round(parseFloat(day.total_carbs || 0) * 100) / 100
            }))
        });

    } catch (error) {
        console.error("Помилка в getMealHistory:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

export default {
    getAllFoodItems,
    getFoodCategories,
    searchFoodItems,
    addDailyMeal,
    getDailyMeals,
    updateDailyMeal,
    deleteDailyMeal,
    clearDailyMeals,
    getMealHistory
};