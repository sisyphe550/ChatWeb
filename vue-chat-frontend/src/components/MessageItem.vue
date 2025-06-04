<script setup lang="ts">
import type { Message } from '@/stores/chatStore';
import { NCard, NText, NTime } from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
  message: Message;
}>();

// 计算属性判断是否为系统类型的消息
const isSystemMessage = computed(() => {
  return props.message.type === 'server_notification' || 
         props.message.type === 'system_error' || 
         props.message.type === 'user_list_update';
});

const senderDisplayName = computed(() => {
  if (isSystemMessage.value) {
    // 对于不同类型的系统消息，可以显示不同的固定名称
    if (props.message.type === 'system_error') return '系统错误';
    if (props.message.type === 'user_list_update') return '用户列表更新';
    return '系统通知'; // 默认为 server_notification
  }
  return props.message.senderName || props.message.senderId || '未知用户';
});

</script>

<template>
  <div :class="['message-item-wrapper', { 'self': props.message.isSelf, 'system-message': isSystemMessage }]">
    <n-card size="small" :bordered="true" class="message-card">
      <template #header v-if="!isSystemMessage"> 
        <n-text strong :type="props.message.isSelf ? 'primary' : 'info'">
          {{ senderDisplayName }}
        </n-text>
      </template>
      <!-- 系统消息通常没有单独的header，内容直接就是通知 -->
      <n-text :class="{ 'system-content': isSystemMessage }">
        {{ props.message.content }}
      </n-text>
      <template #footer v-if="props.message.timestamp">
        <n-time :time="props.message.timestamp" format="MM-dd HH:mm:ss" />
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.message-item-wrapper {
  display: flex;
  margin-bottom: 10px;
  max-width: 80%; /* 消息不会过宽 */
}

.message-item-wrapper.self {
  justify-content: flex-end; /* 自己发送的消息靠右 */
  margin-left: auto; /* 配合父容器的 flex-start */
}

.message-item-wrapper.system-message {
  justify-content: center; /* 系统消息居中 */
  margin-left: auto;
  margin-right: auto;
  max-width: 90%; /* 系统消息可以更宽一些 */
}

.message-card {
  border-radius: 8px;
}

.message-item-wrapper.self .message-card {
  background-color: #dcf8c6; /* 自己发送的消息用不同背景色 */
}

.message-item-wrapper.system-message .message-card {
  background-color: #f0f0f0; /* 系统消息背景色 */
  text-align: center;
}

.system-content {
    font-style: italic;
    color: #555;
}

/* Naive UI Card specific adjustments if needed */
:deep(.n-card-header) {
  padding-bottom: 5px !important; 
}
:deep(.n-card__content) {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}
:deep(.n-card__footer) {
  padding-top: 5px !important;
  text-align: right; 
  font-size: 0.75em;
  color: #888;
}
.message-item-wrapper.self :deep(.n-card__footer) {
 text-align: right;
}
.message-item-wrapper.system-message :deep(.n-card__footer) {
 text-align: center;
}
</style> 