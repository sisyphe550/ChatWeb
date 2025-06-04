<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { NInput, NButton, NSpace } from 'naive-ui'; // \u导入 Naive UI \u组件

const chatStore = useChatStore();
const newMessage = ref('');

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  chatStore.sendChatMessage(newMessage.value.trim());
  newMessage.value = ''; // \u清空输入框
};
</script>

<template>
  <div class="message-input-area">
    <n-space align="center">
      <n-input
        v-model:value="newMessage"
        type="text"
        placeholder="输入消息..."
        autosize
        style="min-width: 300px;"
        @keyup.enter="sendMessage"
      />
      <n-button type="primary" @click="sendMessage" :disabled="!chatStore.isConnected || !newMessage.trim()">
        发送
      </n-button>
    </n-space>
  </div>
</template>

<style scoped>
.message-input-area {
  padding: 10px;
  border-top: 1px solid #eee; /* \u可选的分割线 */
  background-color: #f9f9f9; /* \u可选的背景色 */
}
</style> 