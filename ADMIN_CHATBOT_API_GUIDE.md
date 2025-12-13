# 🤖 Hướng Dẫn Sử Dụng Admin Chatbot API

## 📝 Tổng Quan

API Admin Chatbot sử dụng **Google Gemini AI** để hiểu ngôn ngữ tự nhiên và tự động thực thi các tác vụ quản lý lịch hẹn.

**Base URL**: `http://localhost:3000`

---

## 🔌 Endpoint Chính

### POST `/admin-chatbot/query`

Gửi câu hỏi/yêu cầu đến chatbot và nhận phản hồi thông minh.

---

## 📤 Request Format

```json
{
  "message": "string", // Bắt buộc - Câu hỏi/yêu cầu từ admin
  "conversationId": "string" // Tùy chọn - ID cuộc hội thoại (dành cho tương lai)
}
```

### Ví dụ Request:

```json
{
  "message": "Cho tôi xem lịch hẹn tuần này"
}
```

---

## 📥 Response Format

### Response Cơ Bản:

```json
{
  "message": "string",           // Thông báo xử lý
  "success": true/false,         // Trạng thái
  "result": {
    "message": "string",         // Câu trả lời từ AI
    "data": {},                  // Dữ liệu kết quả
    "intent": "string",          // Loại intent được nhận diện
    "requiresAction": boolean,   // Có cần thực hiện action không
    "actionType": "string",      // Loại action cần thực hiện
    "actionData": {}             // Dữ liệu cho action
  }
}
```

---

## 🎯 Các Intent Được Hỗ Trợ

### 1. 📊 Thống Kê Lịch Hẹn (`get_appointments`)

#### Ví dụ câu hỏi:

- "Cho tôi xem lịch hẹn tuần này"
- "Lịch hẹn đã hoàn thành tháng 12"
- "Hiển thị lịch hẹn pending hôm nay"
- "Lịch hẹn của bác sĩ Nguyễn Văn A trong tháng này"

#### Request:

```json
{
  "message": "Cho tôi xem lịch hẹn tuần này"
}
```

#### Response:

```json
{
  "message": "Xử lý thành công",
  "success": true,
  "result": {
    "message": "Đã tìm thấy 15 lịch hẹn phù hợp.",
    "intent": "get_appointments",
    "data": {
      "appointments": [
        {
          "_id": "674a1b8c9d8e7f6a5b4c3d2e",
          "patientId": "674a1b8c9d8e7f6a5b4c3d2f",
          "doctorId": "674a1b8c9d8e7f6a5b4c3d30",
          "serviceIds": ["674a1b8c9d8e7f6a5b4c3d31"],
          "appointmentDate": "2024-12-15T00:00:00.000Z",
          "appointmentStartTime": "09:00",
          "appointmentEndTime": "09:30",
          "status": "confirmed",
          "price": 200000,
          "isCheckout": true,
          "note": "Khám định kỳ",
          "patient": {
            "name": "Nguyễn Văn A",
            "phone": "0912345678"
          },
          "doctor": {
            "name": "BS. Trần Thị B",
            "specialty": "Nội tổng quát"
          },
          "services": [
            {
              "name": "Khám tổng quát",
              "price": 200000
            }
          ]
        }
        // ... more appointments
      ],
      "statistics": {
        "total": 15,
        "byStatus": {
          "pending": 3,
          "confirmed": 8,
          "completed": 3,
          "cancelled": 1
        },
        "totalRevenue": 3000000
      },
      "filter": {
        "startDate": "2024-12-09",
        "endDate": "2024-12-15",
        "status": null
      }
    }
  }
}
```

#### Frontend Xử Lý:

```javascript
// Hiển thị danh sách lịch hẹn
const appointments = response.result.data.appointments
appointments.forEach((apt) => {
  console.log(`Bệnh nhân: ${apt.patient.name}`)
  console.log(`Bác sĩ: ${apt.doctor.name}`)
  console.log(`Thời gian: ${apt.appointmentDate} ${apt.appointmentStartTime}`)
  console.log(`Trạng thái: ${apt.status}`)
})

// Hiển thị thống kê
const stats = response.result.data.statistics
console.log(`Tổng số: ${stats.total}`)
console.log(`Pending: ${stats.byStatus.pending}`)
console.log(`Doanh thu: ${stats.totalRevenue.toLocaleString('vi-VN')} VNĐ`)
```

---

### 2. 💰 Thống Kê Doanh Thu (`get_appointment_revenue`)

#### Ví dụ câu hỏi:

- "Doanh thu tháng này là bao nhiêu?"
- "Tính doanh thu tuần trước"
- "Doanh thu từ ngày 1/12 đến 10/12"
- "Báo cáo doanh thu tháng 11"

#### Request:

```json
{
  "message": "Doanh thu tháng này là bao nhiêu?"
}
```

#### Response:

```json
{
  "message": "Xử lý thành công",
  "success": true,
  "result": {
    "message": "Tổng doanh thu: 15,000,000 VNĐ",
    "intent": "get_appointment_revenue",
    "data": {
      "totalRevenue": 15000000,
      "averageRevenue": 500000,
      "totalAppointments": 30,
      "revenueByDate": [
        {
          "date": "2024-12-01",
          "revenue": 1200000
        },
        {
          "date": "2024-12-02",
          "revenue": 800000
        },
        {
          "date": "2024-12-03",
          "revenue": 1500000
        }
        // ... more dates
      ],
      "filter": {
        "startDate": "2024-12-01",
        "endDate": "2024-12-31"
      }
    }
  }
}
```

#### Frontend Xử Lý:

```javascript
const revenueData = response.result.data

// Hiển thị tổng quan
console.log(`Tổng doanh thu: ${revenueData.totalRevenue.toLocaleString('vi-VN')} VNĐ`)
console.log(`Doanh thu TB/lịch: ${revenueData.averageRevenue.toLocaleString('vi-VN')} VNĐ`)
console.log(`Tổng lịch hẹn: ${revenueData.totalAppointments}`)

// Vẽ biểu đồ doanh thu theo ngày
const chartData = revenueData.revenueByDate.map((item) => ({
  x: new Date(item.date),
  y: item.revenue
}))

// Sử dụng Chart.js, Recharts, hoặc thư viện khác
drawRevenueChart(chartData)
```

---

### 3. 📥 Xuất File (`export_appointments`)

#### Ví dụ câu hỏi:

- "Xuất file Excel lịch hẹn tháng 12"
- "Export PDF lịch hẹn đã xác nhận"
- "Tải file CSV tất cả lịch hẹn tuần này"
- "Xuất báo cáo lịch hẹn hoàn thành tháng trước"

#### Request:

```json
{
  "message": "Xuất file Excel lịch hẹn tháng 12"
}
```

#### Response:

```json
{
  "message": "Xử lý thành công",
  "success": true,
  "result": {
    "message": "Dữ liệu xuất file EXCEL đã sẵn sàng (45 bản ghi)",
    "intent": "export_appointments",
    "requiresAction": true,
    "actionType": "export_file",
    "data": [
      {
        "id": "674a1b8c9d8e7f6a5b4c3d2e",
        "patientName": "Nguyễn Văn A",
        "patientPhone": "0912345678",
        "doctorName": "BS. Trần Thị B",
        "services": "Khám tổng quát, Xét nghiệm máu",
        "appointmentDate": "2024-12-15",
        "startTime": "09:00",
        "endTime": "09:30",
        "status": "completed",
        "price": 500000,
        "isCheckout": "Đã thanh toán",
        "note": "Khám định kỳ"
      }
      // ... more records
    ],
    "actionData": {
      "format": "excel",
      "totalRecords": 45,
      "filter": {
        "startDate": "2024-12-01",
        "endDate": "2024-12-31",
        "status": null
      }
    }
  }
}
```

#### Frontend Xử Lý:

**✅ Quan trọng**: Backend chỉ trả về data, Frontend phải tự generate file!

```javascript
// Kiểm tra nếu cần export
if (response.result.requiresAction && response.result.actionType === 'export_file') {
  const exportData = response.result.data
  const format = response.result.actionData.format

  switch (format) {
    case 'excel':
      exportToExcel(exportData)
      break
    case 'pdf':
      exportToPDF(exportData)
      break
    case 'csv':
      exportToCSV(exportData)
      break
  }
}

// Ví dụ export Excel với SheetJS (xlsx)
function exportToExcel(data) {
  import('xlsx').then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments')

    // Tải file
    XLSX.writeFile(workbook, `appointments_${Date.now()}.xlsx`)
  })
}

// Ví dụ export CSV
function exportToCSV(data) {
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map((row) => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `appointments_${Date.now()}.csv`
  link.click()
}

// Ví dụ export PDF với jsPDF
function exportToPDF(data) {
  import('jspdf').then(({ jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF()

      doc.text('Danh Sách Lịch Hẹn', 14, 15)

      doc.autoTable({
        head: [['Bệnh nhân', 'SĐT', 'Bác sĩ', 'Ngày', 'Giờ', 'Trạng thái', 'Giá']],
        body: data.map((apt) => [
          apt.patientName,
          apt.patientPhone,
          apt.doctorName,
          apt.appointmentDate,
          apt.startTime,
          apt.status,
          apt.price.toLocaleString('vi-VN')
        ]),
        startY: 20
      })

      doc.save(`appointments_${Date.now()}.pdf`)
    })
  })
}
```

**Cài đặt thư viện cần thiết:**

```bash
npm install xlsx jspdf jspdf-autotable
```

---

### 4. 🔍 Tìm Kiếm Lịch Hẹn (`search_appointments`)

#### Ví dụ câu hỏi:

- "Tìm lịch hẹn của bệnh nhân Nguyễn Văn A"
- "Tìm theo số điện thoại 0912345678"
- "Tìm lịch hẹn của bác sĩ Trần Thị B"
- "Tìm kiếm lịch hẹn của BS Nguyễn"

#### Request:

```json
{
  "message": "Tìm lịch hẹn của bệnh nhân Nguyễn Văn A"
}
```

#### Response:

```json
{
  "message": "Xử lý thành công",
  "success": true,
  "result": {
    "message": "Tìm thấy 5 kết quả",
    "intent": "search_appointments",
    "data": {
      "results": [
        {
          "_id": "674a1b8c9d8e7f6a5b4c3d2e",
          "patientId": "674a1b8c9d8e7f6a5b4c3d2f",
          "doctorId": "674a1b8c9d8e7f6a5b4c3d30",
          "appointmentDate": "2024-12-15T00:00:00.000Z",
          "appointmentStartTime": "09:00",
          "appointmentEndTime": "09:30",
          "status": "confirmed",
          "price": 200000,
          "patient": {
            "name": "Nguyễn Văn A",
            "phone": "0912345678"
          },
          "doctor": {
            "name": "BS. Trần Thị B",
            "specialty": "Nội tổng quát"
          },
          "services": [
            {
              "name": "Khám tổng quát",
              "price": 200000
            }
          ]
        }
        // ... more results
      ],
      "searchCriteria": {
        "query": "Nguyễn Văn A",
        "searchBy": "patient_name"
      }
    }
  }
}
```

#### Frontend Xử Lý:

```javascript
const searchResults = response.result.data.results
const criteria = response.result.data.searchCriteria

console.log(`Tìm kiếm theo: ${criteria.searchBy}`)
console.log(`Từ khóa: ${criteria.query}`)
console.log(`Tìm thấy: ${searchResults.length} kết quả`)

// Hiển thị kết quả
searchResults.forEach((apt) => {
  displayAppointmentCard(apt)
})
```

---

## ⚠️ Error Handling

### Response Lỗi:

```json
{
  "message": "Có lỗi xảy ra khi xử lý câu hỏi",
  "success": false,
  "error": "Error message"
}
```

### Frontend Xử Lý Lỗi:

```javascript
try {
  const response = await fetch('/admin-chatbot/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: userInput })
  })

  const data = await response.json()

  if (!data.success) {
    showErrorMessage(data.message)
    return
  }

  // Xử lý response thành công
  handleChatbotResponse(data.result)
} catch (error) {
  showErrorMessage('Không thể kết nối đến server')
}
```

---

## 🧪 Testing Examples

### Example 1: Lấy lịch hẹn hôm nay

```bash
curl -X POST http://localhost:3000/admin-chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Cho tôi xem lịch hẹn hôm nay"}'
```

### Example 2: Thống kê doanh thu

```bash
curl -X POST http://localhost:3000/admin-chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Doanh thu tháng 12 là bao nhiêu?"}'
```

### Example 3: Xuất file

```bash
curl -X POST http://localhost:3000/admin-chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Xuất file Excel lịch hẹn tuần này"}'
```

### Example 4: Tìm kiếm

```bash
curl -X POST http://localhost:3000/admin-chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Tìm lịch hẹn của bệnh nhân Nguyễn Văn A"}'
```

---

## 📊 UI/UX Recommendations

### 1. Chat Interface

```javascript
// Component gợi ý
const ChatInterface = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    // Thêm message của user
    setMessages([...messages, { type: 'user', text: input }])

    // Gọi API
    const response = await fetch('/admin-chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    })

    const data = await response.json()

    // Thêm response của bot
    setMessages([...messages, { type: 'user', text: input }, { type: 'bot', data: data.result }])

    setInput('')
  }

  return (
    <div className='chat-interface'>
      <div className='messages'>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder='Hỏi gì đó... (vd: Cho tôi xem lịch hẹn tuần này)'
      />
    </div>
  )
}
```

### 2. Quick Actions

Hiển thị các nút gợi ý câu hỏi:

```javascript
const QuickActions = ({ onSelect }) => {
  const suggestions = [
    'Cho tôi xem lịch hẹn hôm nay',
    'Doanh thu tháng này',
    'Xuất file Excel lịch hẹn tuần này',
    'Tìm lịch hẹn pending'
  ]

  return (
    <div className='quick-actions'>
      {suggestions.map((text) => (
        <button onClick={() => onSelect(text)}>{text}</button>
      ))}
    </div>
  )
}
```

### 3. Response Renderer

Render khác nhau theo intent:

```javascript
const ChatMessage = ({ message }) => {
  if (message.type === 'user') {
    return <div className='user-message'>{message.text}</div>
  }

  const { intent, data } = message.data

  switch (intent) {
    case 'get_appointments':
      return <AppointmentsList data={data} />

    case 'get_appointment_revenue':
      return <RevenueChart data={data} />

    case 'export_appointments':
      return <ExportAction data={data} />

    case 'search_appointments':
      return <SearchResults data={data} />

    default:
      return <div className='bot-message'>{message.data.message}</div>
  }
}
```

---

## 🎨 Styling Suggestions

```css
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.user-message {
  background: #007bff;
  color: white;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 10px;
  max-width: 70%;
  margin-left: auto;
}

.bot-message {
  background: #f1f1f1;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 10px;
  max-width: 70%;
}

.quick-actions {
  display: flex;
  gap: 10px;
  padding: 10px;
  flex-wrap: wrap;
}

.quick-actions button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-actions button:hover {
  background: #007bff;
  color: white;
}
```

---

## 🔐 Security Notes

1. **Authentication**: Thêm middleware xác thực admin trước khi cho phép truy cập
2. **Rate Limiting**: Giới hạn số request để tránh abuse
3. **Input Validation**: Validate message không quá dài (max 500 chars)
4. **CORS**: Cấu hình CORS đúng cho production

---

## 📞 Support

Nếu có vấn đề, liên hệ:

- Backend Team
- Email: backend@clinic.com
- Slack: #backend-support

---

## 🚀 Deployment Checklist

- [ ] Cấu hình `GOOGLE_GENERATIVE_AI_API_KEY` trong `.env`
- [ ] Test tất cả 4 intent
- [ ] Kiểm tra export file works trên browser
- [ ] Setup error tracking (Sentry)
- [ ] Configure CORS cho production domain
- [ ] Add authentication middleware
- [ ] Setup rate limiting
- [ ] Performance testing với nhiều queries

---

**Last Updated**: December 13, 2025
**Version**: 1.0.0
