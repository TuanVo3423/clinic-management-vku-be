import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'

class SocketService {
  private io: SocketIOServer | null = null
  private connectedUsers: Map<string, string> = new Map() // userId -> socketId

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: 'http://localhost:8080',
        credentials: true,
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket: Socket) => {
      console.log(`✅ Client connected: ${socket.id}`)

      // Client gửi userId khi kết nối để server biết socket này thuộc về user nào
      socket.on('register', (userId: string) => {
        this.connectedUsers.set(userId, socket.id)
        console.log(`👤 User ${userId} registered with socket ${socket.id}`)
      })

      socket.on('disconnect', () => {
        // Xóa user khỏi danh sách khi disconnect
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId)
            console.log(`👋 User ${userId} disconnected`)
            break
          }
        }
        console.log(`❌ Client disconnected: ${socket.id}`)
      })
    })

    console.log('✅ Socket.IO initialized')
  }

  // Gửi notification cho một user cụ thể
  emitToUser(userId: string, event: string, data: any) {
    if (!this.io) {
      console.warn('Socket.IO chưa được khởi tạo')
      return
    }

    const socketId = this.connectedUsers.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
      console.log(`📤 Sent ${event} to user ${userId}`)
    } else {
      console.log(`⚠️ User ${userId} không online`)
    }
  }

  // Gửi notification cho tất cả clients
  emitToAll(event: string, data: any) {
    if (!this.io) {
      console.warn('Socket.IO chưa được khởi tạo')
      return
    }

    this.io.emit(event, data)
    console.log(`📤 Broadcast ${event} to all clients`)
  }

  // Gửi notification cho nhiều users
  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data)
    })
  }

  getIO() {
    return this.io
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys())
  }
}

const socketService = new SocketService()
export default socketService
