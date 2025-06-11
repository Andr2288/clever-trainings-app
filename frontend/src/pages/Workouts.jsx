import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Settings, Trophy, Clock, Loader, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { useAuthStore } from '../store/useAuthStore';
import WorkoutCard from '../components/WorkoutCard';

const Workouts = () => {
    // UI State
    const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(null);
    const [workoutTimer, setWorkoutTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Local state for stats
    const [todayStats, setTodayStats] = useState({
        workouts: [],
        stats: { total_workouts: 0, total_duration: 0 }
    });
    const [weeklyStats, setWeeklyStats] = useState({
        total_workouts: 0,
        total_duration: 0,
        workout_types: {}
    });

    // Stores
    const {
        currentWorkouts,
        preferences,
        generateWorkoutsForLevel,
        generateRandomWorkouts,
        completeWorkout,
        setFitnessLevel,
        clearCurrentWorkouts,
        loadTodayWorkouts,
        loadWeeklyStats,
        updatePreferences,
        isLoadingTemplates,
        isLoading
    } = useWorkoutStore();

    const { getUserWeight } = useAuthStore();

    // Ініціалізація при завантаженні
    useEffect(() => {
        const initializeData = async () => {
            try {
                // Завантажуємо статистику
                const [todayData, weeklyData] = await Promise.all([
                    loadTodayWorkouts(),
                    loadWeeklyStats()
                ]);

                if (todayData) {
                    setTodayStats(todayData);
                }

                if (weeklyData) {
                    setWeeklyStats(weeklyData);
                }
            } catch (error) {
                console.error('Помилка завантаження статистики:', error);
            }
        };

        initializeData();
    }, [loadTodayWorkouts, loadWeeklyStats]);

    // Таймер для тренування
    useEffect(() => {
        let interval = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setWorkoutTimer(timer => timer + 1);
            }, 1000);
        } else if (!isTimerRunning && workoutTimer !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, workoutTimer]);

    // Обробники подій
    const handleGenerateWorkouts = async (type = 'level') => {
        try {
            let newWorkouts;
            if (type === 'random') {
                newWorkouts = await generateRandomWorkouts(6);
            } else {
                newWorkouts = await generateWorkoutsForLevel(preferences.fitnessLevel);
            }

            if (newWorkouts && newWorkouts.length > 0) {
                toast.success(`Згенеровано ${newWorkouts.length} тренувань`);
            }
        } catch (error) {
            console.error('Помилка генерації тренувань:', error);
        }
    };

    const handleStartWorkout = (index) => {
        setActiveWorkoutIndex(index);
        setWorkoutTimer(0);
        setIsTimerRunning(true);
        toast.success('Тренування розпочато! Удачі! 💪');
    };

    const handleCompleteWorkout = async (index) => {
        try {
            const duration = Math.floor(workoutTimer / 60); // конвертуємо в хвилини
            const completedWorkout = await completeWorkout(index, duration);

            if (completedWorkout) {
                // Оновлюємо статистику
                const todayData = await loadTodayWorkouts();
                if (todayData) {
                    setTodayStats(todayData);
                }

                const weeklyData = await loadWeeklyStats();
                if (weeklyData) {
                    setWeeklyStats(weeklyData);
                }
            }

            setActiveWorkoutIndex(null);
            setIsTimerRunning(false);
            setWorkoutTimer(0);
        } catch (error) {
            console.error('Помилка завершення тренування:', error);
        }
    };

    const handleStopWorkout = () => {
        if (window.confirm('Ви впевнені, що хочете зупинити тренування?')) {
            setActiveWorkoutIndex(null);
            setIsTimerRunning(false);
            setWorkoutTimer(0);
            toast.info('Тренування скасовано');
        }
    };

    const handleUpdateFitnessLevel = async (level) => {
        try {
            await setFitnessLevel(level);
        } catch (error) {
            console.error('Помилка оновлення рівня:', error);
        }
    };

    const handleUpdateCalorieGoal = async (goal) => {
        try {
            await updatePreferences({ daily_calorie_goal: parseInt(goal) });
        } catch (error) {
            console.error('Помилка оновлення цілі:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Розрахувати приблизні спалені калорії
    const getEstimatedCalories = (workout) => {
        const userWeight = getUserWeight() || 70;
        const duration = activeWorkoutIndex === currentWorkouts.indexOf(workout)
            ? Math.floor(workoutTimer / 60)
            : workout.duration;

        // Спрощений розрахунок калорій
        let multiplier = 1;
        switch (workout.type?.toLowerCase()) {
            case 'кардіо': multiplier = 10; break;
            case 'силові': multiplier = 6; break;
            case 'hiit': multiplier = 12; break;
            default: multiplier = 8;
        }

        // Врахування інтенсивності
        const intensityMultiplier = workout.intensity?.includes('Висока') ? 1.3 :
            workout.intensity?.includes('Середня') ? 1.0 : 0.8;

        return Math.round(duration * multiplier * intensityMultiplier * (userWeight / 70));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
                    Тренувальний Центр
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Бічна панель */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Статистика */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                <Trophy className="mr-2" size={20} />
                                Статистика
                            </h2>

                            <div className="space-y-4">
                                <div className="text-center bg-green-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {todayStats.stats.total_workouts || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">Сьогодні</p>
                                </div>

                                <div className="text-center bg-blue-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {weeklyStats.total_workouts || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">За тиждень</p>
                                </div>

                                <div className="text-center bg-purple-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {weeklyStats.total_duration || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">Хвилин за тиждень</p>
                                </div>

                                {weeklyStats.active_days > 0 && (
                                    <div className="text-center bg-orange-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {weeklyStats.active_days}
                                        </p>
                                        <p className="text-sm text-gray-600">Активних днів</p>
                                    </div>
                                )}
                            </div>

                            {todayStats.workouts.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Сьогоднішні тренування:
                                    </h4>
                                    {todayStats.workouts.slice(0, 3).map((workout, index) => (
                                        <div key={index} className="text-xs text-gray-600 mb-1 flex justify-between">
                                            <span>{workout.name}</span>
                                            <span>{workout.actualDuration}хв</span>
                                        </div>
                                    ))}
                                    {todayStats.workouts.length > 3 && (
                                        <p className="text-xs text-gray-500">
                                            ...та ще {todayStats.workouts.length - 3}
                                        </p>
                                    )}
                                </div>
                            )}

                            {Object.keys(weeklyStats.workout_types).length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Типи тренувань цього тижня:
                                    </h4>
                                    {Object.entries(weeklyStats.workout_types).map(([type, count]) => (
                                        <div key={type} className="text-xs text-gray-600 mb-1 flex justify-between">
                                            <span>{type}:</span>
                                            <span>{count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Налаштування */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full flex items-center justify-between text-blue-700 font-semibold mb-4"
                            >
                                <div className="flex items-center">
                                    <Settings className="mr-2" size={20} />
                                    Налаштування
                                </div>
                                <span>{showSettings ? '−' : '+'}</span>
                            </button>

                            {showSettings && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Рівень підготовки:
                                        </label>
                                        <select
                                            value={preferences.fitnessLevel || 'beginner'}
                                            onChange={(e) => handleUpdateFitnessLevel(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            disabled={isLoading}
                                        >
                                            <option value="beginner">Початківець</option>
                                            <option value="intermediate">Середній</option>
                                            <option value="advanced">Просунутий</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ціль калорій на день:
                                        </label>
                                        <input
                                            type="number"
                                            value={preferences.daily_calorie_goal || 2000}
                                            onChange={(e) => handleUpdateCalorieGoal(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="1200"
                                            max="5000"
                                            step="50"
                                        />
                                    </div>

                                    <div className="text-xs text-gray-600">
                                        <p className="mb-1"><strong>Початківець:</strong> Легкі вправи, коротша тривалість</p>
                                        <p className="mb-1"><strong>Середній:</strong> Помірна інтенсивність і складність</p>
                                        <p><strong>Просунутий:</strong> Складні вправи, висока інтенсивність</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Таймер тренування */}
                        {activeWorkoutIndex !== null && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-500">
                                <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                                    <Clock className="mr-2" size={20} />
                                    Активне тренування
                                </h3>

                                <div className="text-center mb-4">
                                    <p className="text-3xl font-bold text-green-600 mb-2">
                                        {formatTime(workoutTimer)}
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {currentWorkouts[activeWorkoutIndex]?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                                        <Zap size={14} className="mr-1" />
                                        ~{getEstimatedCalories(currentWorkouts[activeWorkoutIndex])} ккал
                                    </p>
                                </div>

                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                                        className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                                            isTimerRunning
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {isTimerRunning ? 'Пауза' : 'Старт'}
                                    </button>
                                    <button
                                        onClick={() => handleCompleteWorkout(activeWorkoutIndex)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium"
                                    >
                                        Завершити
                                    </button>
                                </div>

                                <button
                                    onClick={handleStopWorkout}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
                                >
                                    Скасувати
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Основна панель */}
                    <div className="lg:col-span-3">
                        {/* Кнопки генерації */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={() => handleGenerateWorkouts('level')}
                                    disabled={isLoadingTemplates}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition font-medium"
                                >
                                    {isLoadingTemplates ? (
                                        <Loader className="animate-spin h-5 w-5" />
                                    ) : (
                                        <Play size={20} />
                                    )}
                                    <span>
                                        {isLoadingTemplates ? 'Завантаження...' : 'Тренування для мого рівня'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleGenerateWorkouts('random')}
                                    disabled={isLoadingTemplates}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition font-medium"
                                >
                                    {isLoadingTemplates ? (
                                        <Loader className="animate-spin h-5 w-5" />
                                    ) : (
                                        <RotateCcw size={20} />
                                    )}
                                    <span>
                                        {isLoadingTemplates ? 'Завантаження...' : 'Випадкові тренування'}
                                    </span>
                                </button>

                                {currentWorkouts.length > 0 && (
                                    <button
                                        onClick={clearCurrentWorkouts}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition font-medium"
                                    >
                                        Очистити список
                                    </button>
                                )}
                            </div>

                            {preferences.fitnessLevel && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        Поточний рівень: <span className="font-medium text-blue-600">
                                            {preferences.fitnessLevel === 'beginner' && 'Початківець'}
                                        {preferences.fitnessLevel === 'intermediate' && 'Середній'}
                                        {preferences.fitnessLevel === 'advanced' && 'Просунутий'}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Список тренувань */}
                        {isLoadingTemplates ? (
                            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                                <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">Завантаження тренувань...</p>
                                <p className="text-gray-500 text-sm mt-2">Підбираємо найкращі вправи для вас</p>
                            </div>
                        ) : currentWorkouts.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                                {currentWorkouts.map((workout, index) => (
                                    <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                        {/* Workout Card Content */}
                                        <div className={`transition-all duration-300 ${
                                            activeWorkoutIndex === index
                                                ? 'ring-4 ring-green-300 shadow-xl'
                                                : ''
                                        }`}>
                                            <WorkoutCard
                                                workout={workout}
                                                isActive={activeWorkoutIndex === index}
                                                showCompletedBadge={false}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="p-4 bg-gray-50 border-t">
                                            {activeWorkoutIndex === index ? (
                                                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                                                    <p className="text-green-700 font-medium text-sm mb-1">
                                                        Активне тренування
                                                    </p>
                                                    <p className="text-green-600 font-bold text-lg">
                                                        {formatTime(workoutTimer)}
                                                    </p>
                                                    <p className="text-green-600 text-xs mt-1">
                                                        ~{getEstimatedCalories(workout)} ккал спалено
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartWorkout(index)}
                                                    disabled={activeWorkoutIndex !== null}
                                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition font-medium shadow-sm hover:shadow-md"
                                                >
                                                    <Play size={18} />
                                                    <span>
                                                        {activeWorkoutIndex !== null ? 'Інше тренування активне' : 'Почати тренування'}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                        Готові до тренування?
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Натисніть одну з кнопок вище, щоб отримати персоналізовані тренування з нашої бази даних.
                                    </p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p>• Тренування з бази даних адаптовані під ваш рівень</p>
                                        <p>• Різні типи: кардіо, силові, HIIT та інші</p>
                                        <p>• Вбудований таймер з підрахунком калорій</p>
                                        <p>• Автоматичне збереження в історію</p>
                                        <p>• Детальна статистика прогресу</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Рекомендації */}
                        {currentWorkouts.length > 0 && (
                            <div className="mt-8 bg-blue-50 p-6 rounded-2xl">
                                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                                    💡 Поради для ефективного тренування:
                                </h3>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li>• Почніть з 5-хвилинної розминки</li>
                                    <li>• Слідкуйте за правильною технікою виконання</li>
                                    <li>• Робіть перерви між вправами (30-60 секунд)</li>
                                    <li>• Пийте воду під час тренування</li>
                                    <li>• Завершіть заминкою та розтяжкою</li>
                                    <li>• Слухайте своє тіло - при болю зупиніться</li>
                                </ul>

                                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                    <p className="text-blue-800 text-sm">
                                        <strong>🎯 Ваша ціль:</strong> {preferences.daily_calorie_goal || 2000} ккал на день
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workouts;