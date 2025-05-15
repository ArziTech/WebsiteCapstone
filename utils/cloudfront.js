import {CreateInvalidationCommand} from "@aws-sdk/client-cloudfront";
import {distributionId} from "../lib/config.js";
import cloudfrontClient from "../lib/cloudfrontclient.js";

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