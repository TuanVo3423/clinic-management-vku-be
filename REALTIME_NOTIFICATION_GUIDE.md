# Hướng dẫn tích hợp Realtime Notifications

## Backend đã được cấu hình

Backend đã được thiết lập để:

1. ✅ Lắng nghe thay đổi trong collection `notifications` sử dụng MongoDB Change Streams
2. ✅ Tự động gửi notification qua Socket.IO khi có notification mới được thêm vào
3. ✅ Hỗ trợ gửi notification đến user cụ thể hoặc broadcast cho tất cả users

## Cách sử dụng ở Frontend (Client)

### 1. Cài đặt Socket.IO Client

```bash
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

### 2. Kết nối đến Socket Server

```javascript
import { io } from 'socket.io-client'

// Kết nối đến server
const socket = io('http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket', 'polling']
})

// Lắng nghe sự kiện kết nối thành công
socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server')

  // Đăng ký userId với server để nhận notification riêng
  const userId = 'USER_ID_CUA_BAN' // Lấy từ auth state
  socket.emit('register', userId)
})

// Lắng nghe notification mới
socket.on('new-notification', (notification) => {
  console.log('🔔 Notification mới:', notification)

  // Hiển thị notification cho user
  // notification format:
  // {
  //   _id: string,
  //   recipientType: 'patient' | 'doctor',
  //   recipientId: string,
  //   type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled',
  //   message: string,
  //   channel: 'sms' | 'email',
  //   status: 'sent' | 'failed',
  //   createdAt: Date
  // }

  // Ví dụ: hiển thị toast notification
  showToast(notification.message)

  // Ví dụ: cập nhật UI
  addNotificationToList(notification)

  // Ví dụ: phát âm thanh
  playNotificationSound()
})

// Lắng nghe sự kiện disconnect
socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO server')
})
```

### 3. Ví dụ với React

```jsx
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function NotificationComponent({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Khởi tạo socket connection
    const newSocket = io('http://localhost:3000', {
      withCredentials: true
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      newSocket.emit('register', userId)
    })

    // Lắng nghe notification mới
    newSocket.on('new-notification', (notification) => {
      console.log('New notification:', notification)

      // Thêm notification vào danh sách
      setNotifications((prev) => [notification, ...prev])

      // Hiển thị browser notification (nếu được phép)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Thông báo mới', {
          body: notification.message,
          icon: '/notification-icon.png'
        })
      }
    })

    setSocket(newSocket)

    // Cleanup khi component unmount
    return () => {
      newSocket.close()
    }
  }, [userId])

  return (
    <div className='notification-container'>
      <h3>Thông báo ({notifications.length})</h3>
      <ul>
        {notifications.map((notif) => (
          <li key={notif._id} className='notification-item'>
            <p>{notif.message}</p>
            <small>{new Date(notif.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default NotificationComponent
```

### 4. Ví dụ với Vue.js

```vue
<template>
  <div class="notification-container">
    <h3>Thông báo ({{ notifications.length }})</h3>
    <ul>
      <li v-for="notif in notifications" :key="notif._id" class="notification-item">
        <p>{{ notif.message }}</p>
        <small>{{ formatDate(notif.createdAt) }}</small>
      </li>
    </ul>
  </div>
</template>

<script>
import { io } from 'socket.io-client'

export default {
  name: 'NotificationComponent',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      socket: null,
      notifications: []
    }
  },
  mounted() {
    this.initSocket()
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.close()
    }
  },
  methods: {
    initSocket() {
      this.socket = io('http://localhost:3000', {
        withCredentials: true
      })

      this.socket.on('connect', () => {
        console.log('Connected to server')
        this.socket.emit('register', this.userId)
      })

      this.socket.on('new-notification', (notification) => {
        console.log('New notification:', notification)
        this.notifications.unshift(notification)

        // Hiển thị browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Thông báo mới', {
            body: notification.message,
            icon: '/notification-icon.png'
          })
        }
      })
    },
    formatDate(date) {
      return new Date(date).toLocaleString('vi-VN')
    }
  }
}
</script>
```

## Test thử nghiệm

### Cách 1: Sử dụng MongoDB Compass hoặc CLI

Thêm một document mới vào collection `notifications`:

```javascript
db.notifications.insertOne({
  recipientType: 'patient',
  recipientId: ObjectId('YOUR_USER_ID'),
  type: 'appointment_created',
  message: 'Bạn có lịch hẹn mới vào ngày 10/11/2025',
  channel: 'email',
  status: 'sent',
  createdAt: new Date()
})
```

### Cách 2: Sử dụng API endpoint

Nếu bạn có API endpoint để tạo notification, gọi API đó và notification sẽ tự động được gửi qua socket.

## Events có sẵn

### Client -> Server

- `register`: Đăng ký userId với socket connection
  ```javascript
  socket.emit('register', userId)
  ```

### Server -> Client

- `new-notification`: Nhận notification mới
  ```javascript
  socket.on('new-notification', (notification) => {
    // Handle notification
  })
  ```

## Lưu ý quan trọng

1. **MongoDB Replica Set**: MongoDB Change Streams yêu cầu MongoDB chạy dưới dạng Replica Set. Nếu bạn đang dùng MongoDB local, hãy đảm bảo nó được cấu hình đúng.

2. **User Authentication**: Trong production, bạn nên xác thực socket connection với JWT token:

   ```javascript
   const socket = io('http://localhost:3000', {
     auth: {
       token: 'YOUR_JWT_TOKEN'
     }
   })
   ```

3. **CORS Configuration**: Đảm bảo cấu hình CORS phù hợp với domain của frontend.

4. **Reconnection**: Socket.IO tự động reconnect khi mất kết nối, nhưng bạn cần gọi lại `socket.emit('register', userId)` sau khi reconnect.

## Troubleshooting

### Lỗi: "The $changeStream stage is only supported on replica sets"

MongoDB của bạn không chạy dưới dạng replica set. Giải pháp:

1. **MongoDB Atlas**: Tự động hỗ trợ replica set
2. **MongoDB Local**:

   ```bash
   # Khởi động MongoDB với replica set
   mongod --replSet rs0

   # Trong mongo shell
   rs.initiate()
   ```

### Socket không kết nối được

- Kiểm tra CORS configuration
- Kiểm tra firewall/port 3000
- Kiểm tra URL kết nối đúng chưa

### Không nhận được notification

- Kiểm tra userId đã đăng ký đúng chưa
- Kiểm tra recipientId trong notification có khớp với userId không
- Kiểm tra console log ở backend để debug
