# API Documentation - Hệ thống quản lý phòng khám Đông y

## Tổng quan
Hệ thống API quản lý phòng khám Đông y được xây dựng bằng Node.js, Express và MongoDB.

## Collections

### 1. Patients (Bệnh nhân)
- **Endpoint**: `/patients`
- **Mô tả**: Quản lý thông tin bệnh nhân

#### Các API:
- `POST /patients` - Tạo bệnh nhân mới
- `GET /patients` - Lấy danh sách tất cả bệnh nhân
- `GET /patients/:patient_id` - Lấy thông tin bệnh nhân theo ID
- `GET /patients/phone/:phone` - Lấy bệnh nhân theo số điện thoại
- `PATCH /patients/:patient_id` - Cập nhật thông tin bệnh nhân
- `DELETE /patients/:patient_id` - Xóa bệnh nhân

#### Body mẫu cho tạo bệnh nhân:
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "email": "nguyenvana@email.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

### 2. Doctors (Bác sĩ)
- **Endpoint**: `/doctors`
- **Mô tả**: Quản lý thông tin bác sĩ

#### Các API:
- `POST /doctors` - Tạo bác sĩ mới
- `GET /doctors` - Lấy danh sách tất cả bác sĩ
- `GET /doctors/available?day=1` - Lấy bác sĩ có thể làm việc trong ngày (0-6, 0=Chủ nhật)
- `GET /doctors/:doctor_id` - Lấy thông tin bác sĩ theo ID
- `PATCH /doctors/:doctor_id` - Cập nhật thông tin bác sĩ
- `DELETE /doctors/:doctor_id` - Xóa bác sĩ

#### Body mẫu cho tạo bác sĩ:
```json
{
  "name": "Bác sĩ Nguyễn Thị B",
  "specialization": "Châm cứu",
  "phone": "0987654321",
  "email": "bsnguyenthib@clinic.com",
  "workingDays": [1, 2, 3, 4, 5],
  "startTime": "08:00",
  "endTime": "17:00"
}
```

### 3. Services (Dịch vụ)
- **Endpoint**: `/services`
- **Mô tả**: Quản lý dịch vụ phòng khám

#### Các API:
- `POST /services` - Tạo dịch vụ mới
- `GET /services` - Lấy danh sách tất cả dịch vụ
- `GET /services?minPrice=100000&maxPrice=500000` - Lọc dịch vụ theo khoảng giá
- `GET /services/:service_id` - Lấy thông tin dịch vụ theo ID
- `PATCH /services/:service_id` - Cập nhật thông tin dịch vụ
- `DELETE /services/:service_id` - Xóa dịch vụ

#### Body mẫu cho tạo dịch vụ:
```json
{
  "name": "Khám và châm cứu",
  "description": "Khám bệnh và điều trị bằng phương pháp châm cứu",
  "duration": 60,
  "price": 300000
}
```

### 4. Appointments (Lịch hẹn)
- **Endpoint**: `/appointments`
- **Mô tả**: Quản lý lịch hẹn khám

#### Các API:
- `POST /appointments` - Tạo lịch hẹn mới
- `GET /appointments` - Lấy danh sách tất cả lịch hẹn
- `GET /appointments/emergency` - Lấy lịch hẹn khẩn cấp
- `GET /appointments/by-date?date=2023-12-01` - Lấy lịch hẹn theo ngày
- `GET /appointments/patient/:patient_id` - Lấy lịch hẹn của bệnh nhân
- `GET /appointments/doctor/:doctor_id` - Lấy lịch hẹn của bác sĩ
- `GET /appointments/:appointment_id` - Lấy thông tin lịch hẹn theo ID
- `PATCH /appointments/:appointment_id` - Cập nhật lịch hẹn
- `PATCH /appointments/:appointment_id/cancel` - Hủy lịch hẹn
- `DELETE /appointments/:appointment_id` - Xóa lịch hẹn

#### Body mẫu cho tạo lịch hẹn:
```json
{
  "patientId": "655f8c123456789012345678",
  "doctorId": "655f8c123456789012345679",
  "serviceId": "655f8c12345678901234567a",
  "appointmentDate": "2023-12-15T09:00:00.000Z",
  "isEmergency": false,
  "note": "Bệnh nhân có triệu chứng đau lưng"
}
```

### 5. Notifications (Thông báo)
- **Endpoint**: `/notifications`
- **Mô tả**: Quản lý thông báo gửi cho bệnh nhân/bác sĩ

#### Các API:
- `POST /notifications` - Tạo thông báo mới
- `GET /notifications` - Lấy danh sách tất cả thông báo
- `GET /notifications/failed` - Lấy thông báo gửi thất bại
- `GET /notifications/recipient/:recipient_id?recipient_type=patient` - Lấy thông báo theo người nhận
- `GET /notifications/:notification_id` - Lấy thông tin thông báo theo ID
- `PATCH /notifications/:notification_id/failed` - Đánh dấu thông báo thất bại
- `PATCH /notifications/:notification_id/retry` - Thử lại gửi thông báo
- `DELETE /notifications/:notification_id` - Xóa thông báo

#### Body mẫu cho tạo thông báo:
```json
{
  "recipientType": "patient",
  "recipientId": "655f8c123456789012345678",
  "type": "appointment_created",
  "message": "Lịch hẹn của bạn đã được tạo thành công",
  "channel": "sms"
}
```

## Thiết lập Database

### Environment Variables
Thêm vào file `.env`:
```
DB_PATIENTS_COLLECTION=patients
DB_DOCTORS_COLLECTION=doctors
DB_SERVICES_COLLECTION=services
DB_APPOINTMENTS_COLLECTION=appointments
DB_NOTIFICATIONS_COLLECTION=notifications
```

### Tạo Indexes
Chạy lệnh để tạo indexes tối ưu cho database:
```javascript
import createIndexes from './src/utils/createIndexes'
await createIndexes()
```

## Luồng hoạt động chính

### 1. Đặt lịch hẹn mới:
1. Tạo/tìm bệnh nhân (nếu chưa có)
2. Chọn dịch vụ
3. Chọn bác sĩ (tùy chọn)
4. Tạo lịch hẹn
5. Hệ thống tự động gửi thông báo

### 2. Quản lý lịch hẹn:
- Xem lịch hẹn theo ngày/bác sĩ/bệnh nhân
- Cập nhật thông tin lịch hẹn
- Hủy lịch hẹn
- Xử lý lịch hẹn khẩn cấp

### 3. Thông báo:
- Tự động gửi khi tạo/cập nhật/hủy lịch hẹn
- Theo dõi trạng thái gửi
- Retry cho thông báo thất bại

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Notes
- Số điện thoại bệnh nhân là unique (dùng để nhận diện)
- Lịch hẹn có history tracking tự động
- Thông báo được gửi tự động khi có thay đổi lịch hẹn
- Hỗ trợ lịch hẹn khẩn cấp