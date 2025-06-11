import React, { useState } from 'react';

const UserForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activity: 'moderate'
  });

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Ваші параметри</h2>

      <div className="mb-3">
        <label className="block mb-1 text-gray-700">Вік (років)</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
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
          <option value="low">Низький</option>
          <option value="moderate">Середній</option>
          <option value="high">Високий</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Розрахувати
      </button>
    </form>
  );
};

export default UserForm;