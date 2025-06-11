import React, { useState } from 'react';
import WorkoutCard from '../components/WorkoutCard';
import { generateWorkouts } from '../utils/workoutGenerator';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);

  const handleGenerate = () => {
    const generated = generateWorkouts(); // генерація тренувань
    setWorkouts(generated);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-6">
        Генератор Тренувань
      </h1>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition"
        >
          Згенерувати тренування
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <WorkoutCard key={index} workout={workout} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            Натисніть кнопку, щоб згенерувати тренування.
          </p>
        )}
      </div>
    </div>
  );
};

export default Workouts;