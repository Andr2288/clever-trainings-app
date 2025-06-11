import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Завантажуємо змінні середовища
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфігурація підключення до MySQL (спочатку без бази даних)
const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4'
};

// Конфігурація з базою даних
const dbConnectionConfig = {
    ...connectionConfig,
    database: process.env.DB_NAME || 'fitness_app_db'
};

// Функція для створення бази даних
const createDatabase = async () => {
    const connection = await mysql.createConnection(connectionConfig);
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'fitness_app_db'}\``);
        console.log('✅ База даних створена або вже існує');
    } finally {
        await connection.end();
    }
};

// Функція для виконання SQL команд
const executeSQLCommands = async (connection, commands) => {
    for (const command of commands) {
        if (command.trim() && !command.trim().startsWith('--')) {
            try {
                console.log(`📋 Виконуємо: ${command.substring(0, 60).replace(/\n/g, ' ')}...`);
                await connection.query(command);
            } catch (error) {
                console.error(`❌ Помилка при виконанні команди: ${error.message}`);
                console.error(`📝 Команда: ${command}`);
                throw error;
            }
        }
    }
};

// Функція для створення таблиць
const createTables = async (connection) => {
    const createTableCommands = [
        // Таблиця користувачів
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            profile_pic VARCHAR(255) DEFAULT NULL,
            age INT DEFAULT NULL,
            gender ENUM('male', 'female') DEFAULT NULL,
            weight DECIMAL(5,2) DEFAULT NULL,
            height INT DEFAULT NULL,
            activity_level ENUM('low', 'moderate', 'high') DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // Таблиця категорій продуктів
        `CREATE TABLE IF NOT EXISTS food_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // Таблиця продуктів харчування
        `CREATE TABLE IF NOT EXISTS food_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category_id INT,
            calories_per_100g DECIMAL(8,2) NOT NULL,
            protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
            fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
            carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE SET NULL
        )`,

        // Таблиця щоденного харчування
        `CREATE TABLE IF NOT EXISTS daily_meals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            food_item_id INT NOT NULL,
            quantity_grams DECIMAL(8,2) NOT NULL DEFAULT 100,
            consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            meal_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
        )`,

        // Таблиця типів тренувань
        `CREATE TABLE IF NOT EXISTS workout_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // Таблиця шаблонів тренувань
        `CREATE TABLE IF NOT EXISTS workout_templates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type_id INT,
            duration_minutes INT NOT NULL,
            intensity ENUM('Легка', 'Середня', 'Висока') NOT NULL,
            fitness_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
            description TEXT,
            equipment VARCHAR(255) DEFAULT 'Не потрібно',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (type_id) REFERENCES workout_types(id) ON DELETE SET NULL
        )`,

        // Таблиця завершених тренувань
        `CREATE TABLE IF NOT EXISTS completed_workouts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            workout_template_id INT,
            workout_name VARCHAR(100) NOT NULL,
            workout_type VARCHAR(50) NOT NULL,
            planned_duration_minutes INT NOT NULL,
            actual_duration_minutes INT NOT NULL,
            intensity VARCHAR(50) NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            workout_date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
        )`,

        // Таблиця налаштувань користувачів
        `CREATE TABLE IF NOT EXISTS user_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            fitness_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
            preferred_workout_types JSON,
            daily_calorie_goal INT,
            notifications_enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // Таблиця історії ваги
        `CREATE TABLE IF NOT EXISTS weight_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            weight DECIMAL(5,2) NOT NULL,
            recorded_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_date (user_id, recorded_date)
        )`
    ];

    await executeSQLCommands(connection, createTableCommands);
};

// Функція для створення індексів
const createIndexes = async (connection) => {
    const indexCommands = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_daily_meals_user_date ON daily_meals(user_id, meal_date)',
        'CREATE INDEX IF NOT EXISTS idx_completed_workouts_user_date ON completed_workouts(user_id, workout_date)',
        'CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name)',
        'CREATE INDEX IF NOT EXISTS idx_workout_templates_level ON workout_templates(fitness_level)'
    ];

    await executeSQLCommands(connection, indexCommands);
};

// Функція для заповнення тестовими даними
const insertTestData = async (connection) => {
    console.log('🔄 Додавання тестових даних...');

    // Очищення існуючих даних
    const clearCommands = [
        'SET FOREIGN_KEY_CHECKS = 0',
        'TRUNCATE TABLE weight_history',
        'TRUNCATE TABLE user_preferences',
        'TRUNCATE TABLE completed_workouts',
        'TRUNCATE TABLE daily_meals',
        'TRUNCATE TABLE food_items',
        'TRUNCATE TABLE food_categories',
        'TRUNCATE TABLE workout_templates',
        'TRUNCATE TABLE workout_types',
        'TRUNCATE TABLE users',
        'SET FOREIGN_KEY_CHECKS = 1'
    ];

    await executeSQLCommands(connection, clearCommands);

    // Категорії продуктів
    const foodCategories = [
        `INSERT INTO food_categories (name, description) VALUES
        ('Фрукти', 'Свіжі та сушені фрукти'),
        ('Овочі', 'Свіжі овочі та зелень'),
        ('М\\'ясо', 'М\\'ясні продукти та птиця'),
        ('Молочні продукти', 'Молоко, сир, кефір та інші молочні продукти'),
        ('Зернові', 'Крупи, хліб, макарони'),
        ('Горіхи', 'Горіхи та насіння'),
        ('Масла', 'Рослинні та тваринні жири'),
        ('Солодощі', 'Цукерки, шоколад, десерти'),
        ('Продукти тваринного походження', 'Яйця та інші продукти')`
    ];

    // Продукти харчування
    const foodItems = [
        `INSERT INTO food_items (name, category_id, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, description) VALUES
        ('Яблуко', 1, 52, 0.3, 0.2, 14, 'Свіже яблуко середнього розміру'),
        ('Банан', 1, 89, 1.1, 0.3, 23, 'Солодкий банан середнього розміру'),
        ('Броколі', 2, 34, 2.8, 0.4, 7, 'Свіжа броколі'),
        ('Куряча грудка', 3, 165, 31, 3.6, 0, 'Відварене або запечене куряче філе'),
        ('Молоко', 4, 42, 3.4, 1, 5, 'Знежирене молоко'),
        ('Рис', 5, 130, 2.7, 0.3, 28, 'Варений білий рис'),
        ('Миндаль', 6, 579, 21, 50, 22, 'Сушений міндаль'),
        ('Оливкова олія', 7, 884, 0, 100, 0, 'Оливкова олія першого віджиму'),
        ('Чорний шоколад', 8, 546, 7.8, 31, 63, 'Гіркий чорний шоколад з високим вмістом какао'),
        ('Яйце', 9, 155, 13, 11, 1.1, 'Відварене яйце середнього розміру')`
    ];

    // Типи тренувань
    const workoutTypes = [
        `INSERT INTO workout_types (name, description) VALUES
        ('Кардіо', 'Аеробні вправи для покращення серцево-судинної системи'),
        ('Силові', 'Вправи з обтяженням для розвитку м\\'язової маси'),
        ('Розтяжка', 'Вправи для гнучкості та відновлення'),
        ('Функціональні', 'Комплексні вправи для загальної фізичної підготовки'),
        ('HIIT', 'Високоінтенсивні інтервальні тренування')`
    ];

    // Шаблони тренувань
    const workoutTemplates = [
        `INSERT INTO workout_templates (name, type_id, duration_minutes, intensity, fitness_level, description, equipment) VALUES
        ('Стрибки з розведенням рук і ніг', 1, 10, 'Легка', 'beginner', 'Стрибки на місці з розведенням рук і ніг', 'Не потрібно'),
        ('Віджимання від підлоги', 2, 5, 'Легка', 'beginner', 'Класичні віджимання від підлоги', 'Не потрібно'),
        ('Присідання', 2, 8, 'Легка', 'beginner', 'Присідання з власною вагою', 'Не потрібно'),
        ('Планка', 2, 5, 'Легка', 'beginner', 'Утримання положення планки', 'Не потрібно'),
        ('Берпі', 1, 15, 'Середня', 'intermediate', 'Комплексна вправа з стрибком', 'Не потрібно'),
        ('Підтягування', 2, 10, 'Середня', 'intermediate', 'Підтягування на турніку', 'Турнік')`
    ];

    // Тестовий користувач (пароль: password123)
    const testUser = [
        `INSERT INTO users (full_name, email, password, age, gender, weight, height, activity_level) VALUES
        ('Тестовий Користувач', 'test@example.com', '$2b$10$rQj5XyZjI4LX4ZrHOyV6R.CQBqzZqJYUjK3lGN2qU8L6eWz2H2xJ.', 25, 'male', 75.5, 180, 'moderate')`
    ];

    // Налаштування для тестового користувача
    const userPreferences = [
        `INSERT INTO user_preferences (user_id, fitness_level, daily_calorie_goal) VALUES
        (1, 'intermediate', 2200)`
    ];

    await executeSQLCommands(connection, foodCategories);
    await executeSQLCommands(connection, foodItems);
    await executeSQLCommands(connection, workoutTypes);
    await executeSQLCommands(connection, workoutTemplates);
    await executeSQLCommands(connection, testUser);
    await executeSQLCommands(connection, userPreferences);
};

// Основна функція налаштування
const setupDatabase = async () => {
    let connection;

    try {
        console.log('🔄 Підключення до MySQL...');

        // Спочатку створюємо базу даних
        await createDatabase();

        // Потім підключаємося до створеної бази даних
        connection = await mysql.createConnection(dbConnectionConfig);
        console.log('✅ Підключено до MySQL і базі даних');

        console.log('🔄 Створення таблиць...');
        await createTables(connection);

        console.log('🔄 Створення індексів...');
        await createIndexes(connection);

        console.log('🔄 Заповнення тестовими даними...');
        await insertTestData(connection);

        // Перевірка створених таблиць
        console.log('🔍 Перевірка створених таблиць...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME, TABLE_ROWS 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [process.env.DB_NAME || 'fitness_app_db']);

        console.log('📋 Створені таблиці:');
        tables.forEach(table => {
            console.log(`   ✓ ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} записів)`);
        });

        console.log('🎉 База даних налаштована успішно!');
        console.log('');
        console.log('🔑 Тестовий акаунт:');
        console.log('   Email: test@example.com');
        console.log('   Пароль: password123');
        console.log('');
        console.log('🚀 Тепер можете запускати сервер командою: npm run dev');

    } catch (error) {
        console.error('❌ Помилка налаштування бази даних:', error.message);
        console.log('');
        console.log('🔧 Можливі рішення:');
        console.log('1. Перевірте, чи запущений MySQL сервер');
        console.log('2. Перевірте налаштування підключення в .env файлі');
        console.log('3. Переконайтеся, що у користувача є права на створення бази даних');
        console.log('4. Перевірте правильність логіна і пароля для MySQL');
        console.log('');
        console.log('💡 Поточні налаштування:');
        console.log(`   DB_HOST=${process.env.DB_HOST}`);
        console.log(`   DB_USER=${process.env.DB_USER}`);
        console.log(`   DB_NAME=${process.env.DB_NAME}`);
        console.log(`   DB_PORT=${process.env.DB_PORT}`);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 З\'єднання з MySQL закрито');
        }
    }
};

// Запуск налаштування
console.log('🏃‍♂️ FitApp - Налаштування бази даних');
console.log('=====================================');
setupDatabase();