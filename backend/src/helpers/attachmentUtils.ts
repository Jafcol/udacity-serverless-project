import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoAccess } from './todosAcess'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const todoAccess = new TodoAccess()

// TODO: Implement the fileStogare logic
export async function AttachmentUtils(userId: string, todoId: string): Promise<string> {
    let responseUrl: string
    const attachmentId = userId + todoId
    try {
       responseUrl = await s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attachmentId,
        Expires: parseInt(urlExpiration)
      })
    } catch (error) {
        throw new Error('upload url error: ' + error.message)
    }
    await todoAccess.addAttachment(userId, todoId, attachmentId).catch((error) => {throw new Error('upload url error: ' + error.message)})
    return responseUrl
}