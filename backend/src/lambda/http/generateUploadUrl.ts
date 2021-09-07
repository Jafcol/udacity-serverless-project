import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)    
    const signedUrl = await createAttachmentPresignedUrl(userId, todoId)
    if (signedUrl) {
      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: signedUrl
        })
    }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'generating signed url error'
        })
      }
    }
}
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
