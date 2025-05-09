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
app.post('/api/image',upload.single('image'), async (req, res)=>{
    try {
        console.log("req.body", req.body)
        console.log("req.file", req.file)

        const realImageData = req.file.buffer;
        const fileName = req.file.originalname;

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: realImageData,
            ContentType: req.file.mimeType
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
    console.log(`Server running on port: ${port}`)
})