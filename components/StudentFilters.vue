<template>
  <div>
    <!-- 筛选选项 -->
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600">筛选:</span>
        <div class="flex flex-wrap gap-2">
          <Button 
            v-for="option in filterOptions" 
            :key="option.value"
            :variant="currentFilter === option.value ? 'default' : 'outline'"
            size="sm"
            @click="applyFilter(option.value)"
          >
            {{ option.label }}
          </Button>
        </div>
      </div>
      <div class="text-sm text-gray-600">
        筛选结果: {{ totalCount }} 条记录
      </div>
    </div>
    
    <!-- 排序选项 -->
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600">排序:</span>
        <div class="flex flex-wrap gap-2">
          <Button 
            v-for="option in sortOptions" 
            :key="option.value"
            :variant="sortField === option.value ? 'default' : 'outline'"
            size="sm"
            @click="toggleSort(option.value)"
          >
            {{ option.label }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'

const props = defineProps<{
  filterOptions: { value: string, label: string }[]
  sortOptions: { value: string, label: string }[]
  currentFilter: string
  sortField: string
  totalCount: number
}>()

const emit = defineEmits<{
  'update:currentFilter': [value: string]
  'update:sortField': [value: string]
  'toggle-sort': [field: string]
}>()

// 应用筛选
const applyFilter = (filter: string) => {
  emit('update:currentFilter', filter)
}

// 切换排序
const toggleSort = (field: string) => {
  emit('toggle-sort', field)
}
</script> 