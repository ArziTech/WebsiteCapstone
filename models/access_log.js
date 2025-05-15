import pool from '../lib/db.js'
import {getSignedUrl} from "@aws-sdk/cloudfront-signer";

import moment from "moment";
import {cloudFrontPrivateKey, keyPairId} from "../lib/config.js";

export async function getAllAccessLog() {
    const dbResponse = await pool.query("SELECT key, created_at FROM" +
        " access_log ORDER BY created_at DESC");

    const access_log =  dbResponse.rows.map((row) => {
        const imageName = row.key;
        const access_time = moment(row.created_at).format('LLLL')

        try {
            // const command = new GetObjectCommand(getObjectParams);
            const url = getSignedUrl({
                url: "https://d2c0wqkau15v7n.cloudfront.net/" + imageName,
                dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
                privateKey: cloudFrontPrivateKey,
                keyPairId: keyPairId
            });
            // const url = "https://d2c0wqkau15v7n.cloudfront.net/" +imageName
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