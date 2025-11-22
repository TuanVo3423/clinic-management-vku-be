# 🚀 Quick Start: Blockchain Integration

Hướng dẫn nhanh để setup blockchain cho appointment management system.

## ⚡ Bước 1: Cài đặt Dependencies

```bash
npm install ethers
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

## ⚡ Bước 2: Start Local Blockchain

Mở terminal và chạy:

```bash
npm run blockchain:node
```

**Kết quả:** Bạn sẽ thấy:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

⚠️ **QUAN TRỌNG:** Copy `Account #0` và `Private Key` để dùng ở bước sau.

## ⚡ Bước 3: Compile Smart Contract

Mở terminal mới và chạy:

```bash
npm run blockchain:compile
```

## ⚡ Bước 4: Deploy Contract

```bash
npm run blockchain:deploy
```

**Kết quả:**
```
✅ AppointmentRegistry deployed successfully!
📝 Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🔧 Add this to your .env file:
============================================================
BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
============================================================
```

## ⚡ Bước 5: Cấu hình .env

Tạo/cập nhật file `.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

⚠️ Thay `BLOCKCHAIN_PRIVATE_KEY` và `BLOCKCHAIN_CONTRACT_ADDRESS` bằng giá trị thực tế từ bước 2 và 4.

## ⚡ Bước 6: Start Backend Server

```bash
npm run dev
```

**Kiểm tra log:**
```
✅ Connected to AppointmentRegistry contract at: 0x5FbDB...
```

✅ **XONG!** Hệ thống đã sẵn sàng.

---

## 🧪 Test Blockchain Integration

### Test 1: Tạo Appointment

```bash
curl -X POST http://localhost:4000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "YOUR_PATIENT_ID",
    "doctorId": "YOUR_DOCTOR_ID",
    "serviceIds": ["YOUR_SERVICE_ID"],
    "appointmentDate": "2024-01-15",
    "appointmentStartTime": "09:00",
    "appointmentEndTime": "10:00"
  }'
```

**Kiểm tra log backend:**
```
📝 Storing appointment 67a1b2... to blockchain...
✅ Appointment stored on blockchain. Tx hash: 0x123abc...
```

### Test 2: Verify Tính toàn vẹn

```bash
curl http://localhost:4000/appointments/<APPOINTMENT_ID>/verify
```

**Kết quả (Valid):**
```json
{
  "success": true,
  "isValid": true,
  "message": "✅ Data integrity verified successfully"
}
```

### Test 3: Lấy Blockchain History

```bash
curl http://localhost:4000/appointments/<APPOINTMENT_ID>/blockchain-history
```

---

## 🛠️ Troubleshooting

### ❌ Lỗi: "Blockchain service not ready"

**Nguyên nhân:** Chưa cấu hình `.env` hoặc contract chưa deploy.

**Giải pháp:**
1. Kiểm tra file `.env` có đầy đủ 3 biến
2. Đảm bảo `blockchain:node` đang chạy
3. Deploy lại contract: `npm run blockchain:deploy`

### ❌ Lỗi: "Cannot connect to blockchain"

**Nguyên nhân:** Hardhat node không chạy.

**Giải pháp:**
```bash
npm run blockchain:node
```

### ❌ Lỗi: "Contract not found"

**Nguyên nhân:** Contract address sai hoặc contract chưa deploy.

**Giải pháp:**
1. Deploy lại: `npm run blockchain:deploy`
2. Copy contract address mới vào `.env`
3. Restart backend server

---

## 📊 Workflow Tóm tắt

```
┌─────────────────┐
│  Tạo Appointment│
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Lưu MongoDB    │ ───> │  Response    │
└────────┬────────┘      └──────────────┘
         │
         │ (Async)
         ▼
┌─────────────────┐
│  Hash → BC      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Tx Hash │
└─────────────────┘
```

---

## 🎯 API Endpoints

### Tạo Appointment
```
POST /appointments
```

### Verify Integrity
```
GET /appointments/:id/verify
```

### Blockchain History
```
GET /appointments/:id/blockchain-history
```

---

## 💡 Tips

1. **Development**: Dùng local blockchain (FREE, nhanh)
2. **Testing**: Dùng Sepolia testnet (FREE test ETH)
3. **Production**: Dùng Polygon mainnet (rẻ hơn Ethereum)

---

## 📚 Đọc thêm

- [BLOCKCHAIN_INTEGRATION_GUIDE.md](./BLOCKCHAIN_INTEGRATION_GUIDE.md) - Hướng dẫn chi tiết
- [blockchain/README.md](./blockchain/README.md) - Smart contract documentation

---

## ✅ Checklist

- [ ] Cài đặt dependencies
- [ ] Start Hardhat node
- [ ] Compile smart contract
- [ ] Deploy contract
- [ ] Cấu hình .env
- [ ] Start backend
- [ ] Test tạo appointment
- [ ] Test verify integrity
- [ ] Test blockchain history

🎉 **Chúc mừng!** Hệ thống blockchain đã hoạt động!
