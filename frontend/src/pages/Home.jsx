import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import UserForm from '../components/UserForm';
import { Activity, Target, TrendingUp } from 'lucide-react';

const Home = () => {
    const { user, setUser, getCalculatedCalories } = useUserStore();
    const { getTotalCalories, dailyMeals } = useNutritionStore();
    const { getTodayWorkouts, getWeeklyStats } = useWorkoutStore();

    const handleFormSubmit = (data) => {
        setUser(data);
    };

    const recommendedCalories = getCalculatedCalories();
    const consumedCalories = Math.round(getTotalCalories());
    const todayWorkouts = getTodayWorkouts();
    const weeklyStats = getWeeklyStats();

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
                    Фітнес та харчування онлайн
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Форма профілю */}
                    <div className="flex justify-center">
                        <UserForm onSubmit={handleFormSubmit} user={user} />
                    </div>

                    {/* Статистика */}
                    <div className="space-y-6">
                        {user && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <Target className="mr-2" size={24} />
                                    Привіт, {user.name}!
                                </h2>

                                {recommendedCalories && (
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                                            Рекомендована калорійність:
                                        </h3>
                                        <p className="text-3xl font-bold text-green-600">
                                            {recommendedCalories} ккал/день
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Спожито сьогодні</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {consumedCalories} ккал
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {dailyMeals.length} продуктів
                                        </p>
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Тренувань сьогодні</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {todayWorkouts.length}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {todayWorkouts.reduce((sum, w) => sum + (w.actualDuration || 0), 0)} хв
                                        </p>
                                    </div>
                                </div>

                                {/* Прогрес до цілі */}
                                {recommendedCalories && (
                                    <div className="mt-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Прогрес калорій</span>
                                            <span className="text-sm text-gray-600">
                        {Math.round((consumedCalories / recommendedCalories) * 100)}%
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min((consumedCalories / recommendedCalories) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Залишилось: {Math.max(0, recommendedCalories - consumedCalories)} ккал
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Тижнева статистика */}
                        {weeklyStats.totalWorkouts > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <TrendingUp className="mr-2" size={20} />
                                    Статистика за тиждень
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {weeklyStats.totalWorkouts}
                                        </p>
                                        <p className="text-sm text-gray-600">Тренувань</p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {weeklyStats.totalDuration}
                                        </p>
                                        <p className="text-sm text-gray-600">Хвилин</p>
                                    </div>
                                </div>

                                {Object.keys(weeklyStats.workoutTypes).length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Типи тренувань:</p>
                                        {Object.entries(weeklyStats.workoutTypes).map(([type, count]) => (
                                            <div key={type} className="flex justify-between text-sm">
                                                <span>{type}:</span>
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Швидкі дії */}
                        {!user && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <Activity className="mr-2" size={20} />
                                    Почніть свою фітнес-подорож
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Заповніть форму профілю, щоб отримати персоналізовані рекомендації щодо калорій та тренувань.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>✓ Розрахунок щоденної норми калорій</p>
                                    <p>✓ Персоналізовані тренування</p>
                                    <p>✓ Трекінг харчування</p>
                                    <p>✓ Статистика прогресу</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;