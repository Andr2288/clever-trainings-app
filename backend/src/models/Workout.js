import BaseModel from './BaseModel.js';

class WorkoutType extends BaseModel {
    constructor() {
        super('workout_types');
    }

    // Отримати всі типи з кількістю шаблонів
    async getAllWithTemplateCount() {
        const query = `
            SELECT 
                wt.*,
                COUNT(wtpl.id) as template_count
            FROM workout_types wt
            LEFT JOIN workout_templates wtpl ON wt.id = wtpl.type_id
            GROUP BY wt.id
            ORDER BY wt.name
        `;
        return await this.executeCustomQuery(query);
    }
}

class WorkoutTemplate extends BaseModel {
    constructor() {
        super('workout_templates');
    }

    // Отримати шаблони за рівнем фітнесу
    async getByFitnessLevel(fitnessLevel) {
        const query = `
            SELECT 
                wt.*,
                wtype.name as type_name
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE wt.fitness_level = ?
            ORDER BY wt.name
        `;
        return await this.executeCustomQuery(query, [fitnessLevel]);
    }

    // Отримати випадкові шаблони
    async getRandomTemplates(count = 5, fitnessLevel = null) {
        let query = `
            SELECT 
                wt.*,
                wtype.name as type_name
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
        `;
        const params = [];

        if (fitnessLevel) {
            query += ` WHERE wt.fitness_level = ?`;
            params.push(fitnessLevel);
        }

        query += ` ORDER BY RAND() LIMIT ?`;
        params.push(count);

        return await this.executeCustomQuery(query, params);
    }

    // Отримати всі шаблони з типами
    async getAllWithTypes() {
        const query = `
            SELECT 
                wt.*,
                wtype.name as type_name,
                wtype.description as type_description
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            ORDER BY wt.fitness_level, wt.name
        `;
        return await this.executeCustomQuery(query);
    }

    // Пошук шаблонів за назвою
    async searchByName(searchTerm) {
        const query = `
            SELECT 
                wt.*,
                wtype.name as type_name
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE wt.name LIKE ? OR wt.description LIKE ?
            ORDER BY wt.name
        `;
        const searchPattern = `%${searchTerm}%`;
        return await this.executeCustomQuery(query, [searchPattern, searchPattern]);
    }

    // Отримати популярні шаблони
    async getPopular(limit = 10) {
        const query = `
            SELECT 
                wt.*,
                wtype.name as type_name,
                COUNT(cw.id) as usage_count
            FROM workout_templates wt
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            LEFT JOIN completed_workouts cw ON wt.id = cw.workout_template_id
            GROUP BY wt.id
            ORDER BY usage_count DESC, wt.name
            LIMIT ?
        `;
        return await this.executeCustomQuery(query, [limit]);
    }
}

class CompletedWorkout extends BaseModel {
    constructor() {
        super('completed_workouts');
    }

    // Додати завершене тренування
    async addCompletedWorkout(userId, workoutData) {
        const currentDate = new Date().toISOString().split('T')[0];

        return await this.create({
            user_id: userId,
            workout_template_id: workoutData.templateId || null,
            workout_name: workoutData.name,
            workout_type: workoutData.type,
            planned_duration_minutes: workoutData.plannedDuration,
            actual_duration_minutes: workoutData.actualDuration,
            intensity: workoutData.intensity,
            workout_date: currentDate,
            notes: workoutData.notes || null
        });
    }

    // Отримати тренування за день
    async getDayWorkouts(userId, date) {
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
        return await this.executeCustomQuery(query, [userId, date]);
    }

    // Отримати статистику за день
    async getDayStats(userId, date) {
        const query = `
            SELECT 
                COUNT(*) as workout_count,
                SUM(cw.actual_duration_minutes) as total_duration,
                AVG(cw.actual_duration_minutes) as avg_duration
            FROM completed_workouts cw
            WHERE cw.user_id = ? AND cw.workout_date = ?
        `;
        const result = await this.executeCustomQuery(query, [userId, date]);
        return result[0] || {
            workout_count: 0,
            total_duration: 0,
            avg_duration: 0
        };
    }

    // Отримати тижневу статистику
    async getWeeklyStats(userId) {
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
        return await this.executeCustomQuery(query, [userId]);
    }

    // Отримати історію тренувань
    async getWorkoutHistory(userId, limit = 50) {
        const query = `
            SELECT 
                cw.workout_date,
                COUNT(*) as workout_count,
                SUM(cw.actual_duration_minutes) as total_duration,
                GROUP_CONCAT(DISTINCT cw.workout_type) as workout_types
            FROM completed_workouts cw
            WHERE cw.user_id = ?
            GROUP BY cw.workout_date
            ORDER BY cw.workout_date DESC
            LIMIT ?
        `;
        return await this.executeCustomQuery(query, [userId, limit]);
    }

    // Отримати останні тренування
    async getRecentWorkouts(userId, limit = 10) {
        const query = `
            SELECT 
                cw.*,
                wt.description as template_description,
                wtype.name as type_name
            FROM completed_workouts cw
            LEFT JOIN workout_templates wt ON cw.workout_template_id = wt.id
            LEFT JOIN workout_types wtype ON wt.type_id = wtype.id
            WHERE cw.user_id = ?
            ORDER BY cw.completed_at DESC
            LIMIT ?
        `;
        return await this.executeCustomQuery(query, [userId, limit]);
    }

    // Отримати статистику по типах тренувань
    async getWorkoutTypeStats(userId, days = 30) {
        const query = `
            SELECT 
                cw.workout_type,
                COUNT(*) as count,
                SUM(cw.actual_duration_minutes) as total_duration,
                AVG(cw.actual_duration_minutes) as avg_duration
            FROM completed_workouts cw
            WHERE cw.user_id = ? 
            AND cw.workout_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY cw.workout_type
            ORDER BY count DESC
        `;
        return await this.executeCustomQuery(query, [userId, days]);
    }
}

class UserPreferences extends BaseModel {
    constructor() {
        super('user_preferences');
    }

    // Отримати або створити налаштування користувача
    async getOrCreate(userId) {
        let preferences = await this.findOneWhere({ user_id: userId });

        if (!preferences) {
            preferences = await this.create({
                user_id: userId,
                fitness_level: 'beginner',
                daily_calorie_goal: 2000
            });
        }

        return preferences;
    }

    // Оновити рівень фітнесу
    async updateFitnessLevel(userId, fitnessLevel) {
        const preferences = await this.getOrCreate(userId);
        return await this.update(preferences.id, { fitness_level: fitnessLevel });
    }

    // Оновити ціль калорій
    async updateCalorieGoal(userId, calorieGoal) {
        const preferences = await this.getOrCreate(userId);
        return await this.update(preferences.id, { daily_calorie_goal: calorieGoal });
    }

    // Оновити налаштування
    async updatePreferences(userId, data) {
        const preferences = await this.getOrCreate(userId);
        return await this.update(preferences.id, data);
    }
}

export const workoutTypeModel = new WorkoutType();
export const workoutTemplateModel = new WorkoutTemplate();
export const completedWorkoutModel = new CompletedWorkout();
export const userPreferencesModel = new UserPreferences();