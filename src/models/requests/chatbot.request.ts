export interface ChatRequest {
  message: string
  conversationId?: string
}

export interface InitChatbotRequest {
  apiKey: string
}

export interface GetSuggestedServicesRequest {
  symptoms: string[]
}
