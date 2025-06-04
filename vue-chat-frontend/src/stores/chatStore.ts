// src/stores/chatStore.ts
import { defineStore } from 'pinia';
import { websocketService } from '@/services/websocketService'; // 使用路径别名 @ (如果已配置) 或相对路径

// 定义消息和用户的接口类型
export interface Message {
  id?: string; // 消息的唯一ID，可以由服务器生成或前端生成
  type: 'user_message' | 'server_notification' | 'system_error' | 'user_list_update'; // 细化消息类型
  senderId?: string; // 发送者ID (可以是客户端ID或昵称)
  senderName?: string; // 发送者昵称
  content: any;    // 消息内容，可以是字符串或其他
  timestamp: Date;
  isSelf?: boolean; // 标记是否是自己发送的消息
}

export interface User {
  id: number; // 通常是服务器分配的 WebSocket 客户端 ID
  name: string;
}

interface ChatState {
  messages: Message[];
  users: User[];
  isConnected: boolean;
  currentUser: {
    id: number | null;
    name: string | null;
  };
  lastErrorMessage: { message: string, timestamp: number } | null;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [],
    users: [],
    isConnected: false,
    currentUser: { id: null, name: 'WebSocketClient' }, // 默认名称，会被服务器消息覆盖
    lastErrorMessage: null,
  }),

  actions: {
    // 初始化 WebSocket 连接并设置监听器
    initializeWebSocket() {
      if (this.isConnected || websocketService.isConnected()) {
        console.warn('ChatStore: WebSocket already initialized or connected.');
        this.isConnected = true; // Ensure state is consistent
        return;
      }
      console.log('ChatStore: Initializing WebSocket...');

      websocketService.onOpen(() => {
        this.isConnected = true;
        console.log('ChatStore: WebSocket connection opened.');
        // 连接成功后可以请求用户列表或发送其他初始信令
        // this.requestUserList(); // 示例: 假设有这样一个action
      });

      websocketService.onClose(() => { 
        this.isConnected = false;
        console.log('ChatStore: WebSocket connection closed.');
        // No specific error message is set here by default on close.
        // Errors leading to a close should be caught by onError or connect().catch(),
        // or by actions attempting to use a closed connection.
      });

      websocketService.onError((errorEvent: Event) => {
        this.isConnected = false;
        this.lastErrorMessage = { message: 'WebSocket 连接错误，请检查网络或稍后重试。', timestamp: Date.now() };
        console.error('ChatStore: WebSocket error.', errorEvent);
      });

      // 监听所有类型的消息，然后分发
      websocketService.onMessage('*', (message: any) => {
        console.log('ChatStore: Received message via service -', message);
        switch (message.type) {
          case 'server_message': // 例如后端发送的 "Welcome..." 或其他通知
            // 假设 server_message 结构: { type: 'server_message', content: string, clientId?: number, clientName?: string }
            this.addMessage({
                type: 'server_notification',
                content: message.content,
                timestamp: new Date(),
            });
            if (message.clientId && message.clientName) { // 假设 welcome 消息包含这些
                this.currentUser.id = message.clientId;
                this.currentUser.name = message.clientName;
            } else if (message.content && message.content.includes('Your Client ID is')) {
                // 从 "Welcome WebSocketClient X! Your Client ID is Y" 中提取
                const idMatch = message.content.match(/Client ID is (\d+)/);
                const nameMatch = message.content.match(/Welcome (WebSocketClient \d+)!/);
                if (idMatch && idMatch[1]) {
                    this.currentUser.id = parseInt(idMatch[1], 10);
                }
                if (nameMatch && nameMatch[1]) {
                    this.currentUser.name = nameMatch[1];
                }
            }
            break;
          case 'chat_message': // 其他客户端或Java客户端发来的消息
             // 假设 chat_message 结构: { type: 'chat_message', senderId: string, content: string }
            this.addMessage({
              type: 'user_message',
              senderId: message.senderId, // Node.js后端应提供 senderId
              // senderName: message.senderName, // 如果Node.js后端提供了发送者名称
              content: message.content,
              timestamp: new Date(),
              isSelf: message.senderId === this.currentUser.name || (this.currentUser.id && message.senderId?.includes(`WS-${this.currentUser.id}`)) // 粗略判断是否是自己
            });
            break;
          case 'user_list_update':
            // 假设 user_list_update 结构: { type: 'user_list_update', users: User[] }
            if (Array.isArray(message.users)) {
              this.users = message.users;
              this.addMessage({ // 可选：将用户列表更新也作为一条系统消息显示
                  type: 'user_list_update',
                  content: `在线用户列表已更新: ${this.users.map(u => u.name).join(', ')}`,
                  timestamp: new Date(),
              });
            }
            break;
          case 'nickname_updated':
            // 假设结构: { type: 'nickname_updated', id: number, oldName: string, newName: string }
            const userToUpdate = this.users.find(u => u.id === message.id);
            if (userToUpdate) {
                userToUpdate.name = message.newName;
            }
            if (this.currentUser.id === message.id) {
                this.currentUser.name = message.newName;
            }
             this.addMessage({
                type: 'server_notification',
                content: `用户 '${message.oldName}' 已更名为 '${message.newName}'`,
                timestamp: new Date(),
            });
            break;
          case 'error': // 来自Node.js服务器的错误消息
             this.addMessage({
                type: 'system_error',
                content: `服务器返回错误: ${message.content}`,
                timestamp: new Date(),
            });
            this.lastErrorMessage = { message: `服务器错误: ${message.content}`, timestamp: Date.now() };
            break;
          default:
            console.warn('ChatStore: Unhandled message type -', message.type);
        }
      });

      // 尝试连接
      websocketService.connect().catch((err: any) => {
        this.isConnected = false;
        this.lastErrorMessage = { message: '无法连接到 WebSocket 服务器。', timestamp: Date.now() };
        console.error('ChatStore: Failed to initiate WebSocket connection.', err);
      });
    },

    // 添加消息到列表
    addMessage(message: Omit<Message, 'id'>) {
      const fullMessage: Message = {
        ...message,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // 简单的唯一ID
      };
      this.messages.push(fullMessage);
      // 可以考虑限制消息列表的最大长度
      // if (this.messages.length > 100) {
      //   this.messages.shift();
      // }
    },

    // 发送聊天消息
    sendChatMessage(content: string) {
      if (!this.isConnected) {
        this.lastErrorMessage = { message: '连接已断开，无法发送消息。', timestamp: Date.now() };
        return;
      }
      if (!content.trim()) return; // 不发送空消息

      const messagePayload = {
        content: content.trim(),
        // senderId and senderName will be handled/added by Node.js or derived from connection
      };
      // Node.js 后端期望的格式是: { type: "chat_message", content: "Hello" }
      // sendMessage 的第二个参数 payload 会被展开到消息对象中
      websocketService.sendMessage('chat_message', messagePayload );

      // 乐观更新：立即将自己发送的消息添加到UI
      this.addMessage({ 
        type: 'user_message',
        senderId: this.currentUser.name || `WS-${this.currentUser.id}`, // 确保与 isSelf 判断逻辑兼容
        senderName: this.currentUser.name || 'Me', // 显示为 'Me' 或当前昵称
        content: content.trim(),
        timestamp: new Date(),
        isSelf: true, // 明确标记为自己发送
      });
    },

    // 更新用户昵称
    updateNickname(newNickname: string) {
        if (!this.isConnected) {
            this.lastErrorMessage = { message: '连接已断开，无法更新昵称。', timestamp: Date.now() };
            return;
        }
        if (!newNickname.trim() || newNickname.trim().length > 50) {
            this.lastErrorMessage = { message: '昵称长度必须在1到50个字符之间。', timestamp: Date.now() };
            return;
        }
        // Node.js 后端期望的格式是: { type: "set_nickname", nickname: "MyNewName" }
        websocketService.sendMessage('set_nickname', { nickname: newNickname.trim() });
    },

    // 手动断开连接 (如果需要)
    disconnectWebSocket() {
        websocketService.disconnect();
    }
  },

  getters: {
    // 例如，获取排序后的消息
    sortedMessages(state): Message[] {
      return [...state.messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    },
    // 获取当前在线用户数
    onlineUserCount(state): number {
        return state.users.length;
    }
  },
});

// 可以在 store 外部调用 initializeWebSocket，例如在 main.ts 或 App.vue 的 setup 中
// const chatStore = useChatStore();
// chatStore.initializeWebSocket(); 