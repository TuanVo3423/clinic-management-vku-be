# Chatbot RAG - Hướng dẫn sử dụng

## Giới thiệu

Chatbot sử dụng RAG (Retrieval-Augmented Generation) với Google Gemini để tư vấn về các dịch vụ phòng khám cho bệnh nhân dựa trên triệu chứng của họ.

## Công nghệ sử dụng

- **LangChainJS**: Framework để xây dựng ứng dụng LLM
- **Google Gemini**: Model AI (gemini-1.5-flash)
- **Vector Store**: MemoryVectorStore để lưu trữ và tìm kiếm embeddings
- **Google Embeddings**: embedding-001 model

## Cài đặt Dependencies

```bash
npm install
```

Các package đã được thêm vào `package.json`:

- `langchain`: Framework LangChain
- `@langchain/google-genai`: Tích hợp Google Gemini
- `@langchain/community`: Các công cụ bổ sung

## Cấu trúc File

```
src/
├── data/
│   └── clinic-services-knowledge.json    # Dữ liệu dịch vụ và bệnh lý
├── services/
│   └── chatbot.services.ts               # Service xử lý RAG
├── controllers/
│   └── chatbot.controller.ts             # Controllers xử lý request
├── routes/
│   └── chatbot.routes.ts                 # API routes
└── models/requests/
    └── chatbot.request.ts                # Type definitions
```

## API Endpoints

### 1. Khởi tạo Chatbot

**POST** `/chatbot/init`

Khởi tạo chatbot với Google API key (chỉ cần gọi 1 lần).

**Body:**

```json
{
  "apiKey": "YOUR_GOOGLE_API_KEY"
}
```

**Response:**

```json
{
  "message": "Chatbot initialized successfully",
  "data": {
    "ready": true
  }
}
```

### 2. Kiểm tra trạng thái

**GET** `/chatbot/status`

Kiểm tra xem chatbot đã được khởi tạo chưa.

**Response:**

```json
{
  "message": "Chatbot status retrieved successfully",
  "data": {
    "ready": true,
    "status": "initialized"
  }
}
```

### 3. Chat với Bot

**POST** `/chatbot/chat`

Gửi tin nhắn về triệu chứng và nhận tư vấn về dịch vụ phù hợp.

**Body:**

```json
{
  "message": "Tôi bị đau lưng và vai gáy mấy tuần nay",
  "conversationId": "optional-conversation-id"
}
```

**Response:**

```json
{
  "message": "Chat response generated successfully",
  "data": {
    "response": "Dựa trên triệu chứng đau lưng và vai gáy của bạn...",
    "timestamp": "2025-11-27T10:30:00.000Z"
  }
}
```

### 4. Gợi ý dịch vụ

**POST** `/chatbot/suggest-services`

Lấy danh sách dịch vụ phù hợp dựa trên mảng triệu chứng.

**Body:**

```json
{
  "symptoms": ["đau lưng", "đau vai gáy", "tê bì"]
}
```

**Response:**

```json
{
  "message": "Suggested services retrieved successfully",
  "data": {
    "services": [
      {
        "id": 1,
        "name": "Khám bệnh, tư vấn kê đơn thuốc",
        "description": "...",
        "duration": 30,
        "price": 0,
        "suitable_for": [...],
        "conditions": [...]
      },
      ...
    ],
    "count": 5
  }
}
```

## Cách sử dụng

### Bước 1: Lấy Google API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy API key

### Bước 2: Khởi tạo Chatbot

Gọi API init với API key của bạn:

```bash
curl -X POST http://localhost:3000/chatbot/init \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "YOUR_API_KEY_HERE"}'
```

### Bước 3: Chat với Bot

```bash
curl -X POST http://localhost:3000/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tôi bị đau khớp gối và khó đi lại"}'
```

## Dữ liệu Knowledge Base

File `clinic-services-knowledge.json` chứa:

### 8 Dịch vụ chính:

1. Khám bệnh, tư vấn kê đơn thuốc (Miễn phí)
2. Châm cứu đèn hồng ngoại (250,000 VNĐ)
3. Siêu âm điều trị (200,000 VNĐ)
4. Điều trị bằng sóng xung kích (400,000 VNĐ)
5. Điện xung (200,000 VNĐ)
6. Kéo giãn cột sống (300,000 VNĐ)
7. Xoa bóp bấm huyệt và tập (350,000 VNĐ)
8. Hỏa long cứu (250,000 VNĐ)

### Thông tin mỗi dịch vụ:

- Mô tả chi tiết
- Thời gian điều trị
- Giá cả
- Phù hợp với triệu chứng nào
- Điều trị các bệnh lý gì
- Lợi ích

### Bệnh lý thường gặp:

- Đau lưng
- Đau vai gáy
- Thoát vị đĩa đệm
- Viêm khớp
- Đau thần kinh tọa
- Viêm gân
- Thoái hóa khớp
- Chấn thương thể thao
- Đau mạn tính
- Liệt yếu cơ

## Cách hoạt động của RAG

1. **Indexing**: Khi khởi tạo, tất cả dữ liệu dịch vụ được chuyển thành embeddings và lưu trong vector store
2. **Retrieval**: Khi user hỏi, câu hỏi được chuyển thành embedding và tìm kiếm các documents liên quan nhất
3. **Generation**: Các documents liên quan được đưa vào context của prompt, sau đó Gemini tạo câu trả lời tự nhiên

## Ví dụ sử dụng

### Ví dụ 1: Hỏi về triệu chứng

```
User: "Tôi bị đau lưng mỗi sáng thức dậy, đau âm ỉ cả ngày"

Bot: "Chào bạn! Dựa trên triệu chứng đau lưng mà bạn mô tả, có thể bạn đang gặp
vấn đề về cột sống hoặc cơ lưng. Phòng khám của chúng tôi có các dịch vụ phù hợp:

1. **Khám bệnh, tư vấn kê đơn thuốc** (Miễn phí - 30 phút)
   Bác sĩ sẽ khám và chẩn đoán chính xác nguyên nhân đau lưng của bạn.

2. **Kéo giãn cột sống** (300,000 VNĐ - 45 phút)
   Giúp giảm chèn ép thần kinh, cải thiện thoát vị đĩa đệm nếu có.

3. **Châm cứu đèn hồng ngoại** (250,000 VNĐ - 45 phút)
   Tăng cường tuần hoàn máu, giảm đau và thư giãn cơ.

Tôi khuyên bạn nên đến khám trực tiếp để bác sĩ chẩn đoán chính xác nhé!"
```

### Ví dụ 2: Hỏi về dịch vụ cụ thể

```
User: "Sóng xung kích có hiệu quả với đau vai không?"

Bot: "Có! Điều trị bằng sóng xung kích rất hiệu quả với đau vai mạn tính.
Dịch vụ này có giá 400,000 VNĐ, thời gian 40 phút.

Sóng xung kích phù hợp với:
- Viêm khớp vai
- Vôi hóa gân
- Đau vai mãn tính không đáp ứng với điều trị thông thường

Lợi ích:
- Kích thích tái tạo mô
- Phá vỡ vôi hóa
- Giảm đau nhanh chóng
- Hiệu quả cao với đau mạn tính"
```

## Lưu ý

- API key chỉ cần khởi tạo 1 lần khi server khởi động
- Chatbot không thay thế chẩn đoán y tế chuyên nghiệp
- Luôn khuyên bệnh nhân đến khám trực tiếp
- Vector store hiện tại dùng Memory (sẽ mất khi restart server)

## Mở rộng tương lai

- Lưu conversation history
- Tích hợp với database appointments
- Sử dụng persistent vector store (như Pinecone, Chroma)
- Thêm multi-language support
- Tích hợp với WebSocket cho real-time chat
