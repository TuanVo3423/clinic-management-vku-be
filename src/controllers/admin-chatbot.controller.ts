import { Request, Response } from 'express'
import adminChatbotServices from '~/services/admin-chatbot.services'
import { AdminChatbotQueryBody } from '~/models/requests/admin-chatbot.request'

/**
 * Controller xử lý chat với admin chatbot
 * POST /admin-chatbot/query
 * Body: { message: string, conversationId?: string }
 */
export const adminChatbotQueryController = async (req: Request, res: Response) => {
  const { message, conversationId } = req.body as AdminChatbotQueryBody

  if (!message || message.trim() === '') {
    return res.status(400).json({
      message: 'Vui lòng nhập câu hỏi',
      success: false
    })
  }

  try {
    const response = await adminChatbotServices.processQuery({ message, conversationId })

    return res.status(200).json({
      message: 'Xử lý thành công',
      success: true,
      result: response
    })
  } catch (error) {
    console.error('❌ Error in adminChatbotQueryController:', error)
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi xử lý câu hỏi',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Controller lấy danh sách conversation history (Optional - cho tương lai)
 * GET /admin-chatbot/conversations
 */
export const getConversationsController = async (req: Request, res: Response) => {
  // TODO: Implement conversation history nếu cần
  return res.status(200).json({
    message: 'Feature đang phát triển',
    success: true,
    result: []
  })
}
