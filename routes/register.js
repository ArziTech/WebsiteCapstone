import {Router} from "express";
import {register} from "../controller/register.js";

const router = Router();


router.get('/', register)

export default router;
