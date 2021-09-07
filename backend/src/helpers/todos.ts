import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todoAccess = new TodoAccess()

const logger = createLogger('todos')

// TODO: Implement businessLogic
export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    let responseUrl: string
    logger.info('Creating signed url', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    try {
      responseUrl = await AttachmentUtils(userId, todoId)  
    } catch (error) {
      logger.error('Upload url error', { error: error.message })
      return null
    }
    logger.info('Signed url created', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    return responseUrl
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
    let todos: TodoItem[]
    logger.info('Getting todos', {userId: userId, time: new Date().toISOString()})
    try {
      todos = await todoAccess.getTodosbyUserID(userId)  
    } catch (error) {
        logger.error('Getting todos error', {error: error.message})
      return null  
    }
    logger.info('Getting todos done', {userId: userId, time: new Date().toISOString()})
    return todos
  }

  export async function createTodo(userId: string, todoRequest: CreateTodoRequest): Promise<TodoItem> {
    let todoObject: TodoItem
    let todo: TodoItem
    const todoId = uuid.v4()
    todoObject = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: todoRequest.name,
        dueDate: todoRequest.dueDate,
        done: false
    }
    logger.info('Creating todo', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    try {
      todo = await todoAccess.createTodo(todoObject)  
    } catch (error) {
        logger.error('Creating todo error', {error: error.message})
      return null  
    }
    logger.info('Todo created', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    return todo
  }

  export async function updateTodo(todoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<string> {
    logger.info('Updating todo', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    await todoAccess.updateTodo(todoRequest, todoId, userId).catch((error) => {
        logger.error('Updating todo error', {error: error.message})
      return null  
    })
    logger.info('Todo updated', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    return 'update success'
  }

  export async function deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info('Todo deleting', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    await todoAccess.deleteTodo(todoId, userId).catch((error) => {
        logger.error('Deleting todo error', {error: error.message})
      return null
    })
    logger.info('Todo deleted', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    return 'delete success'
  }