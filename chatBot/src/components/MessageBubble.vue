<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '../interfaces/ChatBot'

const props = defineProps<{
  message: Message
  index: number
}>()

const isUser = computed(() => props.message.sender === 'user')

const bubbleClasses = computed(() => {
  if (isUser.value) {
    return props.index % 2 === 0
      ? 'self-end bg-violet-500 text-white'
      : 'self-end bg-violet-700 text-white'
  } else {
    return props.index % 2 === 0
      ? 'self-start bg-emerald-200 text-gray-900'
      : 'self-start bg-emerald-300 text-gray-900'
  }
})
</script>

<template>
  <div :class="['max-w-[85%] break-words px-4 py-2 rounded-2xl shadow-sm animate-fade', bubbleClasses]">
    <div class="text-sm leading-relaxed">{{ message.text }}</div>
    <div class="text-[10px] text-white/40 mt-1 text-right">{{ message.time }}</div>
  </div>
</template>

<style scoped>
@keyframes fade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade {
  animation: fade 160ms ease-out;
}
</style>