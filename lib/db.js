import {Pool} from "pg";
import {dbKeySslCertificate, dbUrl} from "./config.js";

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: true, // Untuk development (production gunakan cert
        ca: dbKeySslCertificate,
    }
});

export default pool;