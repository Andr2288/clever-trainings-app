import React, { useState } from 'react';
import UserForm from '../components/UserForm';
import { calculateCalories } from '../utils/calorieCalculator';

const Home = () => {
  const [calories, setCalories] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleFormSubmit = (data) => {
    const cal = calculateCalories(data);
    setCalories(cal);
    setUserData(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">
        Фітнес та харчування онлайн
      </h1>

      <UserForm onSubmit={handleFormSubmit} />

      {calories && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            Рекомендована добова калорійність:
          </h2>
          <p className="text-3xl font-bold text-gray-800">{calories} ккал</p>
        </div>
      )}
    </div>
  );
};

export default Home;