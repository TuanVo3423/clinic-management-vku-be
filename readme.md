# RecyAI Clinic API - Hệ thống quản lý phòng khám Đông y

## Tổng quan

Hệ thống API quản lý phòng khám Đông y được xây dựng bằng Node.js, Express và MongoDB. API này cung cấp đầy đủ các chức năng quản lý bệnh nhân, bác sĩ, dịch vụ, lịch hẹn, giường bệnh và thông báo.

**✨ NEW: Blockchain Integration** - Hệ thống đã tích hợp blockchain để đảm bảo tính toàn vẹn dữ liệu appointments!

**Base URL:** `http://localhost:3000`

## 🔐 Blockchain Features

- **Data Integrity**: Mỗi appointment được hash và lưu lên blockchain
- **Tamper Detection**: Tự động phát hiện nếu dữ liệu bị sửa đổi
- **Immutable History**: Lịch sử thay đổi không thể xóa
- **Verify API**: Endpoint để kiểm tra tính toàn vẹn

👉 **Quick Start:** [BLOCKCHAIN_QUICK_START.md](./BLOCKCHAIN_QUICK_START.md)  
📚 **Full Guide:** [BLOCKCHAIN_INTEGRATION_GUIDE.md](./BLOCKCHAIN_INTEGRATION_GUIDE.md)

## Mục lục

- [1. Patients (Bệnh nhân)](#1-patients-bệnh-nhân)
- [2. Doctors (Bác sĩ)](#2-doctors-bác-sĩ)
- [3. Services (Dịch vụ)](#3-services-dịch-vụ)
- [4. Appointments (Lịch hẹn)](#4-appointments-lịch-hẹn)
  - [4.1 Blockchain Integration](#41-blockchain-integration-new)
- [5. Beds (Giường bệnh)](#5-beds-giường-bệnh)
- [6. Notifications (Thông báo)](#6-notifications-thông-báo)

---

## 1. Patients (Bệnh nhân)

**Endpoint:** `/patients`  
**Mô tả:** Quản lý thông tin bệnh nhân

### Các API:

#### 1.1 Tạo bệnh nhân mới

- **Method:** `POST`
- **URL:** `/patients`
- **Body:**

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "email": "nguyenvana@email.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

#### 1.2 Lấy danh sách tất cả bệnh nhân

- **Method:** `GET`
- **URL:** `/patients`

#### 1.3 Lấy thông tin bệnh nhân theo ID

- **Method:** `GET`
- **URL:** `/patients/:patient_id`
- **Params:** `patient_id` (ObjectId)

#### 1.4 Lấy bệnh nhân theo số điện thoại

- **Method:** `GET`
- **URL:** `/patients/phone/:phone`
- **Params:** `phone` (string)

#### 1.5 Cập nhật thông tin bệnh nhân

- **Method:** `PATCH`
- **URL:** `/patients/:patient_id`
- **Params:** `patient_id` (ObjectId)
- **Body:**

```json
{
  "fullName": "Nguyễn Văn A Updated",
  "email": "updated@email.com"
}
```

#### 1.6 Xóa bệnh nhân

- **Method:** `DELETE`
- **URL:** `/patients/:patient_id`
- **Params:** `patient_id` (ObjectId)

---

## 2. Doctors (Bác sĩ)

**Endpoint:** `/doctors`  
**Mô tả:** Quản lý thông tin bác sĩ

### Các API:

#### 2.1 Tạo bác sĩ mới

- **Method:** `POST`
- **URL:** `/doctors`
- **Body:**

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

#### 2.2 Lấy danh sách tất cả bác sĩ

- **Method:** `GET`
- **URL:** `/doctors`

#### 2.3 Lấy bác sĩ có thể làm việc trong ngày

- **Method:** `GET`
- **URL:** `/doctors/available?day=1`
- **Query Params:** `day` (0-6, 0=Chủ nhật)

#### 2.4 Lấy thông tin bác sĩ theo ID

- **Method:** `GET`
- **URL:** `/doctors/:doctor_id`
- **Params:** `doctor_id` (ObjectId)

#### 2.5 Cập nhật thông tin bác sĩ

- **Method:** `PATCH`
- **URL:** `/doctors/:doctor_id`
- **Params:** `doctor_id` (ObjectId)
- **Body:**

```json
{
  "specialization": "Châm cứu và massage",
  "phone": "0987654322"
}
```

#### 2.6 Xóa bác sĩ

- **Method:** `DELETE`
- **URL:** `/doctors/:doctor_id`
- **Params:** `doctor_id` (ObjectId)

---

## 3. Services (Dịch vụ)

**Endpoint:** `/services`  
**Mô tả:** Quản lý dịch vụ phòng khám

### Các API:

#### 3.1 Tạo dịch vụ mới

- **Method:** `POST`
- **URL:** `/services`
- **Body:**

```json
{
  "name": "Khám và châm cứu",
  "description": "Khám bệnh và điều trị bằng phương pháp châm cứu",
  "duration": 60,
  "price": 300000
}
```

#### 3.2 Lấy danh sách tất cả dịch vụ

- **Method:** `GET`
- **URL:** `/services`

#### 3.3 Lọc dịch vụ theo khoảng giá

- **Method:** `GET`
- **URL:** `/services?minPrice=100000&maxPrice=500000`
- **Query Params:**
  - `minPrice` (number): Giá tối thiểu
  - `maxPrice` (number): Giá tối đa

#### 3.4 Lấy thông tin dịch vụ theo ID

- **Method:** `GET`
- **URL:** `/services/:service_id`
- **Params:** `service_id` (ObjectId)

#### 3.5 Cập nhật thông tin dịch vụ

- **Method:** `PATCH`
- **URL:** `/services/:service_id`
- **Params:** `service_id` (ObjectId)
- **Body:**

```json
{
  "price": 350000,
  "description": "Khám bệnh và điều trị bằng phương pháp châm cứu - Cập nhật"
}
```

#### 3.6 Xóa dịch vụ

- **Method:** `DELETE`
- **URL:** `/services/:service_id`
- **Params:** `service_id` (ObjectId)

---

## 4. Appointments (Lịch hẹn)

**Endpoint:** `/appointments`  
**Mô tả:** Quản lý lịch hẹn khám bệnh

### Các API:

#### 4.1 Tạo lịch hẹn mới

- **Method:** `POST`
- **URL:** `/appointments`
- **Body:**

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

#### 4.2 Tạo lịch hẹn với giường bệnh

- **Method:** `POST`
- **URL:** `/appointments`
- **Body:**

```json
{
  "patientId": "655f8c123456789012345678",
  "doctorId": "655f8c123456789012345679",
  "serviceId": "655f8c12345678901234567a",
  "bedId": "655f8c12345678901234567d",
  "appointmentDate": "2025-10-15",
  "appointmentStartTime": "09:00",
  "appointmentEndTime": "11:00",
  "isEmergency": false,
  "note": "Patient requires bed rest"
}
```

#### 4.3 Lấy danh sách tất cả lịch hẹn

- **Method:** `GET`
- **URL:** `/appointments`

#### 4.4 Lấy lịch hẹn khẩn cấp

- **Method:** `GET`
- **URL:** `/appointments/emergency`

#### 4.5 Lấy lịch hẹn theo ngày

- **Method:** `GET`
- **URL:** `/appointments/by-date?date=2023-12-01`
- **Query Params:** `date` (YYYY-MM-DD)

#### 4.6 Lấy lịch hẹn của bệnh nhân

- **Method:** `GET`
- **URL:** `/appointments/patient/:patient_id`
- **Params:** `patient_id` (ObjectId)

#### 4.7 Lấy lịch hẹn của bác sĩ

- **Method:** `GET`
- **URL:** `/appointments/doctor/:doctor_id`
- **Params:** `doctor_id` (ObjectId)

#### 4.8 Lấy thông tin lịch hẹn theo ID

- **Method:** `GET`
- **URL:** `/appointments/:appointment_id`
- **Params:** `appointment_id` (ObjectId)

#### 4.9 Cập nhật lịch hẹn

- **Method:** `PATCH`
- **URL:** `/appointments/:appointment_id`
- **Params:** `appointment_id` (ObjectId)
- **Body:**

```json
{
  "appointmentDate": "2023-12-15T10:00:00.000Z",
  "note": "Thay đổi giờ hẹn"
}
```

#### 4.10 Hủy lịch hẹn

- **Method:** `PATCH`
- **URL:** `/appointments/:appointment_id/cancel`
- **Params:** `appointment_id` (ObjectId)

#### 4.11 Xóa lịch hẹn

- **Method:** `DELETE`
- **URL:** `/appointments/:appointment_id`
- **Params:** `appointment_id` (ObjectId)

### 4.1 Blockchain Integration ✨ NEW

#### 4.12 Verify Tính toàn vẹn dữ liệu

- **Method:** `GET`
- **URL:** `/appointments/:appointment_id/verify`
- **Params:** `appointment_id` (ObjectId)
- **Mô tả:** Kiểm tra xem dữ liệu appointment có bị sửa đổi không bằng cách so sánh với blockchain
- **Response (Valid):**

```json
{
  "success": true,
  "appointmentId": "67a1b2c3...",
  "isValid": true,
  "currentHash": "0xabc123...",
  "blockchainHash": "0xabc123...",
  "message": "✅ Data integrity verified successfully",
  "blockchainInfo": {
    "blockchainHash": "0xabc123...",
    "blockchainTxHash": "0xtx456...",
    "blockchainVerified": true
  }
}
```

- **Response (Tampered):**

```json
{
  "success": true,
  "appointmentId": "67a1b2c3...",
  "isValid": false,
  "currentHash": "0xabc123...",
  "blockchainHash": "0xdef456...",
  "message": "Data has been tampered with!",
  "warning": "⚠️ DATA INTEGRITY VIOLATION: This appointment has been tampered with!"
}
```

#### 4.13 Lấy Lịch sử thay đổi từ Blockchain

- **Method:** `GET`
- **URL:** `/appointments/:appointment_id/blockchain-history`
- **Params:** `appointment_id` (ObjectId)
- **Mô tả:** Lấy toàn bộ lịch sử hash của appointment từ blockchain
- **Response:**

```json
{
  "success": true,
  "appointmentId": "67a1b2c3...",
  "history": [
    "0xhash1...", // Created
    "0xhash2...", // Updated 1
    "0xhash3..."  // Updated 2
  ],
  "message": "Found 3 change(s) on blockchain"
}
```

**📝 Lưu ý:**
- Mỗi khi tạo hoặc update appointment, hash tự động được lưu lên blockchain
- Việc lưu hash là async, không làm chậm response
- Blockchain đảm bảo dữ liệu không thể bị sửa đổi sau khi lưu
- Chi phí: FREE trên local/testnet, ~$0.20-$2 trên mainnet

**🔧 Setup blockchain:** Xem [BLOCKCHAIN_QUICK_START.md](./BLOCKCHAIN_QUICK_START.md)

---

## 5. Beds (Giường bệnh)

**Endpoint:** `/beds`  
**Mô tả:** Quản lý giường bệnh và tình trạng sử dụng

### Các API:

#### 5.1 Tạo giường bệnh mới

- **Method:** `POST`
- **URL:** `/beds`
- **Body:**

```json
{
  "bedNumber": 11,
  "bedName": "Bed 11 - VIP Room",
  "department": "VIP",
  "description": "Private VIP room bed"
}
```

#### 5.2 Lấy danh sách tất cả giường bệnh

- **Method:** `GET`
- **URL:** `/beds`

#### 5.3 Lấy giường bệnh có sẵn trong khoảng thời gian

- **Method:** `GET`
- **URL:** `/beds/available?appointmentDate=2025-10-15&appointmentStartTime=09:00&appointmentEndTime=11:00`
- **Query Params:**
  - `appointmentDate` (YYYY-MM-DD): Ngày hẹn
  - `appointmentStartTime` (HH:MM): Giờ bắt đầu
  - `appointmentEndTime` (HH:MM): Giờ kết thúc

#### 5.4 Kiểm tra tính khả dụng của giường

- **Method:** `GET`
- **URL:** `/beds/check-availability?bedId=bed_id&appointmentDate=2025-10-15&appointmentStartTime=09:00&appointmentEndTime=11:00`
- **Query Params:**
  - `bedId` (ObjectId): ID giường bệnh
  - `appointmentDate` (YYYY-MM-DD): Ngày hẹn
  - `appointmentStartTime` (HH:MM): Giờ bắt đầu
  - `appointmentEndTime` (HH:MM): Giờ kết thúc

#### 5.5 Lấy thông tin giường bệnh theo ID

- **Method:** `GET`
- **URL:** `/beds/:bed_id`
- **Params:** `bed_id` (ObjectId)

#### 5.6 Lấy lịch hẹn của giường bệnh

- **Method:** `GET`
- **URL:** `/beds/:bed_id/appointments`
- **Params:** `bed_id` (ObjectId)

#### 5.7 Cập nhật thông tin giường bệnh

- **Method:** `PUT`
- **URL:** `/beds/:bed_id`
- **Params:** `bed_id` (ObjectId)
- **Body:**

```json
{
  "isAvailable": false,
  "description": "Under maintenance"
}
```

#### 5.8 Xóa giường bệnh

- **Method:** `DELETE`
- **URL:** `/beds/:bed_id`
- **Params:** `bed_id` (ObjectId)

---

## 6. Notifications (Thông báo)

**Endpoint:** `/notifications`  
**Mô tả:** Quản lý thông báo gửi cho bệnh nhân và bác sĩ

### Các API:

#### 6.1 Tạo thông báo mới

- **Method:** `POST`
- **URL:** `/notifications`
- **Body:**

```json
{
  "recipientType": "patient",
  "recipientId": "655f8c123456789012345678",
  "type": "appointment_created",
  "message": "Lịch hẹn của bạn đã được tạo thành công",
  "channel": "sms"
}
```

#### 6.2 Lấy danh sách tất cả thông báo

- **Method:** `GET`
- **URL:** `/notifications`

#### 6.3 Lấy thông báo gửi thất bại

- **Method:** `GET`
- **URL:** `/notifications/failed`

#### 6.4 Lấy thông báo theo người nhận

- **Method:** `GET`
- **URL:** `/notifications/recipient/:recipient_id?recipient_type=patient`
- **Params:** `recipient_id` (ObjectId)
- **Query Params:** `recipient_type` (patient/doctor)

#### 6.5 Lấy thông tin thông báo theo ID

- **Method:** `GET`
- **URL:** `/notifications/:notification_id`
- **Params:** `notification_id` (ObjectId)

#### 6.6 Đánh dấu thông báo thất bại

- **Method:** `PATCH`
- **URL:** `/notifications/:notification_id/failed`
- **Params:** `notification_id` (ObjectId)

#### 6.7 Thử lại gửi thông báo

- **Method:** `PATCH`
- **URL:** `/notifications/:notification_id/retry`
- **Params:** `notification_id` (ObjectId)

#### 6.8 Xóa thông báo

- **Method:** `DELETE`
- **URL:** `/notifications/:notification_id`
- **Params:** `notification_id` (ObjectId)

---

## Biến môi trường (Environment Variables)

### Postman Collection Variables:

```
baseUrl: http://localhost:3000
bed_id: (được cập nhật động)
patient_id: 655f8c123456789012345678
doctor_id: 655f8c123456789012345679
service_id: 655f8c12345678901234567a
appointment_id: 655f8c12345678901234567b
```

### Database Environment Variables:

```
DB_PATIENTS_COLLECTION=patients
DB_DOCTORS_COLLECTION=doctors
DB_SERVICES_COLLECTION=services
DB_APPOINTMENTS_COLLECTION=appointments
DB_BEDS_COLLECTION=beds
DB_NOTIFICATIONS_COLLECTION=notifications
```

---

## Luồng hoạt động chính

### 1. Đặt lịch hẹn cơ bản:

1. Tạo/tìm bệnh nhân (nếu chưa có)
2. Chọn dịch vụ
3. Chọn bác sĩ (tùy chọn)
4. Tạo lịch hẹn
5. Hệ thống tự động gửi thông báo

### 2. Đặt lịch hẹn với giường bệnh:

1. Kiểm tra giường bệnh có sẵn
2. Tạo lịch hẹn với thông tin giường
3. Giường sẽ được đặt trước trong khoảng thời gian đã chọn

### 3. Quản lý lịch hẹn:

- Xem lịch hẹn theo ngày/bác sĩ/bệnh nhân
- Cập nhật thông tin lịch hẹn
- Hủy lịch hẹn
- Xử lý lịch hẹn khẩn cấp

### 4. Quản lý giường bệnh:

- Xem tình trạng giường
- Kiểm tra khả dụng
- Theo dõi lịch sử sử dụng

### 5. Thông báo:

- Tự động gửi khi tạo/cập nhật/hủy lịch hẹn
- Theo dõi trạng thái gửi
- Retry cho thông báo thất bại

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Lưu ý quan trọng

- Số điện thoại bệnh nhân là unique (dùng để nhận diện)
- Lịch hẹn có history tracking tự động
- Thông báo được gửi tự động khi có thay đổi lịch hẹn
- Hỗ trợ lịch hẹn khẩn cấp
- Giường bệnh có thể được đặt trước trong khoảng thời gian cụ thể
- Hệ thống kiểm tra xung đột thời gian cho giường bệnh
- Tất cả các ObjectId phải là MongoDB ObjectId hợp lệ
