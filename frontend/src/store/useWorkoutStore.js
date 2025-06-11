import { create } from 'zustand';
import { workoutAPI, workoutUtils } from '../services/workoutAPI.js';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export const useWorkoutStore = create((set, get) => ({
    // Стан
    currentWorkouts: [],
    completedWorkouts: [],
    workoutTypes: [],
    workoutTemplates: [],
    preferences: {
        fitnessLevel: 'beginner',
        daily_calorie_goal: 2000,
        notifications_enabled: true
    },

    // Стан завантаження
    isLoading: false,
    isLoadingWorkouts: false,
    isLoadingTemplates: false,

    // Стан помилок
    error: null,

    // ШАБЛОНИ ТРЕНУВАНЬ

    // Завантажити типи тренувань
    loadWorkoutTypes: async () => {
        try {
            const response = await workoutAPI.getWorkoutTypes();

            if (response.success) {
                set({ workoutTypes: response.data });
            }
        } catch (error) {
            console.error('Помилка завантаження типів тренувань:', error);
        }
    },

    // Завантажити шаблони тренувань
    loadWorkoutTemplates: async (params = {}) => {
        try {
            set({ isLoadingTemplates: true, error: null });
            const response = await workoutAPI.getWorkoutTemplates(params);

            if (response.success) {
                const formattedTemplates = response.data.map(workoutUtils.formatWorkoutTemplate);
                set({ workoutTemplates: formattedTemplates });
                return formattedTemplates;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            console.error('Помилка завантаження шаблонів:', error);
        } finally {
            set({ isLoadingTemplates: false });
        }
    },

    // Генерувати тренування для рівня користувача
    generateWorkoutsForLevel: async (fitnessLevel = null) => {
        try {
            set({ isLoadingTemplates: true });

            const level = fitnessLevel || get().preferences.fitnessLevel;
            const response = await workoutAPI.getWorkoutTemplates({
                fitness_level: level,
                limit: 6
            });

            if (response.success) {
                const formattedWorkouts = response.data.map(workoutUtils.formatWorkoutTemplate);
                set({ currentWorkouts: formattedWorkouts });
                return formattedWorkouts;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка генерації тренувань:', error);
        } finally {
            set({ isLoadingTemplates: false });
        }
    },

    // Генерувати випадкові тренування
    generateRandomWorkouts: async (count = 5) => {
        try {
            set({ isLoadingTemplates: true });

            const response = await workoutAPI.getRandomWorkouts({ count });

            if (response.success) {
                const formattedWorkouts = response.data.map(workoutUtils.formatWorkoutTemplate);
                set({ currentWorkouts: formattedWorkouts });
                return formattedWorkouts;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка генерації випадкових тренувань:', error);
        } finally {
            set({ isLoadingTemplates: false });
        }
    },

    // Встановити поточні тренування
    setWorkouts: (workouts) => {
        set({ currentWorkouts: workouts });
    },

    // Очистити поточні тренування
    clearCurrentWorkouts: () => {
        set({ currentWorkouts: [] });
    },

    // ЗАВЕРШЕНІ ТРЕНУВАННЯ

    // Завантажити завершені тренування
    loadCompletedWorkouts: async (params = {}) => {
        try {
            set({ isLoadingWorkouts: true, error: null });
            const response = await workoutAPI.getCompletedWorkouts(params);

            if (response.success) {
                const formattedWorkouts = response.data.map(workoutUtils.formatCompletedWorkout);
                set({ completedWorkouts: formattedWorkouts });
                return formattedWorkouts;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            set({ error: errorMessage });
            console.error('Помилка завантаження завершених тренувань:', error);
        } finally {
            set({ isLoadingWorkouts: false });
        }
    },

    // Завершити тренування
    completeWorkout: async (workoutIndex, actualDuration = null) => {
        try {
            const currentWorkouts = get().currentWorkouts;
            const workout = currentWorkouts[workoutIndex];

            if (!workout) {
                toast.error('Тренування не знайдено');
                return;
            }

            const workoutData = {
                templateId: workout.id,
                name: workout.name,
                type: workout.type,
                plannedDuration: workout.duration,
                actualDuration: actualDuration || workout.duration,
                intensity: workout.intensity,
                notes: null
            };

            const response = await workoutAPI.addCompletedWorkout(workoutData);

            if (response.success) {
                const completedWorkout = workoutUtils.formatCompletedWorkout(response.data);

                set(state => ({
                    completedWorkouts: [completedWorkout, ...state.completedWorkouts]
                }));

                toast.success(`Тренування "${workout.name}" завершено!`);
                return completedWorkout;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка завершення тренування:', error);
        }
    },

    // Додати власне тренування
    addCustomWorkout: async (workoutData) => {
        try {
            const response = await workoutAPI.addCompletedWorkout(workoutData);

            if (response.success) {
                const completedWorkout = workoutUtils.formatCompletedWorkout(response.data);

                set(state => ({
                    completedWorkouts: [completedWorkout, ...state.completedWorkouts]
                }));

                toast.success(`Тренування "${workoutData.name}" додано!`);
                return completedWorkout;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка додавання тренування:', error);
        }
    },

    // Видалити завершене тренування
    deleteCompletedWorkout: async (workoutId) => {
        try {
            const response = await workoutAPI.deleteCompletedWorkout(workoutId);

            if (response.success) {
                set(state => ({
                    completedWorkouts: state.completedWorkouts.filter(
                        workout => workout.id !== workoutId
                    )
                }));

                toast.success('Тренування видалено');
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка видалення тренування:', error);
        }
    },

    // СТАТИСТИКА

    // Завантажити тренування за сьогодні
    loadTodayWorkouts: async () => {
        try {
            const response = await workoutAPI.getTodayWorkouts();

            if (response.success) {
                const formattedWorkouts = response.data.workouts.map(workoutUtils.formatCompletedWorkout);
                return {
                    workouts: formattedWorkouts,
                    stats: response.data.stats
                };
            }
        } catch (error) {
            console.error('Помилка завантаження сьогоднішніх тренувань:', error);
            return { workouts: [], stats: {} };
        }
    },

    // Завантажити тижневу статистику
    loadWeeklyStats: async () => {
        try {
            const response = await workoutAPI.getWeeklyStats();

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Помилка завантаження тижневої статистики:', error);
            return {
                total_workouts: 0,
                total_duration: 0,
                active_days: 0,
                average_duration: 0,
                workout_types: {}
            };
        }
    },

    // НАЛАШТУВАННЯ

    // Завантажити налаштування користувача
    loadUserPreferences: async () => {
        try {
            const response = await workoutAPI.getUserPreferences();

            if (response.success) {
                set({ preferences: response.data });
                return response.data;
            }
        } catch (error) {
            console.error('Помилка завантаження налаштувань:', error);
        }
    },

    // Оновити рівень фітнесу
    setFitnessLevel: async (level) => {
        try {
            const response = await workoutAPI.updateUserPreferences({
                fitness_level: level
            });

            if (response.success) {
                set(state => ({
                    preferences: { ...state.preferences, fitnessLevel: level }
                }));

                toast.success('Рівень фітнесу оновлено');
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка оновлення рівня фітнесу:', error);
        }
    },

    // Оновити налаштування користувача
    updatePreferences: async (newPreferences) => {
        try {
            const response = await workoutAPI.updateUserPreferences(newPreferences);

            if (response.success) {
                set(state => ({
                    preferences: { ...state.preferences, ...newPreferences }
                }));

                toast.success('Налаштування оновлено');
                return response.data;
            }
        } catch (error) {
            const errorMessage = api.handleError(error);
            toast.error(errorMessage);
            console.error('Помилка оновлення налаштувань:', error);
        }
    },

    // ОБЧИСЛЮВАНІ ЗНАЧЕННЯ (з API)

    // Отримати тренування за сьогодні
    getTodayWorkouts: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().completedWorkouts.filter(workout => workout.date === today);
    },

    // Отримати тижневу статистику (локальну)
    getWeeklyStats: () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyWorkouts = get().completedWorkouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= oneWeekAgo;
        });

        return workoutUtils.calculateWorkoutStats(weeklyWorkouts);
    },

    // Отримати тренування за датою
    getWorkoutsByDate: (date) => {
        return get().completedWorkouts.filter(workout => workout.date === date);
    },

    // УТИЛІТИ

    // Очистити помилки
    clearError: () => set({ error: null }),

    // Ініціалізація
    initialize: async () => {
        const store = get();
        await Promise.all([
            store.loadWorkoutTypes(),
            store.loadUserPreferences(),
            store.loadCompletedWorkouts({ limit: 100 })
        ]);
    },

    // Оновити все
    refresh: async () => {
        const store = get();
        await Promise.all([
            store.loadCompletedWorkouts({ limit: 100 }),
            store.loadUserPreferences()
        ]);
    }
}));