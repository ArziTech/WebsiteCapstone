import {Router} from "express";
import {dbHealthCheck} from "../controller/db.js";

const router = Router();

router.get('/', dbHealthCheck)

export default router;
