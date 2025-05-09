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
    console.log("req.file", req.file)
    console.log("req.body", req.body)
    try {

        const realImageData = req.file.buffer;
        const fileName = req.file.originalname;
        const contentType = req.file.mimetype;

        if(!realImageData || !fileName) {
            return res.status(400).send({
                code: 400,
                message: "No file uploaded."
            });
        }

        console.log(typeof realImageData)
        console.log("-----------")
        console.log({realImageData})
        console.log("-----------")

        // 2. Ekstrak tipe file dan data Base64
        const matches = realImageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid Base64 image format.' });
        }

        const type = matches[1]; // 'jpeg', 'png', dll.
        const base64Data = matches[2]; // Data tanpa prefix

        // 3. Konversi Base64 ke Buffer
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
            ContentType: contentType
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