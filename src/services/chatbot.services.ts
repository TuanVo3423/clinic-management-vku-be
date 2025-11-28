import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from '@langchain/core/documents'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import * as fs from 'fs'
import * as path from 'path'

interface ServiceData {
  id: number
  name: string
  description: string
  duration: number
  price: number
  suitable_for: string[]
  conditions: string[]
  benefits?: string[]
}

interface ClinicKnowledge {
  clinicInfo: {
    name: string
    specialization: string
    description: string
  }
  services: ServiceData[]
  commonConditions: Record<string, any>
  keywords: Record<string, string[]>
}

class ChatbotService {
  private vectorStore: MemoryVectorStore | null = null
  private model: ChatGoogleGenerativeAI | null = null
  private embeddings: GoogleGenerativeAIEmbeddings | null = null
  private knowledgeData: ClinicKnowledge | null = null
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Tự động khởi tạo khi service được tạo
    this.initPromise = this.initialize()
  }

  private async initialize() {
    if (this.isInitialized) {
      return
    }

    try {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

      if (!apiKey) {
        console.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables')
        return
      }

      // Khởi tạo model và embeddings
      this.model = new ChatGoogleGenerativeAI({
        modelName: 'gemini-2.5-flash',
        apiKey: apiKey,
        temperature: 0.2
        // maxOutputTokens: 1000
      })

      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey,
        modelName: 'models/gemini-embedding-001'
      })

      // Load knowledge base
      const knowledgePath = path.join(__dirname, '../data/clinic-services-knowledge.json')
      const rawData = fs.readFileSync(knowledgePath, 'utf-8')
      this.knowledgeData = JSON.parse(rawData)

      // Tạo documents từ knowledge base
      const documents = this.createDocuments()

      // Tạo vector store
      this.vectorStore = await MemoryVectorStore.fromDocuments(documents, this.embeddings)

      this.isInitialized = true
      console.log('✅ Chatbot service initialized successfully')
    } catch (error) {
      console.error('❌ Error initializing chatbot service:', error)
    }
  }

  async ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise
    }
  }

  private createDocuments(): Document[] {
    if (!this.knowledgeData) {
      throw new Error('Knowledge data not loaded')
    }

    const documents: Document[] = []

    // Document cho thông tin phòng khám
    documents.push(
      new Document({
        pageContent: `Phòng khám: ${this.knowledgeData.clinicInfo.name}
        Chuyên khoa: ${this.knowledgeData.clinicInfo.specialization}
        Mô tả: ${this.knowledgeData.clinicInfo.description}`,
        metadata: { type: 'clinic_info' }
      })
    )

    // Documents cho từng dịch vụ
    this.knowledgeData.services.forEach((service) => {
      const content = `
        Dịch vụ: ${service.name}
        Mô tả: ${service.description}
        Thời gian: ${service.duration} phút
        Giá: ${service.price === 0 ? 'Miễn phí' : service.price.toLocaleString('vi-VN') + ' VNĐ'}
        Phù hợp cho: ${service.suitable_for.join(', ')}
        Điều trị các bệnh: ${service.conditions.join(', ')}
        ${service.benefits ? 'Lợi ích: ' + service.benefits.join(', ') : ''}
      `.trim()

      documents.push(
        new Document({
          pageContent: content,
          metadata: {
            type: 'service',
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            duration: service.duration
          }
        })
      )
    })

    // Documents cho các bệnh lý thường gặp
    Object.entries(this.knowledgeData.commonConditions).forEach(([key, condition]: [string, any]) => {
      const content = `
        Bệnh lý: ${key.replace(/_/g, ' ')}
        Mô tả: ${condition.description}
        Các dịch vụ được đề xuất: ${condition.recommendedServices
          .map((id: number) => {
            const service = this.knowledgeData!.services.find((s) => s.id === id)
            return service?.name
          })
          .join(', ')}
      `.trim()

      documents.push(
        new Document({
          pageContent: content,
          metadata: {
            type: 'condition',
            conditionKey: key,
            recommendedServices: condition.recommendedServices
          }
        })
      )
    })

    return documents
  }

  async chat(message: string): Promise<any> {
    await this.ensureInitialized()

    if (!this.isInitialized || !this.vectorStore || !this.model) {
      throw new Error('Chatbot service not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY in .env')
    }

    if (!this.model || !this.model.apiKey) {
      throw new Error('Model chưa được khởi tạo hoặc API key sai.')
    }

    try {
      // Tìm kiếm các documents liên quan
      const relevantDocs = await this.vectorStore.similaritySearch(message, 4)

      // Tạo context từ các documents
      const context = relevantDocs.map((doc: Document) => doc.pageContent).join('\n\n---\n\n')

      // Tạo prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
        Bạn là trợ lý y tế thông minh của Phòng Khám Đa Khoa VKU, chuyên về Cơ Xương Khớp và Phục Hồi Chức Năng.

        NHIỆM VỤ CỦA BẠN:
        1. Lắng nghe và hiểu triệu chứng của bệnh nhân
        2. Phân tích và đưa ra thông tin về bệnh lý có thể có
        3. Đề xuất các dịch vụ phù hợp của phòng khám có thể giúp điều trị
        4. Cung cấp thông tin chi tiết về dịch vụ: thời gian, giá cả, lợi ích

        NGUYÊN TẮC:
        - Thân thiện, dễ hiểu, chuyên nghiệp
        - Không chẩn đoán bệnh chính xác (chỉ bác sĩ mới làm được)
        - Luôn khuyên bệnh nhân đến khám trực tiếp để được chẩn đoán chính xác
        - Đề xuất dịch vụ phù hợp dựa trên triệu chứng
        - Cung cấp thông tin giá cả và thời gian rõ ràng

        THÔNG TIN TỪ CƠ SỞ DỮ LIỆU:
        {context}

        CÂU HỎI CỦA BỆNH NHÂN: {question}

        YÊU CẦU ĐẦU RA BẮT BUỘC:
        - Trả về DUY NHẤT một JSON hợp lệ.
        - KHÔNG thêm bất kỳ json, không thêm markdown, không thêm code block.
        - KHÔNG thêm text trước hoặc sau JSON.
        - KHÔNG bao JSON thành chuỗi (string).
        - Phải parse được bằng JSON.parse().
        FORMAT JSON BẮT BUỘC:
        {{
          "message": "Câu trả lời tư vấn bằng tiếng Việt, thân thiện và chuyên nghiệp.",
          "services": [
            {{
              "serviceName": "<tên dịch vụ giống y trong context>"
            }}
          ]
        }}

        LƯU Ý:
        - "message" là đoạn tư vấn tự nhiên.
        - "services" là danh sách các dịch vụ phù hợp (0–3 service).
        - Nếu câu trả lời không đủ thông tin dịch vụ thì trả về mảng rỗng [].
        `)

      // Tạo chain
      const chain = RunnableSequence.from([
        {
          context: () => context,
          question: (input: { question: string }) => input.question
        },
        promptTemplate,
        this.model,
        new StringOutputParser()
      ])

      // Thực thi chain
      const response = await chain.invoke({ question: message })

      const parsed = JSON.parse(response)

      return {
        message: parsed.message,
        services: parsed.services ?? []
      }
    } catch (error) {
      console.error('Error in chat:', error)
      throw new Error('Đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại.')
    }
  }

  async getSuggestedServices(symptoms: string[]): Promise<ServiceData[]> {
    if (!this.knowledgeData) {
      return []
    }

    const suggestedServices = new Set<number>()

    symptoms.forEach((symptom) => {
      this.knowledgeData!.services.forEach((service) => {
        const matchesSuitableFor = service.suitable_for.some((item) =>
          item.toLowerCase().includes(symptom.toLowerCase())
        )
        const matchesConditions = service.conditions.some((condition) =>
          condition.toLowerCase().includes(symptom.toLowerCase())
        )

        if (matchesSuitableFor || matchesConditions) {
          suggestedServices.add(service.id)
        }
      })
    })

    return this.knowledgeData.services.filter((service) => suggestedServices.has(service.id))
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService()
