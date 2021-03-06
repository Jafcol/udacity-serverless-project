import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodos as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)    
    const todos = await getTodosForUser(userId)
    if (todos) {
      return {
        statusCode: 201,
        body: JSON.stringify({
          items: todos
        })
    }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'getting todos error'
        })
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
