const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2');

// Determine SSL options for cloud MySQL (e.g. Aiven, TiDB, Railway, PlanetScale)
const isCloudDb = Boolean(process.env.DATABASE_URL) || process.env.DB_SSL === 'true';

// Build pool configuration
let poolConfig;
if (process.env.DATABASE_URL) {
    // Remove query params like ?ssl-mode=REQUIRED for clean mysql2 URI parsing
    const cleanUri = process.env.DATABASE_URL.replace(/\?.*$/, '');
    poolConfig = {
        uri: cleanUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'defaultdb',
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: isCloudDb ? { rejectUnauthorized: false } : undefined
    };
}

const pool = mysql.createPool(poolConfig);

// Initialize database tables and schema migrations
function initSchema(targetPool) {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20) NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createTasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT false,
            priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
            due_date DATE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    const createEmailOtpsTable = `
        CREATE TABLE IF NOT EXISTS email_otps (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createRegistrationOtpsTable = `
        CREATE TABLE IF NOT EXISTS registration_otps (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email_otp VARCHAR(6) NOT NULL,
            mobile_otp VARCHAR(6) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    targetPool.query(createUsersTable, (err) => {
        if (err) console.error('Error creating users table:', err.message);
        else console.log('✅ Table "users" is ready.');

        // Safe migration: Add phone column to users table if missing
        targetPool.query(`ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL`, (err) => {
            if (err && err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
                console.error('Phone column migration notice:', err.message);
            }
        });
    });

    targetPool.query(createTasksTable, (err) => {
        if (err) console.error('Error creating tasks table:', err.message);
        else console.log('✅ Table "tasks" is ready.');

        // Safe migration: Add priority column if it doesn't exist
        targetPool.query(`ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium'`, (err) => {
            if (err && err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
                console.error('Priority migration notice:', err.message);
            }
        });

        // Safe migration: Add due_date column if it doesn't exist
        targetPool.query(`ALTER TABLE tasks ADD COLUMN due_date DATE NULL`, (err) => {
            if (err && err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
                console.error('Due date migration notice:', err.message);
            }
        });
    });

    targetPool.query(createEmailOtpsTable, (err) => {
        if (err) console.error('Error creating email_otps table:', err.message);
        else console.log('✅ Table "email_otps" is ready.');
    });

    targetPool.query(createRegistrationOtpsTable, (err) => {
        if (err) console.error('Error creating registration_otps table:', err.message);
        else console.log('✅ Table "registration_otps" is ready.');
    });
}

// Check connection and initialize
pool.getConnection((err, connection) => {
    if (err) {
        // If database does not exist locally, attempt to create it
        if (err.code === 'ER_BAD_DB_ERROR' && !process.env.DATABASE_URL) {
            console.log(`Database '${process.env.DB_NAME}' does not exist. Attempting creation...`);
            const adminConn = mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                port: Number(process.env.DB_PORT) || 3306
            });
            adminConn.connect((adminErr) => {
                if (adminErr) {
                    console.error('Could not connect to MySQL server to create database:', adminErr.message);
                    return;
                }
                adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'task_manager'}\``, (cErr) => {
                    adminConn.end();
                    if (cErr) {
                        console.error('Could not create database:', cErr.message);
                        return;
                    }
                    console.log(`✅ Database '${process.env.DB_NAME || 'task_manager'}' created successfully.`);
                    initSchema(pool);
                });
            });
            return;
        }
        console.error('MySQL connection failed:', err.message);
        return;
    }

    console.log('✅ Connected to MySQL database successfully via connection pool!');
    connection.release();
    initSchema(pool);
});

module.exports = pool;
