import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Конфігурація підключення до бази даних
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitness_app_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Створення пулу з'єднань
const pool = mysql.createPool(dbConfig);

// Функція для тестування з'єднання
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL база даних підключена успішно');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Помилка підключення до бази даних:', error.message);
        return false;
    }
};

// Функція для виконання запитів
export const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Помилка виконання запиту:', error);
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
        throw error;
    } finally {
        connection.release();
    }
};

// Закриття пулу з'єднань (для graceful shutdown)
export const closePool = async () => {
    try {
        await pool.end();
        console.log('MySQL пул з\'єднань закрито');
    } catch (error) {
        console.error('Помилка при закритті пулу:', error);
    }
};

export default pool;