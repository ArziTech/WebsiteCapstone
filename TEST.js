// const bucketName = process.env.BUCKET_NAME;
//
// app.post('/api/image', upload.single('image'), async (req, res)=>{
//     try {
//         // Validate request
//         if (!req.file) {
//             return res.status(400).json({
//                 code: 400,
//                 message: "No file uploaded."
//             });
//         }
//
//         const { buffer, originalname: fileName } = req.file;
//
//
//
//         const realImageData = buffer;
//
//
//         let contentType = '';
//         let processedBuffer;
//         if(!realImageData || !fileName) {
//             return res.status(400).send({
//                 code: 400,
//                 message: "No file uploaded."
//             });
//         }
//
//         // Convert Buffer to base64 string first
//         const base64String = realImageData.toString();
//
//         // karena realImageData bukan string, maka error di baris ini
//         const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
//         if (matches && matches.length === 3) {
//             // If the base64 string includes the data URI prefix
//             contentType = matches[1];
//             const pureBase64Data = matches[2];
//             processedBuffer = Buffer.from(pureBase64Data, 'base64');
//         } else {
//             processedBuffer = realImageData;
//             contentType = req.file.mimeType;
//         }
//
//         const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
//         if (!validMimeTypes.includes(contentType)) {
//             return res.status(400).send({
//                 message: "Invalid file type. Only images are allowed."
//             });
//         }
//
//         const params = {
//             Bucket: bucketName,
//             Key: fileName,
//             Body: processedBuffer,
//             ContentType: contentType
//         }
//
//         const command = new PutObjectCommand(params)
//
//         await s3.send(command);
//
//         return res.status(200)
//     } catch (e) {
//         console.log({e})
//         res.send({code: 500, error: e})
//     }
// })