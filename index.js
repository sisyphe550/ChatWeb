// index.js - Main file for the Node.js WebSocket Adapter

// --- 模块 1.1: 依赖引入 (部分已在 npm install 完成) ---
const WebSocket = require('ws');
const net = require('net');
const express = require('express');

// --- 配置常量 ---
const JAVA_SERVER_HOST = 'localhost';
const JAVA_SERVER_PORT = 9998; // 与您的 mserver.java 端口一致
const WEBSOCKET_SERVER_PORT = 3000; // Node.js WebSocket 服务器监听的端口

console.log('Node.js WebSocket Adapter starting...');

// --- 模块 1.3 & 1.5: WebSocket 服务模块 (面向 Vue.js 前端) 与用户状态管理 ---
// TODO: 初始化 Express 应用
// TODO: 初始化 WebSocket 服务器 (e.g., new WebSocket.Server({ server: httpServer }))
// TODO: 管理 WebSocket 客户端列表 (connectedClients)
// TODO: 处理 WebSocket 连接事件 (connection, message, close, error)
// TODO: 广播消息给所有或特定客户端的函数 (broadcastMessage)
// TODO: 维护用户列表及同步逻辑

// --- 模块 1.2: Java TCP 服务器连接模块 ---
// TODO: 创建 TCP 客户端连接到 Java 服务器 (javaClient = new net.Socket())
// TODO: 处理 Java TCP 客户端连接事件 (connect, data, error, close)
// TODO: 存储从 Java 服务器接收数据的缓冲区 (如果需要处理粘包/半包问题)

// --- 模块 1.4: 消息路由与协议转换模块 ---
// TODO: 定义消息格式 (JSON: type, senderId, content, timestamp etc.)
// TODO: 实现上行消息处理 (Vue -> Node -> Java)
// TODO: 实现下行消息处理 (Java -> Node -> Vue)

// --- 模块 1.6: 错误处理与日志记录 ---
// TODO: 实现全局错误处理
// TODO: 添加更详细的日志记录

// --- 启动服务 ---
// TODO: 启动 HTTP 服务器 (用于 WebSocket)

// --- 优雅关闭处理 (可选但推荐) ---
// process.on('SIGINT', () => { /* ... */ }); // 处理 Ctrl+C
// process.on('SIGTERM', () => { /* ... */ }); // 处理终止信号

console.log(`WebSocket server will listen on port ${WEBSOCKET_SERVER_PORT}`);
console.log(`Attempting to connect to Java server at ${JAVA_SERVER_HOST}:${JAVA_SERVER_PORT}`);

// 示例: 简单的 HTTP 服务器启动 (后续会集成 WebSocket)
const app = express();
const httpServer = app.listen(WEBSOCKET_SERVER_PORT, () => {
    console.log(`HTTP server listening on port ${WEBSOCKET_SERVER_PORT} for WebSocket connections.`);
});

// --- 以下为各模块的具体实现占位 ---

// ==============================================================================
// 模块 1.2: Java TCP 服务器连接模块
// ==============================================================================
let javaClient = new net.Socket();
let isJavaConnected = false;

javaClient.on('connect', () => {
    isJavaConnected = true;
    console.log(`Successfully connected to Java server at ${JAVA_SERVER_HOST}:${JAVA_SERVER_PORT}`);
    // TODO: 连接成功后可以发送一个心跳或身份验证消息 (如果Java服务器需要)
    // javaClient.write('Node.js client connected\n'); // <--- 将此行注释掉或删除
});

javaClient.on('data', (data) => {
    const messagesFromJava = data.toString('utf8').split('\n');
    messagesFromJava.forEach(messageString => {
        const trimmedMessage = messageString.trim();
        if (!trimmedMessage) return;

        console.log(`Received raw from Java server: ${trimmedMessage}`);

        if (trimmedMessage.startsWith("Your client id is: ")) {
            console.log(`Node.js adapter's ID from Java server: ${trimmedMessage.substring("Your client id is: ".length)}`);
        } else if (trimmedMessage === "SERVER_SHUTDOWN: Server is shutting down.") {
            broadcastMessageToWebSockets({
                type: "server_notification",
                content: "Java server is shutting down."
            });
        } else if (trimmedMessage.startsWith("Client ")) {
            // This is likely a broadcast message from mserver
            // Format: "Client <SourceID_in_mserver>: <OriginalPayload>"
            const mserverBroadcastParts = trimmedMessage.match(/^Client (\d+): (.*)$/);
            if (mserverBroadcastParts && mserverBroadcastParts.length === 3) {
                const originalPayload = mserverBroadcastParts[2].trim();

                // Now, try to determine if originalPayload came from a WebSocket client (via this Node.js) or a native Java mclient
                // WebSocket client messages to mserver are formatted as: "Client <WS_ID> (<WS_Name>): <WS_Content>"
                const wsOriginParts = originalPayload.match(/^Client (\d+) \((.*?)\): (.*)$/);
                if (wsOriginParts && wsOriginParts.length === 4) {
                    // Message originated from a WebSocket client and was looped back
                    const originalWsId = parseInt(wsOriginParts[1]);
                    const originalWsName = wsOriginParts[2];
                    const originalWsContent = wsOriginParts[3];
                    
                    // We should ideally use the originalWsName or a more direct identifier
                    // If the message came from THIS Node.js adapter's client, we broadcast it.
                    // We can check if connectedClients has a client with this id/name for confirmation, but it might be an mclient.
                    broadcastMessageToWebSockets({
                        type: "chat_message",
                        senderId: `${originalWsName} (WS-${originalWsId})`, // Make senderId more descriptive
                        content: originalWsContent
                    });
                } else {
                    // Message likely originated from a native Java mclient
                    // Format of originalPayload is likely "Client <MCLIENT_ID_in_mserver>: <MCLIENT_Content>"
                    // Or, if mclient doesn't send a "Client X:" prefix, originalPayload is just <MCLIENT_CONTENT>
                    // For now, we'll assume mserver already prefixed it correctly for mclient messages.
                    // So, originalPayload is the actual content prefixed by the mclient's ID in mserver.
                    // Example: originalPayload = "Client 2: Hello from native Java client"
                    const javaClientOriginParts = originalPayload.match(/^Client (\d+): (.*)$/);
                    if (javaClientOriginParts && javaClientOriginParts.length === 3){
                         broadcastMessageToWebSockets({
                            type: "chat_message",
                            senderId: `JavaClient ${javaClientOriginParts[1]}`, 
                            content: javaClientOriginParts[2]
                        });
                    } else {
                        // If it doesn't match the "Client X: ..." format from a Java mclient either,
                        // it might be a simpler message or something else. Broadcast as is from the source mserver saw.
                        // The mserverBroadcastParts[1] is the ID of the client as mserver sees it (could be an mclient or this Node instance)
                        // The mserverBroadcastParts[2] (originalPayload) is the message content.
                        broadcastMessageToWebSockets({
                            type: "chat_message", // Or server_notification if more appropriate
                            senderId: `Java ${mserverBroadcastParts[1]}`, // Generic ID from mserver's perspective
                            content: originalPayload
                        });
                    }
                }
            } else {
                console.log(`Unknown prefixed message type from Java server (doesn't start with Client X: ): ${trimmedMessage}`);
                // broadcastMessageToWebSockets({ type: 'unknown_java_message', content: trimmedMessage });
            }
        } else {
            console.log(`Unhandled raw message from Java server: ${trimmedMessage}`);
            // broadcastMessageToWebSockets({ type: 'generic_java_message', content: trimmedMessage });
        }
    });
});

javaClient.on('error', (err) => {
    console.error(`Java client connection error: ${err.message}`);
    isJavaConnected = false;
    // TODO: 实现重连逻辑
});

javaClient.on('close', () => {
    isJavaConnected = false;
    console.log('Connection to Java server closed.');
    // TODO: 实现重连逻辑或通知 WebSocket 客户端
});

function connectToJavaServer() {
    if (!isJavaConnected) {
        console.log(`Attempting to connect to Java server: ${JAVA_SERVER_HOST}:${JAVA_SERVER_PORT}`);
        javaClient.connect({
            port: JAVA_SERVER_PORT,
            host: JAVA_SERVER_HOST,
            family: 4 // Explicitly use IPv4
        });
    }
}

// 初始连接尝试
connectToJavaServer();

// 定期尝试重连 (简单示例)
// setInterval(() => {
//   if (!isJavaConnected) {
//     connectToJavaServer();
//   }
// }, 5000);


// ==============================================================================
// 模块 1.3 & 1.5: WebSocket 服务模块 和 用户状态管理
// ==============================================================================
const wss = new WebSocket.Server({ server: httpServer }); // 将 WebSocket 附加到 HTTP 服务器
const connectedClients = new Map(); // Stores: ws -> { id: number, name: string, ws: WebSocketInstance }
let nextClientId = 1; // 简单的客户端ID生成器

// Helper function to broadcast user list to all connected WebSocket clients
function broadcastUserListUpdate() {
    const userList = [];
    for (const clientData of connectedClients.values()) {
        userList.push({ id: clientData.id, name: clientData.name });
    }
    broadcastMessageToWebSockets({ type: "user_list_update", users: userList });
}

wss.on('connection', (ws, req) => {
    const clientId = nextClientId++;
    const defaultName = `WebSocketClient ${clientId}`;
    const clientData = { id: clientId, name: defaultName, ws: ws };
    connectedClients.set(ws, clientData);
    
    const clientIp = req.socket.remoteAddress;

    console.log(`WebSocket client ${clientData.id} (${clientData.name} from IP: ${clientIp}) connected.`);
    ws.send(JSON.stringify({ type: 'server_message', content: `Welcome ${clientData.name}! Your Client ID is ${clientData.id}` }));
    
    broadcastUserListUpdate(); // Broadcast updated user list

    ws.on('message', (message) => {
        let parsedMessage;
        const currentClientData = connectedClients.get(ws); // Get current client's data
        if (!currentClientData) return; // Should not happen if client is still in map

        try {
            parsedMessage = JSON.parse(message.toString());
            console.log(`Received from WebSocket client ${currentClientData.id} (${currentClientData.name}): `, parsedMessage);

            if (parsedMessage.type === 'chat_message') {
                if (isJavaConnected) {
                    const messageForJava = `Client ${currentClientData.id} (${currentClientData.name}): ${parsedMessage.content}\n`;
                    javaClient.write(messageForJava);
                    console.log(`Forwarded to Java server: ${messageForJava.trim()}`);
                }

                // Broadcast the chat message to other WebSocket clients
                const messageToBroadcastToWS = {
                    type: "chat_message",
                    senderId: `${currentClientData.name} (WS-${currentClientData.id})`,
                    content: parsedMessage.content
                };
                wss.clients.forEach(client => {
                    // Send to other clients, not the sender itself, and only if OPEN
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(messageToBroadcastToWS), (err) => {
                            if (err) {
                                console.error('Error broadcasting chat message to a WebSocket client:', err);
                            }
                        });
                    }
                });
                // Optionally, if you want the sender to also receive their message back from the server (as a confirmation or standard chat behavior)
                // you could send it to `ws` as well, or rely on the Java server loopback if that was enabled.
                // For now, sender does not get their own message back from this broadcast.

            } else if (parsedMessage.type === 'set_nickname') {
                const newNickname = parsedMessage.nickname ? parsedMessage.nickname.trim() : '';
                if (newNickname && newNickname.length > 0 && newNickname.length <= 50) { // Basic validation
                    const oldName = currentClientData.name;
                    currentClientData.name = newNickname;
                    console.log(`Client ${currentClientData.id} changed nickname from '${oldName}' to '${newNickname}'`);
                    ws.send(JSON.stringify({ type: 'nickname_updated', oldName: oldName, newName: newNickname, id: currentClientData.id }));
                    broadcastUserListUpdate(); // Notify all clients of the name change
                } else {
                    ws.send(JSON.stringify({ type: 'error', content: 'Invalid nickname. Must be non-empty and max 50 chars.' }));
                }
            } else if (parsedMessage.type === 'request_user_list') {
                const userList = [];
                for (const cData of connectedClients.values()) {
                    userList.push({ id: cData.id, name: cData.name });
                }
                ws.send(JSON.stringify({ type: "user_list_update", users: userList }));
            }

        } catch (e) {
            console.error(`Failed to parse message from client ${currentClientData.id} (${currentClientData.name}) or process it: `, message.toString(), e);
            ws.send(JSON.stringify({ type: 'error', content: 'Invalid message format.' }));
            return;
        }
    });

    ws.on('close', () => {
        const closingClientData = connectedClients.get(ws);
        if (closingClientData) {
            console.log(`WebSocket client ${closingClientData.id} (${closingClientData.name}) disconnected.`);
            connectedClients.delete(ws);
            broadcastUserListUpdate(); // Broadcast updated user list
        } else {
            console.log('An unknown WebSocket client disconnected.');
        }
    });

    ws.on('error', (error) => {
        const errorClientData = connectedClients.get(ws);
        if (errorClientData) {
            console.error(`WebSocket client ${errorClientData.id} (${errorClientData.name}) error: `, error);
            // Ensure removal from lists if an error occurs, then broadcast
            if (connectedClients.has(ws)) {
                connectedClients.delete(ws);
                broadcastUserListUpdate();
            }
        } else {
             console.error('Unknown WebSocket client error: ', error);
        }
    });
});

console.log(`Node.js WebSocket server is listening on ws://localhost:${WEBSOCKET_SERVER_PORT}`);

// Helper function to broadcast messages to all connected WebSocket clients
function broadcastMessageToWebSockets(messageObject) {
    if (!wss || !wss.clients) {
        console.error("WebSocket server or clients not initialized.");
        return;
    }
    const messageString = JSON.stringify(messageObject);
    console.log(`Broadcasting to WebSocket clients: ${messageString}`);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageString, (err) => {
                if (err) {
                    console.error('Error sending message to a WebSocket client:', err);
                }
            });
        }
    });
}

// ==============================================================================
// 模块 1.4: 消息路由与协议转换 (部分已在上面实现)
// ==============================================================================
// 消息格式约定:
// 前端 -> Node (WebSocket): { "type": "chat_message", "content": "Hello" }
//                         { "type": "set_nickname", "nickname": "MyNewName" }
//                         { "type": "request_user_list" }
// Node -> 前端 (WebSocket): { "type": "server_message", "content": "Welcome!" }
//                         { "type": "chat_message", "senderId": "JavaClient X", "content": "Hi" } // or "WebSocketClient Y"
//                         { "type": "user_list_update", "users": [{"id": 1, "name": "User1_WS"}, ...] }
//                         { "type": "nickname_updated", "id": 1, "oldName": "Old", "newName": "New" }
//                         { "type": "error", "content": "Error message" }
//
// Node <-> Java (TCP Socket): 纯文本字符串，每条消息以换行符 ('\n') 结尾。
// Java -> Node 示例: "Client 1: Hello from Java"
//                     "Your client id is: 1" (这个可以直接显示或用于关联)
//                     "SERVER_SHUTDOWN: Server is shutting down."
// Node -> Java 示例: "Client 123 (Nickname): My message from Node\n" (123是WebSocket客户端ID)


// ==============================================================================
// 模块 1.6: 错误处理与日志记录 (部分已通过 console.log/error 实现)
// ==============================================================================
// 全局未捕获异常处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 在生产环境中，这里可能需要更优雅地关闭服务器或重启进程
  // process.exit(1); // 强制退出
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // process.exit(1);
});


// 优雅关闭示例
function gracefulShutdown() {
    console.log('Attempting graceful shutdown...');
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'server_message', content: 'Server is shutting down.' }));
            client.close();
        }
    });
    wss.close(() => {
        console.log('WebSocket server closed.');
        if (javaClient && !javaClient.destroyed) {
            javaClient.end(() => {
                console.log('Connection to Java server gracefully closed.');
                process.exit(0);
            });
            // 设置超时，以防Java服务器不响应end
            setTimeout(() => {
                console.warn('Java server close timeout, forcing exit.');
                process.exit(1);
            }, 5000);
        } else {
            process.exit(0);
        }
    });

    // 如果30秒后还未完全关闭，则强制退出
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
}

process.on('SIGINT', gracefulShutdown); // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // kill 命令

console.log(`Node.js WebSocket Adapter setup complete. Ready for connections.`); 