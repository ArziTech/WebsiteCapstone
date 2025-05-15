import {bucketName} from "../lib/config.js";
import {DeleteObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import s3 from "../lib/s3.js";

export async function putObject(fileName, bufferData, contentType) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: bufferData,
        ContentType: contentType
    }

    const command = new PutObjectCommand(params)

    try {
        await s3.send(command);
        return {
            status: 'success'
        }
    } catch (error) {
        console.log(error)
        return {
            status: "error"
        }
    }
}

export async function deleteObject(fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName
    }
    const command = new DeleteObjectCommand(params)
    await s3.send(command);
}