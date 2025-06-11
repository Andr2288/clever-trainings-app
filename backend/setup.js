import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Завантажуємо змінні середовища
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфігурація підключення до MySQL (без бази даних для початкового підключення)
const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

// Функція для виконання SQL файлу
const executeSQLFile = async (connection, filePath) => {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        const statements = sql.split(';').filter(statement => statement.trim() !== '');

        for (const statement of statements) {
            if (statement.trim() !== '') {
                await connection.execute(statement + ';');
            }
        }
        console.log(`✅ Виконано: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Помилка при виконанні ${path.basename(filePath)}:`, error.message);
        throw error;
    }
};

// Основна функція налаштування
const setupDatabase = async () => {
    let connection;

    try {
        console.log('🔄 Підключення до MySQL...');
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Підключено до MySQL');

        // Шляхи до SQL файлів
        const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
        const seedPath = path.join(__dirname, '..', 'seed_data.sql');

        // Перевіряємо, чи існують файли
        if (!fs.existsSync(schemaPath)) {
            console.error('❌ Файл database_schema.sql не знайдено');
            return;
        }

        if (!fs.existsSync(seedPath)) {
            console.error('❌ Файл seed_data.sql не знайдено');
            return;
        }

        console.log('🔄 Створення схеми бази даних...');
        await executeSQLFile(connection, schemaPath);

        console.log('🔄 Заповнення тестовими даними...');
        await executeSQLFile(connection, seedPath);

        console.log('🎉 База даних налаштована успішно!');
        console.log('📋 Створені таблиці:');
        console.log('   - users (користувачі)');
        console.log('   - food_categories (категорії продуктів)');
        console.log('   - food_items (продукти харчування)');
        console.log('   - daily_meals (щоденне харчування)');
        console.log('   - workout_types (типи тренувань)');
        console.log('   - workout_templates (шаблони тренувань)');
        console.log('   - completed_workouts (завершені тренування)');
        console.log('   - user_preferences (налаштування користувачів)');
        console.log('   - weight_history (історія ваги)');
        console.log('');
        console.log('🔑 Тестовий акаунт:');
        console.log('   Email: test@example.com');
        console.log('   Пароль: password123');

    } catch (error) {
        console.error('❌ Помилка налаштування бази даних:', error.message);
        console.log('');
        console.log('🔧 Можливі рішення:');
        console.log('1. Перевірте, чи запущений MySQL сервер');
        console.log('2. Перевірте налаштування підключення в .env файлі');
        console.log('3. Переконайтеся, що у користувача є права на створення бази даних');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 З\'єднання з MySQL закрито');
        }
    }
};

// Запуск налаштування
setupDatabase();