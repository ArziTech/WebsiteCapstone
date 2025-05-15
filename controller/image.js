import {getAllAccessLog} from "../models/access_log.js";
import {deleteImageFromDB, saveImageToDB} from "../models/image.js"
import {deleteObject, putObject} from "../utils/s3.js";
import {invalidateLink} from "../utils/cloudfront.js";
import {getAllImages as modelGetAllImages} from "../models/image.js";

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

export async function saveNewImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: "No file uploaded."
            });
        }

        const { buffer, originalname: fileName, mimetype } = req.file;

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
        const response =await saveImageToDB(fileName)
        if(response.status === "error") {
            await deleteObject(fileName)
            await invalidateLink(fileName)
        }

        return res.status(201).json({
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