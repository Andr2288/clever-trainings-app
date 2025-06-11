import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
    return (
        <div className="bg-white shadow-md rounded-2xl p-4 mb-4 hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
                <li><strong>Калорійність:</strong> {product.calories} ккал / 100г</li>
                <li><strong>Білки:</strong> {product.protein} г</li>
                <li><strong>Жири:</strong> {product.fat} г</li>
                <li><strong>Вуглеводи:</strong> {product.carbs} г</li>
            </ul>
            {product.category && (
                <p className="text-xs text-gray-500 mb-3">Категорія: {product.category}</p>
            )}
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition"
                >
                    <Plus size={16} />
                    <span>Додати</span>
                </button>
            )}
        </div>
    );
};

export default ProductCard;