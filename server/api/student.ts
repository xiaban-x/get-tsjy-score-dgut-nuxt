import { defineEventHandler, getQuery } from 'h3'

interface StudentResponse {
  errno: number
  errmsg: string
  usermsg: string
  result: StudentData
}

interface StudentData {
  studentId: string
  studentName: string
  year: string
  college: string
  major: string
  className: string
  dataSyncTime: number
  dataSyncTime_tsjy: number
  dataSyncTime_dssl: number | null
  dataSyncTime_dsjh: number
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

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const { studentId, studentName } = query
    
    console.log('API请求参数:', { studentId, studentName })
    
    if (!studentId) {
      return {
        errno: 400,
        errmsg: '缺少学号参数',
        usermsg: '',
        result: null
      }
    }
    
    // 构建请求URL，修正为正确的API地址
    const encodedName = studentName ? encodeURIComponent(String(studentName)) : ''
    const apiUrl = `https://tsjy.dgut.edu.cn/api/a/credit/statistics/student?studentId=${studentId}&studentName=${encodedName}`
    
    console.log('请求外部API:', apiUrl)
    
    // 发送请求到目标API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }
    
    const data: StudentResponse = await response.json()
    
    console.log('API响应状态:', {
      errno: data.errno,
      errmsg: data.errmsg,
      hasResult: !!data.result
    })
    
    if (data.result) {
      console.log('学生基本信息:', {
        studentId: data.result.studentId,
        studentName: data.result.studentName,
        totalCredit: data.result.totalCredit,
        tsCredit: data.result.tsCredit,
        dsjhCredit: data.result.dsjhCredit
      })
    }
    
    // 返回API响应
    return data
  } catch (error) {
    console.error('获取学生数据时出错:', error)
    
    return {
      errno: 500,
      errmsg: error instanceof Error ? error.message : '服务器内部错误',
      usermsg: '',
      result: null
    }
  }
})