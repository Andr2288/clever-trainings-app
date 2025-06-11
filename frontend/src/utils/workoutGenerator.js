/**
 * Генерація тренувань залежно від рівня фізичної підготовки
 * @param {string} fitnessLevel - рівень фізичної підготовки користувача ("beginner", "intermediate", "advanced")
 * @returns {Array} - масив тренувань, що відповідають рівню фізичної підготовки
 */
export const generateWorkouts = (fitnessLevel = 'beginner') => {
  const workouts = {
    beginner: [
      {
        name: "Стрибки з розведенням рук і ніг",
        type: "Кардіо",
        duration: 10,
        intensity: "Легка",
        description: "Стрибки на місці з розведенням рук і ніг",
        equipment: "Не потрібно"
      },
      {
        name: "Віджимання від підлоги",
        type: "Силові",
        duration: 5,
        intensity: "Легка",
        description: "Класичні віджимання від підлоги",
        equipment: "Не потрібно"
      },
      {
        name: "Присідання",
        type: "Силові",
        duration: 8,
        intensity: "Легка",
        description: "Присідання з власною вагою",
        equipment: "Не потрібно"
      },
      {
        name: "Планка",
        type: "Силові",
        duration: 5,
        intensity: "Легка",
        description: "Утримання положення планки",
        equipment: "Не потрібно"
      }
    ],
    intermediate: [
      {
        name: "Берпі",
        type: "Кардіо",
        duration: 15,
        intensity: "Середня",
        description: "Комплексна вправа з стрибком",
        equipment: "Не потрібно"
      },
      {
        name: "Підтягування",
        type: "Силові",
        duration: 10,
        intensity: "Середня",
        description: "Підтягування на турніку",
        equipment: "Турнік"
      },
      {
        name: "Випади",
        type: "Силові",
        duration: 12,
        intensity: "Середня",
        description: "Випади вперед з власною вагою",
        equipment: "Не потрібно"
      },
      {
        name: "Альпініст",
        type: "Кардіо",
        duration: 10,
        intensity: "Середня",
        description: "Імітація підйому в гори",
        equipment: "Не потрібно"
      }
    ],
    advanced: [
      {
        name: "Muscle-ups",
        type: "Силові",
        duration: 20,
        intensity: "Висока",
        description: "Підйом силою на турніку",
        equipment: "Турнік"
      },
      {
        name: "Пістолетики",
        type: "Силові",
        duration: 15,
        intensity: "Висока",
        description: "Присідання на одній нозі",
        equipment: "Не потрібно"
      },
      {
        name: "Віджимання в стійці на руках",
        type: "Силові",
        duration: 10,
        intensity: "Висока",
        description: "Віджимання в стійці біля стіни",
        equipment: "Стіна"
      },
      {
        name: "Планка з переходом у віджимання",
        type: "Силові",
        duration: 12,
        intensity: "Висока",
        description: "Динамічна планка з віджиманнями",
        equipment: "Не потрібно"
      }
    ]
  };

  return workouts[fitnessLevel] || workouts.beginner;
};

/**
 * Генерація випадкових тренувань для змішування різних видів вправ
 * @returns {Array} - масив випадкових тренувань
 */
export const generateRandomWorkouts = () => {
  const allWorkouts = [
    {
      name: "Стрибки з розведенням рук і ніг",
      type: "Кардіо",
      duration: 10,
      intensity: "Легка",
      description: "Стрибки на місці з розведенням рук і ніг"
    },
    {
      name: "Віджимання від підлоги",
      type: "Силові",
      duration: 8,
      intensity: "Легка",
      description: "Класичні віджимання від підлоги"
    },
    {
      name: "Берпі",
      type: "Кардіо",
      duration: 15,
      intensity: "Середня",
      description: "Комплексна вправа з стрибком"
    },
    {
      name: "Випади",
      type: "Силові",
      duration: 12,
      intensity: "Середня",
      description: "Випади вперед з власною вагою"
    },
    {
      name: "Альпініст",
      type: "Кардіо",
      duration: 10,
      intensity: "Середня",
      description: "Імітація підйому в гори"
    },
    {
      name: "Підтягування",
      type: "Силові",
      duration: 10,
      intensity: "Середня",
      description: "Підтягування на турніку"
    },
    {
      name: "Планка",
      type: "Силові",
      duration: 8,
      intensity: "Легка",
      description: "Утримання положення планки"
    },
    {
      name: "Присідання",
      type: "Силові",
      duration: 10,
      intensity: "Легка",
      description: "Присідання з власною вагою"
    }
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