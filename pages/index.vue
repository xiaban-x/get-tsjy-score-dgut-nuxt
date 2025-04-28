<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { read, utils } from 'xlsx'
import { useFileDialog } from '@vueuse/core'

// 导入Shadcn Vue组件
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

interface Student {
  studentId: string
  studentName: string
  data?: StudentData
  loading?: boolean
  error?: string
}

interface StudentData {
  studentId: string
  studentName: string
  year: string
  college: string
  major: string
  className: string
  totalCredit: number
  tsCredit: number
  slCredit: number
  dsjhCredit: number
  tsktList: CourseItem[]
  dsslList: CourseItem[]
  dsjhList: CourseItem[]
}

interface CourseItem {
  title: string
  activityTime: number
  credit: number
  description: string
  dataSyncTime: number
  liveTime: number
  duration: number
  sign_on: number
  sign_off: number
  readCount: number
}

// 状态管理
const students = ref<Student[]>([])
const selectedStudent = ref<Student | null>(null)
const activeTab = ref('upload')
const singleStudentId = ref('')
const singleStudentName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// 分页相关状态
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const pageSizeOptions = [5, 10, 20, 50, 100]
const totalPages = computed(() => Math.ceil(students.value.length / pageSize.value))
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return students.value.slice(start, end)
})

// 分页操作函数
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToFirstPage = () => goToPage(1)
const goToPreviousPage = () => goToPage(currentPage.value - 1)
const goToNextPage = () => goToPage(currentPage.value + 1)
const goToLastPage = () => goToPage(totalPages.value)

const handlePageSizeChange = (value: any) => {
  pageSize.value = typeof value === 'string' ? parseInt(value) : value
  // 当改变每页显示数量时，可能需要调整当前页码
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
}

// 文件上传处理
const { open, onChange } = useFileDialog()
const handleFileUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  
  const file = files[0]
  processExcelFile(file)
}

onChange((files) => {
  if (files && files.length > 0) {
    processExcelFile(files[0])
  }
})

const processExcelFile = async (file: File) => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const data = await file.arrayBuffer()
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = utils.sheet_to_json<{[key: string]: any}>(worksheet)
    
    if (jsonData.length === 0) {
      errorMessage.value = 'Excel文件为空或格式不正确'
      isLoading.value = false
      return
    }
    
    console.log("Excel数据:", jsonData)
    
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
    console.log("所有可能的列名:", headers)
    
    let studentIdKey = ''
    let studentNameKey = ''
    
    // 尝试找到学号和姓名列，检查所有可能的列名
    for (const key of headers) {
      const lowerKey = String(key).toLowerCase()
      console.log("检查列名:", key, "转小写:", lowerKey)
      
      // 学号可能的名称
      if (lowerKey.includes('学号') || 
          lowerKey.includes('id') || 
          lowerKey.includes('编号') || 
          lowerKey.includes('学生编号') ||
          lowerKey.includes('学籍号') ||
          lowerKey.includes('student') && lowerKey.includes('id') ||
          lowerKey.includes('no')) {
        studentIdKey = key
        console.log("找到学号列:", key)
      }
      
      // 姓名可能的名称
      if (lowerKey.includes('姓名') || 
          lowerKey.includes('name') || 
          lowerKey.includes('学生姓名') ||
          lowerKey.includes('学生名字') ||
          lowerKey.includes('student') && lowerKey.includes('name')) {
        studentNameKey = key
        console.log("找到姓名列:", key)
      }
    }
    
    if (!studentIdKey || !studentNameKey) {
      errorMessage.value = `无法识别Excel中的数据列。${!studentIdKey ? '找不到学号列；' : ''}${!studentNameKey ? '找不到姓名列；' : ''}请确保文件包含这些信息，或者重命名列名为"学号"和"姓名"`
      isLoading.value = false
      return
    }
    
    console.log("使用的学号列:", studentIdKey, "姓名列:", studentNameKey)
    
    // 提取学生信息
    students.value = jsonData.map(row => reactive({
      studentId: String(row[studentIdKey] || '').trim(),
      studentName: String(row[studentNameKey] || '').trim(),
      loading: false,
      data: undefined,
      error: undefined
    })).filter(student => student.studentId && student.studentName)  // 过滤掉没有学号或姓名的行
    
    console.log("解析出的学生信息:", students.value)
    
    if (students.value.length === 0) {
      errorMessage.value = '没有找到有效的学生信息，请检查Excel文件格式'
      isLoading.value = false
      return
    }
    
    // 批量查询学生信息
    await fetchAllStudentsData()
    
  } catch (error) {
    console.error('处理Excel文件时出错:', error)
    errorMessage.value = `处理文件时出错: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isLoading.value = false
  }
}

// API请求
const fetchStudentData = async (student: Student) => {
  try {
    // 确保响应式系统能捕获到状态变化
    student.loading = true
    student.error = undefined
    
    const response = await fetch(`/api/student?studentId=${student.studentId}&studentName=${encodeURIComponent(student.studentName)}`)
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.errno !== 200) {
      throw new Error(data.errmsg || '请求失败')
    }
    
    // 调试信息，打印API响应内容
    console.log('获取到学生数据:', data.result)
    
    // 确保数据存在
    if (!data.result) {
      throw new Error('返回的数据为空')
    }
    
    // 强制使用新对象触发响应式更新
    const studentData = {
      studentId: data.result.studentId,
      studentName: data.result.studentName,
      year: data.result.year,
      college: data.result.college,
      major: data.result.major,
      className: data.result.className,
      totalCredit: data.result.totalCredit,
      tsCredit: data.result.tsCredit,
      slCredit: data.result.slCredit,
      dsjhCredit: data.result.dsjhCredit,
      tsktList: data.result.tsktList || [],
      dsslList: data.result.dsslList || [],
      dsjhList: data.result.dsjhList || []
    }
    
    // 使用解构赋值和新对象来确保响应式更新
    Object.assign(student, { 
      data: studentData,
      loading: false,
      error: undefined
    })
    
    // 打印更新后的student对象确认状态
    console.log('更新后的学生对象:', student)
    
    return data.result
  } catch (error) {
    console.error(`获取学生 ${student.studentId} 数据时出错:`, error)
    
    // 使用解构赋值确保响应式更新
    Object.assign(student, {
      error: error instanceof Error ? error.message : String(error),
      loading: false
    })
    
    return null
  } finally {
    // 再次确保loading状态正确重置
    student.loading = false
  }
}

const fetchAllStudentsData = async () => {
  const promises = students.value.map(student => fetchStudentData(student))
  await Promise.all(promises)
}

// 单个学生查询
const fetchSingleStudent = async () => {
  if (!singleStudentId.value) {
    errorMessage.value = '请输入学号'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const newStudent: Student = reactive({
      studentId: singleStudentId.value,
      studentName: singleStudentName.value,
      loading: true,
      data: undefined,
      error: undefined
    })
    
    // 添加到学生列表
    students.value = [newStudent]
    
    await fetchStudentData(newStudent)
    
    // 重置输入
    singleStudentId.value = ''
    singleStudentName.value = ''
  } catch (error) {
    errorMessage.value = `查询失败: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isLoading.value = false
  }
}

// 查看学生详情
const viewStudentDetails = (student: Student) => {
  selectedStudent.value = student
}

// 格式化日期
const formatDate = (timestamp: number) => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">东莞理工学院通识教育学分查询</h1>
    
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
            <Button @click="open()" variant="default">
              选择文件
            </Button>
            <input type="file" hidden @change="handleFileUpload" accept=".xlsx,.xls,.csv" />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="single" class="p-4 bg-white rounded-lg shadow">
        <div class="flex flex-col space-y-4">
          <div>
            <label class="block mb-1">学号</label>
            <Input v-model="singleStudentId" placeholder="请输入学号" class="w-full" />
          </div>
          <div>
            <label class="block mb-1">姓名 (选填)</label>
            <Input v-model="singleStudentName" placeholder="请输入姓名" class="w-full" />
          </div>
          <Button @click="fetchSingleStudent" variant="default">
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
    
    <!-- 学生列表 -->
    <Card v-if="students.length > 0" class="bg-white rounded-lg shadow overflow-hidden mb-4">
      <!-- 分页设置和信息 -->
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">每页显示:</span>
          <Select v-model="pageSize" @update:modelValue="handlePageSizeChange">
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
          显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, students.length) }} 条，共 {{ students.length }} 条
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="px-4 py-2 font-medium text-left">学号</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">姓名</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">学院</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">专业</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">班级</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">通识教育学分</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">读书计划学分</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">总学分</TableHead>
            <TableHead class="px-4 py-2 font-medium text-left">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="student in paginatedStudents" :key="student.studentId" :class="{'bg-gray-50': student.loading}">
            <TableCell class="px-4 py-2">{{ student.studentId }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.studentName }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.data?.college || '-' }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.data?.major || '-' }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.data?.className || '-' }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.data?.tsCredit }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.data?.dsjhCredit }}</TableCell>
            <TableCell class="px-4 py-2">{{ student.data?.totalCredit }}</TableCell>
            <TableCell class="px-4 py-2">
              <div v-if="student.loading" class="animate-pulse">加载中...</div>
              <div v-else-if="student.error" class="text-red-500">{{ student.error }}</div>
              <div v-else-if="student.data" class="dialog-container">
                <Button @click="viewStudentDetails(student)" variant="default" size="sm" class="px-3 py-1 text-sm">
                  查看详情
                </Button>
                
                <div v-if="selectedStudent === student" class="fixed inset-0 flex items-center justify-center z-50">
                  <div class="fixed inset-0 bg-black bg-opacity-50" @click="selectedStudent = null"></div>
                  <Card class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10">
                    <CardHeader>
                      <CardTitle>{{ student.data?.studentName }} 的学分详情</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div class="mb-6 grid grid-cols-2 gap-4">
                        <div>
                          <p><span class="font-medium">学号:</span> {{ student.data?.studentId }}</p>
                          <p><span class="font-medium">姓名:</span> {{ student.data?.studentName }}</p>
                          <p><span class="font-medium">年级:</span> {{ student.data?.year }}</p>
                        </div>
                        <div>
                          <p><span class="font-medium">学院:</span> {{ student.data?.college }}</p>
                          <p><span class="font-medium">专业:</span> {{ student.data?.major }}</p>
                          <p><span class="font-medium">班级:</span> {{ student.data?.className }}</p>
                        </div>
                      </div>
                      
                      <div class="mb-4">
                        <h3 class="text-lg font-medium mb-2">学分统计</h3>
                        <div class="grid grid-cols-3 gap-4">
                          <div class="p-3 bg-blue-50 rounded">
                            <p class="text-sm">通识教育学分</p>
                            <p class="text-xl font-bold">{{ student.data?.tsCredit }}/1.0</p>
                          </div>
                          <div class="p-3 bg-green-50 rounded">
                            <p class="text-sm">读书计划学分</p>
                            <p class="text-xl font-bold">{{ student.data?.dsjhCredit }}/1.0</p>
                          </div>
                          <div class="p-3 bg-purple-50 rounded">
                            <p class="text-sm">总学分</p>
                            <p class="text-xl font-bold">{{ student.data?.totalCredit }}/2.0</p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 通识课堂列表 -->
                      <div v-if="student.data?.tsktList?.length > 0" class="mb-6">
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
                              <TableRow v-for="(course, index) in student.data?.tsktList" :key="index">
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
                      <div v-if="student.data?.dsjhList?.length > 0" class="mb-6">
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
                              <TableRow v-for="(course, index) in student.data?.dsjhList" :key="index">
                                <TableCell class="px-3 py-2 text-sm">{{ course.title }}</TableCell>
                                <TableCell class="px-3 py-2 text-sm">{{ formatDate(course.activityTime) }}</TableCell>
                                <TableCell class="px-3 py-2 text-sm">{{ course.credit }}</TableCell>
                                <TableCell class="px-3 py-2 text-sm">{{ course.description }}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      <Button @click="selectedStudent = null" variant="outline" class="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
                        <span class="sr-only">关闭</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <!-- 分页控制 -->
      <div class="flex justify-between items-center px-4 py-3 border-t border-gray-200">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">第 {{ currentPage }}/{{ totalPages }} 页</span>
        </div>
        <div class="flex space-x-2">
          <Button @click="goToFirstPage" :disabled="currentPage === 1" variant="outline" size="sm">
            首页
          </Button>
          <Button @click="goToPreviousPage" :disabled="currentPage === 1" variant="outline" size="sm">
            上一页
          </Button>
          <div class="flex items-center space-x-1">
            <Input
              :model-value="currentPage"
              @update:model-value="(val) => goToPage(Number(val))"
              class="w-16 h-8 text-center"
              type="number"
              min="1"
              :max="totalPages"
            />
            <span class="text-sm text-gray-600">/{{ totalPages }}</span>
          </div>
          <Button @click="goToNextPage" :disabled="currentPage === totalPages" variant="outline" size="sm">
            下一页
          </Button>
          <Button @click="goToLastPage" :disabled="currentPage === totalPages" variant="outline" size="sm">
            末页
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>