import React, { useState, useEffect } from 'react';
import { User, Activity, Target, Calendar, Download, Trash2, BarChart3, Settings, Loader, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/useAuthStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWorkoutStore } from '../store/useWorkoutStore';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});

  // Auth store
  const {
    authUser,
    userStats,
    updateProfile,
    getUserName,
    getRecommendedCalories,
    isProfileComplete,
    isUpdatingProfile,
    loadUserStats
  } = useAuthStore();

  // Nutrition store
  const {
    mealHistory,
    loadMealHistory,
    isLoadingHistory
  } = useNutritionStore();

  // Workout store
  const {
    completedWorkouts,
    preferences,
    loadCompletedWorkouts,
    clearCurrentWorkouts,
    updatePreferences,
    isLoadingWorkouts
  } = useWorkoutStore();

  // Ініціалізація даних
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadUserStats(),
          loadMealHistory(50),
          loadCompletedWorkouts({ limit: 100 })
        ]);
      } catch (error) {
        console.error('Помилка завантаження даних профілю:', error);
      }
    };

    if (authUser) {
      initializeData();
      // Ініціалізуємо форму поточними даними користувача
      setProfileFormData({
        fullName: authUser.full_name || '',
        age: authUser.age || '',
        gender: authUser.gender || 'male',
        weight: authUser.weight || '',
        height: authUser.height || '',
        activityLevel: authUser.activity_level || 'moderate'
      });
    }
  }, [authUser, loadUserStats, loadMealHistory, loadCompletedWorkouts]);

  const tabs = [
    { id: 'profile', label: 'Профіль', icon: User },
    { id: 'nutrition', label: 'Харчування', icon: Target },
    { id: 'workouts', label: 'Тренування', icon: Activity },
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
    { id: 'settings', label: 'Налаштування', icon: Settings }
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Конвертуємо назви полів для API
      const updateData = {
        fullName: profileFormData.fullName,
        age: parseInt(profileFormData.age),
        gender: profileFormData.gender,
        weight: parseFloat(profileFormData.weight),
        height: parseInt(profileFormData.height),
        activityLevel: profileFormData.activityLevel
      };

      await updateProfile(updateData);
      setIsEditingProfile(false);

      // Оновлюємо статистику після оновлення профілю
      await loadUserStats();
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
    }
  };

  const exportData = () => {
    const data = {
      profile: authUser,
      mealHistory,
      workoutHistory: completedWorkouts,
      userStats,
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

    toast.success('Дані експортовано успішно');
  };

  const handleClearWorkouts = async () => {
    if (window.confirm('Ви впевнені, що хочете очистити поточні тренування? Це не вплине на вашу історію.')) {
      clearCurrentWorkouts();
      toast.success('Поточні тренування очищено');
    }
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await updatePreferences(newPreferences);
    } catch (error) {
      console.error('Помилка оновлення налаштувань:', error);
    }
  };

  const recommendedCalories = getRecommendedCalories();

  // Розрахункові значення
  const totalMealDays = mealHistory?.length || 0;
  const totalWorkouts = completedWorkouts?.length || 0;
  const averageCaloriesPerDay = totalMealDays > 0 && mealHistory
      ? Math.round(mealHistory.reduce((sum, day) => sum + (day.total_calories || 0), 0) / totalMealDays)
      : 0;

  const lastWeekWorkouts = completedWorkouts?.filter(workout => {
    const workoutDate = new Date(workout.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return workoutDate >= oneWeekAgo;
  }).length || 0;

  return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
            Профіль користувача
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
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-blue-700">
                          Особисті дані
                        </h2>
                        <button
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                        >
                          {isEditingProfile ? <X size={16} /> : <Edit size={16} />}
                          <span>{isEditingProfile ? 'Скасувати' : 'Редагувати'}</span>
                        </button>
                      </div>

                      {isEditingProfile ? (
                          <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Повне ім'я
                              </label>
                              <input
                                  type="text"
                                  name="fullName"
                                  value={profileFormData.fullName}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                  required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Вік
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={profileFormData.age}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="10"
                                    max="120"
                                    required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Стать
                                </label>
                                <select
                                    name="gender"
                                    value={profileFormData.gender}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="male">Чоловіча</option>
                                  <option value="female">Жіноча</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Вага (кг)
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={profileFormData.weight}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="30"
                                    max="300"
                                    step="0.1"
                                    required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Зріст (см)
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    value={profileFormData.height}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="120"
                                    max="250"
                                    required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Рівень активності
                              </label>
                              <select
                                  name="activityLevel"
                                  value={profileFormData.activityLevel}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="low">Низький (сидячий спосіб життя)</option>
                                <option value="moderate">Середній (1-3 тренування на тиждень)</option>
                                <option value="high">Високий (4+ тренувань на тиждень)</option>
                              </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition"
                            >
                              {isUpdatingProfile ? (
                                  <>
                                    <Loader className="animate-spin h-5 w-5" />
                                    <span>Оновлення...</span>
                                  </>
                              ) : (
                                  <>
                                    <Save size={16} />
                                    <span>Зберегти зміни</span>
                                  </>
                              )}
                            </button>
                          </form>
                      ) : (
                          <>
                            {authUser ? (
                                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="font-medium text-gray-700">Ім'я:</span>
                                      <span>{authUser.full_name || 'Не вказано'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium text-gray-700">Email:</span>
                                      <span>{authUser.email}</span>
                                    </div>
                                    {authUser.age && (
                                        <div className="flex justify-between">
                                          <span className="font-medium text-gray-700">Вік:</span>
                                          <span>{authUser.age} років</span>
                                        </div>
                                    )}
                                    {authUser.gender && (
                                        <div className="flex justify-between">
                                          <span className="font-medium text-gray-700">Стать:</span>
                                          <span>{authUser.gender === 'male' ? 'Чоловіча' : 'Жіноча'}</span>
                                        </div>
                                    )}
                                    {authUser.weight && (
                                        <div className="flex justify-between">
                                          <span className="font-medium text-gray-700">Вага:</span>
                                          <span>{authUser.weight} кг</span>
                                        </div>
                                    )}
                                    {authUser.height && (
                                        <div className="flex justify-between">
                                          <span className="font-medium text-gray-700">Зріст:</span>
                                          <span>{authUser.height} см</span>
                                        </div>
                                    )}
                                    {authUser.activity_level && (
                                        <div className="flex justify-between">
                                          <span className="font-medium text-gray-700">Активність:</span>
                                          <span>
                                                                    {authUser.activity_level === 'low' && 'Низька'}
                                            {authUser.activity_level === 'moderate' && 'Середня'}
                                            {authUser.activity_level === 'high' && 'Висока'}
                                                                </span>
                                        </div>
                                    )}
                                    {recommendedCalories && (
                                        <div className="flex justify-between border-t pt-3">
                                          <span className="font-medium text-gray-700">Добова норма:</span>
                                          <span className="font-bold text-green-600">{recommendedCalories} ккал</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-3">
                                      <span className="font-medium text-gray-700">Профіль:</span>
                                      <span className={isProfileComplete() ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                                                                {isProfileComplete() ? '✅ Заповнено' : '⚠️ Не повний'}
                                                            </span>
                                    </div>
                                  </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                                  <p className="text-yellow-800">
                                    Дані профілю завантажуються...
                                  </p>
                                </div>
                            )}

                            {!isProfileComplete() && (
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6">
                                  <p className="text-orange-800 mb-2">
                                    <strong>Заповніть профіль повністю для:</strong>
                                  </p>
                                  <ul className="text-orange-700 text-sm space-y-1">
                                    <li>• Точного розрахунку калорій</li>
                                    <li>• Персональних рекомендацій</li>
                                    <li>• Правильного підбору тренувань</li>
                                  </ul>
                                </div>
                            )}
                          </>
                      )}

                      {/* Кнопки дій */}
                      {!isEditingProfile && (
                          <div className="flex flex-wrap gap-3">
                            <button
                                onClick={exportData}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                            >
                              <Download size={16} />
                              <span>Експорт даних</span>
                            </button>

                            <button
                                onClick={handleClearWorkouts}
                                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                              <span>Очистити тренування</span>
                            </button>
                          </div>
                      )}
                    </div>

                    {/* Статистика профілю */}
                    <div>
                      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                        Швидка статистика
                      </h2>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {totalMealDays}
                          </div>
                          <div className="text-sm text-gray-600">Днів харчування</div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {totalWorkouts}
                          </div>
                          <div className="text-sm text-gray-600">Тренувань</div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {averageCaloriesPerDay}
                          </div>
                          <div className="text-sm text-gray-600">Сер. калорій/день</div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-orange-600 mb-1">
                            {lastWeekWorkouts}
                          </div>
                          <div className="text-sm text-gray-600">За тиждень</div>
                        </div>
                      </div>

                      {authUser && recommendedCalories && (
                          <div className="bg-white border-2 border-blue-200 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-blue-700 mb-4">
                              Розрахунки для вашого профілю
                            </h3>

                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-700">Базовий метаболізм (BMR):</span>
                                <span className="font-bold text-blue-600">
                                                        {Math.round(recommendedCalories / (
                                                            authUser.activity_level === 'low' ? 1.2 :
                                                                authUser.activity_level === 'moderate' ? 1.55 : 1.725
                                                        ))} ккал
                                                    </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-700">Добова норма (TDEE):</span>
                                <span className="font-bold text-green-600">{recommendedCalories} ккал</span>
                              </div>

                              {authUser.weight && authUser.height && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Індекс маси тіла (ІМТ):</span>
                                    <span className="font-bold text-purple-600">
                                                            {(authUser.weight / Math.pow(authUser.height / 100, 2)).toFixed(1)}
                                                        </span>
                                  </div>
                              )}
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              )}

              {/* Таб Харчування */}
              {activeTab === 'nutrition' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                      Історія харчування
                    </h2>

                    {isLoadingHistory ? (
                        <div className="text-center py-8">
                          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                          <p className="text-gray-600">Завантаження історії харчування...</p>
                        </div>
                    ) : mealHistory && mealHistory.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {mealHistory.slice(0, 12).map((day, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium text-gray-700">
                                                            {new Date(day.meal_date).toLocaleDateString('uk-UA')}
                                                        </span>
                                    <span className="text-sm text-gray-500">
                                                            {day.meal_count} продуктів
                                                        </span>
                                  </div>

                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                      {Math.round(day.total_calories || 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">ккал</p>
                                  </div>

                                  {recommendedCalories && (
                                      <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                              className="bg-green-500 h-2 rounded-full"
                                              style={{
                                                width: `${Math.min((day.total_calories / recommendedCalories) * 100, 100)}%`
                                              }}
                                          ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-center">
                                          {Math.round((day.total_calories / recommendedCalories) * 100)}% від норми
                                        </p>
                                      </div>
                                  )}

                                  <div className="mt-2 text-xs text-gray-600 grid grid-cols-3 gap-1">
                                    <div className="text-center">
                                      <div className="font-medium text-red-600">
                                        {Math.round(day.total_protein || 0)}г
                                      </div>
                                      <div>Білки</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-yellow-600">
                                        {Math.round(day.total_fat || 0)}г
                                      </div>
                                      <div>Жири</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-blue-600">
                                        {Math.round(day.total_carbs || 0)}г
                                      </div>
                                      <div>Вуглеводи</div>
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>

                          {mealHistory.length > 12 && (
                              <p className="text-center text-sm text-gray-500">
                                Показано останні 12 днів з {mealHistory.length}
                              </p>
                          )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">Історія харчування порожня</p>
                          <p className="text-sm text-gray-400">
                            Почніть додавати продукти на сторінці "Калорії"
                          </p>
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

                    {isLoadingWorkouts ? (
                        <div className="text-center py-8">
                          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                          <p className="text-gray-600">Завантаження історії тренувань...</p>
                        </div>
                    ) : completedWorkouts && completedWorkouts.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {completedWorkouts.slice(0, 12).map((workout, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-800">{workout.name}</h4>
                                    <span className="text-xs text-gray-500">
                                                            {new Date(workout.date).toLocaleDateString('uk-UA')}
                                                        </span>
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                      <span>Тип:</span>
                                      <span className="font-medium">{workout.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Тривалість:</span>
                                      <span className="font-medium text-green-600">
                                                                {workout.actualDuration} хв
                                                            </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Інтенсивність:</span>
                                      <span className={`font-medium ${
                                          workout.intensity?.includes('Висока') ? 'text-red-600' :
                                              workout.intensity?.includes('Середня') ? 'text-yellow-600' :
                                                  'text-green-600'
                                      }`}>
                                                                {workout.intensity}
                                                            </span>
                                    </div>
                                  </div>

                                  {workout.notes && (
                                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                        {workout.notes}
                                      </div>
                                  )}
                                </div>
                            ))}
                          </div>

                          {completedWorkouts.length > 12 && (
                              <p className="text-center text-sm text-gray-500">
                                Показано останні 12 тренувань з {completedWorkouts.length}
                              </p>
                          )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">Історія тренувань порожня</p>
                          <p className="text-sm text-gray-400">
                            Почніть тренуватися на сторінці "Тренування"
                          </p>
                        </div>
                    )}
                  </div>
              )}

              {/* Таб Статистика */}
              {activeTab === 'stats' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                      Детальна статистика
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-blue-50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {userStats?.nutrition?.days_tracked || totalMealDays}
                        </div>
                        <div className="text-sm text-gray-600">Днів харчування</div>
                      </div>

                      <div className="bg-green-50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {userStats?.workouts?.total_workouts || totalWorkouts}
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
                          {userStats?.workouts?.total_minutes ||
                              completedWorkouts?.reduce((sum, w) => sum + (w.actualDuration || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Хвилин тренувань</div>
                      </div>
                    </div>

                    {authUser && recommendedCalories && (
                        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl">
                          <h3 className="text-lg font-semibold text-blue-700 mb-4">
                            Персональні показники
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-gray-700">Базовий метаболізм (BMR):</span>
                                <span className="font-bold text-blue-600">
                                                        {Math.round(recommendedCalories / (
                                                            authUser.activity_level === 'low' ? 1.2 :
                                                                authUser.activity_level === 'moderate' ? 1.55 : 1.725
                                                        ))} ккал/день
                                                    </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-700">Добова норма (TDEE):</span>
                                <span className="font-bold text-green-600">{recommendedCalories} ккал/день</span>
                              </div>

                              {averageCaloriesPerDay > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Середнє споживання:</span>
                                    <span className="font-bold text-purple-600">{averageCaloriesPerDay} ккал/день</span>
                                  </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              {authUser.weight && authUser.height && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">ІМТ:</span>
                                    <span className="font-bold text-orange-600">
                                                            {(authUser.weight / Math.pow(authUser.height / 100, 2)).toFixed(1)}
                                                        </span>
                                  </div>
                              )}

                              <div className="flex justify-between">
                                <span className="text-gray-700">Рівень активності:</span>
                                <span className="font-bold text-gray-700">
                                                        {authUser.activity_level === 'low' && 'Низький'}
                                  {authUser.activity_level === 'moderate' && 'Середній'}
                                  {authUser.activity_level === 'high' && 'Високий'}
                                                    </span>
                              </div>

                              {lastWeekWorkouts > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Тренувань за тиждень:</span>
                                    <span className="font-bold text-green-600">{lastWeekWorkouts}</span>
                                  </div>
                              )}
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
              )}

              {/* Таб Налаштування */}
              {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-700 mb-6">
                      Налаштування додатку
                    </h2>

                    <div className="space-y-6">
                      {/* Налаштування тренувань */}
                      <div className="bg-white border border-gray-200 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Налаштування тренувань
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Рівень фітнесу:
                            </label>
                            <select
                                value={preferences?.fitnessLevel || 'beginner'}
                                onChange={(e) => handleUpdatePreferences({ fitness_level: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="beginner">Початківець</option>
                              <option value="intermediate">Середній рівень</option>
                              <option value="advanced">Просунутий</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ціль калорій на день:
                            </label>
                            <input
                                type="number"
                                value={preferences?.daily_calorie_goal || 2000}
                                onChange={(e) => handleUpdatePreferences({ daily_calorie_goal: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="1200"
                                max="5000"
                                step="50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Експорт та очищення даних */}
                      <div className="bg-white border border-gray-200 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Управління даними
                        </h3>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-800">Експорт даних</h4>
                              <p className="text-sm text-gray-600">Завантажити всі ваші дані у форматі JSON</p>
                            </div>
                            <button
                                onClick={exportData}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                            >
                              <Download size={16} />
                              <span>Експорт</span>
                            </button>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-800">Очистити поточні тренування</h4>
                              <p className="text-sm text-gray-600">Видалити тренування з поточного списку (історія збережеться)</p>
                            </div>
                            <button
                                onClick={handleClearWorkouts}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                            >
                              <Trash2 size={16} />
                              <span>Очистити</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Інформація про акаунт */}
                      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">
                          Інформація про акаунт
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Email:</span>
                            <span className="font-medium">{authUser?.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Дата реєстрації:</span>
                            <span className="font-medium">
                                                    {authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('uk-UA') : 'Невідомо'}
                                                </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Останнє оновлення:</span>
                            <span className="font-medium">
                                                    {authUser?.updated_at ? new Date(authUser.updated_at).toLocaleDateString('uk-UA') : 'Невідомо'}
                                                </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;