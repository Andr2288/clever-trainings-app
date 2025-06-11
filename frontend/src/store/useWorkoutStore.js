// src/store/useWorkoutStore.js
import { create } from 'zustand';

const STORAGE_KEY = 'fitapp_workout_data';

const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving workout data:', error);
    }
};

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {
            currentWorkouts: [],
            completedWorkouts: [],
            preferences: { fitnessLevel: 'beginner' }
        };
    } catch (error) {
        console.error('Error loading workout data:', error);
        return {
            currentWorkouts: [],
            completedWorkouts: [],
            preferences: { fitnessLevel: 'beginner' }
        };
    }
};

const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

export const useWorkoutStore = create((set, get) => ({
    // Стан
    currentWorkouts: loadFromStorage().currentWorkouts || [],
    completedWorkouts: loadFromStorage().completedWorkouts || [],
    preferences: loadFromStorage().preferences || { fitnessLevel: 'beginner' },

    // Дії
    setWorkouts: (workouts) => {
        set({ currentWorkouts: workouts });

        const data = {
            currentWorkouts: workouts,
            completedWorkouts: get().completedWorkouts,
            preferences: get().preferences
        };
        saveToStorage(data);
    },

    completeWorkout: (workoutIndex, duration = null) => {
        const currentWorkouts = get().currentWorkouts;
        const workout = currentWorkouts[workoutIndex];

        if (!workout) return;

        const completedWorkout = {
            ...workout,
            id: Date.now(),
            completedAt: new Date().toISOString(),
            date: getTodayDate(),
            actualDuration: duration || workout.duration
        };

        const updatedCompleted = [...get().completedWorkouts, completedWorkout];

        set({ completedWorkouts: updatedCompleted });

        const data = {
            currentWorkouts: get().currentWorkouts,
            completedWorkouts: updatedCompleted,
            preferences: get().preferences
        };
        saveToStorage(data);
    },

    setFitnessLevel: (level) => {
        const updatedPreferences = { ...get().preferences, fitnessLevel: level };

        set({ preferences: updatedPreferences });

        const data = {
            currentWorkouts: get().currentWorkouts,
            completedWorkouts: get().completedWorkouts,
            preferences: updatedPreferences
        };
        saveToStorage(data);
    },

    clearCurrentWorkouts: () => {
        set({ currentWorkouts: [] });

        const data = {
            currentWorkouts: [],
            completedWorkouts: get().completedWorkouts,
            preferences: get().preferences
        };
        saveToStorage(data);
    },

    // Обчислювані значення
    getTodayWorkouts: () => {
        const today = getTodayDate();
        return get().completedWorkouts.filter(workout => workout.date === today);
    },

    getWeeklyStats: () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyWorkouts = get().completedWorkouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= oneWeekAgo;
        });

        const totalDuration = weeklyWorkouts.reduce((sum, workout) =>
            sum + (workout.actualDuration || 0), 0
        );

        const workoutTypes = weeklyWorkouts.reduce((types, workout) => {
            types[workout.type] = (types[workout.type] || 0) + 1;
            return types;
        }, {});

        return {
            totalWorkouts: weeklyWorkouts.length,
            totalDuration,
            averageDuration: weeklyWorkouts.length > 0 ? Math.round(totalDuration / weeklyWorkouts.length) : 0,
            workoutTypes
        };
    },

    getWorkoutsByDate: (date) => {
        return get().completedWorkouts.filter(workout => workout.date === date);
    }
}));