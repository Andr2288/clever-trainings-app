import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useAuthStore } from '../store/useAuthStore';
import UserForm from '../components/UserForm';
import { Activity, Target, TrendingUp, User, Heart } from 'lucide-react';

const Home = () => {
    const { user, setUser, getCalculatedCalories } = useUserStore();
    const { getTotalCalories, dailyMeals } = useNutritionStore();
    const { getTodayWorkouts, getWeeklyStats } = useWorkoutStore();
    const { getUserName } = useAuthStore();

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
                    {/* Profile setup section */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
                                <User className="mr-2" size={24} />
                                Налаштування профілю
                            </h2>

                            {!user ? (
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                                    <p className="text-blue-800 mb-2">
                                        <strong>Заповніть свій профіль</strong>
                                    </p>
                                    <p className="text-blue-700 text-sm">
                                        Це допоможе нам розрахувати вашу щоденну норму калорій та підібрати персональні тренування
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
                                    <p className="text-green-800 font-medium">
                                        ✅ Профіль налаштовано успішно!
                                    </p>
                                </div>
                            )}

                            <UserForm onSubmit={handleFormSubmit} user={user} />
                        </div>

                        {/* Quick actions */}
                        {user && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <Activity className="mr-2" size={20} />
                                    Швидкі дії
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href="/calories"
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center hover:from-green-600 hover:to-green-700 transition"
                                    >
                                        <Target size={24} className="mx-auto mb-2" />
                                        <div className="text-sm font-medium">Додати їжу</div>
                                    </a>

                                    <a
                                        href="/workouts"
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center hover:from-blue-600 hover:to-blue-700 transition"
                                    >
                                        <Activity size={24} className="mx-auto mb-2" />
                                        <div className="text-sm font-medium">Тренуватися</div>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Statistics section */}
                    <div className="space-y-6">
                        {user && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
                                    <Target className="mr-2" size={24} />
                                    Ваші цілі та прогрес
                                </h2>

                                {recommendedCalories && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-700 mb-3">
                                            Щоденна норма калорій:
                                        </h3>
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl">
                                            <p className="text-3xl font-bold text-green-600 text-center">
                                                {recommendedCalories} ккал/день
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <Target size={20} className="text-blue-600 mr-1" />
                                        </div>
                                        <p className="text-sm text-gray-600">Спожито сьогодні</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {consumedCalories} ккал
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {dailyMeals.length} продуктів
                                        </p>
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-xl text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <Activity size={20} className="text-green-600 mr-1" />
                                        </div>
                                        <p className="text-sm text-gray-600">Тренувань сьогодні</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {todayWorkouts.length}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {todayWorkouts.reduce((sum, w) => sum + (w.actualDuration || 0), 0)} хв
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {recommendedCalories && (
                                    <div className="mt-6">
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
                        )}

                        {/* Weekly stats */}
                        {weeklyStats.totalWorkouts > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                    <TrendingUp className="mr-2" size={20} />
                                    Тижнева статистика
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center bg-purple-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {weeklyStats.totalWorkouts}
                                        </p>
                                        <p className="text-sm text-gray-600">Тренувань</p>
                                    </div>

                                    <div className="text-center bg-orange-50 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {weeklyStats.totalDuration}
                                        </p>
                                        <p className="text-sm text-gray-600">Хвилин</p>
                                    </div>
                                </div>

                                {Object.keys(weeklyStats.workoutTypes).length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Типи тренувань:</p>
                                        <div className="space-y-1">
                                            {Object.entries(weeklyStats.workoutTypes).map(([type, count]) => (
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
                                {user ? (
                                    <p>Ви на правильному шляху до здорового способу життя! 💪</p>
                                ) : (
                                    <p>Заповніть профіль, щоб почати свою подорож до здоров'я! 🚀</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits section */}
                {!user && (
                    <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
                            Чому варто використовувати FitApp?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target size={32} className="text-blue-600" />
                                </div>
                                <h4 className="font-semibold mb-2">Точний підрахунок</h4>
                                <p className="text-sm text-gray-600">Розрахунок калорій на основі ваших індивідуальних параметрів</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity size={32} className="text-green-600" />
                                </div>
                                <h4 className="font-semibold mb-2">Персональні тренування</h4>
                                <p className="text-sm text-gray-600">Вправи, адаптовані під ваш рівень фізичної підготовки</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp size={32} className="text-purple-600" />
                                </div>
                                <h4 className="font-semibold mb-2">Відстеження прогресу</h4>
                                <p className="text-sm text-gray-600">Детальна статистика ваших досягнень</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart size={32} className="text-red-600" />
                                </div>
                                <h4 className="font-semibold mb-2">Турбота про здоров'я</h4>
                                <p className="text-sm text-gray-600">Комплексний підхід до здорового способу життя</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;