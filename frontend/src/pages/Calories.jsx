import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { calculateCalories } from '../utils/calorieCalculator';
import { foodList } from '../data/foodList';

const Calories = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [dailyCalories, setDailyCalories] = useState(0);

  const handleAddProduct = (product) => {
    setSelectedProducts((prev) => [...prev, product]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCalculateCalories = () => {
    const totalCalories = calculateCalories(selectedProducts);
    setDailyCalories(totalCalories);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-6">
        Розрахунок Добової Калорійності Продуктів
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {foodList.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={() => handleAddProduct(product)}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Вибрані продукти</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {selectedProducts.map((product) => (
            <div key={product.id} className="flex items-center space-x-2 bg-white p-4 rounded-xl shadow-md">
              <span>{product.name}</span>
              <button
                onClick={() => handleRemoveProduct(product.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleCalculateCalories}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition"
        >
          Розрахувати Калорії
        </button>

        {dailyCalories > 0 && (
          <div className="mt-6 text-xl font-bold text-green-700">
            <p>Загальна калорійність: {dailyCalories} калорій</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calories;