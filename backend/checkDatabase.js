import { testConnection, checkTables } from '../src/config/database.js';

const checkDatabase = async () => {
    console.log('🔍 FitApp - Перевірка бази даних');
    console.log('================================');

    try {
        // Перевірка підключення
        console.log('🔄 Перевірка підключення до бази даних...');
        const connected = await testConnection();

        if (!connected) {
            console.log('❌ Немає підключення до бази даних');
            process.exit(1);
        }

        // Перевірка таблиць
        console.log('🔄 Перевірка таблиць...');
        const tables = await checkTables();

        console.log('📋 Стан таблиць:');
        tables.forEach(table => {
            if (table.exists) {
                console.log(`   ✅ ${table.table} - ${table.count} записів`);
            } else {
                console.log(`   ❌ ${table.table} - не існує (${table.error})`);
            }
        });

        const missingTables = tables.filter(t => !t.exists);
        if (missingTables.length > 0) {
            console.log('');
            console.log('⚠️  Деякі таблиці відсутні. Запустіть: npm run setup-db');
        } else {
            console.log('');
            console.log('✅ Всі таблиці на місці! База даних готова до роботи.');
        }

    } catch (error) {
        console.error('❌ Помилка перевірки бази даних:', error.message);
        process.exit(1);
    }
};

checkDatabase();