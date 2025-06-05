# 聊天应用程序 (ChatApplication)

一个基于Java后端、Node.js中间件和Vue.js前端的实时聊天应用程序。

## 项目简介

本项目是一个多技术栈的聊天应用程序，包含以下组件：

- **Java后端服务器**: 负责核心聊天逻辑和数据处理
- **Node.js中间件**: 处理WebSocket连接和实时通信
- **Vue.js前端**: 提供现代化的用户界面

## 技术栈

- **后端**: Java
- **中间件**: Node.js + Express + WebSocket
- **前端**: Vue.js + TypeScript + Vite
- **通信协议**: WebSocket (实时通信)

## 项目结构

```
ChatApplication/
├── src/                    # Java后端源码
│   ├── mserver.java       # 主服务器
│   ├── mclient.java       # 客户端
│   └── work.md           # 工作文档
├── vue-chat-frontend/     # Vue前端应用
├── index.js              # Node.js中间件
├── package.json          # Node.js依赖配置
└── README.md             # 项目说明
```

## 启动流程

### 1. 进入src目录
```bash
java mserver
```

### 2. 启动Node.js服务
```bash
node index.js
```

### 3. 进入vue-chat-frontend目录
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问：http://localhost:5173

## 安装依赖

### Node.js依赖 (项目根目录)
```bash
npm install
```

### Vue前端依赖 (vue-chat-frontend目录)
```bash
cd vue-chat-frontend
npm install
```

## 系统要求

- Java JDK 8+
- Node.js 14+
- npm 6+

## 功能特性

- 实时聊天功能
- 多用户支持
- 现代化Web界面
- 跨平台支持

## 许可证

ISC

## 贡献

欢迎提交Issue和Pull Request！ 