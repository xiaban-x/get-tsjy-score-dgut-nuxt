import { ref } from 'vue'
import type { Student, StudentData } from '~/types'

/**
 * 学生API请求相关组合函数
 */
export function useStudentApi() {
  // 状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * 获取单个学生的学分情况
   */
  const fetchStudent = async (studentId: string, studentName: string = ''): Promise<StudentData | null> => {
    if (!studentId) {
      throw new Error('学号不能为空')
    }
    
    try {
      isLoading.value = true
      error.value = null
      
      // 调用API
      const response = await fetch(`/api/student?studentId=${encodeURIComponent(studentId)}&studentName=${encodeURIComponent(studentName)}`)
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
      }
      
      const data = await response.json()
      
      // 处理API错误
      if (data.errno !== 200) {
        throw new Error(data.errmsg || '请求失败')
      }
      
      // 没有返回结果
      if (!data.result) {
        throw new Error('未找到学生信息')
      }
      
      return data.result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取学生信息失败'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 批量获取学生学分情况
   */
  const fetchStudentsBatch = async (students: Student[]): Promise<Student[]> => {
    const updatedStudents = [...students]
    
    for (let i = 0; i < updatedStudents.length; i++) {
      const student = updatedStudents[i]
      
      // 跳过已经加载的或出错的
      if (student.data || (student.error && student.error !== '无效的学生信息')) {
        continue
      }
      
      try {
        // 标记为加载中
        student.loading = true
        student.error = undefined
        
        // 获取学生数据
        const result = await fetchStudent(student.studentId, student.studentName)
        
        if (result) {
          student.data = result
        } else {
          student.error = '获取学生信息失败'
        }
      } catch (err) {
        student.error = err instanceof Error ? err.message : '获取学生信息失败'
      } finally {
        student.loading = false
      }
    }
    
    return updatedStudents
  }
  
  return {
    // 状态
    isLoading,
    error,
    
    // 方法
    fetchStudent,
    fetchStudentsBatch
  }
} 