/**
 * Розрахунок базового рівня метаболізму (BMR) за формулою Mifflin-St Jeor
 * @param {number} weight - вага користувача в кілограмах
 * @param {number} height - зріст користувача в сантиметрах
 * @param {number} age - вік користувача в роках
 * @param {string} gender - стать користувача ("male" або "female")
 * @returns {number} - базовий рівень метаболізму
 */
export const calculateBMR = (weight, height, age, gender) => {
	if (gender === 'male') {
		return 10 * weight + 6.25 * height - 5 * age + 5
	} else if (gender === 'female') {
		return 10 * weight + 6.25 * height - 5 * age - 161
	}
	return 0
}

/**
 * Розрахунок загальної добової калорійності (TDEE) з урахуванням рівня активності
 * @param {number} BMR - базовий рівень метаболізму
 * @param {string} activityLevel - рівень активності ("low", "moderate", "high")
 * @returns {number} - загальна добова калорійність
 */
export const calculateTDEE = (BMR, activityLevel) => {
	let activityMultiplier

	switch (activityLevel) {
		case 'low':
			activityMultiplier = 1.2
			break
		case 'moderate':
			activityMultiplier = 1.55
			break
		case 'high':
			activityMultiplier = 1.725
			break
		default:
			activityMultiplier = 1.2 // Default to low if invalid activity level
	}

	return BMR * activityMultiplier
}

/**
 * Розрахунок калорійності продукту на основі спожитої кількості
 * @param {number} caloriesPer100g - калорії на 100 грамів продукту
 * @param {number} quantity - кількість спожитого продукту в грамах
 * @returns {number} - кількість калорій для спожитої кількості продукту
 */
export const calculateProductCalories = (caloriesPer100g, quantity = 100) => {
	return (caloriesPer100g * quantity) / 100
}

/**
 * Розрахунок добової калорійності на основі вибраних продуктів
 * @param {Array} foodItems - список вибраних продуктів з їх кількістю
 * @returns {number} - загальна кількість калорій для вибраних продуктів
 */
export const calculateFoodCalories = (foodItems) => {
	if (!Array.isArray(foodItems)) {
		return 0;
	}

	return foodItems.reduce((total, item) => {
		return total + calculateProductCalories(item.calories, item.quantity || 100)
	}, 0)
}

/**
 * Основна функція для розрахунку калорій користувача
 * @param {Object} userData - дані користувача
 * @returns {number} - рекомендована добова калорійність
 */
export const calculateCalories = (userData) => {
	// Якщо передано масив продуктів, розраховуємо калорії продуктів
	if (Array.isArray(userData)) {
		return calculateFoodCalories(userData);
	}

	// Якщо передано дані користувача, розраховуємо TDEE
	if (userData && typeof userData === 'object' && userData.weight && userData.height && userData.age) {
		const { weight, height, age, gender, activity } = userData;
		const bmr = calculateBMR(Number(weight), Number(height), Number(age), gender);
		const tdee = calculateTDEE(bmr, activity);
		return Math.round(tdee);
	}

	return 0;
}