import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Токен не надано. Потрібна авторизація" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Недійсний токен" });
        }

        // Отримання користувача з бази даних
        const users = await executeQuery(
            "SELECT id, full_name, email, profile_pic, age, gender, weight, height, activity_level, created_at, updated_at FROM users WHERE id = ?",
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Користувача не знайдено" });
        }

        const user = users[0];
        req.user = user;

        next();

    } catch (error) {
        console.error("Помилка в protectRoute middleware:", error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Недійсний токен" });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Термін дії токену минув" });
        }

        return res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
};

// Middleware для перевірки ролей (для майбутнього розширення)
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Потрібна авторизація" });
        }

        // Поки що всі користувачі мають роль 'user'
        // В майбутньому можна додати поле role в таблицю users
        const userRole = req.user.role || 'user';

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Недостатньо прав доступу" });
        }

        next();
    };
};

// Middleware для логування запитів авторизованих користувачів
const logUserActivity = async (req, res, next) => {
    if (req.user) {
        try {
            // Можна додати логування активності користувача
            console.log(`👤 Користувач ${req.user.id} (${req.user.email}) виконує ${req.method} ${req.path}`);
        } catch (error) {
            console.error("Помилка логування активності:", error.message);
        }
    }
    next();
};

export default {
    protectRoute,
    requireRole,
    logUserActivity
};