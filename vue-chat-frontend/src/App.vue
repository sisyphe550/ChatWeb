<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useChatStore } from './stores/chatStore';
// import { NButton } from 'naive-ui' // NButton 已不再直接使用，移除或注释掉
import ChatHeader from './components/ChatHeader.vue';
import MessageInput from './components/MessageInput.vue'
import MessageList from './components/MessageList.vue'
import UserList from './components/UserList.vue';
import { NMessageProvider } from 'naive-ui';
import MessageErrorHandler from './components/MessageErrorHandler.vue';

const chatStore = useChatStore();

onMounted(() => {
  chatStore.initializeWebSocket();
  console.log('App.vue: Called chatStore.initializeWebSocket()');
});

onUnmounted(() => {
  chatStore.disconnectWebSocket();
  console.log('App.vue: Called chatStore.disconnectWebSocket()');
});
</script>

<template>
  <n-message-provider>
    <div class="app-container">
      <div class="main-chat-area">
        <ChatHeader />
        <MessageList />
        <MessageInput />
      </div>
      <UserList />
    </div>
    <MessageErrorHandler />
  </n-message-provider>
</template>

<style scoped>
.app-container {
  display: flex;
  align-items: stretch;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  box-sizing: border-box;
  background-color: #f4f4f4;
}

.main-chat-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  height: 100%;
}
</style>
