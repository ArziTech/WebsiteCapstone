import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3'
import {getSignedUrl} from "@aws-sdk/cloudfront-signer";
import {Pool} from "pg";
import fs from 'fs'
import moment from "moment";
import {CloudFrontClient, CreateInvalidationCommand} from "@aws-sdk/client-cloudfront";

moment.locale('id');
dotenv.config();

const app = express();
const port = 3000;

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

const dbUrl = process.env.DATABASE_URL;

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const bucketAccessKey = process.env.BUCKET_ACCESS_KEY;
const bucketSecretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;

const cloudFrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

const s3 = new S3Client({
    credentials: {
        accessKeyId: bucketAccessKey,
        secretAccessKey: bucketSecretAccessKey
    },
    region: bucketRegion
})

const cloudfrontClient = new CloudFrontClient({
    credentials: {
        accessKeyId: bucketAccessKey,
        secretAccessKey: bucketSecretAccessKey
    },
    region: bucketRegion
})

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: true, // Untuk development (production gunakan cert
        ca: fs.readFileSync('db-key.pem').toString(),
    }
});
pool.connect();

app.get('/',async (req, res) => {
    try {
        const dbResponse = await pool.query("SELECT key, created_at FROM" +
            " access_log ORDER BY created_at DESC");

        const imageUrls =  dbResponse.rows.map((row) => {
            const imageName = row.key;
            const access_time = moment(row.created_at).format('LLLL')

            try {
                // const command = new GetObjectCommand(getObjectParams);
                const url = getSignedUrl({
                    url: "https://d2c0wqkau15v7n.cloudfront.net/" + imageName,
                    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    privateKey: cloudFrontPrivateKey,
                    keyPairId: keyPairId
                });
                // const url = "https://d2c0wqkau15v7n.cloudfront.net/" +imageName
                return {
                    imageName,
                    url,
                    access_time
                };
            } catch (s3Error) {
                console.error(`Error generating URL for ${imageName}:`, s3Error);
                return {
                    imageName,
                    error: 'Failed to generate URL',
                    exists: false
                };
            }
        })

        return res.render('index.ejs', {
            count: imageUrls.length,
            urls: imageUrls
        })
    } catch (error) {
        console.error("Error fetching image URLs:", error);
        return res.status(500).json({
            code: 500,
            message: "Failed to retrieve image URLs",
            error: error.message
        });
    }
})

app.get('/api/get-images', async (req, res) => {
    try {
        const dbResponse = await pool.query("SELECT key, created_at FROM" +
            " access_log ORDER BY created_at DESC");

        const imageUrls =  dbResponse.rows.map((row) => {
            const imageName = row.key;
            const access_time = moment(row.created_at).format('LLLL')

            try {
                // const command = new GetObjectCommand(getObjectParams);
                const url = getSignedUrl({
                    url: "https://d2c0wqkau15v7n.cloudfront.net/" + imageName,
                    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    privateKey: cloudFrontPrivateKey,
                    keyPairId: keyPairId
                });
                // const url = "https://d2c0wqkau15v7n.cloudfront.net/" +imageName
                return {
                    imageName,
                    url,
                    access_time
                };
            } catch (s3Error) {
                console.error(`Error generating URL for ${imageName}:`, s3Error);
                return {
                    imageName,
                    error: 'Failed to generate URL',
                    exists: false
                };
            }
        })

        // 3. Return response
        return res.status(200).json({
            count: imageUrls.length,
            urls: imageUrls
        });
    } catch (error) {
        console.error("Error fetching image URLs:", error);
        return res.status(500).json({
            code: 500,
            message: "Failed to retrieve image URLs",
            error: error.message
        });
    }
})

app.get('/api/healthcheck', async (req, res) => {
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

        const { buffer, originalname: fileName } = req.file;

        const realImageData = buffer;


        let contentType = '';
        let processedBuffer;
        if(!realImageData || !fileName) {
            return res.status(400).send({
                code: 400,
                message: "No file uploaded."
            });
        }


        console.dir(req.file, {depth: null, colors: true})

        // Convert Buffer to base64 string first
        const base64String = realImageData.toString();

        // console.log({realImageData})
        // console.log({base64String})
        // karena realImageData bukan string, maka error di baris ini
        const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            console.log("extract")
            console.log("matches[1]", matches[1])
            console.log("matches[2]", matches[2])
            console.log("matches[3]", matches[3])
            // If the base64 string includes the data URI prefix
            contentType = matches[1];
            const pureBase64Data = matches[2];
            processedBuffer = Buffer.from(pureBase64Data, 'base64');
        } else {
            console.log("not matches")
            // console.log({matches})
            // console.log("matches.length", matches.length)
            processedBuffer = realImageData;
            contentType = req.file.mimetype;
        }

        // return res.send(req.file)

        const validMimeTypes = ["image/jpeg","image/jpg", "image/png", "image/gif"];
        if (!validMimeTypes.includes(contentType)) {
            return res.status(400).send({
                message: "Invalid file type. Only images are allowed."
            });
        }

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: processedBuffer,
            ContentType: contentType
        }

        const command = new PutObjectCommand(params)

        await s3.send(command);


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

app.delete('/api/image/:id', async (req, res) => {
    const imageKey = req.params.id;
    let deletedRow  = 0;
    try {
        const result = await pool.query("DELETE FROM access_log WHERE key =($1)", [imageKey]);
        deletedRow = result.rowCount;
    } catch (e) {
        console.error("something went wrong")
        console.error(e)
        return res.status(500)
    }

    const params = {
        Bucket: bucketName,
        Key: imageKey
    }
    const command = new DeleteObjectCommand(params)
    await s3.send(command);

    // send invalid command to cloudfront
    const invalidationParams = {
        DistributionId: distributionId,
        InvalidationBatch: {
            CallerReference: imageKey, //image name
            Paths: {
                Quantity: 1,
                Items: [
                    "/" + imageKey
                ]
            }
        }
    }
    const invalidationCommand = new CreateInvalidationCommand(invalidationParams)
    await cloudfrontClient.send(invalidationCommand)

    return res.status(200).json({
        ok: true,
        deletedRow: deletedRow
    })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})