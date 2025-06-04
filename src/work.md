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

安装TypeScript Vue Plugin(Volar)插件


好的，没有问题！我们一步一步来搭建您的 Vue.js 前端开发环境。我将为您提供详细的命令和说明。

请打开您的终端（命令行工具），然后按照以下步骤操作：

**步骤 1：使用 Vite 创建 Vue + TypeScript 项目**

Vite 提供了一个非常便捷的命令来快速初始化项目。

1.  **运行创建命令**：
    在您的终端中，导航到您希望创建项目的父文件夹，然后运行以下命令：
    ```bash
    npm create vite@latest
    ```
    或者，如果您更喜欢使用 yarn：
    ```bash
    yarn create vite
    ```
    或者使用 pnpm:
    ```bash
    pnpm create vite
    ```

2.  **按照提示操作**：
    *   **Project name?** (项目名称?)：输入您希望的项目名称，例如 `vue-chat-frontend`，然后按 Enter。
    *   **Select a framework?** (选择一个框架?)：使用键盘上下箭头选择 `Vue`，然后按 Enter。
    *   **Select a variant?** (选择一个变体?)：使用键盘上下箭头选择 `TypeScript`，然后按 Enter。

    Vite 会为您创建一个包含 Vue 和 TypeScript 基本配置的新项目文件夹。

3.  **进入项目目录**：
    创建完成后，终端会提示您进入项目目录。运行：
    ```bash
    cd vue-chat-frontend 
    # 将 "vue-chat-frontend" 替换为您实际设置的项目名称
    ```

4.  **安装项目依赖**：
    在项目目录中，运行以下命令来安装项目所需的基础依赖（这些依赖已在 `package.json` 文件中定义）：
    ```bash
    npm install
    ```
    或者，如果您使用 yarn：
    ```bash
    yarn
    ```
    或者使用 pnpm:
    ```bash
    pnpm install
    ```

现在，您的 Vue + TypeScript 项目基础环境已经搭建好了。

**步骤 2：安装 Pinia (状态管理)**

Pinia 是 Vue 官方推荐的状态管理库。

1.  **在项目根目录中 (例如 `vue-chat-frontend`)，运行安装命令**：
    ```bash
    npm install pinia
    ```
    或者，如果您使用 yarn：
    ```bash
    yarn add pinia
    ```
    或者使用 pnpm:
    ```bash
    pnpm add pinia
    ```

**步骤 3：安装 Naive UI (UI 组件库)**

1.  **安装 Naive UI 主包**：
    ```bash
    npm install naive-ui
    ```
    或者，如果您使用 yarn：
    ```bash
    yarn add naive-ui
    ```
    或者使用 pnpm:
    ```bash
    pnpm add naive-ui
    ```

2.  **(推荐) 安装 `unplugin-vue-components` 实现自动按需引入**：
    这个插件能让您直接在模板中使用 Naive UI 组件，而无需手动导入。
    ```bash
    npm install -D unplugin-vue-components
    ```
    或者，如果您使用 yarn (作为开发依赖)：
    ```bash
    yarn add -D unplugin-vue-components
    ```
    或者使用 pnpm (作为开发依赖):
    ```bash
    pnpm add -D unplugin-vue-components
    ```
    (`-D` 表示将其安装为开发依赖项，因为它主要在构建过程中起作用)。

3.  **(可选) 安装 Naive UI 推荐字体 `vfonts`**：
    为了获得 Naive UI 最佳的视觉效果，可以安装其推荐的字体。
    ```bash
    npm install vfonts
    ```
    或者，如果您使用 yarn：
    ```bash
    yarn add vfonts
    ```
    或者使用 pnpm:
    ```bash
    pnpm add vfonts
    ```

**总结一下您刚刚安装的内容：**

1.  **Vite**: 现代化的前端构建工具。
2.  **Vue.js 3**: 渐进式 JavaScript 框架。
3.  **TypeScript**: 为 JavaScript 添加了类型系统。
4.  **Pinia**: Vue 的状态管理库。
5.  **Naive UI**: Vue 3 的组件库。
6.  **unplugin-vue-components**: 用于 Naive UI (及其他库) 组件的自动按需引入。
7.  **vfonts**: (可选) Naive UI 推荐的字体库。

**下一步是什么？**

在这些库安装完成后，我们接下来需要在项目中对它们进行配置，主要涉及：

*   在 `main.ts` 文件中：
    *   引入并使用 Pinia。
    *   (如果未使用自动按需引入或需要全局注册某些 Naive UI 内容) 引入并使用 Naive UI。
    *   (可选) 引入 `vfonts` 中的字体 CSS。
*   在 `vite.config.ts` 文件中：
    *   配置 `unplugin-vue-components` 以便 Naive UI 组件可以自动按需引入。

请告诉我您是否准备好进行这些配置步骤，或者您想先确认一下目前的安装情况。您可以通过运行 `npm run dev` (或 `yarn dev` / `pnpm dev`) 来启动开发服务器，看看基础的 Vue 应用是否能正常运行（此时还没有集成 Pinia 和 Naive UI 的功能）。

npm install -D @types/node

http://localhost:5173

启动流程

1.进入src目录
```
  java mserver
```

2.启动node
```
  node index.js
```

3.进入vue-chat-fronted目录
```
  npm run dev
```

4.进入网页：http://localhost:5173