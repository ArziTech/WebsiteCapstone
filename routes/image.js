import {Router} from "express";

import {deleteImage, getAllImages, saveNewImage} from "../controller/image.js";
import {upload} from "../lib/multer.js";

const router = Router();

router.get('/images', getAllImages)
router.post('/image', upload.single('image'), saveNewImage);
router.delete('/image/:id', deleteImage);

export default router;
