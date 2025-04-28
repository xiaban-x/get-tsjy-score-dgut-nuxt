<template>
  <div v-if="show && student && student.data" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
    <Card class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10">
      <CardHeader>
        <CardTitle>{{ student.data.studentName }} 的学分详情</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p><span class="font-medium">学号:</span> {{ student.data.studentId }}</p>
            <p><span class="font-medium">姓名:</span> {{ student.data.studentName }}</p>
            <p><span class="font-medium">年级:</span> {{ student.data.year }}</p>
          </div>
          <div>
            <p><span class="font-medium">学院:</span> {{ student.data.college }}</p>
            <p><span class="font-medium">专业:</span> {{ student.data.major }}</p>
            <p><span class="font-medium">班级:</span> {{ student.data.className }}</p>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2">学分统计</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="p-3 bg-blue-50 rounded">
              <p class="text-sm">通识教育学分</p>
              <p class="text-xl font-bold">{{ student.data.tsCredit }}/1.0</p>
            </div>
            <div class="p-3 bg-green-50 rounded">
              <p class="text-sm">读书计划学分</p>
              <p class="text-xl font-bold">{{ student.data.dsjhCredit }}/1.0</p>
            </div>
            <div class="p-3 bg-purple-50 rounded">
              <p class="text-sm">总学分</p>
              <p class="text-xl font-bold">{{ student.data.totalCredit }}/2.0</p>
            </div>
          </div>
        </div>
        
        <!-- 通识课堂列表 -->
        <div v-if="student.data.tsktList && student.data.tsktList.length > 0" class="mb-6">
          <h3 class="text-lg font-medium mb-2">通识教育大讲堂</h3>
          <div class="border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">课程名称</TableHead>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">时间</TableHead>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">学分</TableHead>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(course, index) in student.data.tsktList" :key="index">
                  <TableCell class="px-3 py-2 text-sm">{{ course.title }}</TableCell>
                  <TableCell class="px-3 py-2 text-sm">{{ formatDate(course.activityTime) }}</TableCell>
                  <TableCell class="px-3 py-2 text-sm">{{ course.credit }}</TableCell>
                  <TableCell class="px-3 py-2 text-sm">{{ course.description }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        <!-- 读书计划列表 -->
        <div v-if="student.data.dsjhList && student.data.dsjhList.length > 0" class="mb-6">
          <h3 class="text-lg font-medium mb-2">求是读书计划</h3>
          <div class="border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">项目名称</TableHead>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">时间</TableHead>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">学分</TableHead>
                  <TableHead class="px-3 py-2 text-sm font-medium text-left">描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(course, index) in student.data.dsjhList" :key="index">
                  <TableCell class="px-3 py-2 text-sm">{{ course.title }}</TableCell>
                  <TableCell class="px-3 py-2 text-sm">{{ formatDate(course.activityTime) }}</TableCell>
                  <TableCell class="px-3 py-2 text-sm">{{ course.credit }}</TableCell>
                  <TableCell class="px-3 py-2 text-sm">{{ course.description }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        <Button @click="$emit('close')" variant="outline" class="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <span class="sr-only">关闭</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import type { Student } from '~/types'

const props = defineProps<{
  student: Student | null
  show: boolean
}>()

const emit = defineEmits<{
  'close': []
}>()

// 格式化日期
const formatDate = (timestamp: number) => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleDateString('zh-CN')
}
</script> 