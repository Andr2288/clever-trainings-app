import { axiosInstance } from "../lib/axios.js";

// API сервіс для роботи з тренуваннями
export const workoutAPI = {
    // ТИПИ ТА ШАБЛОНИ ТРЕНУВАНЬ

    // Отримати всі типи тренувань
    getWorkoutTypes: async () => {
        const response = await axiosInstance.get("/workouts/types");
        return response.data;
    },

    // Отримати шаблони тренувань
    getWorkoutTemplates: async (params = {}) => {
        const { fitness_level, type_id, limit = 50 } = params;
        const queryParams = new URLSearchParams();

        if (fitness_level) queryParams.append('fitness_level', fitness_level);
        if (type_id) queryParams.append('type_id', type_id);
        queryParams.append('limit', limit);

        const response = await axiosInstance.get(`/workouts/templates?${queryParams}`);
        return response.data;
    },

    // Отримати випадкові шаблони тренувань
    getRandomWorkouts: async (params = {}) => {
        const { fitness_level, count = 5 } = params;
        const queryParams = new URLSearchParams();

        if (fitness_level) queryParams.append('fitness_level', fitness_level);
        queryParams.append('count', count);

        const response = await axiosInstance.get(`/workouts/random?${queryParams}`);
        return response.data;
    },

    // ЗАВЕРШЕНІ ТРЕНУВАННЯ

    // Отримати завершені тренування
    getCompletedWorkouts: async (params = {}) => {
        const { date, limit = 50 } = params;
        const queryParams = new URLSearchParams();

        if (date) queryParams.append('date', date);
        queryParams.append('limit', limit);

        const response = await axiosInstance.get(`/workouts/completed?${queryParams}`);
        return response.data;
    },

    // Додати завершене тренування
    addCompletedWorkout: async (workoutData) => {
        const response = await axiosInstance.post("/workouts/completed", {
            workout_template_id: workoutData.templateId || null,
            workout_name: workoutData.name,
            workout_type: workoutData.type,
            planned_duration_minutes: workoutData.plannedDuration || workoutData.actualDuration,
            actual_duration_minutes: workoutData.actualDuration,
            intensity: workoutData.intensity || 'Середня',
            notes: workoutData.notes || null
        });
        return response.data;
    },

    // Видалити завершене тренування
    deleteCompletedWorkout: async (workoutId) => {
        const response = await axiosInstance.delete(`/workouts/completed/${workoutId}`);
        return response.data;
    },

    // СТАТИСТИКА

    // Отримати тренування за сьогодні
    getTodayWorkouts: async () => {
        const response = await axiosInstance.get("/workouts/today");
        return response.data;
    },

    // Отримати тижневу статистику
    getWeeklyStats: async () => {
        const response = await axiosInstance.get("/workouts/stats/weekly");
        return response.data;
    },

    // НАЛАШТУВАННЯ КОРИСТУВАЧА

    // Отримати налаштування користувача
    getUserPreferences: async () => {
        const response = await axiosInstance.get("/workouts/preferences");
        return response.data;
    },

    // Оновити налаштування користувача
    updateUserPreferences: async (preferences) => {
        const response = await axiosInstance.put("/workouts/preferences", preferences);
        return response.data;
    }
};

// Утилітарні функції для роботи з тренуваннями
export const workoutUtils = {
    // Форматувати шаблон тренування для фронтенду
    formatWorkoutTemplate: (template) => ({
        id: template.id,
        name: template.name,
        type: template.type_name || template.workout_type || 'Загальне',
        duration: template.duration_minutes,
        intensity: template.intensity,
        description: template.description || '',
        equipment: template.equipment || 'Не потрібно',
        fitnessLevel: template.fitness_level || 'beginner'
    }),

    // Форматувати завершене тренування для фронтенду
    formatCompletedWorkout: (workout) => ({
        id: workout.id,
        name: workout.workout_name,
        type: workout.workout_type,
        plannedDuration: workout.planned_duration_minutes,
        actualDuration: workout.actual_duration_minutes,
        intensity: workout.intensity,
        notes: workout.notes,
        completedAt: workout.completed_at,
        date: workout.workout_date,
        templateDescription: workout.template_description,
        equipment: workout.template_equipment
    }),

    // Розрахувати приблизні калорії для тренування
    estimateCalories: (type, duration, intensity, userWeight = 70) => {
        let caloriesPerMinute = 5; // базове значення

        // Коефіцієнти для різних типів тренувань
        const typeMultipliers = {
            'Кардіо': 1.5,
            'Силові': 1.2,
            'HIIT': 2.0,
            'Розтяжка': 0.8,
            'Функціональні': 1.3
        };

        // Коефіцієнти для інтенсивності
        const intensityMultipliers = {
            'Легка': 0.8,
            'Низька': 0.8,
            'Середня': 1.0,
            'Висока': 1.4,
            'Високий': 1.4
        };

        const typeMultiplier = typeMultipliers[type] || 1.0;
        const intensityMultiplier = intensityMultipliers[intensity] || 1.0;

        // Врахування ваги користувача (базова вага 70кг)
        const weightMultiplier = userWeight / 70;

        caloriesPerMinute = caloriesPerMinute * typeMultiplier * intensityMultiplier * weightMultiplier;

        return Math.round(duration * caloriesPerMinute);
    },

    // Отримати іконку для типу тренування
    getWorkoutTypeIcon: (type) => {
        const icons = {
            'Кардіо': '❤️',
            'Силові': '💪',
            'HIIT': '🔥',
            'Розтяжка': '🧘',
            'Функціональні': '🎯'
        };
        return icons[type] || '🏃';
    },

    // Отримати колір для інтенсивності
    getIntensityColor: (intensity) => {
        const colors = {
            'Легка': 'bg-green-100 text-green-800',
            'Низька': 'bg-green-100 text-green-800',
            'Середня': 'bg-yellow-100 text-yellow-800',
            'Висока': 'bg-red-100 text-red-800',
            'Високий': 'bg-red-100 text-red-800'
        };
        return colors[intensity] || 'bg-gray-100 text-gray-800';
    },

    // Розрахувати зірки складності
    getDifficultyStars: (intensity) => {
        const level = intensity.toLowerCase();
        let stars = 1;
        if (level.includes('середня') || level.includes('moderate')) stars = 2;
        if (level.includes('висока') || level.includes('високий') || level.includes('advanced')) stars = 3;

        return '★'.repeat(stars) + '☆'.repeat(3 - stars);
    },

    // Групувати тренування по типах
    groupWorkoutsByType: (workouts) => {
        return workouts.reduce((groups, workout) => {
            const type = workout.type || workout.workout_type || 'Інше';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(workout);
            return groups;
        }, {});
    },

    // Розрахувати статистику для списку тренувань
    calculateWorkoutStats: (workouts) => {
        const stats = workouts.reduce((acc, workout) => {
            const duration = workout.actualDuration || workout.actual_duration_minutes || 0;
            const type = workout.type || workout.workout_type || 'Інше';

            return {
                totalWorkouts: acc.totalWorkouts + 1,
                totalDuration: acc.totalDuration + duration,
                workoutTypes: {
                    ...acc.workoutTypes,
                    [type]: (acc.workoutTypes[type] || 0) + 1
                }
            };
        }, {
            totalWorkouts: 0,
            totalDuration: 0,
            workoutTypes: {}
        });

        stats.averageDuration = stats.totalWorkouts > 0
            ? Math.round(stats.totalDuration / stats.totalWorkouts)
            : 0;

        return stats;
    }
};