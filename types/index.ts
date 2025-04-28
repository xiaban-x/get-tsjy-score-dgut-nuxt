// 学生数据模型
export interface Student {
  studentId: string
  studentName: string
  data?: StudentData
  loading?: boolean
  error?: string
}

// 学生详细信息
export interface StudentData {
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

// 课程项目
export interface CourseItem {
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

// API响应类型
export interface ApiResponse {
  errno: number
  errmsg: string
  usermsg: string
  result: StudentData
}

// 排序方向
export type SortDirection = 'asc' | 'desc'

// 筛选选项
export interface FilterOption {
  value: string
  label: string
}

// 排序选项
export interface SortOption {
  value: string
  label: string
} 