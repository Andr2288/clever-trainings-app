import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import nutritionRoutes from "./routes/nutrition.route.js";
import workoutRoutes from "./routes/workout.route.js";
import { testConnection, closePool } from "./config/database.js";

// Завантаження змінних середовища
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' })); // Збільшуємо ліміт для зображень
app.use(cookieParser());

// CORS налаштування
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware для логування запитів
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/workouts", workoutRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.status(200).json({
            status: "OK",
            message: "FitApp API працює",
            database: dbConnected ? "підключено" : "помилка підключення",
            timestamp: new Date().toISOString(),
            endpoints: {
                auth: "/api/auth",
                nutrition: "/api/nutrition",
                workouts: "/api/workouts",
                health: "/api/health"
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            message: "Помилка перевірки стану",
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Ендпоінт не знайдено",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        availableRoutes: [
            "POST /api/auth/signup",
            "POST /api/auth/login",
            "POST /api/auth/logout",
            "GET /api/auth/check",
            "PUT /api/auth/update-profile",
            "GET /api/auth/stats",
            "GET /api/nutrition/foods",
            "GET /api/nutrition/foods/search",
            "GET /api/nutrition/categories",
            "GET /api/nutrition/daily",
            "POST /api/nutrition/daily",
            "PUT /api/nutrition/daily/:mealId",
            "DELETE /api/nutrition/daily/:mealId",
            "DELETE /api/nutrition/daily",
            "GET /api/nutrition/history",
            "GET /api/workouts/types",
            "GET /api/workouts/templates",
            "GET /api/workouts/random",
            "GET /api/workouts/completed",
            "POST /api/workouts/completed",
            "DELETE /api/workouts/completed/:workoutId",
            "GET /api/workouts/today",
            "GET /api/workouts/stats/weekly",
            "GET /api/workouts/preferences",
            "PUT /api/workouts/preferences"
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("🚨 Глобальна помилка:", error);
    res.status(500).json({
        message: "Внутрішня помилка сервера",
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('🛑 Отримано сигнал завершення роботи...');

    try {
        await closePool();
        console.log('✅ База даних відключена');
        process.exit(0);
    } catch (error) {
        console.error('❌ Помилка при завершенні роботи:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Запуск сервера
const startServer = async () => {
    try {
        // Перевірка підключення до бази даних
        console.log('🔄 Перевірка підключення до бази даних...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Не вдалося підключитися до бази даних');
            process.exit(1);
        }

        // Запуск сервера
        app.listen(PORT, () => {
            console.log('🚀 ================================');
            console.log(`🚀 FitApp API сервер запущено!`);
            console.log(`🚀 Порт: ${PORT}`);
            console.log(`🚀 Режим: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 URL: http://localhost:${PORT}`);
            console.log(`🚀 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🚀 API Endpoints:`);
            console.log(`🚀   Auth: http://localhost:${PORT}/api/auth`);
            console.log(`🚀   Nutrition: http://localhost:${PORT}/api/nutrition`);
            console.log(`🚀   Workouts: http://localhost:${PORT}/api/workouts`);
            console.log('🚀 ================================');
        });

    } catch (error) {
        console.error('❌ Помилка запуску сервера:', error);
        process.exit(1);
    }
};

startServer();