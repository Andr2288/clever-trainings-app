import React, { useEffect, useState } from 'react';
import { Activity, Target, TrendingUp, User, Heart, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWorkoutStore } from '../store/useWorkoutStore';

const Home = () => {
    const [isInitializing, setIsInitializing] = useState(true);

    // Auth store
    const {
        authUser,
        getUserName,
        getRecommendedCalories,
        isProfileComplete,
        userStats
    } = useAuthStore();

    // Nutrition store
    const {
        dailyMeals,
        getTotalCalories,
        initialize: initializeNutrition,
        isLoadingMeals
    } = useNutritionStore();

    // Workout store
    const {
        loadTodayWorkouts,
        loadWeeklyStats,
        initialize: initializeWorkouts
    } = useWorkoutStore();

    // Local state for stats
    const [todayWorkouts, setTodayWorkouts] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState({
        total_workouts: 0,
        total_duration: 0,
        workout_types: {}
    });

    // Ініціалізація при завантаженні компонента
    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsInitializing(true);

                // Ініціалізуємо stores паралельно
                await Promise.all([
                    initializeNutrition(),
                    initializeWorkouts()
                ]);

                // Завантажуємо сьогоднішні дані
                const [todayData, weeklyData] = await Promise.all([
                    loadTodayWorkouts(),
                    loadWeeklyStats()
                ]);

                if (todayData) {
                    setTodayWorkouts(todayData.workouts || []);
                }

                if (weeklyData) {
                    setWeeklyStats(weeklyData);
                }

            } catch (error) {
                console.error('Помилка ініціалізації головної сторінки:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        if (authUser) {
            initializeData();
        }
    }, [authUser, initializeNutrition, initializeWorkouts, loadTodayWorkouts, loadWeeklyStats]);

    // Розраховуємо дані
    const recommendedCalories = getRecommendedCalories();
    const consumedCalories = Math.round(getTotalCalories());
    const todayWorkoutCount = todayWorkouts.length;
    const todayWorkoutDuration = todayWorkouts.reduce((sum, w) => sum + (w.actualDuration || 0), 0);

    // Показуємо загрузку під час ініціалізації
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="size-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Завантаження даних...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Welcome section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-800 mb-4">
                        Привіт, {getUserName()}! 👋
                    </h1>
                    <p className="text-xl text-gray-600">
                        Ласкаво просимо до вашого персонального фітнес-помічника
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Profile and Quick Actions */}
                    <div className="space-y-6">
                        {/* Profile completion check */}
                        {!isProfileComplete() && (
                            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                                <h2 className="text-xl font-semibold text-yellow-800 mb-2 flex items-center">
                                    <User className="mr-2" size={24} />
                                    Заповніть профіль
                                </h2>
                                <p className="text-yellow-700 mb-4">
                                    Завершіть налаштування профілю для отримання персональних рекомендацій
                                </p>
                                <Link
                                    to="/profile"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center"
                                >
                                    Налаштувати профіль
                                </Link>
                            </div>
                        )}

                        {/* Profile info */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
                                <User className="mr-2" size={24} />
                                Ваш профіль
                            </h2>

                            {isProfileComplete() ? (
                                <>
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4">
                                        <p className="text-green-800 font-medium">
                                            ✅ Профіль заповнено повністю!
                                        </p>
                                    </div>

                                    {recommendedCalories && (
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl mb-4">
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Рекомендована калорійність:
                                            </h3>
                                            <p className="text-3xl font-bold text-green-600">
                                                {recommendedCalories} ккал/день
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <p className="text-blue-800 mb-2">
                                        <strong>Заповніть профіль для:</strong>
                                    </p>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>• Розрахунку персональної норми калорій</li>
                                        <li>• Підбору тренувань за рівнем підготовки</li>
                                        <li>• Отримання точних рекомендацій</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Quick actions */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                <Activity className="mr-2" size={20} />
                                Швидкі дії
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    to="/calories"
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center hover:from-green-600 hover:to-green-700 transition"
                                >
                                    <Target size={24} className="mx-auto mb-2" />
                                    <div className="text-sm font-medium">Додати їжу</div>
                                </Link>

                                <Link
                                    to="/workouts"
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center hover:from-blue-600 hover:to-blue-700 transition"
                                >
                                    <Activity size={24} className="mx-auto mb-2" />
                                    <div className="text-sm font-medium">Тренуватися</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Statistics */}
                    <div className="space-y-6">
                        {/* Today's stats */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
                                <Target className="mr-2" size={24} />
                                Сьогоднішній прогрес
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <Target size={20} className="text-blue-600 mr-1" />
                                    </div>
                                    <p className="text-sm text-gray-600">Спожито</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {isLoadingMeals ? (
                                            <Loader size={16} className="animate-spin inline" />
                                        ) : (
                                            `${consumedCalories} ккал`
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {dailyMeals.length} продуктів
                                    </p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <Activity size={20} className="text-green-600 mr-1" />
                                    </div>
                                    <p className="text-sm text-gray-600">Тренувань</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {todayWorkoutCount}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {todayWorkoutDuration} хв
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            {recommendedCalories && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Прогрес калорій</span>
                                        <span className="text-sm text-gray-600">
                                            {Math.round((consumedCalories / recommendedCalories) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min((consumedCalories / recommendedCalories) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        {recommendedCalories - consumedCalories > 0
                                            ? `Залишилось: ${recommendedCalories - consumedCalories} ккал`
                                            : `Перевищено на: ${consumedCalories - recommendedCalories} ккал`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Weekly stats */}
                        {weeklyStats.total_workouts > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <TrendingUp className="mr-2" size={20} />
                                    Тижнева статистика
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center bg-purple-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {weeklyStats.total_workouts}
                                        </p>
                                        <p className="text-sm text-gray-600">Тренувань</p>
                                    </div>

                                    <div className="text-center bg-orange-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {weeklyStats.total_duration}
                                        </p>
                                        <p className="text-sm text-gray-600">Хвилин</p>
                                    </div>
                                </div>

                                {Object.keys(weeklyStats.workout_types).length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Типи тренувань:</p>
                                        <div className="space-y-1">
                                            {Object.entries(weeklyStats.workout_types).map(([type, count]) => (
                                                <div key={type} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                                    <span>{type}:</span>
                                                    <span className="font-medium">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User stats from backend */}
                        {userStats && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <TrendingUp className="mr-2" size={20} />
                                    Загальна статистика
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center bg-blue-50 p-3 rounded-lg">
                                        <p className="text-lg font-bold text-blue-600">
                                            {userStats.nutrition?.days_tracked || 0}
                                        </p>
                                        <p className="text-xs text-gray-600">Днів харчування</p>
                                    </div>

                                    <div className="text-center bg-green-50 p-3 rounded-lg">
                                        <p className="text-lg font-bold text-green-600">
                                            {userStats.workouts?.total_workouts || 0}
                                        </p>
                                        <p className="text-xs text-gray-600">Всього тренувань</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Motivation card */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center mb-4">
                                <Heart className="mr-2" size={24} />
                                <h3 className="text-xl font-semibold">Мотивація дня</h3>
                            </div>
                            <p className="text-lg mb-4">
                                "Кожен день - це нова можливість стати кращою версією себе!"
                            </p>
                            <div className="text-sm opacity-90">
                                {isProfileComplete() ? (
                                    <p>Ви на правильному шляху до здорового способу життя! 💪</p>
                                ) : (
                                    <p>Заповніть профіль, щоб почати свою подорож до здоров'я! 🚀</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;