编译所有 Java 文件：
```
   javac *.java
```

启动服务器：
```
   java mserver
```
退出服务器
Ctrl + C

启动多个客户端:
```
   java mclient
```
退出客户端
QUIT

git commit -m "Add initial server and client Java files with improvements"

启动Node.js控制台（要先运行mserver）
node index.js

java -Djava.net.preferIPv4Stack=true mserver

java -Djava.net.preferIPv4Stack=true mclient

ws://localhost:3000

{"type":"server_message","content":"Welcome! Your Client ID is 1"}
{"type": "chat_message", "content": "Hello via Node and WebSocket"}
{"type":"chat_message","senderId":"JavaClient 2","content":"Hello from Java client"}

