import React from 'react';
import { Plus, Info } from 'lucide-react';

const ProductCard = ({ product, onAdd, showNutritionFacts = false }) => {
    const [showDetails, setShowDetails] = React.useState(false);

    const getNutritionColor = (value, type) => {
        // Кольорове кодування для різних макроелементів
        switch(type) {
            case 'calories':
                if (value < 100) return 'text-green-600';
                if (value < 300) return 'text-yellow-600';
                return 'text-red-600';
            case 'protein':
                if (value > 15) return 'text-green-600';
                if (value > 5) return 'text-yellow-600';
                return 'text-gray-600';
            case 'fat':
                if (value < 5) return 'text-green-600';
                if (value < 15) return 'text-yellow-600';
                return 'text-red-600';
            case 'carbs':
                if (value < 10) return 'text-green-600';
                if (value < 30) return 'text-yellow-600';
                return 'text-red-600';
            default:
                return 'text-gray-700';
        }
    };

    const getCalorieLevel = (calories) => {
        if (calories < 100) return { level: 'Низька', color: 'bg-green-100 text-green-800' };
        if (calories < 300) return { level: 'Середня', color: 'bg-yellow-100 text-yellow-800' };
        return { level: 'Висока', color: 'bg-red-100 text-red-800' };
    };

    const calorieLevel = getCalorieLevel(product.calories);

    return (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
            {/* Заголовок з категорією */}
            <div className="p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex-1">
                        {product.name}
                    </h3>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Детальна інформація"
                    >
                        <Info size={16} />
                    </button>
                </div>

                {product.category && (
                    <div className="flex justify-between items-center mb-3">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {product.category}
            </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${calorieLevel.color}`}>
              {calorieLevel.level} калорійність
            </span>
                    </div>
                )}
            </div>

            {/* Основна інформація */}
            <div className="px-4 pb-3">
                {/* Калорії - виділено */}
                <div className="text-center bg-gray-50 p-3 rounded-lg mb-3">
                    <p className={`text-2xl font-bold ${getNutritionColor(product.calories, 'calories')}`}>
                        {product.calories}
                    </p>
                    <p className="text-sm text-gray-600">ккал / 100г</p>
                </div>

                {/* Макроелементи */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                        <p className={`font-bold ${getNutritionColor(product.protein, 'protein')}`}>
                            {product.protein}г
                        </p>
                        <p className="text-xs text-gray-500">Білки</p>
                    </div>
                    <div className="text-center">
                        <p className={`font-bold ${getNutritionColor(product.fat, 'fat')}`}>
                            {product.fat}г
                        </p>
                        <p className="text-xs text-gray-500">Жири</p>
                    </div>
                    <div className="text-center">
                        <p className={`font-bold ${getNutritionColor(product.carbs, 'carbs')}`}>
                            {product.carbs}г
                        </p>
                        <p className="text-xs text-gray-500">Вуглеводи</p>
                    </div>
                </div>

                {/* Розширена інформація */}
                {showDetails && (
                    <div className="border-t pt-3 mt-3">
                        {product.description && (
                            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                        )}

                        {/* Додаткові розрахунки */}
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Калорій з білків:</span>
                                <span>{Math.round(product.protein * 4)} ккал</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Калорій з жирів:</span>
                                <span>{Math.round(product.fat * 9)} ккал</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Калорій з вуглеводів:</span>
                                <span>{Math.round(product.carbs * 4)} ккал</span>
                            </div>
                        </div>

                        {/* Піктограми поживності */}
                        <div className="mt-3 flex flex-wrap gap-1">
                            {product.protein > 15 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  💪 Високий білок
                </span>
                            )}
                            {product.fat < 3 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  💧 Нежирний
                </span>
                            )}
                            {product.carbs < 5 && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  🥬 Низько-вуглеводний
                </span>
                            )}
                            {product.calories < 50 && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  🔥 Низькокалорійний
                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Кнопка додавання */}
            {onAdd && (
                <div className="px-4 pb-4">
                    <button
                        onClick={onAdd}
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                    >
                        <Plus size={18} />
                        <span>Додати до раціону</span>
                    </button>
                </div>
            )}

            {/* Індикатор поживної цінності */}
            {showNutritionFacts && (
                <div className="px-4 pb-4">
                    <div className="text-xs text-gray-500 text-center">
                        💡 Клікніть на іконку ℹ️ для детальної інформації
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;