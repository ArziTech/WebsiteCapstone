
import { exec } from 'child_process';
// import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from "axios";
import fs from "fs";
import {modelUrl} from "../lib/config.js";
import FormData from "form-data";


export async function predict(req, res) {
    const file =  req.file
    if (!req.file) {
        return res.status(400).json({
            code: 400,
            message: 'No file uploaded.',
        });
    }

    try {
        const formData = new FormData();
        formData.append('image', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        const result = await axios.post(`http://3.24.137.25:5000/`, formData);

        const matrix_result = result.data.prediction_embed
        console.log(matrix_result)

        const user = {
            name: "",
            embed_matrix: "",
            imageLink: ""
        }

        await registerNewUser(user);


        return res.status(200).json({
            data: result.data
        })

    } catch (error) {
        console.log({error})
        return res.status(500).json({ error: 'Internal server error' });
    }

}