import express from 'express';
import moment from "moment";
import {parse} from "valibot";
import pool from './lib/db.js'

import modelRouter from './routes/predict.js'
import imageRouter from './routes/image.js'
import dbRouter from './routes/db.js'
import dashboardRouter from './routes/dashboard.js'
import userRouter from './routes/user.js'

import {getAllAccessLog} from "./models/access_log.js";
import {ConfigSchema} from "./utils/schema.js";
import * as config from './lib/config.js'

moment.locale('id');

const app = express();
const port = 3000;

app.use('/', dashboardRouter);
app.use('/api', imageRouter);
app.use('/predict', modelRouter);
app.use('/db', dbRouter);
app.use('/api', userRouter);

app.listen(port, () => {
    try {
        parse(ConfigSchema, config)
        pool.connect();

        console.log(`Server running on port ${port}`);
    } catch{

        return console.error("Missing environment variable");
    }
})