import axios from "axios";
import FormData from "form-data";
import {
    createNewUser,
    deleteUserFromDB,
    getAllUser as modelGetAllUser, getSpecificUser
} from "../models/user.js";
import {deleteObject, putObject} from "../utils/s3.js";
import {cfGetSignedUrl, invalidateLink} from "../utils/cloudfront.js";
import {deleteImageFromDB} from "../models/image.js";


export async function registerNewUser(req, res) {
    console.info("incoming request")
    const {name}= req.body;
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

        const result = await axios.post(`${modelUrl}/`, formData);

        const matrix_result = result.data.prediction_embed
        // console.log(matrix_result)

        // save image to s3
        await putObject(file.originalname, file.buffer, file.mimetype)


        // create
        const response = await createNewUser(name, matrix_result, file.originalname);
        if(response.status === "error") {
            await deleteObject(file.originalname)
            await invalidateLink(file.originalname)
        }

        const url = cfGetSignedUrl(file.originalname)

        return res.render('success.ejs', {
            name: name,
            image: url // image link
            // data: result.data,
        })

    } catch (error) {
        console.log({error})
        return res.status(500).json({ error: 'Internal server error' });
    }

}

export async function deleteUser(req, res) {
    const username = req.params.id;

    const result = await getSpecificUser(username)

    const { imagelink } = result.user;

    await deleteUserFromDB(username)
    await deleteObject(imagelink)
    await invalidateLink(imagelink)

    return res.status(200).json({
        ok: true,
    })
}