import { ref, computed } from 'vue'
import type { Student, StudentData, SortDirection, FilterOption, SortOption } from '~/types'
import { useStudentApi } from './useStudentApi'
import { useTableControls } from './useTableControls'
import { exportStudentsToCSV, downloadCSV } from '~/utils/parser'

export function useStudents() {
  // 状态
  const students = ref<Student[]>([])
  const selectedStudent = ref<Student | null>(null)
  const errorMessage = ref('')
  const showStudentDetails = ref(false)
  const isLoading = ref(false)

  // 筛选状态
  const filterOptions: FilterOption[] = [
    { value: 'all', label: '显示全部' },
    { value: 'tsCreditsLow', label: '通识教育学分不足' },
    { value: 'dsjhCreditsLow', label: '读书计划学分不足' },
    { value: 'anyCreditsLow', label: '任一学分不足' },
    { value: 'allCreditsLow', label: '全部学分不足' },
    { value: 'allCreditsFull', label: '全部学分已满' }
  ]
  const currentFilter = ref('all')

  // 排序状态
  const sortOptions: SortOption[] = [
    { value: '', label: '默认排序' },
    { value: 'studentId', label: '按学号' },
    { value: 'studentName', label: '按姓名' },
    { value: 'college', label: '按学院' },
    { value: 'tsCredit', label: '按通识教育学分' },
    { value: 'dsjhCredit', label: '按读书计划学分' },
    { value: 'totalCredit', label: '按总学分' }
  ]
  const sortField = ref('')
  const sortDirection = ref<SortDirection>('asc')

  // 分页状态
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(10)
  const pageSizeOptions = [5, 10, 20, 50, 100]

  // 计算属性
  const totalPages = computed(() => Math.ceil(displayedStudents.value.length / pageSize.value))

  // 筛选和排序后的学生列表
  const displayedStudents = computed(() => {
    // 先筛选
    let result = students.value
    
    if (currentFilter.value !== 'all') {
      result = result.filter(student => {
        if (!student.data) return false
        
        const tsCredit = student.data.tsCredit
        const dsjhCredit = student.data.dsjhCredit
        
        switch (currentFilter.value) {
          case 'tsCreditsLow':
            return tsCredit < 1
          case 'dsjhCreditsLow':
            return dsjhCredit < 1
          case 'anyCreditsLow':
            return tsCredit < 1 || dsjhCredit < 1
          case 'allCreditsLow':
            return tsCredit < 1 && dsjhCredit < 1
          case 'allCreditsFull':
            return tsCredit >= 1 && dsjhCredit >= 1
          default:
            return true
        }
      })
    }
    
    // 再排序
    if (sortField.value) {
      result = [...result].sort((a, b) => {
        if (!a.data || !b.data) return 0
        
        let valueA: any
        let valueB: any
        
        // 获取排序字段的值
        if (sortField.value === 'studentId' || sortField.value === 'studentName') {
          valueA = a[sortField.value as keyof Student]
          valueB = b[sortField.value as keyof Student]
        } else if (a.data && b.data) {
          valueA = a.data[sortField.value as keyof StudentData]
          valueB = b.data[sortField.value as keyof StudentData]
        } else {
          return 0
        }
        
        // 处理空值
        if (valueA === undefined) return sortDirection.value === 'asc' ? 1 : -1
        if (valueB === undefined) return sortDirection.value === 'asc' ? -1 : 1
        
        // 根据值类型进行比较
        let result = 0
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          result = valueA - valueB
        } else {
          // 字符串比较
          result = String(valueA).localeCompare(String(valueB), 'zh-CN')
        }
        
        // 根据排序方向返回结果
        return sortDirection.value === 'asc' ? result : -result
      })
    }
    
    return result
  })

  // 当前页的学生
  const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return displayedStudents.value.slice(start, end)
  })

  // 导入API相关功能
  const { fetchStudent, fetchStudentsBatch } = useStudentApi()
  
  // 导入表格控制相关功能
  const tableControls = useTableControls(students)

  /**
   * 获取单个学生数据
   */
  const fetchStudentData = async (student: Student) => {
    if (!student.studentId) {
      student.error = '学号不能为空'
      return null
    }
    
    try {
      student.loading = true
      student.error = undefined
      
      const result = await fetchStudent(student.studentId, student.studentName)
      
      if (result) {
        student.data = result
        return result
      } else {
        student.error = '获取学生数据失败'
        return null
      }
    } catch (err) {
      student.error = err instanceof Error ? err.message : '获取学生数据失败'
      return null
    } finally {
      student.loading = false
    }
  }
  
  /**
   * 获取所有学生的数据
   */
  const fetchAllStudentsData = async () => {
    if (students.value.length === 0) {
      errorMessage.value = '没有学生数据可加载'
      return
    }
    
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      students.value = await fetchStudentsBatch(students.value)
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : '批量获取学生数据失败'
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 设置学生列表
   */
  const setStudents = (newStudents: Student[]) => {
    students.value = newStudents
    selectedStudent.value = null
    showStudentDetails.value = false
  }
  
  /**
   * 查看学生详情
   */
  const viewStudentDetails = (student: Student) => {
    selectedStudent.value = student
    showStudentDetails.value = true
  }
  
  /**
   * 关闭学生详情
   */
  const closeStudentDetails = () => {
    showStudentDetails.value = false
    selectedStudent.value = null
  }
  
  /**
   * 导出学生数据为CSV文件
   */
  const exportToCSV = () => {
    if (students.value.length === 0) {
      errorMessage.value = '没有学生数据可导出'
      return
    }
    
    try {
      const csvContent = exportStudentsToCSV(students.value)
      downloadCSV(csvContent, '学生学分数据.csv')
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : '导出CSV失败'
    }
  }
  
  /**
   * 格式化日期
   */
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '未知时间'
    
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return {
    // 状态
    students,
    selectedStudent,
    errorMessage,
    showStudentDetails,
    isLoading,
    
    // 表格控制相关功能
    ...tableControls,
    
    // 方法
    fetchStudentData,
    fetchAllStudentsData,
    setStudents,
    viewStudentDetails,
    closeStudentDetails,
    exportToCSV,
    formatDate
  }
} 