import {Router} from "express";
import {getAllUser, registerNewUser, deleteUser} from "../controller/user.js";
import {upload} from "../lib/multer.js";

const router = Router();


router.get('/users', getAllUser)
router.post('/user', upload.single('image'), registerNewUser)
router.delete('/user/:id', deleteUser);

export default router;
