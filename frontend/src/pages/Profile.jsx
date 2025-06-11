import React, { useState } from 'react';
import UserForm from '../components/UserForm';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
  });

  const handleFormSubmit = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-6">
        Профіль Користувача
      </h1>

      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Особисті Дані</h2>

        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg mb-8">
          <p className="mb-2 text-lg">
            <strong>Ім'я:</strong> {user.name || 'Не вказано'}
          </p>
          <p className="mb-2 text-lg">
            <strong>Вік:</strong> {user.age || 'Не вказано'}
          </p>
          <p className="mb-2 text-lg">
            <strong>Стать:</strong> {user.gender || 'Не вказано'}
          </p>
          <p className="mb-2 text-lg">
            <strong>Вага:</strong> {user.weight || 'Не вказано'} кг
          </p>
          <p className="mb-2 text-lg">
            <strong>Зріст:</strong> {user.height || 'Не вказано'} см
          </p>
          <p className="mb-2 text-lg">
            <strong>Рівень активності:</strong> {user.activityLevel || 'Не вказано'}
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Редагувати Профіль</h2>
        <UserForm user={user} onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
};

export default Profile;