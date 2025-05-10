import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {Pool} from "pg";

dotenv.config();

const app = express();
const port = 3000;

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY;
const BUCKET_SECRET_ACCESS_KEY = process.env.BUCKET_SECRET_ACCESS_KEY;


const s3 = new S3Client({
    credentials: {
        accessKeyId: BUCKET_ACCESS_KEY,
        secretAccessKey: BUCKET_SECRET_ACCESS_KEY
    },
    region: BUCKET_REGION
})

const pool = new Pool({
    user: 'postgres',
    host: 'capstone-db.ch4wu2eowbo0.ap-southeast-2.rds.amazonaws.com',
    database: 'capstone-db',
    password: 'Capstone6Projec',
    port: 5432,
});

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL
// });

app.get('/',async (req, res) => {
    // get this from database
    const dbResponse = await pool.query("SELECT * FROM access_log");
    return res.send(dbResponse);

    const imageName = 'esp32cam.jpg';

    const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: imageName
    }

    const command = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(s3, command, {expiresIn: 60 * 2 })
    console.info(url)
    return res.send(url)
})

// Endpoint untuk mengecek koneksi database
app.get('/api/healthcheck', async (req, res) => {
    let client;
    try {
        // Dapatkan client dari pool
        client = await pool.connect();

        // Eksekusi query sederhana
        const result = await client.query('SELECT NOW() as current_time');
        const currentTime = result.rows[0].current_time;

        // Jika berhasil
        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            currentTime: currentTime,
            details: {
                host: pool.options.host,
                database: pool.options.database,
                port: pool.options.port
            }
        });

    } catch (error) {
        // Jika error
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            details: {
                host: pool.options.host,
                database: pool.options.database
            }
        });
    } finally {
        // Pastikan client selalu dilepas
        if (client) client.release();
    }
});

app.post('/api/image', upload.single('image'), async (req, res) => {
    try {
        // Validate request
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: "No file uploaded."
            });
        }

        const { buffer, originalname: fileName, mimetype } = req.file;

        // Validate file type
        const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validMimeTypes.includes(mimetype)) {
            return res.status(400).json({
                message: "Invalid file type. Only images are allowed."
            });
        }

        let uploadBuffer;
        let contentType = mimetype;

        // Check if buffer contains base64 encoded data URI
        const bufferString = buffer.toString();
        const matches = bufferString.match(/^data:image\/(\w+);base64,(.+)$/);

        if (matches && matches.length === 3) {
            // Case 1: Data URI format (extract pure base64)
            const imageType = matches[1];
            const base64Data = matches[2];
            uploadBuffer = Buffer.from(base64Data, 'base64');
            contentType = `image/${imageType}`;
        } else {
            // Case 2: Raw buffer (direct upload)
            uploadBuffer = buffer;
        }

        // Upload to S3
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: uploadBuffer,
            ContentType: contentType
        };

        const putCommand = new PutObjectCommand(params)
        await s3.send(putCommand);

        // Log to PostgreSQL database
        try {
            await pool.query(
                "INSERT INTO access_log (key) VALUES ($1)",
                [fileName]
            );
            console.log(`Successfully logged ${fileName} to database`);
        } catch (dbError) {
            console.error("Database logging error:", dbError);
            // Don't fail the request if logging fails
        }

        return res.status(200).json({
            code: 200,
            message: "File uploaded and logged successfully",
            filename: fileName
        });

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            code: 500,
            message: "File upload failed",
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})