<script setup lang="ts">
import { useHead } from '#app'

useHead({
  title: '东莞理工学院通识教育学分查询',
  meta: [
    { name: 'description', content: '东莞理工学院通识教育学分查询系统' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtPage />
  </div>
</template>
