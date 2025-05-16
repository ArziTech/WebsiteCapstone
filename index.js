import express from 'express';
import moment from "moment";
import {parse} from "valibot";
import pool from './lib/db.js'

import modelRouter from './routes/predict.js'
import imageRouter from './routes/image.js'
import dbRouter from './routes/db.js'

import {getAllAccessLog} from "./models/access_log.js";
import {ConfigSchema} from "./utils/schema.js";
import * as config from './lib/config.js'

moment.locale('id');

const app = express();
const port = 3000;

app.get('/',async (req, res) => {
    try {
        const response = await getAllAccessLog()

        return res.render('index.ejs', {
            ...response,
            count: response.count
        })
    } catch (error) {
        console.error("Error fetching image URLs:", error);
        return res.status(500).json({
            code: 500,
            message: "Failed to retrieve image URLs",
            error: error.message
        });
    }
})


app.use('/api', imageRouter);
app.use('/predict', modelRouter);
app.use('/db', dbRouter);

app.listen(port, () => {
    try {
        parse(ConfigSchema, config)
        pool.connect();

        console.log(`Server running on port ${port}`);
    } catch{

        return console.error("Missing environment variable");
    }
})