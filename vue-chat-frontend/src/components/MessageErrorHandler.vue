<script setup lang="ts">
import { watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useMessage } from 'naive-ui';

const chatStore = useChatStore();
const messageApi = useMessage();

watch(() => chatStore.lastErrorMessage, (newError) => {
  if (newError) {
    messageApi.error(newError.message, { duration: 5000 }); // 显示5秒
    // 可选：如果希望相同的错误在短时间内能被再次触发显示 (例如，如果用户快速连续执行导致相同错误的操作)，
    // 你可能不想在这里清除它。或者，你可以根据 newError.timestamp 和一个阈值来决定是否显示。
    // 为了简单起见，我们暂时不清除，这样如果 store 中的错误状态没有改变，它不会重复弹出。
    // 如果要清除以便下次相同的错误依然能触发，可以添加一个 action 到 store: chatStore.clearLastErrorMessage();
  }
}, { deep: true });
</script>

<template>
  <!-- This component does not render anything visible -->
</template> 