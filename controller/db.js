import pool from "../lib/db.js";

export async function dbHealthCheck(req, res) {
    try {
        // Eksekusi query sederhana
        const result = await pool.query('SELECT NOW() as current_time');
        const currentTime = result.rows[0].current_time;

        // Jika berhasil
        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            currentTime: currentTime,
            details: {
                // host: pool.options.host,
                // database: pool.options.database,
                // port: pool.options.port
            }
        });

    } catch (error) {
        // Jika error
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            details: {
                // host: pool.options.host,
                // database: pool.options.database
            }
        });
    }
}