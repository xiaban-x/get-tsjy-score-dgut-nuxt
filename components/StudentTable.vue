<template>
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1 cursor-pointer" @click="$emit('toggle-sort', 'studentId')">
              <span>学号</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="getSortIconClass('studentId')">
                <path d="M12 5v14M5 12l7-7 7 7"/>
              </svg>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1 cursor-pointer" @click="$emit('toggle-sort', 'studentName')">
              <span>姓名</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="getSortIconClass('studentName')">
                <path d="M12 5v14M5 12l7-7 7 7"/>
              </svg>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1 cursor-pointer" @click="$emit('toggle-sort', 'college')">
              <span>学院</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="getSortIconClass('college')">
                <path d="M12 5v14M5 12l7-7 7 7"/>
              </svg>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1">
              <span>专业</span>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1">
              <span>班级</span>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1 cursor-pointer" @click="$emit('toggle-sort', 'tsCredit')">
              <span>通识教育学分</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="getSortIconClass('tsCredit')">
                <path d="M12 5v14M5 12l7-7 7 7"/>
              </svg>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1 cursor-pointer" @click="$emit('toggle-sort', 'dsjhCredit')">
              <span>读书计划学分</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="getSortIconClass('dsjhCredit')">
                <path d="M12 5v14M5 12l7-7 7 7"/>
              </svg>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">
            <div class="flex items-center space-x-1 cursor-pointer" @click="$emit('toggle-sort', 'totalCredit')">
              <span>总学分</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="getSortIconClass('totalCredit')">
                <path d="M12 5v14M5 12l7-7 7 7"/>
              </svg>
            </div>
          </TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">状态</TableHead>
          <TableHead class="px-4 py-2 font-medium text-left">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="student in students" :key="student.studentId" :class="{'bg-gray-50': student.loading}">
          <TableCell class="px-4 py-2">{{ student.studentId }}</TableCell>
          <TableCell class="px-4 py-2">{{ student.studentName }}</TableCell>
          <TableCell class="px-4 py-2">{{ student.data?.college || '-' }}</TableCell>
          <TableCell class="px-4 py-2">{{ student.data?.major || '-' }}</TableCell>
          <TableCell class="px-4 py-2">{{ student.data?.className || '-' }}</TableCell>
          <TableCell class="px-4 py-2" :class="student.data && student.data.tsCredit < 1 ? 'text-red-500 font-bold' : ''">
            {{ student.data?.tsCredit }}
          </TableCell>
          <TableCell class="px-4 py-2" :class="student.data && student.data.dsjhCredit < 1 ? 'text-red-500 font-bold' : ''">
            {{ student.data?.dsjhCredit }}
          </TableCell>
          <TableCell class="px-4 py-2" :class="student.data && student.data.totalCredit < 2 ? 'text-red-500 font-bold' : ''">
            {{ student.data?.totalCredit }}
          </TableCell>
          <TableCell class="px-4 py-2">
            <span v-if="student.data && student.data.tsCredit >= 1 && student.data.dsjhCredit >= 1" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              学分已满
            </span>
            <span v-else-if="student.data && student.data.tsCredit < 1 && student.data.dsjhCredit < 1" class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              学分不足
            </span>
            <span v-else-if="student.data && student.data.tsCredit < 1" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              通识学分不足
            </span>
            <span v-else-if="student.data && student.data.dsjhCredit < 1" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              读书学分不足
            </span>
          </TableCell>
          <TableCell class="px-4 py-2">
            <div v-if="student.loading" class="animate-pulse">加载中...</div>
            <div v-else-if="student.error" class="text-red-500">{{ student.error }}</div>
            <div v-else-if="student.data">
              <Button @click="viewStudentDetails(student)" variant="default" size="sm" class="px-3 py-1 text-sm">
                查看详情
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="students.length === 0">
          <TableCell colspan="10" class="px-4 py-8 text-center text-gray-500">
            没有符合筛选条件的学生数据
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import type { Student } from '~/types'

const props = defineProps<{
  students: Student[]
  sortField: string
  sortDirection: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  'toggle-sort': [field: string]
  'view-details': [student: Student]
}>()

// 获取排序图标类名
const getSortIconClass = (field: string) => {
  if (props.sortField !== field) return 'text-gray-300'
  return props.sortDirection === 'asc' ? 'text-blue-500' : 'text-blue-500 transform rotate-180'
}

// 查看学生详情
const viewStudentDetails = (student: Student) => {
  emit('view-details', student)
}
</script> 