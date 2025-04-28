<template>
  <div>
    <!-- 查询选项卡 -->
    <Tabs v-model="activeTab" class="mb-8">
      <TabsList class="flex space-x-2 border-b border-gray-200 mb-4">
        <TabsTrigger value="upload" class="px-4 py-2 font-medium">
          批量查询
        </TabsTrigger>
        <TabsTrigger value="single" class="px-4 py-2 font-medium">
          单个查询
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" class="p-4 bg-white rounded-lg shadow">
        <div class="flex flex-col items-center">
          <p class="mb-4">上传包含学号和姓名的Excel文件(xlsx或csv格式)</p>
          <div class="flex space-x-4">
            <Button @click="openFileDialog()" variant="default">
              选择文件
            </Button>
            <input type="file" ref="fileInput" hidden @change="handleFileUpload" accept=".xlsx,.xls,.csv" />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="single" class="p-4 bg-white rounded-lg shadow">
        <div class="flex flex-col space-y-4">
          <div>
            <label class="block mb-1">学号</label>
            <Input v-model="studentId" placeholder="请输入学号" class="w-full" />
          </div>
          <div>
            <label class="block mb-1">姓名 (选填)</label>
            <Input v-model="studentName" placeholder="请输入姓名" class="w-full" />
          </div>
          <Button @click="querySingleStudent" variant="default">
            查询
          </Button>
        </div>
      </TabsContent>
    </Tabs>
    
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
      {{ errorMessage }}
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center mb-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { read, utils } from 'xlsx'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { Student } from '~/types'

const props = defineProps<{
  isLoading: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  'update:error': [value: string]
  'set-students': [students: Student[]]
  'fetch-single': [studentId: string, studentName: string]
}>()

// 状态
const activeTab = ref('upload')
const fileInput = ref<HTMLInputElement | null>(null)
const studentId = ref('')
const studentName = ref('')

// 打开文件选择对话框
const openFileDialog = () => {
  fileInput.value?.click()
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  
  const file = files[0]
  processExcelFile(file)
}

// 处理Excel文件
const processExcelFile = async (file: File) => {
  try {
    emit('update:error', '')
    
    const data = await file.arrayBuffer()
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = utils.sheet_to_json<{[key: string]: any}>(worksheet)
    
    if (jsonData.length === 0) {
      emit('update:error', 'Excel文件为空或格式不正确')
      return
    }
    
    // 获取所有可能的列名
    const allHeaders = new Set<string>()
    
    // 遍历所有行来收集所有可能的列名
    for (const row of jsonData) {
      const rowKeys = Object.keys(row)
      for (const key of rowKeys) {
        allHeaders.add(key)
      }
    }
    
    const headers = Array.from(allHeaders)
    
    let studentIdKey = ''
    let studentNameKey = ''
    
    // 尝试找到学号和姓名列，检查所有可能的列名
    for (const key of headers) {
      const lowerKey = String(key).toLowerCase()
      
      // 学号可能的名称
      if (lowerKey.includes('学号') || 
          lowerKey.includes('id') || 
          lowerKey.includes('编号') || 
          lowerKey.includes('学生编号') ||
          lowerKey.includes('学籍号') ||
          lowerKey.includes('student') && lowerKey.includes('id') ||
          lowerKey.includes('no')) {
        studentIdKey = key
      }
      
      // 姓名可能的名称
      if (lowerKey.includes('姓名') || 
          lowerKey.includes('name') || 
          lowerKey.includes('学生姓名') ||
          lowerKey.includes('学生名字') ||
          lowerKey.includes('student') && lowerKey.includes('name')) {
        studentNameKey = key
      }
    }
    
    if (!studentIdKey || !studentNameKey) {
      emit('update:error', `无法识别Excel中的数据列。${!studentIdKey ? '找不到学号列；' : ''}${!studentNameKey ? '找不到姓名列；' : ''}请确保文件包含这些信息，或者重命名列名为"学号"和"姓名"`)
      return
    }
    
    // 提取学生信息
    const students: Student[] = jsonData.map(row => ({
      studentId: String(row[studentIdKey] || '').trim(),
      studentName: String(row[studentNameKey] || '').trim(),
      loading: false,
      data: undefined,
      error: undefined
    })).filter(student => student.studentId && student.studentName)  // 过滤掉没有学号或姓名的行
    
    if (students.length === 0) {
      emit('update:error', '没有找到有效的学生信息，请检查Excel文件格式')
      return
    }
    
    // 设置学生列表
    emit('set-students', students)
    
    // 重置文件输入框，以便可以重新选择相同的文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    emit('update:error', `处理文件时出错: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 查询单个学生
const querySingleStudent = () => {
  if (!studentId.value) {
    emit('update:error', '请输入学号')
    return
  }
  
  emit('fetch-single', studentId.value, studentName.value)
  
  // 重置输入
  studentId.value = ''
  studentName.value = ''
}
</script> 