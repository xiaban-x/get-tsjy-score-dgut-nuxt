import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Student, SortDirection, StudentData } from '~/types'

/**
 * 表格控制组合函数，处理排序、分页和筛选
 */
export function useTableControls(students: Ref<Student[]>) {
  // 排序状态
  const sortField = ref('')
  const sortDirection = ref<SortDirection>('asc')
  
  // 分页状态
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(10)
  const pageSizeOptions = [5, 10, 20, 50, 100]
  
  // 筛选状态
  const currentFilter = ref('all')
  
  // 筛选选项
  const filterOptions = [
    { value: 'all', label: '显示全部' },
    { value: 'tsCreditsLow', label: '通识教育学分不足' },
    { value: 'dsjhCreditsLow', label: '读书计划学分不足' },
    { value: 'anyCreditsLow', label: '任一学分不足' },
    { value: 'allCreditsLow', label: '全部学分不足' },
    { value: 'allCreditsFull', label: '全部学分已满' }
  ]
  
  // 排序选项
  const sortOptions = [
    { value: '', label: '默认排序' },
    { value: 'studentId', label: '按学号' },
    { value: 'studentName', label: '按姓名' },
    { value: 'college', label: '按学院' },
    { value: 'tsCredit', label: '按通识教育学分' },
    { value: 'dsjhCredit', label: '按读书计划学分' },
    { value: 'totalCredit', label: '按总学分' }
  ]
  
  // 处理筛选后的学生数据
  const filteredStudents = computed(() => {
    if (currentFilter.value === 'all') {
      return students.value
    }
    
    return students.value.filter(student => {
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
  })
  
  // 处理排序后的学生数据
  const sortedStudents = computed(() => {
    if (!sortField.value) {
      return filteredStudents.value
    }
    
    return [...filteredStudents.value].sort((a, b) => {
      if (!a.data || !b.data) return 0
      
      let valueA: any
      let valueB: any
      
      // 获取排序字段的值
      if (sortField.value === 'studentId' || sortField.value === 'studentName') {
        valueA = a[sortField.value as keyof Student]
        valueB = b[sortField.value as keyof Student]
      } else if (a.data && b.data) {
        // 类型安全的方式获取属性值
        switch (sortField.value) {
          case 'college':
            valueA = a.data.college
            valueB = b.data.college
            break
          case 'tsCredit':
            valueA = a.data.tsCredit
            valueB = b.data.tsCredit
            break
          case 'dsjhCredit':
            valueA = a.data.dsjhCredit
            valueB = b.data.dsjhCredit
            break
          case 'totalCredit':
            valueA = a.data.totalCredit
            valueB = b.data.totalCredit
            break
          default:
            return 0
        }
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
  })
  
  // 总页数
  const totalPages = computed(() => Math.ceil(sortedStudents.value.length / pageSize.value))
  
  // 当前页数据
  const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedStudents.value.slice(start, end)
  })
  
  // 切换排序
  const toggleSort = (field: string) => {
    if (sortField.value === field) {
      // 相同字段，切换排序方向
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // 不同字段，设置新字段并默认为升序
      sortField.value = field
      sortDirection.value = 'asc'
    }
    
    // 重置到第一页
    currentPage.value = 1
  }
  
  // 获取排序图标样式
  const getSortIconClass = (field: string) => {
    if (sortField.value !== field) return ''
    return sortDirection.value === 'asc' ? 'i-carbon-arrow-up' : 'i-carbon-arrow-down'
  }
  
  // 应用筛选
  const applyFilter = (filter: string) => {
    currentFilter.value = filter
    // 重置到第一页
    currentPage.value = 1
  }
  
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
  
  // 处理每页显示数量变化
  const handlePageSizeChange = (value: any) => {
    pageSize.value = typeof value === 'string' ? parseInt(value) : value
    // 当改变每页显示数量时，可能需要调整当前页码
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1
    }
  }
  
  return {
    // 状态
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    pageSizeOptions,
    currentFilter,
    filterOptions,
    sortOptions,
    
    // 计算属性
    filteredStudents,
    sortedStudents,
    totalPages,
    paginatedStudents,
    
    // 方法
    toggleSort,
    getSortIconClass,
    applyFilter,
    goToPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    handlePageSizeChange
  }
} 