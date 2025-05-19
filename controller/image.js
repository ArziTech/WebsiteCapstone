import {deleteImageFromDB, saveImageToDB} from "../models/image.js"
import {deleteObject, putObject} from "../utils/s3.js";
import {invalidateLink} from "../utils/cloudfront.js";
import {getAllImages as modelGetAllImages} from "../models/image.js";
import pool from "../lib/db.js";
import axios from "axios";
import {modelUrl} from "../lib/config.js";
import FormData from "form-data";

export async function getAllImages(req, res) {
    try {
        const result = await modelGetAllImages()
        return res.status(200).json({
            count: result.count,
            images: result.images
        });
    } catch (error) {
        console.error("Error fetching image URLs:", error);
        return res.status(500).json({
            code: 500,
            message: "Failed to retrieve image URLs",
            error: error.message
        });
    }
}

function cosineSimilarity(vecA, vecB) {
    console.log({vecB})
    console.log(vecB.length)
    if (vecA.length !== vecB.length) {
        throw new Error(`Vectors must be the same length cannot ${vecA.length} w/ ${vecB.length}`);
    }

    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] ** 2;
        normB += vecB[i] ** 2;
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function euclideanDistance(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be the same length");
    }

    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
        sum += Math.pow(vecA[i] - vecB[i], 2);
    }

    return Math.sqrt(sum);
}



export async function saveNewImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: "No file uploaded."
            });
        }

        const { buffer, originalname: fileName, mimetype } = req.file;

        // return res.send({buffer})

        let processedBuffer;
        if(!buffer || !fileName) {
            return res.status(400).send({
                code: 400,
                message: "No file uploaded."
            });
        }

        // console.dir(req.file, {depth: null, colors: true})
        const base64String = buffer.toString();

        const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const pureBase64Data = matches[2];
            processedBuffer = Buffer.from(pureBase64Data, 'base64');
        } else {
            processedBuffer = buffer;
        }

        const validMimeTypes = ["image/jpeg","image/jpg", "image/png", "image/gif"];
        if (!validMimeTypes.includes(mimetype)) {
            return res.status(400).send({
                message: "Invalid file type. Only images are allowed."
            });
        }


        await putObject(fileName, processedBuffer, mimetype)
        const response = await saveImageToDB(fileName)
        if(response.status === "error") {
            await deleteObject(fileName)
            await invalidateLink(fileName)
        }

        const formData = new FormData();
        formData.append('image', buffer, {
            filename: fileName,
            contentType: mimetype
        });

        const resultEmbed = await axios.post(`${modelUrl}/embed`, formData)
        const data = resultEmbed.data

        // apakah kita perlu untuk mengambil dari database?
        const result = await pool.query("SELECT name, embed FROM users")

        const inputImage = data

        // convert from string to array
        const embedImages = result.rows.map(item => {
            const rawString = item.embed
            // console.log(rawString
            // )

            // Step 1: Clean the string
            const cleaned = rawString.replace(/^\{{2}|}}$/g, ''); // remove leading '{{' and trailing '}}'

            // Step 2: Convert to array of numbers
            const numberArray = cleaned.split(',').map(s => parseFloat(s.replace(/"/g, '')));
            return numberArray
        })


        let matchIndex = -999;
        let similarityRes = 0


        const isMatch = embedImages.some((item, index) => {
            const similarity  = cosineSimilarity(item, inputImage)
            // const similarity  = euclideanDistance(item, inputImage)
            console.log(similarity)
            if(similarity > 0.96) {
                matchIndex = index;
                similarityRes = similarity
                return true;
            }
            return false;
        })

        // console.log("isMatch", isMatch)

        // if match
        if(isMatch) {
            return res.status(202).json({
                name: result.rows[matchIndex].name,
                message: "Authorized",
                similarity: similarityRes,
                matchIndex,
            })
        }

        // console.log(embedImages)

        return res.status(403).json({
            message: "Unauthorized",
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
}

export async function deleteImage(req, res) {
    const fileName = req.params.id;

    await deleteImageFromDB(fileName)
    await deleteObject(fileName)
    await invalidateLink(fileName)

    return res.status(200).json({
        ok: true,
    })
}