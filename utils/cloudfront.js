import {CreateInvalidationCommand} from "@aws-sdk/client-cloudfront";
import {
    cloudFrontPrivateKey,
    distributionId,
    keyPairId
} from "../lib/config.js";
import cloudfrontClient from "../lib/cloudfrontclient.js";
import {getSignedUrl} from "@aws-sdk/cloudfront-signer";


export function cfGetSignedUrl(imageName) {

    const url = getSignedUrl({
        url: "https://d2c0wqkau15v7n.cloudfront.net/" + imageName,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
        privateKey: cloudFrontPrivateKey,
        keyPairId: keyPairId
    });

    return url;
}
export async function invalidateLink(fileName) {
    // send invalid command to cloudfront
    const invalidationParams = {
        DistributionId: distributionId,
        InvalidationBatch: {
            CallerReference: fileName, //image name
            Paths: {
                Quantity: 1,
                Items: [
                    "/" + fileName
                ]
            }
        }
    }
    const invalidationCommand = new CreateInvalidationCommand(invalidationParams)
    try {
        await cloudfrontClient.send(invalidationCommand)
        return {
            status:"success"
        }
    } catch (e) {
        console.log(e)
        return {
            status:"error"
        }
    }
}