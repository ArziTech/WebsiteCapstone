import express from "express";

import {predict} from '../controller/model.js'

import {Router} from "express";
import {upload} from "../lib/multer.js";

const router = Router();

router.get('/', (req, res) => res.status(200).json({message:"hello"}))

router.post('/',upload.single('image'), predict);



export default router;
