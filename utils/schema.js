import {string, object} from 'valibot'

export const ConfigSchema = object({
    bucketName: string(),
    bucketRegion: string(),
    bucketAccessKey: string(),
    bucketSecretAccessKey: string(),
    cloudFrontPrivateKey: string(),
    keyPairId: string(),
    distributionId: string(),
    dbKeySslCertificate: string()
})