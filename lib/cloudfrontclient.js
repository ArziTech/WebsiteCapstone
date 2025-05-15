import {CloudFrontClient} from "@aws-sdk/client-cloudfront";
import {
    bucketAccessKey,
    bucketRegion,
    bucketSecretAccessKey
} from "./config.js";

const cloudfrontClient = new CloudFrontClient({
    credentials: {
        accessKeyId: bucketAccessKey,
        secretAccessKey: bucketSecretAccessKey
    },
    region: bucketRegion
})

export default cloudfrontClient