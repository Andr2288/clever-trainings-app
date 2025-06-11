import React, { useState, useEffect } from 'react';

const UserForm = ({ onSubmit, user = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        weight: '',
        height: '',
        activity: 'moderate'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                age: user.age || '',
                gender: user.gender || 'male',
                weight: user.weight || '',
                height: user.height || '',
                activity: user.activity || 'moderate'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {user ? 'Редагувати профіль' : 'Ваші параметри'}
            </h2>

            <div className="mb-3">
                <label className="block mb-1 text-gray-700">Ім'я</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Введіть ваше ім'я"
                />
            </div>

            <div className="mb-3">
                <label className="block mb-1 text-gray-700">Вік (років)</label>
                <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="1"
                    max="120"
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div className="mb-3">
                <label className="block mb-1 text-gray-700">Стать</label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="male">Чоловіча</option>
                    <option value="female">Жіноча</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="block mb-1 text-gray-700">Вага (кг)</label>
                <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.1"
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div className="mb-3">
                <label className="block mb-1 text-gray-700">Зріст (см)</label>
                <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    required
                    min="50"
                    max="250"
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Рівень активності</label>
                <select
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="low">Низький (сидячий спосіб життя)</option>
                    <option value="moderate">Середній (1-3 тренування на тиждень)</option>
                    <option value="high">Високий (4+ тренувань на тиждень)</option>
                </select>
            </div>

            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
                {user ? 'Оновити дані' : 'Розрахувати'}
            </button>
        </div>
    );
};

export default UserForm;