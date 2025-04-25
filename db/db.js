require('dotenv').config();
const mysql = require('mysql2/promise');


const initializeDatabase = () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 100,
        queueLimit: 0
    });

   
    pool.getConnection()
        .then(connection => {
            console.log('✅ Підключення до бази даних успішне.');
            connection.release();
        })
        .catch(error => {
            console.error('❌ Помилка підключення до бази даних:', error.message);
        });

    return pool;
};

module.exports = initializeDatabase;