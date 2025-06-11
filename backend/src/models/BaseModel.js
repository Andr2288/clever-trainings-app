import { executeQuery } from '../config/database.js';

// Базовий клас для всіх моделей
class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
    }

    // Знайти один запис за ID
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const results = await executeQuery(query, [id]);
        return results[0] || null;
    }

    // Знайти всі записи
    async findAll(limit = null, offset = 0) {
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];

        if (limit) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        return await executeQuery(query, params);
    }

    // Знайти записи за умовою
    async findWhere(conditions, limit = null) {
        const whereClause = Object.keys(conditions)
            .map(key => `${key} = ?`)
            .join(' AND ');

        let query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
        const params = Object.values(conditions);

        if (limit) {
            query += ` LIMIT ?`;
            params.push(limit);
        }

        return await executeQuery(query, params);
    }

    // Знайти один запис за умовою
    async findOneWhere(conditions) {
        const results = await this.findWhere(conditions, 1);
        return results[0] || null;
    }

    // Створити новий запис
    async create(data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
        const result = await executeQuery(query, values);

        return {
            id: result.insertId,
            ...data
        };
    }

    // Оновити запис
    async update(id, data) {
        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(data), id];

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        await executeQuery(query, values);

        return await this.findById(id);
    }

    // Видалити запис
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await executeQuery(query, [id]);
        return result.affectedRows > 0;
    }

    // Підрахувати кількість записів
    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions)
                .map(key => `${key} = ?`)
                .join(' AND ');
            query += ` WHERE ${whereClause}`;
            params.push(...Object.values(conditions));
        }

        const result = await executeQuery(query, params);
        return result[0].count;
    }

    // Виконати кастомний запит
    async executeCustomQuery(query, params = []) {
        return await executeQuery(query, params);
    }
}

export default BaseModel;