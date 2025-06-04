<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import MessageItem from './MessageItem.vue';
import { NScrollbar, NEmpty } from 'naive-ui';

const chatStore = useChatStore();
const messages = computed(() => chatStore.sortedMessages);
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null);
const messageListContentRef = ref<HTMLElement | null>(null);


watch(messages, async (newMessages, oldMessages) => {
  // 仅当消息实际添加或删除时才滚动，避免不必要的重渲染滚动
  // 如果 oldMessages 是 undefined (首次加载)，也尝试滚动
  if (!oldMessages || newMessages.length !== oldMessages.length) {
    await nextTick(); // 等待 DOM 更新
    scrollToBottom();
  }
}, { deep: true });


const scrollToBottom = () => {
  const scrollbar = scrollbarRef.value;
  const content = messageListContentRef.value;
  if (scrollbar && content) {
    // 使用 NScrollbar 的 scrollTo 方法
    scrollbar.scrollTo({ top: content.scrollHeight, behavior: 'smooth' });
  }
};

</script>

<template>
  <div class="message-list-container">
    <n-scrollbar ref="scrollbarRef" style="flex-grow: 1;">
      <div ref="messageListContentRef" class="message-list-content">
        <div v-if="messages.length === 0" class="empty-chat">
          <n-empty description="还没有消息，开始聊天吧！" size="large" />
        </div>
        <MessageItem
          v-for="message in messages"
          :key="message.id" 
          :message="message"
        />
      </div>
    </n-scrollbar>
  </div>
</template>

<style scoped>
.message-list-container {
  flex-grow: 1; /* 占据可用垂直空间 */
  padding: 10px;
  overflow-y: hidden; /* 由 n-scrollbar 处理滚动 */
  display: flex; /* 确保 n-scrollbar 能正确撑开 */
  flex-direction: column; /* 确保 n-scrollbar 能正确撑开 */
  background-color: #f9f9f9; /* 给消息列表一个稍微不同的背景 */
}

.message-list-content {
  display: flex;
  flex-direction: column;
  gap: 0px; /* MessageItem 自身有 margin-bottom */
  padding-right: 5px; /* 防止滚动条遮挡内容 */
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* 占据全部可用空间 */
  min-height: 200px; /* 保证 NEmpty 有足够空间显示 */
  color: #aaa;
}
</style> 