// Test script to verify connection to Aiven MySQL
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const db = require('./backend/db/db');

console.log('🔄 Connecting to Aiven MySQL database...');

db.query(
    'SELECT NOW() AS currentTime, DATABASE() AS currentDatabase, VERSION() AS mysqlVersion',
    (err, results) => {
        if (err) {
            console.error('❌ Connection Failed:', err.message);
            process.exit(1);
        }

        console.log('\n======================================================');
        console.log('✅ AIVEN MYSQL CONNECTION TEST SUCCESSFUL!');
        console.log('======================================================');
        console.log('📅 Server Time:    ', results[0].currentTime);
        console.log('🗄️ Database Name:  ', results[0].currentDatabase);
        console.log('🚀 MySQL Version:  ', results[0].mysqlVersion);

        // Wait 2 seconds for all background table creation queries to settle
        setTimeout(() => {
            db.query('SHOW TABLES', (tableErr, tables) => {
                if (!tableErr) {
                    console.log('\n📋 Existing Tables in Aiven MySQL:');
                    console.table(tables);
                }
                console.log('======================================================\n');
                process.exit(0);
            });
        }, 2000);
    }
);
