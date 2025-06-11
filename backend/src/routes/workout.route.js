import express from 'express';
import workoutController from "../controllers/workout.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Всі роути потребують автентифікації
router.use(authMiddleware.protectRoute);

// ТИПИ ТРЕНУВАНЬ
// GET /api/workouts/types - отримати всі типи тренувань
router.get("/types", workoutController.getWorkoutTypes);

// ШАБЛОНИ ТРЕНУВАНЬ
// GET /api/workouts/templates?fitness_level=beginner&type_id=1&limit=10 - отримати шаблони тренувань
router.get("/templates", workoutController.getWorkoutTemplates);

// GET /api/workouts/random?fitness_level=intermediate&count=5 - отримати випадкові шаблони
router.get("/random", workoutController.getRandomWorkouts);

// ЗАВЕРШЕНІ ТРЕНУВАННЯ
// GET /api/workouts/completed?date=2025-01-15&limit=50 - отримати завершені тренування
router.get("/completed", workoutController.getCompletedWorkouts);

// POST /api/workouts/completed - додати завершене тренування
router.post("/completed", workoutController.addCompletedWorkout);

// DELETE /api/workouts/completed/:workoutId - видалити завершене тренування
router.delete("/completed/:workoutId", workoutController.deleteCompletedWorkout);

// СТАТИСТИКА
// GET /api/workouts/today - отримати тренування за сьогодні
router.get("/today", workoutController.getTodayWorkouts);

// GET /api/workouts/stats/weekly - отримати тижневу статистику
router.get("/stats/weekly", workoutController.getWeeklyStats);

// НАЛАШТУВАННЯ КОРИСТУВАЧА
// GET /api/workouts/preferences - отримати налаштування користувача
router.get("/preferences", workoutController.getUserPreferences);

// PUT /api/workouts/preferences - оновити налаштування користувача
router.put("/preferences", workoutController.updateUserPreferences);

export default router;