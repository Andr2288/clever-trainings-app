import React from 'react';

const WorkoutCard = ({ workout }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 mb-4 hover:shadow-xl transition duration-300">
      <h3 className="text-xl font-semibold mb-2">{workout.name}</h3>
      <ul className="text-sm text-gray-700 mb-2">
        <li><strong>Тип:</strong> {workout.type}</li>
        <li><strong>Тривалість:</strong> {workout.duration} хв</li>
        <li><strong>Інтенсивність:</strong> {workout.intensity}</li>
        {workout.equipment && <li><strong>Обладнання:</strong> {workout.equipment}</li>}
      </ul>
      {workout.description && (
        <p className="text-gray-600 text-sm">{workout.description}</p>
      )}
    </div>
  );
};

export default WorkoutCard;