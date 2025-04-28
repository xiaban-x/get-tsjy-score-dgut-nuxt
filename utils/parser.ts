import { read, utils } from 'xlsx'
import type { Student } from '~/types'

/**
 * 从Excel文件中解析学生信息
 * 支持.xlsx和.csv格式
 */
export function parseStudentsFromExcel(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('读取文件失败')
        }

        // 读取工作簿
        const data = new Uint8Array(e.target.result as ArrayBuffer)
        const workbook = read(data, { type: 'array' })

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          throw new Error('Excel文件中没有找到工作表')
        }
        
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为对象数组
        const rows = utils.sheet_to_json(worksheet)
        
        if (rows.length === 0) {
          throw new Error('文件中没有数据')
        }

        // 提取学生ID和姓名
        const students: Student[] = rows.map((row: any, index) => {
          const studentId = (row['学号'] || row['id'] || row['ID'] || row['学生ID'] || '')?.toString().trim()
          const studentName = (row['姓名'] || row['name'] || row['NAME'] || row['学生姓名'] || '')?.toString().trim()
          
          if (!studentId && !studentName) {
            console.warn(`第 ${index + 1} 行没有有效的学号或姓名`)
          }
          
          return {
            studentId: studentId || '',
            studentName: studentName || '', 
            loading: false,
            error: (!studentId && !studentName) ? '无效的学生信息' : undefined,
            data: undefined
          }
        }).filter(student => student.studentId || student.studentName)

        if (students.length === 0) {
          throw new Error('未能从文件中提取有效的学生信息')
        }

        resolve(students)
      } catch (error) {
        console.error('解析Excel文件时出错:', error)
        reject(error instanceof Error ? error : new Error('解析Excel文件失败'))
      }
    }

    reader.onerror = () => {
      reject(new Error('读取文件时发生错误'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * 从文本框中解析学生信息
 * 格式: 学号 姓名 (每行一个学生信息)
 */
export function parseStudentsFromText(text: string): Student[] {
  if (!text.trim()) {
    return []
  }
  
  const lines = text.split('\n')
  const students: Student[] = []
  
  lines.forEach((line, index) => {
    if (!line.trim()) return
    
    // 尝试匹配 "学号 姓名" 或 "姓名 学号" 格式
    const parts = line.trim().split(/\s+/)
    
    if (parts.length >= 2) {
      // 检查第一部分是否像学号 (数字或字母+数字)
      const firstPartLooksLikeId = /^[A-Za-z0-9]+$/.test(parts[0]) && /\d/.test(parts[0])
      
      const studentId = firstPartLooksLikeId ? parts[0] : parts[1]
      const studentName = firstPartLooksLikeId ? parts.slice(1).join(' ') : parts[0]
      
      students.push({
        studentId,
        studentName,
        loading: false,
        error: undefined,
        data: undefined
      })
    } else if (parts.length === 1) {
      // 只有一个字段，判断是学号还是姓名
      const isLikelyStudentId = /^\d+$/.test(parts[0]) || /^[A-Za-z]\d+$/.test(parts[0])
      
      students.push({
        studentId: isLikelyStudentId ? parts[0] : '',
        studentName: isLikelyStudentId ? '' : parts[0],
        loading: false,
        error: undefined,
        data: undefined
      })
    }
  })
  
  return students
}

/**
 * 导出学生学分情况为CSV
 */
export function exportStudentsToCSV(students: Student[]): string {
  // 创建CSV头部
  const headers = [
    '学号',
    '姓名',
    '学院',
    '专业',
    '班级',
    '入学年份',
    '通识教育学分',
    '通识拓展课学分',
    '读书计划学分',
    '总学分'
  ].join(',')
  
  // 转换每个学生为CSV行
  const rows = students.map(student => {
    const data = student.data
    return [
      student.studentId,
      student.studentName,
      data?.college || '',
      data?.major || '',
      data?.className || '',
      data?.year || '',
      data?.tsCredit || '0',
      data?.slCredit || '0',
      data?.dsjhCredit || '0',
      data?.totalCredit || '0'
    ].map(value => {
      // 处理包含逗号或引号的字段
      const valueStr = String(value)
      if (valueStr.includes(',') || valueStr.includes('"')) {
        return `"${valueStr.replace(/"/g, '""')}"`
      }
      return valueStr
    }).join(',')
  }).join('\n')
  
  return headers + '\n' + rows
}

/**
 * 下载CSV文件
 */
export function downloadCSV(csvContent: string, fileName: string = 'students_data.csv'): void {
  // 添加BOM以确保Excel正确识别UTF-8编码
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
} 