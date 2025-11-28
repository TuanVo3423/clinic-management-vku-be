import { Router } from 'express'
import {
  chatController,
  getChatbotStatusController,
  getSuggestedServicesController,
} from '~/controllers/chatbot.controller'

const chatbotRouter = Router()

/**
 * Description: Get chatbot initialization status
 * Path: /status
 * Method: GET
 */
chatbotRouter.get('/status', getChatbotStatusController)

/**
 * Description: Chat with the bot about symptoms and get service recommendations
 * Path: /chat
 * Method: POST
 * Body: { message: string, conversationId?: string }
 */
chatbotRouter.post('/chat', chatController)

/**
 * Description: Get suggested services based on symptoms
 * Path: /suggest-services
 * Method: POST
 * Body: { symptoms: string[] }
 */
chatbotRouter.post('/suggest-services', getSuggestedServicesController)

export default chatbotRouter
