import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const bucketAccessKey = process.env.BUCKET_ACCESS_KEY;
const bucketSecretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;

const cloudFrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const dbKeySslCertificate = process.env.DB_KEY_SSL_CERTIFICATE;

export { dbUrl, bucketName, bucketAccessKey, bucketRegion, bucketSecretAccessKey, cloudFrontPrivateKey, keyPairId, distributionId,dbKeySslCertificate };