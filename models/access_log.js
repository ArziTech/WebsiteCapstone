import pool from '../lib/db.js'

import moment from "moment";
import {cfGetSignedUrl} from "../utils/cloudfront.js";

export async function getAllAccessLog() {
    const dbResponse = await pool.query("SELECT key, created_at FROM" +
        " access_log ORDER BY created_at DESC");

    const access_log =  dbResponse.rows.map((row) => {
        const imageName = row.key;
        const access_time = moment(row.created_at).format('LLLL')

        try {
            const url = cfGetSignedUrl(imageName)
            return {
                imageName,
                url,
                access_time
            };
        } catch (s3Error) {
            console.error(`Error generating URL for ${imageName}:`, s3Error);
            return {
                imageName,
                error: 'Failed to generate URL',
                exists: false
            };
        }
    })

    return { access_log, count: dbResponse.rows.length }
}