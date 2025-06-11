import express from 'express';
import nutritionController from "../controllers/nutrition.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Всі роути потребують автентифікації
router.use(authMiddleware.protectRoute);

// ПРОДУКТИ ХАРЧУВАННЯ
// GET /api/nutrition/foods - отримати всі продукти
router.get("/foods", nutritionController.getAllFoodItems);

// GET /api/nutrition/foods/search?q=банан - пошук продуктів
router.get("/foods/search", nutritionController.searchFoodItems);

// GET /api/nutrition/categories - отримати всі категорії продуктів
router.get("/categories", nutritionController.getFoodCategories);

// ЩОДЕННИЙ РАЦІОН
// GET /api/nutrition/daily?date=2025-01-15 - отримати раціон на дату (за замовчуванням сьогодні)
router.get("/daily", nutritionController.getDailyMeals);

// POST /api/nutrition/daily - додати продукт до раціону
router.post("/daily", nutritionController.addDailyMeal);

// PUT /api/nutrition/daily/:mealId - оновити кількість продукту в раціоні
router.put("/daily/:mealId", nutritionController.updateDailyMeal);

// DELETE /api/nutrition/daily/:mealId - видалити продукт з раціону
router.delete("/daily/:mealId", nutritionController.deleteDailyMeal);

// DELETE /api/nutrition/daily - очистити весь день
router.delete("/daily", nutritionController.clearDailyMeals);

// ІСТОРІЯ ХАРЧУВАННЯ
// GET /api/nutrition/history?limit=30 - отримати історію харчування
router.get("/history", nutritionController.getMealHistory);

export default router;