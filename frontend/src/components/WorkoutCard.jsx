import React from 'react';
import { Clock, Zap, Dumbbell, Heart, Target, Info } from 'lucide-react';

const WorkoutCard = ({ workout, showCompletedBadge = false, isActive = false }) => {
    const [showDetails, setShowDetails] = React.useState(false);

    const getIntensityColor = (intensity) => {
        switch(intensity.toLowerCase()) {
            case 'легка':
            case 'низька':
                return 'bg-green-100 text-green-800';
            case 'середня':
                return 'bg-yellow-100 text-yellow-800';
            case 'висока':
            case 'високий':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch(type.toLowerCase()) {
            case 'кардіо':
                return <Heart size={18} className="text-red-500" />;
            case 'силові':
                return <Dumbbell size={18} className="text-blue-500" />;
            default:
                return <Target size={18} className="text-purple-500" />;
        }
    };

    const getDifficultyStars = (intensity) => {
        const level = intensity.toLowerCase();
        let stars = 1;
        if (level.includes('середня') || level.includes('moderate')) stars = 2;
        if (level.includes('висока') || level.includes('високий') || level.includes('advanced')) stars = 3;

        return '★'.repeat(stars) + '☆'.repeat(3 - stars);
    };

    const getEstimatedCalories = (type, duration, intensity) => {
        // Приблизний розрахунок калорій (для людини ~70кг)
        let caloriesPerMinute = 5; // базове значення

        if (type.toLowerCase().includes('кардіо')) {
            caloriesPerMinute = intensity.toLowerCase().includes('висока') ? 12 :
                intensity.toLowerCase().includes('середня') ? 8 : 5;
        } else if (type.toLowerCase().includes('силові')) {
            caloriesPerMinute = intensity.toLowerCase().includes('висока') ? 8 :
                intensity.toLowerCase().includes('середня') ? 6 : 4;
        }

        return Math.round(duration * caloriesPerMinute);
    };

    const estimatedCalories = getEstimatedCalories(workout.type, workout.duration, workout.intensity);

    return (
        <div className={`bg-white shadow-md rounded-2xl overflow-hidden transition-all duration-300 ${
            isActive
                ? 'ring-4 ring-green-300 shadow-xl transform scale-105'
                : 'hover:shadow-lg hover:transform hover:scale-102'
        }`}>

            {/* Заголовок */}
            <div className="relative">
                <div className="p-4 pb-2">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 flex-1 pr-2">
                            {workout.name}
                        </h3>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Детальна інформація"
                        >
                            <Info size={16} />
                        </button>
                    </div>

                    {/* Бейджі та індикатори */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
                            {getTypeIcon(workout.type)}
                            <span className="text-xs font-medium text-gray-700">{workout.type}</span>
                        </div>

                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getIntensityColor(workout.intensity)}`}>
              {workout.intensity}
            </span>

                        {showCompletedBadge && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                ✓ Завершено
              </span>
                        )}

                        {isActive && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium animate-pulse">
                🔥 Активне
              </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Основна інформація */}
            <div className="px-4 pb-4">
                {/* Основні параметри */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                        <Clock size={18} className="text-blue-500" />
                        <div>
                            <p className="font-bold text-gray-800">{workout.duration}</p>
                            <p className="text-xs text-gray-600">хвилин</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                        <Zap size={18} className="text-orange-500" />
                        <div>
                            <p className="font-bold text-gray-800">~{estimatedCalories}</p>
                            <p className="text-xs text-gray-600">калорій</p>
                        </div>
                    </div>
                </div>

                {/* Складність */}
                <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Складність:</span>
                    <span className="text-yellow-500 text-lg" title={`${workout.intensity} рівень`}>
            {getDifficultyStars(workout.intensity)}
          </span>
                </div>

                {/* Обладнання */}
                {workout.equipment && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-600">Обладнання: </span>
                        <span className="text-sm font-medium text-blue-700">{workout.equipment}</span>
                    </div>
                )}

                {/* Опис */}
                {workout.description && (
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {workout.description}
                    </p>
                )}

                {/* Розширена інформація */}
                {showDetails && (
                    <div className="border-t pt-3 mt-3 space-y-3">
                        {/* Рекомендації */}
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Поради:</h4>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                {workout.type.toLowerCase().includes('кардіо') && (
                                    <>
                                        <li>• Підтримуйте рівномірне дихання</li>
                                        <li>• Тримайте пульс у цільовій зоні</li>
                                    </>
                                )}
                                {workout.type.toLowerCase().includes('силові') && (
                                    <>
                                        <li>• Контролюйте техніку виконання</li>
                                        <li>• Робіть паузи між підходами</li>
                                    </>
                                )}
                                <li>• Пийте воду під час тренування</li>
                                <li>• Зупиніться при болю чи дискомфорті</li>
                            </ul>
                        </div>

                        {/* Додаткова інформація */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                            <div>
                                <span className="font-medium">Цільові м'язи:</span>
                                <div className="mt-1">
                                    {workout.type.toLowerCase().includes('кардіо') && '❤️ Серце, загальна витривалість'}
                                    {workout.type.toLowerCase().includes('силові') && '💪 Різні групи м\'язів'}
                                    {!workout.type.toLowerCase().includes('кардіо') && !workout.type.toLowerCase().includes('силові') && '🎯 Комплексне тренування'}
                                </div>
                            </div>

                            <div>
                                <span className="font-medium">Рекомендована частота:</span>
                                <div className="mt-1">
                                    {workout.intensity.toLowerCase().includes('легка') && '📅 Щодня'}
                                    {workout.intensity.toLowerCase().includes('середня') && '📅 3-4 рази на тиждень'}
                                    {workout.intensity.toLowerCase().includes('висока') && '📅 2-3 рази на тиждень'}
                                </div>
                            </div>
                        </div>

                        {/* Прогрес та мотивація */}
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-700">
                                🏆 <strong>Результат:</strong> Це тренування допоможе покращити вашу фізичну форму
                                {workout.type.toLowerCase().includes('кардіо') && ' та витривалість серцево-судинної системи'}
                                {workout.type.toLowerCase().includes('силові') && ' та нарощує м\'язову масу'}!
                            </p>
                        </div>
                    </div>
                )}

                {/* Час завершення (якщо завершено) */}
                {workout.completedAt && (
                    <div className="mt-3 text-xs text-gray-500 text-center">
                        Завершено: {new Date(workout.completedAt).toLocaleString('uk-UA')}
                        {workout.actualDuration && workout.actualDuration !== workout.duration && (
                            <span className="ml-2 text-blue-600 font-medium">
                (фактично: {workout.actualDuration} хв)
              </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutCard;