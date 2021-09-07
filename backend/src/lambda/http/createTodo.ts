import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event)    
    const todo = await createTodo(userId, newTodo)
    if (todo) {
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: todo
        })
    }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'creating todo error'
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