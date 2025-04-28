import { ref } from 'vue'
import type { Student } from '~/types'
import { parseStudentsFromExcel, parseStudentsFromText } from '~/utils/parser'

/**
 * 用于导入学生数据的组合式函数
 */
export function useImporter() {
  // 状态
  const isImporting = ref(false)
  const importProgress = ref(0)
  const importError = ref<string | null>(null)
  const importedStudents = ref<Student[]>([])
  const textInput = ref('')
  
  /**
   * 从Excel文件导入学生数据
   */
  const importFromExcel = async (file: File) => {
    if (!file) return
    
    try {
      importError.value = null
      isImporting.value = true
      importProgress.value = 10
      
      // 检查文件类型
      const fileType = file.name.split('.').pop()?.toLowerCase()
      if (fileType !== 'xlsx' && fileType !== 'csv') {
        throw new Error('只支持.xlsx或.csv格式文件')
      }
      
      importProgress.value = 30
      
      // 解析Excel文件
      const students = await parseStudentsFromExcel(file)
      
      importProgress.value = 80
      
      if (students.length === 0) {
        throw new Error('未能从文件中导入任何学生信息')
      }
      
      importedStudents.value = students
      importProgress.value = 100
      return students
    } catch (error) {
      importError.value = error instanceof Error ? error.message : '导入过程中发生错误'
      return []
    } finally {
      setTimeout(() => {
        isImporting.value = false
      }, 500) // 延迟重置导入状态，以便用户能看到完成进度
    }
  }
  
  /**
   * 从文本导入学生数据
   */
  const importFromText = () => {
    try {
      importError.value = null
      isImporting.value = true
      importProgress.value = 20
      
      if (!textInput.value.trim()) {
        throw new Error('请输入学生数据')
      }
      
      importProgress.value = 50
      
      // 解析文本
      const students = parseStudentsFromText(textInput.value)
      
      importProgress.value = 90
      
      if (students.length === 0) {
        throw new Error('未能从文本中导入任何学生信息')
      }
      
      importedStudents.value = students
      importProgress.value = 100
      return students
    } catch (error) {
      importError.value = error instanceof Error ? error.message : '导入过程中发生错误'
      return []
    } finally {
      setTimeout(() => {
        isImporting.value = false
      }, 500)
    }
  }
  
  /**
   * 清空导入的学生数据
   */
  const clearImported = () => {
    importedStudents.value = []
    textInput.value = ''
    importError.value = null
    importProgress.value = 0
  }
  
  return {
    // 状态
    isImporting,
    importProgress,
    importError,
    importedStudents,
    textInput,
    
    // 方法
    importFromExcel,
    importFromText,
    clearImported
  }
} 