import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Конфігурація підключення до бази даних
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitness_app_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

// Створення пулу з'єднань
const pool = mysql.createPool(dbConfig);

// Функція для тестування з'єднання
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL база даних підключена успішно');
        console.log(`📊 База даних: ${dbConfig.database}`);
        console.log(`🖥️  Хост: ${dbConfig.host}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Помилка підключення до бази даних:', error.message);
        console.error('🔧 Перевірте налаштування в .env файлі');
        return false;
    }
};

// Функція для виконання запитів
export const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('❌ Помилка виконання запиту:', error.message);
        console.error('📝 Запит:', query);
        console.error('📋 Параметри:', params);
        throw error;
    }
};

// Функція для виконання транзакцій
export const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params || []);
            results.push(result);
        }

        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        console.error('❌ Помилка транзакції:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

// Функція для перевірки існування таблиць
export const checkTables = async () => {
    try {
        const tables = [
            'users', 'food_categories', 'food_items', 'daily_meals',
            'workout_types', 'workout_templates', 'completed_workouts',
            'user_preferences', 'weight_history'
        ];

        const results = [];
        for (const table of tables) {
            const query = `SELECT COUNT(*) as count FROM ${table}`;
            try {
                const [rows] = await pool.execute(query);
                results.push({ table, exists: true, count: rows[0].count });
            } catch (error) {
                results.push({ table, exists: false, error: error.message });
            }
        }

        return results;
    } catch (error) {
        console.error('❌ Помилка перевірки таблиць:', error.message);
        throw error;
    }
};

// Закриття пулу з'єднань (для graceful shutdown)
export const closePool = async () => {
    try {
        await pool.end();
        console.log('🔐 MySQL пул з\'єднань закрито');
    } catch (error) {
        console.error('❌ Помилка при закритті пулу:', error.message);
    }
};

export default pool;