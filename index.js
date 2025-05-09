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

        const realImageData = req.file.buffer;
        const fileName = req.file.originalname;
        const contentType = req.file.mimeType;

        if(!(realImageData && fileName && contentType)) {
            return res.send({
                code: 400,
                message: "Data not complete"
            })
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: realImageData,
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