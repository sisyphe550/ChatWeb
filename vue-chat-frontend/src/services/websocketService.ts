// src/services/websocketService.ts

// 从 Node.js 后端 (index.js) 获取 WebSocket 服务器地址
// 您可以将其放入 .env 文件并在 Vite 中配置环境变量，但为了简单起见，我们先硬编码
const WEBSOCKET_URL = 'ws://localhost:3000';

let socket: WebSocket | null = null;

// 用于存储不同消息类型的回调函数
// 类型定义可以根据您的消息结构进一步细化
const messageListeners: { [type: string]: ((payload: any) => void)[] } = {};
let openListeners: (() => void)[] = [];
let closeListeners: ((event: CloseEvent) => void)[] = [];
let errorListeners: ((event: Event) => void)[] = [];

function connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket is already connected.');
      resolve();
      return;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket is already connecting.');
        // Możemy poczekać na połączenie lub odrzucić
        // For simplicity, we'll just let it connect and resolve an existing promise if any
        // or the caller can retry. Here we just inform.
        return;
    }

    console.log(`Attempting to connect to WebSocket server at ${WEBSOCKET_URL}`);
    socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('Successfully connected to WebSocket server.');
      openListeners.forEach(listener => listener());
      resolve();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);
        console.log('Received message from server:', message);

        if (message.type && messageListeners[message.type]) {
          messageListeners[message.type].forEach(listener => listener(message.payload !== undefined ? message.payload : message));
        } else if (messageListeners['*']) { // Fallback for a generic listener if type-specific is not found
            messageListeners['*'].forEach(listener => listener(message));
        } else {
          console.warn('No listener registered for message type:', message.type, 'or generic listener *. Message:', message);
        }
      } catch (error) {
        console.error('Failed to parse message from server or listener error:', error);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      errorListeners.forEach(listener => listener(event));
      reject(event); // Reject promise on error during initial connection
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.reason, `(Code: ${event.code})`);
      closeListeners.forEach(listener => listener(event));
      socket = null;
    };
  });
}

function disconnect() {
  if (socket) {
    console.log('Disconnecting WebSocket...');
    socket.close();
  }
}

function sendMessage(type: string, payload?: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({ type, ...payload }); // Spread payload if it's an object, otherwise structure as needed
    console.log('Sending message to server:', message);
    socket.send(message);
  } else {
    console.error('WebSocket is not connected. Cannot send message.');
    // Optionally, queue the message or throw an error
  }
}

// Functions to register listeners from other parts of the app (e.g., Pinia store)
function onMessage(type: string, callback: (payload: any) => void) {
  if (!messageListeners[type]) {
    messageListeners[type] = [];
  }
  messageListeners[type].push(callback);
}

function onOpen(callback: () => void) {
  openListeners.push(callback);
}

function onClose(callback: (event: CloseEvent) => void) {
  closeListeners.push(callback);
}

function onError(callback: (event: Event) => void) {
  errorListeners.push(callback);
}

// Export the public API of the service
export const websocketService = {
  connect,
  disconnect,
  sendMessage,
  onMessage,
  onOpen,
  onClose,
  onError,
  // Utility to check connection status if needed from outside
  isConnected: () => socket !== null && socket.readyState === WebSocket.OPEN,
}; 