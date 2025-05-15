import {S3Client} from "@aws-sdk/client-s3";
import {
    bucketAccessKey,
    bucketRegion,
    bucketSecretAccessKey
} from "./config.js";

const s3 = new S3Client({
    credentials: {
        accessKeyId: bucketAccessKey,
        secretAccessKey: bucketSecretAccessKey
    },
    region: bucketRegion
})

export default s3;