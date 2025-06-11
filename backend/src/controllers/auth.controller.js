import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/database.js";
import cloudinary from "../lib/cloudinary.js";

// Генерація JWT токену
const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== "development",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
    });

    return token;
};

const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Валідація вхідних даних
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Всі поля обов'язкові" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Пароль повинен містити мінімум 6 символів" });
        }

        // Перевірка чи користувач вже існує
        const existingUsers = await executeQuery(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Користувач з таким email вже існує" });
        }

        // Хешування пароля
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Створення нового користувача
        const result = await executeQuery(
            `INSERT INTO users (full_name, email, password, created_at, updated_at) 
             VALUES (?, ?, ?, NOW(), NOW())`,
            [fullName, email, hashedPassword]
        );

        const userId = result.insertId;

        // Створення налаштувань користувача за замовчуванням
        await executeQuery(
            `INSERT INTO user_preferences (user_id, fitness_level, daily_calorie_goal, notifications_enabled) 
             VALUES (?, 'beginner', 2000, true)`,
            [userId]
        );

        // Генерація токену
        generateToken(userId, res);

        // Отримання створеного користувача (без пароля)
        const [newUser] = await executeQuery(
            "SELECT id, full_name, email, profile_pic, age, gender, weight, height, activity_level, created_at FROM users WHERE id = ?",
            [userId]
        );

        return res.status(201).json({
            message: "Користувача створено успішно",
            user: newUser
        });

    } catch (error) {
        console.error("Помилка в signup контролері:", error.message);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Валідація вхідних даних
        if (!email || !password) {
            return res.status(400).json({ message: "Email та пароль обов'язкові" });
        }

        // Пошук користувача за email
        const users = await executeQuery(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: "Неправильні дані для входу" });
        }

        const user = users[0];

        // Перевірка пароля
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Неправильні дані для входу" });
        }

        // Оновлення часу останньої активності
        await executeQuery(
            "UPDATE users SET updated_at = NOW() WHERE id = ?",
            [user.id]
        );

        // Генерація токену
        generateToken(user.id, res);

        // Повернення даних користувача (без пароля)
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            message: "Вхід успішний",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Помилка в login контролері:", error.message);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== "development"
        });

        return res.status(200).json({ message: "Вихід успішний" });

    } catch (error) {
        console.error("Помилка в logout контролері:", error.message);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, age, gender, weight, height, activityLevel } = req.body;
        const userId = req.user.id;

        let updateData = {};
        let updateFields = [];
        let updateValues = [];

        // Обробка зображення профілю
        if (profilePic) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                updateData.profile_pic = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Помилка завантаження зображення:", uploadError);
                return res.status(400).json({ message: "Помилка завантаження зображення" });
            }
        }

        // Додавання інших полів для оновлення
        if (fullName !== undefined) updateData.full_name = fullName;
        if (age !== undefined) updateData.age = parseInt(age);
        if (gender !== undefined) updateData.gender = gender;
        if (weight !== undefined) updateData.weight = parseFloat(weight);
        if (height !== undefined) updateData.height = parseInt(height);
        if (activityLevel !== undefined) updateData.activity_level = activityLevel;

        // Формування SQL запиту
        Object.keys(updateData).forEach(key => {
            updateFields.push(`${key} = ?`);
            updateValues.push(updateData[key]);
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Немає даних для оновлення" });
        }

        // Додавання часу оновлення
        updateFields.push('updated_at = NOW()');
        updateValues.push(userId);

        // Виконання оновлення
        await executeQuery(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Отримання оновленого користувача
        const [updatedUser] = await executeQuery(
            "SELECT id, full_name, email, profile_pic, age, gender, weight, height, activity_level, created_at, updated_at FROM users WHERE id = ?",
            [userId]
        );

        return res.status(200).json({
            message: "Профіль оновлено успішно",
            user: updatedUser
        });

    } catch (error) {
        console.error("Помилка в updateProfile контролері:", error.message);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

const checkAuth = async (req, res) => {
    try {
        const userId = req.user.id;

        // Отримання актуальних даних користувача
        const [user] = await executeQuery(
            "SELECT id, full_name, email, profile_pic, age, gender, weight, height, activity_level, created_at, updated_at FROM users WHERE id = ?",
            [userId]
        );

        if (!user) {
            return res.status(404).json({ message: "Користувача не знайдено" });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("Помилка в checkAuth контролері:", error.message);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

// Отримання статистики користувача
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Статистика харчування
        const [nutritionStats] = await executeQuery(`
            SELECT 
                COUNT(DISTINCT meal_date) as days_tracked,
                COUNT(*) as total_meals,
                AVG(
                    (fi.calories_per_100g * dm.quantity_grams / 100)
                ) as avg_daily_calories
            FROM daily_meals dm
            JOIN food_items fi ON dm.food_item_id = fi.id
            WHERE dm.user_id = ?
        `, [userId]);

        // Статистика тренувань
        const [workoutStats] = await executeQuery(`
            SELECT 
                COUNT(*) as total_workouts,
                SUM(actual_duration_minutes) as total_minutes,
                AVG(actual_duration_minutes) as avg_duration
            FROM completed_workouts
            WHERE user_id = ?
        `, [userId]);

        // Налаштування користувача
        const [preferences] = await executeQuery(
            "SELECT fitness_level, daily_calorie_goal FROM user_preferences WHERE user_id = ?",
            [userId]
        );

        return res.status(200).json({
            nutrition: nutritionStats || { days_tracked: 0, total_meals: 0, avg_daily_calories: 0 },
            workouts: workoutStats || { total_workouts: 0, total_minutes: 0, avg_duration: 0 },
            preferences: preferences || { fitness_level: 'beginner', daily_calorie_goal: 2000 }
        });

    } catch (error) {
        console.error("Помилка в getUserStats контролері:", error.message);
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

export default {
    signup,
    login,
    logout,
    updateProfile,
    checkAuth,
    getUserStats
};