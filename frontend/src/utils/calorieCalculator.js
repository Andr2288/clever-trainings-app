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
 * @param {string} activityLevel - рівень активності ("sedentary", "light", "moderate", "active", "very active")
 * @returns {number} - загальна добова калорійність
 */
export const calculateTDEE = (BMR, activityLevel) => {
	let activityMultiplier

	switch (activityLevel) {
		case 'sedentary':
			activityMultiplier = 1.2
			break
		case 'light':
			activityMultiplier = 1.375
			break
		case 'moderate':
			activityMultiplier = 1.55
			break
		case 'active':
			activityMultiplier = 1.725
			break
		case 'very active':
			activityMultiplier = 1.9
			break
		default:
			activityMultiplier = 1.2 // Default to sedentary if invalid activity level
	}

	return BMR * activityMultiplier
}

/**
 * Розрахунок калорійності продукту на основі спожитої кількості
 * @param {number} caloriesPer100g - калорії на 100 грамів продукту
 * @param {number} quantity - кількість спожитого продукту в грамах
 * @returns {number} - кількість калорій для спожитої кількості продукту
 */
export const calculateProductCalories = (caloriesPer100g, quantity) => {
	return (caloriesPer100g * quantity) / 100
}

/**
 * Розрахунок добової калорійності на основі вибраних продуктів
 * @param {Array} foodItems - список вибраних продуктів з їх кількістю
 * @returns {number} - загальна кількість калорій для вибраних продуктів
 */
export const calculateCalories = (/* params */) => {
	return foodItems.reduce((total, item) => {
		return total + calculateProductCalories(item.calories, item.quantity)
	}, 0)
}
