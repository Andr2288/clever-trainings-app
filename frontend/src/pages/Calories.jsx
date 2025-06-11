import React, { useState } from 'react';
import { useNutritionStore } from '../store/useNutritionStore';
import { useUserStore } from '../store/useUserStore';
import ProductCard from '../components/ProductCard';
import { foodList } from '../data/foodList';
import { Search, X, Save, Trash2, Target, TrendingUp } from 'lucide-react';

const Calories = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(100);

    const {
        dailyMeals,
        addMeal,
        removeMeal,
        updateMealQuantity,
        getTotalCalories,
        getTotalNutrients,
        saveDayToHistory,
        clearDay
    } = useNutritionStore();

    const { getCalculatedCalories } = useUserStore();

    const recommendedCalories = getCalculatedCalories();
    const totalCalories = Math.round(getTotalCalories());
    const totalNutrients = getTotalNutrients();

    // Фільтрація продуктів
    const categories = [...new Set(foodList.map(item => item.category))];
    const filteredProducts = foodList.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddProduct = (product) => {
        setSelectedProduct(product);
        setQuantity(100);
        setShowQuantityModal(true);
    };

    const handleConfirmAdd = () => {
        if (selectedProduct && quantity > 0) {
            addMeal(selectedProduct, quantity);
            setShowQuantityModal(false);
            setSelectedProduct(null);
            setQuantity(100);
        }
    };

    const handleUpdateQuantity = (mealId, newQuantity) => {
        if (newQuantity > 0) {
            updateMealQuantity(mealId, newQuantity);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
                    Трекер Харчування
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Панель трекера */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Загальна статистика */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                <Target className="mr-2" size={20} />
                                Сьогоднішні калорії
                            </h2>

                            <div className="text-center mb-4">
                                <p className="text-3xl font-bold text-green-600">
                                    {totalCalories}
                                </p>
                                <p className="text-gray-600">
                                    {recommendedCalories ? `з ${recommendedCalories} ккал` : 'спожито ккал'}
                                </p>
                            </div>

                            {recommendedCalories && (
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Прогрес</span>
                                        <span className="text-sm text-gray-600">
                      {Math.round((totalCalories / recommendedCalories) * 100)}%
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min((totalCalories / recommendedCalories) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {recommendedCalories - totalCalories > 0
                                            ? `Залишилось: ${recommendedCalories - totalCalories} ккал`
                                            : `Перевищено на: ${totalCalories - recommendedCalories} ккал`
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Макроелементи */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center bg-red-50 p-2 rounded">
                                    <p className="text-sm text-gray-600">Білки</p>
                                    <p className="font-bold text-red-600">{Math.round(totalNutrients.protein)}г</p>
                                </div>
                                <div className="text-center bg-yellow-50 p-2 rounded">
                                    <p className="text-sm text-gray-600">Жири</p>
                                    <p className="font-bold text-yellow-600">{Math.round(totalNutrients.fat)}г</p>
                                </div>
                                <div className="text-center bg-blue-50 p-2 rounded">
                                    <p className="text-sm text-gray-600">Вуглеводи</p>
                                    <p className="font-bold text-blue-600">{Math.round(totalNutrients.carbs)}г</p>
                                </div>
                            </div>

                            {/* Кнопки дій */}
                            <div className="flex gap-2">
                                <button
                                    onClick={saveDayToHistory}
                                    disabled={dailyMeals.length === 0}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition"
                                >
                                    <Save size={16} />
                                    <span>Зберегти день</span>
                                </button>
                                <button
                                    onClick={clearDay}
                                    disabled={dailyMeals.length === 0}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition"
                                >
                                    <Trash2 size={16} />
                                    <span>Очистити</span>
                                </button>
                            </div>
                        </div>

                        {/* Список спожитого */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-semibold text-blue-700 mb-4">
                                Спожито сьогодні ({dailyMeals.length})
                            </h3>

                            {dailyMeals.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Ще нічого не додано
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {dailyMeals.map((meal) => (
                                        <div key={meal.id} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-800">{meal.name}</h4>
                                                <button
                                                    onClick={() => removeMeal(meal.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={meal.quantity}
                                                        onChange={(e) => handleUpdateQuantity(meal.id, Number(e.target.value))}
                                                        className="w-16 px-2 py-1 border rounded text-sm"
                                                        min="1"
                                                    />
                                                    <span className="text-sm text-gray-600">г</span>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">
                                                        {Math.round((meal.calories * meal.quantity) / 100)} ккал
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {Math.round((meal.protein * meal.quantity) / 100)}б /
                                                        {Math.round((meal.fat * meal.quantity) / 100)}ж /
                                                        {Math.round((meal.carbs * meal.quantity) / 100)}в
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Список продуктів */}
                    <div className="lg:col-span-2">
                        {/* Фільтри та пошук */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Пошук продуктів..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Всі категорії</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Продукти */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAdd={() => handleAddProduct(product)}
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Продуктів не знайдено</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Модальне вікно для вибору кількості */}
                {showQuantityModal && selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4">
                                Додати: {selectedProduct.name}
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Кількість (грамів):
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    step="1"
                                />
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Калорії:
                                    <span className="font-bold text-green-600 ml-1">
                    {Math.round((selectedProduct.calories * quantity) / 100)}
                  </span> ккал
                                </p>
                                <p className="text-xs text-gray-500">
                                    Б: {Math.round((selectedProduct.protein * quantity) / 100)}г,
                                    Ж: {Math.round((selectedProduct.fat * quantity) / 100)}г,
                                    В: {Math.round((selectedProduct.carbs * quantity) / 100)}г
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowQuantityModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleConfirmAdd}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Додати
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calories;