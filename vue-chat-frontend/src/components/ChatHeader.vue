<script setup lang="ts">
import { ref, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { NInput, NButton, NSpace, NText } from 'naive-ui';

const chatStore = useChatStore();
const newNickname = ref('');

// \u5f53 store \u中的 currentUser.name \u更新时，也更新输入框的值
// \u这样如果昵称是通过其他方式（例如，服务器强制设置）更新的，UI也能同步
watch(() => chatStore.currentUser.name, (name) => {
  if (name) {
    newNickname.value = name;
  }
}, { immediate: true }); // immediate: true \u确保组件加载时也执行一次

const updateNickname = () => {
  const trimmedNickname = newNickname.value.trim();
  // 前端校验（如为空或未改变）可以保留以优化体验（例如禁用按钮），
  // 但核心的有效性校验（如长度）和错误提示统一由 store 处理。

  // 只有当昵称实际改变时才发送请求到 store
  // 按钮的 :disabled 属性已经处理了昵称为空或与当前昵称相同的情况
  // if (trimmedNickname === chatStore.currentUser.name) {
  //   return; // 如果昵称没有改变，不执行任何操作
  // }
  // chatStore.updateNickname 会处理昵称是否为空或过长等核心校验
  chatStore.updateNickname(trimmedNickname); 
};
</script>

<template>
  <div class="chat-header">
    <NSpace justify="space-between" align="center">
      <NText strong style="font-size: 1.2em;">我的聊天应用</NText>
      <NSpace align="center">
        <NInput
          v-model:value="newNickname"
          type="text"
          placeholder="输入您的昵称"
          size="small"
          style="width: 180px;"
          @keyup.enter="updateNickname"
        />
        <NButton
          type="primary"
          size="small"
          @click="updateNickname"
          :disabled="!chatStore.isConnected || !newNickname.trim() || newNickname.trim() === chatStore.currentUser.name"
        >
          更新昵称
        </NButton>
      </NSpace>
    </NSpace>
    <div class="connection-status-header">
      <span>状态: {{ chatStore.isConnected ? '已连接' : '未连接' }}</span>
      <span v-if="chatStore.currentUser.id"> (ID: {{ chatStore.currentUser.id }})</span>
    </div>
  </div>
</template>

<style scoped>
.chat-header {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}
.connection-status-header {
  font-size: 0.8em;
  color: #888;
  text-align: right; /* \u将状态信息靠右 */
  margin-top: 5px;
}
</style> 