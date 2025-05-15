import {Pool} from "pg";
import {dbUrl} from "./config.js";
import fs from "fs";

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: true, // Untuk development (production gunakan cert
        ca: fs.readFileSync('./db-key.pem').toString(),
    }
});

export default pool;