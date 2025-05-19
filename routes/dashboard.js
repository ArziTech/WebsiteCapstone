import {Router} from "express";
import {
    getAllUser,
    access,
    register,
    welcome, dashboard
} from "../controller/dashboard.js";

const router = Router();


router.get('/', welcome)
router.get('/dashboard', dashboard)
router.get('/logs', access)
router.get('/users', getAllUser)
router.get('/register', register)

export default router;
