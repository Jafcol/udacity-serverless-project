import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) {
  }

  async getTodosbyUserID(userId: string): Promise<TodoItem[]> {
    logger.info('Getting todos of user', {userId: userId, time: new Date().toISOString()})
    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise().catch((error) => {
      logger.error('Getting todos error', {error: error.message})
      throw new Error('getting item error: ' + error.message)})
      logger.info('Getting todos of user done', {userId: userId, time: new Date().toISOString()})
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating todos of user')
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise().catch((error) => {
      logger.error('Creating todo error', {error: error.message})
      throw new Error('creating todo error: ' + error.message)})
    logger.info('Creating todos of user done')
    return todo
  }

  async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    logger.info('Updating todo', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {'userId': userId, 'todoId': todoId},
      UpdateExpression: 'set name = :nameparam, dueDate=:dueparam, done=:doneparam',
      ExpressionAttributeValues:{":nameparam":todo.name,
      ":dueDate":todo.dueDate,
      ":done":todo.done},
      ReturnValues:'UPDATED_NEW'
    }).promise().catch((error) => {
      logger.error('Updating todo error', {userId: userId, todoId: todoId, time: new Date().toISOString()})
      throw new Error('updating todo error: ' + error.message)})
      logger.info('Updating todo done', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    return null
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info('Deleting todo', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {'userId': userId,'todoId': todoId}
    }).promise().catch((error) => {
      logger.error('Deleting todo error', {error: error.message})
      throw new Error('deleting item error: ' + error.message)})
      logger.info('Deleting todo done', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    
      return null
  }

  async addAttachment(userId: string, todoId: string, attachmentId: string): Promise<void> {
    logger.info('Adding attachment', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    await this.docClient.update({
    TableName: this.todosTable,
    Key: {'userId': userId, 'todoId': todoId},
    UpdateExpression: 'set attachmentUrl = :bucketurl',
    ExpressionAttributeValues:{":bucketurl":`https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`},
    ReturnValues:'UPDATED_NEW'
  }).promise().catch((error) => {
    logger.info('Adding attachment error', {userId: userId, todoId: todoId, time: new Date().toISOString()})
    throw new Error('adding attachment url error: ' + error.message)})
  logger.info('Adding attachment done', {userId: userId, todoId: todoId, time: new Date().toISOString()})  
}
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance', {status: 'offline'})
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

// TODO: Implement the dataLayer logic