import { executeQuery } from "../config/database.js";

// Отримати всі типи тренувань
const getWorkoutTypes = async (req, res) => {
    try {
        const query = `
            SELECT 
                wt.*,
                COUNT(wtpl.id) as template_count
            FROM workout_types wt
            LEFT JOIN workout_templates wtpl ON wt.id = wtpl.type_id
            GROUP BY wt.id
            ORDER BY wt.name
        `;

        const workoutTypes = await executeQuery(query);

        return res.status(200).json({
            success: true,
            data: workoutTypes
        });
    } catch (error) {
        console.error("Помилка в getWorkoutTypes:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати шаблони тренувань
const getWorkoutTemplates = async (req, res) => {
    try {
        const { fitness_level, type_id, limit = 50 } = req.query;

        let query = `
            SELECT 
                wt.*,
                wtype.name as type_name,
                wtype.description as type_description
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE 1=1
        `;

        const params = [];

        // Фільтр по рівню фітнесу
        if (fitness_level) {
            query += ` AND wt.fitness_level = ?`;
            params.push(fitness_level);
        }

        // Фільтр по типу тренування
        if (type_id) {
            query += ` AND wt.type_id = ?`;
            params.push(type_id);
        }

        query += ` ORDER BY wt.fitness_level, wt.name LIMIT ?`;
        params.push(parseInt(limit));

        const templates = await executeQuery(query, params);

        return res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error("Помилка в getWorkoutTemplates:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати випадкові шаблони тренувань
const getRandomWorkouts = async (req, res) => {
    try {
        const { fitness_level, count = 5 } = req.query;

        let query = `
            SELECT 
                wt.*,
                wtype.name as type_name,
                wtype.description as type_description
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
        `;

        const params = [];

        if (fitness_level) {
            query += ` WHERE wt.fitness_level = ?`;
            params.push(fitness_level);
        }

        query += ` ORDER BY RAND() LIMIT ?`;
        params.push(parseInt(count));

        const randomWorkouts = await executeQuery(query, params);

        return res.status(200).json({
            success: true,
            data: randomWorkouts
        });
    } catch (error) {
        console.error("Помилка в getRandomWorkouts:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Додати завершене тренування
const addCompletedWorkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            workout_template_id,
            workout_name,
            workout_type,
            planned_duration_minutes,
            actual_duration_minutes,
            intensity,
            notes
        } = req.body;

        // Валідація обов'язкових полів
        if (!workout_name || !workout_type || !actual_duration_minutes) {
            return res.status(400).json({
                success: false,
                message: "workout_name, workout_type та actual_duration_minutes обов'язкові"
            });
        }

        if (actual_duration_minutes <= 0) {
            return res.status(400).json({
                success: false,
                message: "Тривалість тренування повинна бути більше 0"
            });
        }

        const currentDate = new Date().toISOString().split('T')[0];

        const result = await executeQuery(
            `INSERT INTO completed_workouts 
             (user_id, workout_template_id, workout_name, workout_type, 
              planned_duration_minutes, actual_duration_minutes, intensity, 
              workout_date, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                workout_template_id || null,
                workout_name,
                workout_type,
                planned_duration_minutes || actual_duration_minutes,
                actual_duration_minutes,
                intensity || 'Середня',
                currentDate,
                notes || null
            ]
        );

        // Повертаємо додане тренування
        const [completedWorkout] = await executeQuery(
            `SELECT 
                cw.*,
                wt.description as template_description,
                wt.equipment as template_equipment,
                wtype.name as type_name
            FROM completed_workouts cw
            LEFT JOIN workout_templates wt ON cw.workout_template_id = wt.id
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE cw.id = ?`,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Тренування збережено",
            data: completedWorkout
        });

    } catch (error) {
        console.error("Помилка в addCompletedWorkout:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати завершені тренування
const getCompletedWorkouts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, limit = 50 } = req.query;

        let query = `
            SELECT 
                cw.*,
                wt.description as template_description,
                wt.equipment as template_equipment,
                wtype.name as type_name
            FROM completed_workouts cw
            LEFT JOIN workout_templates wt ON cw.workout_template_id = wt.id
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE cw.user_id = ?
        `;

        const params = [userId];

        // Фільтр по даті
        if (date) {
            query += ` AND cw.workout_date = ?`;
            params.push(date);
        }

        query += ` ORDER BY cw.completed_at DESC LIMIT ?`;
        params.push(parseInt(limit));

        const workouts = await executeQuery(query, params);

        return res.status(200).json({
            success: true,
            data: workouts
        });

    } catch (error) {
        console.error("Помилка в getCompletedWorkouts:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати тренування за сьогодні
const getTodayWorkouts = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const query = `
            SELECT 
                cw.*,
                wt.description as template_description,
                wt.equipment as template_equipment,
                wtype.name as type_name
            FROM completed_workouts cw
            LEFT JOIN workout_templates wt ON cw.workout_template_id = wt.id
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE cw.user_id = ? AND cw.workout_date = ?
            ORDER BY cw.completed_at DESC
        `;

        const workouts = await executeQuery(query, [userId, today]);

        // Підраховуємо статистику за день
        const stats = workouts.reduce((acc, workout) => ({
            total_workouts: acc.total_workouts + 1,
            total_duration: acc.total_duration + (workout.actual_duration_minutes || 0),
            workout_types: {
                ...acc.workout_types,
                [workout.workout_type]: (acc.workout_types[workout.workout_type] || 0) + 1
            }
        }), {
            total_workouts: 0,
            total_duration: 0,
            workout_types: {}
        });

        return res.status(200).json({
            success: true,
            data: {
                date: today,
                workouts,
                stats
            }
        });

    } catch (error) {
        console.error("Помилка в getTodayWorkouts:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати тижневу статистику тренувань
const getWeeklyStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                COUNT(*) as total_workouts,
                SUM(cw.actual_duration_minutes) as total_duration,
                AVG(cw.actual_duration_minutes) as avg_duration,
                cw.workout_type,
                COUNT(CASE WHEN cw.workout_type = 'Кардіо' THEN 1 END) as cardio_count,
                COUNT(CASE WHEN cw.workout_type = 'Силові' THEN 1 END) as strength_count
            FROM completed_workouts cw
            WHERE cw.user_id = ? 
            AND cw.workout_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY cw.workout_type
        `;

        const weeklyData = await executeQuery(query, [userId]);

        // Загальна статистика за тиждень
        const totalQuery = `
            SELECT 
                COUNT(*) as total_workouts,
                SUM(actual_duration_minutes) as total_duration,
                COUNT(DISTINCT workout_date) as active_days
            FROM completed_workouts
            WHERE user_id = ? 
            AND workout_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `;

        const [totalStats] = await executeQuery(totalQuery, [userId]);

        // Формуємо статистику по типах
        const workoutTypes = {};
        weeklyData.forEach(item => {
            if (item.workout_type) {
                workoutTypes[item.workout_type] = item.total_workouts;
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                total_workouts: totalStats?.total_workouts || 0,
                total_duration: totalStats?.total_duration || 0,
                active_days: totalStats?.active_days || 0,
                average_duration: totalStats?.total_workouts > 0
                    ? Math.round((totalStats?.total_duration || 0) / totalStats.total_workouts)
                    : 0,
                workout_types: workoutTypes
            }
        });

    } catch (error) {
        console.error("Помилка в getWeeklyStats:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Отримати налаштування користувача
const getUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;

        const [preferences] = await executeQuery(
            "SELECT * FROM user_preferences WHERE user_id = ?",
            [userId]
        );

        if (!preferences) {
            // Створюємо налаштування за замовчуванням
            await executeQuery(
                `INSERT INTO user_preferences (user_id, fitness_level, daily_calorie_goal) 
                 VALUES (?, 'beginner', 2000)`,
                [userId]
            );

            const [newPreferences] = await executeQuery(
                "SELECT * FROM user_preferences WHERE user_id = ?",
                [userId]
            );

            return res.status(200).json({
                success: true,
                data: newPreferences
            });
        }

        return res.status(200).json({
            success: true,
            data: preferences
        });

    } catch (error) {
        console.error("Помилка в getUserPreferences:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Оновити налаштування користувача
const updateUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fitness_level, preferred_workout_types, daily_calorie_goal, notifications_enabled } = req.body;

        // Перевіряємо чи існують налаштування
        const [existingPrefs] = await executeQuery(
            "SELECT id FROM user_preferences WHERE user_id = ?",
            [userId]
        );

        let updateData = {};
        if (fitness_level) updateData.fitness_level = fitness_level;
        if (preferred_workout_types) updateData.preferred_workout_types = JSON.stringify(preferred_workout_types);
        if (daily_calorie_goal) updateData.daily_calorie_goal = daily_calorie_goal;
        if (notifications_enabled !== undefined) updateData.notifications_enabled = notifications_enabled;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Немає даних для оновлення"
            });
        }

        if (existingPrefs) {
            // Оновлюємо існуючі налаштування
            const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(updateData), userId];

            await executeQuery(
                `UPDATE user_preferences SET ${setClause}, updated_at = NOW() WHERE user_id = ?`,
                values
            );
        } else {
            // Створюємо нові налаштування
            await executeQuery(
                `INSERT INTO user_preferences (user_id, fitness_level, daily_calorie_goal) 
                 VALUES (?, ?, ?)`,
                [userId, updateData.fitness_level || 'beginner', updateData.daily_calorie_goal || 2000]
            );
        }

        // Повертаємо оновлені налаштування
        const [updatedPreferences] = await executeQuery(
            "SELECT * FROM user_preferences WHERE user_id = ?",
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Налаштування оновлено",
            data: updatedPreferences
        });

    } catch (error) {
        console.error("Помилка в updateUserPreferences:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

// Видалити завершене тренування
const deleteCompletedWorkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { workoutId } = req.params;

        // Перевіряємо чи належить тренування користувачу
        const workout = await executeQuery(
            "SELECT * FROM completed_workouts WHERE id = ? AND user_id = ?",
            [workoutId, userId]
        );

        if (workout.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Тренування не знайдено"
            });
        }

        // Видаляємо тренування
        await executeQuery(
            "DELETE FROM completed_workouts WHERE id = ? AND user_id = ?",
            [workoutId, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Тренування видалено"
        });

    } catch (error) {
        console.error("Помилка в deleteCompletedWorkout:", error.message);
        return res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера"
        });
    }
};

export default {
    getWorkoutTypes,
    getWorkoutTemplates,
    getRandomWorkouts,
    addCompletedWorkout,
    getCompletedWorkouts,
    getTodayWorkouts,
    getWeeklyStats,
    getUserPreferences,
    updateUserPreferences,
    deleteCompletedWorkout
};