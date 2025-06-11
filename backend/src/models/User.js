import BaseModel from './BaseModel.js';
import bcrypt from 'bcryptjs';

class User extends BaseModel {
    constructor() {
        super('users');
    }

    // Знайти користувача за email
    async findByEmail(email) {
        return await this.findOneWhere({ email });
    }

    // Створити нового користувача з хешуванням пароля
    async createUser(userData) {
        const { password, ...otherData } = userData;

        // Хешуємо пароль
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await this.create({
            ...otherData,
            password: hashedPassword
        });

        // Видаляємо пароль з результату
        delete user.password;
        return user;
    }

    // Перевірка пароля
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Оновити профіль користувача
    async updateProfile(id, profileData) {
        // Видаляємо пароль з даних, якщо він переданий випадково
        const { password, ...safeData } = profileData;

        const updatedUser = await this.update(id, safeData);
        if (updatedUser) {
            delete updatedUser.password;
        }

        return updatedUser;
    }

    // Змінити пароль
    async changePassword(id, newPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        return await this.update(id, { password: hashedPassword });
    }

    // Отримати користувача без пароля
    async findByIdSafe(id) {
        const user = await this.findById(id);
        if (user) {
            delete user.password;
        }
        return user;
    }

    // Оновити останню активність
    async updateLastActivity(id) {
        const query = `UPDATE ${this.tableName} SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return await this.executeCustomQuery(query, [id]);
    }

    // Отримати статистику користувача
    async getUserStats(userId) {
        const query = `
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.age,
                u.gender,
                u.weight,
                u.height,
                u.activity_level,
                u.created_at,
                
                -- Статистика харчування
                (SELECT COUNT(*) FROM daily_meals dm WHERE dm.user_id = u.id) as total_meals,
                (SELECT COUNT(DISTINCT dm.meal_date) FROM daily_meals dm WHERE dm.user_id = u.id) as days_tracked,
                
                -- Статистика тренувань
                (SELECT COUNT(*) FROM completed_workouts cw WHERE cw.user_id = u.id) as total_workouts,
                (SELECT SUM(cw.actual_duration_minutes) FROM completed_workouts cw WHERE cw.user_id = u.id) as total_workout_minutes,
                
                -- Налаштування
                up.fitness_level,
                up.daily_calorie_goal
                
            FROM users u
            LEFT JOIN user_preferences up ON u.id = up.user_id
            WHERE u.id = ?
        `;

        const result = await this.executeCustomQuery(query, [userId]);
        return result[0] || null;
    }

    // Розрахувати базовий метаболізм (BMR)
    calculateBMR(weight, height, age, gender) {
        if (gender === 'male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    }

    // Розрахувати добову норму калорій (TDEE)
    calculateTDEE(bmr, activityLevel) {
        const multipliers = {
            'low': 1.2,
            'moderate': 1.55,
            'high': 1.725
        };

        return Math.round(bmr * (multipliers[activityLevel] || 1.2));
    }

    // Отримати рекомендовану калорійність для користувача
    async getRecommendedCalories(userId) {
        const user = await this.findById(userId);

        if (!user || !user.weight || !user.height || !user.age) {
            return null;
        }

        const bmr = this.calculateBMR(user.weight, user.height, user.age, user.gender);
        const tdee = this.calculateTDEE(bmr, user.activity_level);

        return tdee;
    }
}

export default new User();