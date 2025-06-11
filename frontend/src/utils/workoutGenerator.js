/**
 * Генерація тренувань залежно від рівня фізичної підготовки
 * @param {string} fitnessLevel - рівень фізичної підготовки користувача ("beginner", "intermediate", "advanced")
 * @returns {Array} - масив тренувань, що відповідають рівню фізичної підготовки
 */
export const generateWorkouts = (fitnessLevel) => {
  const workouts = {
    beginner: [
      {
        name: "Jumping Jacks",
        sets: 3,
        reps: 20,
        duration: "30 seconds"
      },
      {
        name: "Push-ups",
        sets: 3,
        reps: 10,
        duration: null
      },
      {
        name: "Bodyweight Squats",
        sets: 3,
        reps: 15,
        duration: null
      },
      {
        name: "Plank",
        sets: 3,
        reps: null,
        duration: "20 seconds"
      }
    ],
    intermediate: [
      {
        name: "Burpees",
        sets: 4,
        reps: 15,
        duration: null
      },
      {
        name: "Pull-ups",
        sets: 4,
        reps: 8,
        duration: null
      },
      {
        name: "Lunges",
        sets: 4,
        reps: 12,
        duration: null
      },
      {
        name: "Mountain Climbers",
        sets: 4,
        reps: 20,
        duration: "30 seconds"
      }
    ],
    advanced: [
      {
        name: "Muscle-ups",
        sets: 5,
        reps: 5,
        duration: null
      },
      {
        name: "Pistol Squats",
        sets: 5,
        reps: 10,
        duration: null
      },
      {
        name: "Handstand Push-ups",
        sets: 5,
        reps: 10,
        duration: null
      },
      {
        name: "Plank to Push-ups",
        sets: 5,
        reps: 15,
        duration: null
      }
    ]
  };

  return workouts[fitnessLevel] || workouts.beginner; // Default to beginner if no valid fitness level is provided
};

/**
 * Генерація випадкових тренувань для змішування різних видів вправ
 * @returns {Array} - масив випадкових тренувань
 */
export const generateRandomWorkouts = () => {
  const allWorkouts = [
    { name: "Jumping Jacks", sets: 3, reps: 20, duration: "30 seconds" },
    { name: "Push-ups", sets: 3, reps: 15, duration: null },
    { name: "Burpees", sets: 4, reps: 15, duration: null },
    { name: "Lunges", sets: 4, reps: 12, duration: null },
    { name: "Mountain Climbers", sets: 4, reps: 20, duration: "30 seconds" },
    { name: "Pull-ups", sets: 4, reps: 8, duration: null },
    { name: "Plank", sets: 3, reps: null, duration: "45 seconds" },
    { name: "Squats", sets: 3, reps: 20, duration: null }
  ];

  // Випадковим чином вибираємо 5 вправ з масиву
  const randomWorkouts = [];
  const selectedIndices = [];

  while (randomWorkouts.length < 5) {
    const randomIndex = Math.floor(Math.random() * allWorkouts.length);
    if (!selectedIndices.includes(randomIndex)) {
      randomWorkouts.push(allWorkouts[randomIndex]);
      selectedIndices.push(randomIndex);
    }
  }

  return randomWorkouts;
};