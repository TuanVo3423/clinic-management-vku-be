import { Router } from 'express'
import { adminChatbotQueryController, getConversationsController } from '~/controllers/admin-chatbot.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const adminChatbotRouter = Router()

/**
 * @route POST /admin-chatbot/query
 * @desc Gửi câu hỏi đến chatbot và nhận phản hồi thông minh
 * @body { message: string, conversationId?: string }
 * @example
 * {
 *   "message": "Cho tôi xem lịch hẹn tuần này"
 * }
 */
adminChatbotRouter.post('/query', wrapRequestHandler(adminChatbotQueryController))

/**
 * @route GET /admin-chatbot/conversations
 * @desc Lấy lịch sử các cuộc hội thoại (Optional feature)
 */
adminChatbotRouter.get('/conversations', wrapRequestHandler(getConversationsController))

export default adminChatbotRouter
