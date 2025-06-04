<script setup lang="ts">
import { computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { NList, NListItem, NText, NBadge, NScrollbar, NEmpty } from 'naive-ui';

const chatStore = useChatStore();
const users = computed(() => chatStore.users);
const currentUser = computed(() => chatStore.currentUser);

</script>

<template>
  <div class="user-list-panel">
    <NText strong class="panel-title">在线用户 ({{ users.length }})</NText>
    <n-scrollbar style="max-height: 300px; margin-top: 10px;"> <!-- \u根据需要调整最大高度 -->
      <div v-if="users.length === 0" class="empty-users-list">
        <n-empty description="当前没有其他用户在线" size="small" />
      </div>
      <n-list bordered clickable hoverable>
        <n-list-item v-for="user in users" :key="user.id">
          <NText :type="user.id === currentUser.id ? 'primary' : 'default'">
            {{ user.name }}
            <NBadge value="You" dot type="success" v-if="user.id === currentUser.id" style="margin-left: 5px;" />
          </NText>
        </n-list-item>
      </n-list>
    </n-scrollbar>
  </div>
</template>

<style scoped>
.user-list-panel {
  padding: 10px;
  border-left: 1px solid #eee; /* \u4e0e聊天区域分隔 */
  width: 200px; /* \u固定宽度或根据布局调整 */
  min-width: 180px;
  background-color: #fcfcfc;
  display: flex;
  flex-direction: column;
}
.panel-title {
  margin-bottom: 5px;
  display: block;
  text-align: center;
}
.empty-users-list {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px; /* \u确保 n-empty \u在容器内有足够空间 */
}
/* \u可以为 NListItem \u添加一些样式，如果需要 */
</style> 