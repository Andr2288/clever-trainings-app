import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import UserForm from '../components/UserForm';
import { User, Activity, Target, Calendar, Download, Trash2, BarChart3 } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedDate, setSelectedDate] = useState('');

  const { user, updateUser, clearUser, getCalculatedCalories } = useUserStore();
  const { mealHistory, getMealsByDate } = useNutritionStore();
  const { completedWorkouts, getWorkoutsByDate, clearCurrentWorkouts } = useWorkoutStore();

  const handleFormSubmit = (updatedUser) => {
    updateUser(updatedUser);
  };

  const handleClearAllData = () => {
    if (window.confirm('Ви впевнені, що хочете видалити всі дані? Цю дію неможливо відмінити.')) {
      clearUser();
      clearCurrentWorkouts();
      // Тут би ми також очистили харчові дані, але в поточному store немає такої функції
      localStorage.removeItem('fitapp_nutrition_data');
      localStorage.removeItem('fitapp_workout_data');
    }
  };

  const exportData = () => {
    const data = {
      profile: user,
      mealHistory,
      workoutHistory: completedWorkouts,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitapp-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Профіль', icon: User },
    { id: 'nutrition', label: 'Харчування', icon: Target },
    { id: 'workouts', label: 'Тренування', icon: Activity },
    { id: 'stats', label: 'Статистика', icon: BarChart3 }
  ];

  const recommendedCalories = getCalculatedCalories();

  // Статистика
  const totalMealDays = mealHistory.length;
  const totalWorkouts = completedWorkouts.length;
  const averageCaloriesPerDay = totalMealDays > 0
      ? Math.round(mealHistory.reduce((sum, day) => sum + day.totalCalories, 0) / totalMealDays)
      : 0;

  const lastWeekWorkouts = completedWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return workoutDate >= oneWeekAgo;
  }).length;

  return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
            Профіль Користувача
          </h1>

          {/* Навігація по табах */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="flex flex-wrap border-b">
              {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center space-x-2 px-6 py-4 font-medium transition ${
                          activeTab === id
                              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
              ))}
            </div>

            <div className="p-6">
              {/* Таб Профіль */}
              {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                        Особисті дані
                      </h2>

                      {user ? (
                          <div className="bg-gray-50 p-6 rounded-xl mb-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Ім'я:</span>
                                <span>{user.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Вік:</span>
                                <span>{user.age} років</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Стать:</span>
                                <span>{user.gender === 'male' ? 'Чоловіча' : 'Жіноча'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Вага:</span>
                                <span>{user.weight} кг</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Зріст:</span>
                                <span>{user.height} см</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Активність:</span>
                                <span>
                            {user.activity === 'low' && 'Низька'}
                                  {user.activity === 'moderate' && 'Середня'}
                                  {user.activity === 'high' && 'Висока'}
                          </span>
                              </div>
                              {recommendedCalories && (
                                  <div className="flex justify-between border-t pt-3">
                                    <span className="font-medium text-gray-700">Добова норма:</span>
                                    <span className="font-bold text-green-600">{recommendedCalories} ккал</span>
                                  </div>
                              )}
                            </div>
                          </div>
                      ) : (
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                            <p className="text-yellow-800">
                              Профіль не заповнений. Заповніть форму нижче, щоб отримати персоналізовані рекомендації.
                            </p>
                          </div>
                      )}

                      {/* Кнопки дій */}
                      <div className="flex flex-wrap gap-3">
                        <button
                            onClick={exportData}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          <Download size={16} />
                          <span>Експорт даних</span>
                        </button>

                        <button
                            onClick={handleClearAllData}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                          <span>Очистити всі дані</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                        Редагувати профіль
                      </h2>
                      <UserForm onSubmit={handleFormSubmit} user={user} />
                    </div>
                  </div>
              )}

              {/* Таб Харчування */}
              {activeTab === 'nutrition' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                      Історія харчування
                    </h2>

                    {mealHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">Історія харчування порожня</p>
                          <p className="text-sm text-gray-400">
                            Почніть додавати продукти на сторінці "Калорії" та зберігайте дні для ведення історії
                          </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mealHistory.slice(-10).reverse().map((day, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">
                              {new Date(day.date).toLocaleDateString('uk-UA')}
                            </span>
                                    <span className="text-sm text-gray-500">
                              {day.meals.length} продуктів
                            </span>
                                  </div>

                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                      {Math.round(day.totalCalories)}
                                    </p>
                                    <p className="text-sm text-gray-600">ккал</p>
                                  </div>

                                  {recommendedCalories && (
                                      <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                              className="bg-green-500 h-2 rounded-full"
                                              style={{
                                                width: `${Math.min((day.totalCalories / recommendedCalories) * 100, 100)}%`
                                              }}
                                          ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-center">
                                          {Math.round((day.totalCalories / recommendedCalories) * 100)}% від норми
                                        </p>
                                      </div>
                                  )}
                                </div>
                            ))}
                          </div>

                          {mealHistory.length > 10 && (
                              <p className="text-center text-sm text-gray-500">
                                Показано останні 10 днів з {mealHistory.length}
                              </p>
                          )}
                        </div>
                    )}
                  </div>
              )}

              {/* Таб Тренування */}
              {activeTab === 'workouts' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                      Історія тренувань
                    </h2>

                    {completedWorkouts.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">Історія тренувань порожня</p>
                          <p className="text-sm text-gray-400">
                            Почніть тренуватися на сторінці "Тренування" для ведення історії
                          </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedWorkouts.slice(-12).reverse().map((workout, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-800">{workout.name}</h4>
                                    <span className="text-xs text-gray-500">
                              {new Date(workout.completedAt).toLocaleDateString('uk-UA')}
                            </span>
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                      <span>Тип:</span>
                                      <span>{workout.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Тривалість:</span>
                                      <span>{workout.actualDuration} хв</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Інтенсивність:</span>
                                      <span>{workout.intensity}</span>
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>

                          {completedWorkouts.length > 12 && (
                              <p className="text-center text-sm text-gray-500">
                                Показано останні 12 тренувань з {completedWorkouts.length}
                              </p>
                          )}
                        </div>
                    )}
                  </div>
              )}

              {/* Таб Статистика */}
              {activeTab === 'stats' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                      Загальна статистика
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-blue-50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {totalMealDays}
                        </div>
                        <div className="text-sm text-gray-600">Днів харчування</div>
                      </div>

                      <div className="bg-green-50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {totalWorkouts}
                        </div>
                        <div className="text-sm text-gray-600">Всього тренувань</div>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {averageCaloriesPerDay}
                        </div>
                        <div className="text-sm text-gray-600">Середня калорійність</div>
                      </div>

                      <div className="bg-orange-50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {lastWeekWorkouts}
                        </div>
                        <div className="text-sm text-gray-600">Тренувань за тиждень</div>
                      </div>
                    </div>

                    {user && recommendedCalories && (
                        <div className="mt-8 bg-white border-2 border-blue-200 p-6 rounded-xl">
                          <h3 className="text-lg font-semibold text-blue-700 mb-4">
                            Ваші цілі та прогрес
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-700">Щоденна норма калорій:</span>
                                <span className="font-bold text-green-600">{recommendedCalories} ккал</span>
                              </div>

                              {averageCaloriesPerDay > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Середнє споживання:</span>
                                    <span className="font-bold text-blue-600">{averageCaloriesPerDay} ккал</span>
                                  </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">BMR</p>
                                <p className="font-bold">
                                  {Math.round(recommendedCalories / (
                                      user.activity === 'low' ? 1.2 :
                                          user.activity === 'moderate' ? 1.55 : 1.725
                                  ))} ккал
                                </p>
                              </div>

                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">ІМТ</p>
                                <p className="font-bold">
                                  {(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)}
                                </p>
                              </div>

                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">Активність</p>
                                <p className="font-bold">
                                  {user.activity === 'low' && 'Низька'}
                                  {user.activity === 'moderate' && 'Середня'}
                                  {user.activity === 'high' && 'Висока'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;