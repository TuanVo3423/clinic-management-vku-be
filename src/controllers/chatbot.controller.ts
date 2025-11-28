import { Request, Response } from 'express'
import { chatbotService } from '~/services/chatbot.services'
import { ChatRequest, InitChatbotRequest, GetSuggestedServicesRequest } from '~/models/requests/chatbot.request'


export const chatController = async (req: Request<any, any, ChatRequest>, res: Response) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({
        message: 'Message is required'
      })
    }

    if (!chatbotService.isReady()) {
      return res.status(503).json({
        message: 'Chatbot is not initialized. Please initialize with API key first.',
        ready: false
      })
    }

    const response = await chatbotService.chat(message)

    return res.json({
      message: 'Chat response generated successfully',
      data: {
        response,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error in chat:', error)
    return res.status(500).json({
      message: 'Failed to process chat message',
      error: error.message
    })
  }
}

export const getSuggestedServicesController = async (
  req: Request<any, any, GetSuggestedServicesRequest>,
  res: Response
) => {
  try {
    const { symptoms } = req.body

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: 'Symptoms array is required'
      })
    }

    if (!chatbotService.isReady()) {
      return res.status(503).json({
        message: 'Chatbot is not initialized. Please initialize with API key first.',
        ready: false
      })
    }

    const suggestedServices = await chatbotService.getSuggestedServices(symptoms)

    return res.json({
      message: 'Suggested services retrieved successfully',
      data: {
        services: suggestedServices,
        count: suggestedServices.length
      }
    })
  } catch (error: any) {
    console.error('Error getting suggested services:', error)
    return res.status(500).json({
      message: 'Failed to get suggested services',
      error: error.message
    })
  }
}

export const getChatbotStatusController = async (req: Request, res: Response) => {
  try {
    const ready = chatbotService.isReady()

    return res.json({
      message: 'Chatbot status retrieved successfully',
      data: {
        ready,
        status: ready ? 'initialized' : 'not_initialized'
      }
    })
  } catch (error: any) {
    console.error('Error getting chatbot status:', error)
    return res.status(500).json({
      message: 'Failed to get chatbot status',
      error: error.message
    })
  }
}
