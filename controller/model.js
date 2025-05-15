
import { exec } from 'child_process';
// import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from "fs";

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function predict(req, res) {
    try {
        const file =  req.file
        // console.log({file})
        // Validasi request
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: 'No file uploaded.',
            });
        }

        const { buffer, originalname: fileName, mimetype } = req.file;

        // Simpan gambar sementara ke disk (karena OpenCV memerlukan path file)
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFilePath = path.join(tempDir, fileName);
        fs.writeFileSync(tempFilePath, buffer);


        console.log("before running script")
        // Jalankan skrip Python untuk prediksi
        exec(`python test_model.py "${tempFilePath}"`, (error, stdout, stderr) => {
            // Hapus file sementara setelah selesai
            fs.unlinkSync(tempFilePath);

            if (error) {
                console.error('Python error:', stderr);
                return res.status(500).json({ error: 'Failed to run model' });
            }


            try {
                // Bersihkan stdout: ambil hanya baris yang mengandung JSON
                let jsonString = stdout.split('\n').find(line => line.trim().startsWith('{'));
                if (!jsonString) {
                    throw new Error('Output tidak mengandung JSON yang valid');
                }

                // jsonString = jsonString.replaceAll(/\r$/, '')
                // console.log("jsonString",jsonString)

                jsonString = jsonString.replaceAll(/'/g, '"')
                console.log("jsonString",jsonString)

                const result = JSON.parse(jsonString);

                console.log("result",result)
                res.json(result)
            } catch (parseError) {
                console.log(parseError)
                res.status(500).json({ error: 'Failed to parse model output' });
            }
        });
        console.log("after running script")

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}