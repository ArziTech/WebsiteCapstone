import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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

app.get('/', (req, res) => {
    return res.send("<h1>Hello World</h1>")
})

// to store image to s3
app.post('/api/image', upload.single('image'), async (req, res)=>{
    // base64Image saya dapat undefined
    const { base64Image, fileName } = req.body;

    console.log("base64image", base64Image);

    console.log("req.file", req.file)
    console.log("req.body", req.body)
    try {

        // req.file.buffer adalah Buffer object
        const realImageData = req.file.buffer;
        const fileName = req.file.originalname;

        if(!realImageData || !fileName) {
            return res.status(400).send({
                code: 400,
                message: "No file uploaded."
            });
        }

        // Convert Buffer to base64 string first
        const base64String = realImageData.toString();

        // karena realImageData bukan string, maka error di baris ini
        const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            // If the base64 string includes the data URI prefix
            const imageType = matches[1];
            const pureBase64Data = matches[2];


            const buffer = Buffer.from(pureBase64Data, 'base64');

            const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!validMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).send({
                    message: "Invalid file type. Only images are allowed."
                });
            }

            const params = {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: buffer,
                ContentType: imageType
            }

            const command = new PutObjectCommand(params)

            await s3.send(command);

            return res.send({code: 200})
        } else {

            // If no data URI prefix found, assume it's pure base64
            const buffer = Buffer.from(base64String, 'base64');
            console.log("Heloooooo")
            const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!validMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).send({
                    message: "Invalid file type. Only images are allowed."
                });
            }

            const params = {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: buffer,
                ContentType: req.file.mimetype
            }

            const command = new PutObjectCommand(params)

            await s3.send(command);

            return res.send({code: 200})
            // ... continue with your S3 upload logic
        }

        const type = matches[1]; // 'jpeg', 'png', dll.

        const buffer = Buffer.from(base64Data, 'base64');

        const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).send({
                message: "Invalid file type. Only images are allowed."
            });
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: type
        }

        const command = new PutObjectCommand(params)

        await s3.send(command);

        return res.send({code: 200})
    } catch (e) {
        console.log({e})
        res.send({code: 500, error: e})
    }
})

app.listen(port, () => {
    if(!(BUCKET_NAME && BUCKET_REGION && BUCKET_ACCESS_KEY && BUCKET_SECRET_ACCESS_KEY)) {
        throw new Error("Missing environment")
    }
    console.log(`Server running on port: ${port}`)
})