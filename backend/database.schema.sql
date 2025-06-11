-- Створення бази даних для фітнес-додатку
CREATE DATABASE IF NOT EXISTS fitness_app_db;
USE fitness_app_db;

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
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
    );

-- Таблиця категорій продуктів
CREATE TABLE IF NOT EXISTS food_categories (
                                               id INT AUTO_INCREMENT PRIMARY KEY,
                                               name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Таблиця продуктів харчування
CREATE TABLE IF NOT EXISTS food_items (
                                          id INT AUTO_INCREMENT PRIMARY KEY,
                                          name VARCHAR(100) NOT NULL,
    category_id INT,
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE SET NULL,
    INDEX idx_food_name (name),
    INDEX idx_category (category_id)
    );

-- Таблиця щоденного харчування користувачів
CREATE TABLE IF NOT EXISTS daily_meals (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           user_id INT NOT NULL,
                                           food_item_id INT NOT NULL,
                                           quantity_grams DECIMAL(8,2) NOT NULL DEFAULT 100,
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meal_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, meal_date),
    INDEX idx_user_consumed (user_id, consumed_at)
    );

-- Таблиця типів тренувань
CREATE TABLE IF NOT EXISTS workout_types (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Таблиця шаблонів тренувань
CREATE TABLE IF NOT EXISTS workout_templates (
                                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                                 name VARCHAR(100) NOT NULL,
    type_id INT,
    duration_minutes INT NOT NULL,
    intensity ENUM('Легка', 'Середня', 'Висока') NOT NULL,
    fitness_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    description TEXT,
    equipment VARCHAR(255) DEFAULT 'Не потрібно',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES workout_types(id) ON DELETE SET NULL,
    INDEX idx_fitness_level (fitness_level),
    INDEX idx_type (type_id)
    );

-- Таблиця завершених тренувань користувачів
CREATE TABLE IF NOT EXISTS completed_workouts (
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
    FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, workout_date),
    INDEX idx_user_completed (user_id, completed_at)
    );

-- Таблиця налаштувань користувачів
CREATE TABLE IF NOT EXISTS user_preferences (
                                                id INT AUTO_INCREMENT PRIMARY KEY,
                                                user_id INT NOT NULL UNIQUE,
                                                fitness_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    preferred_workout_types JSON,
    daily_calorie_goal INT,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- Таблиця історії ваги користувачів
CREATE TABLE IF NOT EXISTS weight_history (
                                              id INT AUTO_INCREMENT PRIMARY KEY,
                                              user_id INT NOT NULL,
                                              weight DECIMAL(5,2) NOT NULL,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, recorded_date),
    UNIQUE KEY unique_user_date (user_id, recorded_date)
    );

-- Додаткові індекси для оптимізації
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_daily_meals_date ON daily_meals(meal_date);
CREATE INDEX idx_completed_workouts_date ON completed_workouts(workout_date);
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_workout_templates_level ON workout_templates(fitness_level);