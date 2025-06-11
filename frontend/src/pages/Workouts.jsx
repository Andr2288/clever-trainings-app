import React, { useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { generateWorkouts, generateRandomWorkouts } from '../utils/workoutGenerator';
import WorkoutCard from '../components/WorkoutCard';
import { Play, RotateCcw, Settings, Trophy, Clock } from 'lucide-react';

const Workouts = () => {
    const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(null);
    const [workoutTimer, setWorkoutTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const {
        currentWorkouts,
        preferences,
        setWorkouts,
        completeWorkout,
        setFitnessLevel,
        getTodayWorkouts,
        getWeeklyStats,
        clearCurrentWorkouts
    } = useWorkoutStore();

    const todayWorkouts = getTodayWorkouts();
    const weeklyStats = getWeeklyStats();

    // Таймер для тренування
    React.useEffect(() => {
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

    const handleGenerateWorkouts = (type = 'level') => {
        let newWorkouts;
        if (type === 'random') {
            newWorkouts = generateRandomWorkouts();
        } else {
            newWorkouts = generateWorkouts(preferences.fitnessLevel);
        }
        setWorkouts(newWorkouts);
    };

    const handleStartWorkout = (index) => {
        setActiveWorkoutIndex(index);
        setWorkoutTimer(0);
        setIsTimerRunning(true);
    };

    const handleCompleteWorkout = (index) => {
        const duration = Math.floor(workoutTimer / 60); // конвертуємо в хвилини
        completeWorkout(index, duration);
        setActiveWorkoutIndex(null);
        setIsTimerRunning(false);
        setWorkoutTimer(0);
    };

    const handleStopWorkout = () => {
        setActiveWorkoutIndex(null);
        setIsTimerRunning(false);
        setWorkoutTimer(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                                    <p className="text-2xl font-bold text-green-600">{todayWorkouts.length}</p>
                                    <p className="text-sm text-gray-600">Сьогодні</p>
                                </div>

                                <div className="text-center bg-blue-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{weeklyStats.totalWorkouts}</p>
                                    <p className="text-sm text-gray-600">За тиждень</p>
                                </div>

                                <div className="text-center bg-purple-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{weeklyStats.totalDuration}</p>
                                    <p className="text-sm text-gray-600">Хвилин за тиждень</p>
                                </div>
                            </div>

                            {todayWorkouts.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Сьогоднішні тренування:</h4>
                                    {todayWorkouts.map((workout, index) => (
                                        <div key={index} className="text-xs text-gray-600 mb-1 flex justify-between">
                                            <span>{workout.name}</span>
                                            <span>{workout.actualDuration}хв</span>
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
                                            value={preferences.fitnessLevel}
                                            onChange={(e) => setFitnessLevel(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="beginner">Початківець</option>
                                            <option value="intermediate">Середній</option>
                                            <option value="advanced">Просунутий</option>
                                        </select>
                                    </div>

                                    <div className="text-xs text-gray-600">
                                        <p className="mb-1"><strong>Початківець:</strong> Легкі вправи, коротка тривалість</p>
                                        <p className="mb-1"><strong>Середній:</strong> Помірна інтенсивність</p>
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
                                    <p className="text-sm text-gray-600">
                                        {currentWorkouts[activeWorkoutIndex]?.name}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        {isTimerRunning ? 'Пауза' : 'Старт'}
                                    </button>
                                    <button
                                        onClick={() => handleCompleteWorkout(activeWorkoutIndex)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Завершити
                                    </button>
                                </div>

                                <button
                                    onClick={handleStopWorkout}
                                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition"
                                >
                                    <Play size={20} />
                                    <span>Тренування для мого рівня</span>
                                </button>

                                <button
                                    onClick={() => handleGenerateWorkouts('random')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition"
                                >
                                    <RotateCcw size={20} />
                                    <span>Випадкові тренування</span>
                                </button>

                                {currentWorkouts.length > 0 && (
                                    <button
                                        onClick={clearCurrentWorkouts}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition"
                                    >
                                        Очистити список
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Список тренувань */}
                        {currentWorkouts.length > 0 ? (
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
                                            />
                                        </div>

                                        {/* Action Buttons - відокремлені від WorkoutCard */}
                                        <div className="p-4 bg-gray-50 border-t">
                                            {activeWorkoutIndex === index ? (
                                                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                                                    <p className="text-green-700 font-medium text-sm mb-2">
                                                        Активне тренування
                                                    </p>
                                                    <p className="text-green-600 font-bold text-lg">
                                                        {formatTime(workoutTimer)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartWorkout(index)}
                                                    disabled={activeWorkoutIndex !== null}
                                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition font-medium"
                                                >
                                                    <Play size={18} />
                                                    <span>Почати тренування</span>
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
                                        Натисніть одну з кнопок вище, щоб згенерувати персоналізовані тренування відповідно до вашого рівня підготовки.
                                    </p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p>• Тренування адаптовані під ваш рівень</p>
                                        <p>• Різні типи вправ: кардіо та силові</p>
                                        <p>• Вбудований таймер для відстеження часу</p>
                                        <p>• Статистика прогресу</p>
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
                                    <li>• Виконуйте розминку перед основними вправами</li>
                                    <li>• Слідкуйте за правильною технікою виконання</li>
                                    <li>• Робіть перерви між вправами (30-60 секунд)</li>
                                    <li>• Пийте воду під час тренування</li>
                                    <li>• Не забувайте про заминку після тренування</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workouts;