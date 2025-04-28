<template>
  <div>
    <!-- 分页设置和信息 -->
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">每页显示:</span>
        <Select :model-value="pageSize" @update:model-value="handlePageSizeChange">
          <SelectTrigger class="w-[80px] h-8">
            <SelectValue :placeholder="String(pageSize)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="text-sm text-gray-600">
        显示 {{ totalItems ? (currentPage - 1) * pageSize + 1 : 0 }}-{{ Math.min(currentPage * pageSize, totalItems) }} 条，共 {{ totalItems }} 条
      </div>
    </div>
    
    <!-- 分页控制 -->
    <div class="flex justify-between items-center px-4 py-3 border-t border-gray-200">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">第 {{ currentPage }}/{{ totalPages || 1 }} 页</span>
      </div>
      <div class="flex space-x-2">
        <Button @click="goToFirstPage" :disabled="currentPage === 1 || totalItems === 0" variant="outline" size="sm">
          首页
        </Button>
        <Button @click="goToPreviousPage" :disabled="currentPage === 1 || totalItems === 0" variant="outline" size="sm">
          上一页
        </Button>
        <div class="flex items-center space-x-1">
          <Input
            :model-value="currentPage"
            @update:model-value="(val) => goToPage(Number(val))"
            class="w-16 h-8 text-center"
            type="number"
            min="1"
            :max="totalPages || 1"
            :disabled="totalItems === 0"
          />
          <span class="text-sm text-gray-600">/{{ totalPages || 1 }}</span>
        </div>
        <Button @click="goToNextPage" :disabled="currentPage === totalPages || totalItems === 0" variant="outline" size="sm">
          下一页
        </Button>
        <Button @click="goToLastPage" :disabled="currentPage === totalPages || totalItems === 0" variant="outline" size="sm">
          末页
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

const props = defineProps<{
  currentPage: number
  pageSize: number
  pageSizeOptions: number[]
  totalItems: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'update:pageSize': [value: number]
}>()

// 分页操作函数
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}

const goToFirstPage = () => goToPage(1)
const goToPreviousPage = () => goToPage(props.currentPage - 1)
const goToNextPage = () => goToPage(props.currentPage + 1)
const goToLastPage = () => goToPage(props.totalPages)

// 处理每页显示数量变化
const handlePageSizeChange = (value: any) => {
  const newPageSize = typeof value === 'string' ? parseInt(value) : value
  emit('update:pageSize', newPageSize)
}
</script> 