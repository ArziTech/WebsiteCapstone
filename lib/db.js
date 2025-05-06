require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = new URL(process.env.DATABASE_URL);

const query = async (query) => {
    const pool = new Pool({
        user: dbUrl.username,
        password: dbUrl.password,
        host: dbUrl.hostname,
        port: dbUrl.port,
        database: dbUrl.pathname.split('/')[1], // Ambil nama database dari path
        ssl: {
            rejectUnauthorized: false // Untuk development saja, sesuaikan untuk production
        }
    });
    const {rows} = await pool.query(query);
    return JSON(rows);
};

module.exports = query;