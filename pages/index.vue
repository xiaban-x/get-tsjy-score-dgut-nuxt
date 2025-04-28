<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Card } from '~/components/ui/card'
import { useStudents } from '~/composables/useStudents'
import type { Student } from '~/types'

// 使用组合式函数
const {
  students,
  selectedStudent,
  showStudentDetails,
  errorMessage,
  isLoading,
  
  // 表格控制相关功能
  currentPage,
  pageSize,
  pageSizeOptions,
  totalPages,
  paginatedStudents,
  currentFilter,
  filterOptions,
  sortOptions,
  sortField,
  sortDirection,
  
  // 方法
  fetchStudentData,
  fetchAllStudentsData,
  setStudents,
  viewStudentDetails,
  closeStudentDetails,
  toggleSort,
  exportToCSV
} = useStudents()

// 处理单个学生查询
const handleFetchSingle = async (studentId: string, studentName: string) => {
  try {
    const newStudent: Student = reactive({
      studentId,
      studentName,
      loading: true,
      data: undefined,
      error: undefined
    })
    
    // 添加到学生列表
    setStudents([newStudent])
    
    // 获取数据
    await fetchStudentData(newStudent)
  } catch (error) {
    console.error('查询单个学生时出错:', error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">东莞理工学院通识教育学分查询</h1>
    
    <!-- 学生上传/查询组件 -->
    <StudentUpload 
      :is-loading="isLoading" 
      :error-message="errorMessage"
      @update:error="(val) => errorMessage = val"
      @set-students="setStudents"
      @fetch-single="handleFetchSingle"
    />
    
    <!-- 学生列表 -->
    <Card v-if="students.length > 0" class="bg-white rounded-lg shadow overflow-hidden mb-4">
      <!-- 筛选和排序组件 -->
      <StudentFilters
        :filter-options="filterOptions"
        :sort-options="sortOptions"
        :current-filter="currentFilter"
        :sort-field="sortField"
        :total-count="paginatedStudents.length"
        @update:current-filter="(val) => currentFilter = val"
        @toggle-sort="toggleSort"
      />
      
      <!-- 分页控制组件 (顶部) -->
      <StudentPagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-size-options="pageSizeOptions"
        :total-items="paginatedStudents.length"
        :total-pages="totalPages"
        @update:current-page="(val) => currentPage = val"
        @update:page-size="(val) => pageSize = val"
      />
      
      <!-- 学生表格组件 -->
      <StudentTable
        :students="paginatedStudents"
        :sort-field="sortField"
        :sort-direction="sortDirection"
        @toggle-sort="toggleSort"
        @view-details="viewStudentDetails"
      />
      
      <!-- 分页控制组件 (底部) -->
      <StudentPagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-size-options="pageSizeOptions"
        :total-items="paginatedStudents.length"
        :total-pages="totalPages"
        @update:current-page="(val) => currentPage = val"
        @update:page-size="(val) => pageSize = val"
      />
    </Card>
    
    <!-- 学生详情弹窗 -->
    <StudentDetail
      :student="selectedStudent"
      :show="showStudentDetails"
      @close="closeStudentDetails"
    />
  </div>
</template>