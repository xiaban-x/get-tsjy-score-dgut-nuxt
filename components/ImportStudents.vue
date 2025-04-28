<template>
  <div class="import-students">
    <div class="import-options">
      <div class="tab-controls">
        <button 
          :class="{ active: activeTab === 'file' }" 
          @click="activeTab = 'file'"
        >
          从Excel导入
        </button>
        <button 
          :class="{ active: activeTab === 'text' }" 
          @click="activeTab = 'text'"
        >
          从文本导入
        </button>
      </div>
      
      <!-- 文件导入选项卡 -->
      <div v-show="activeTab === 'file'" class="tab-content">
        <div class="file-upload-area" @click="triggerFileInput" @drop.prevent="handleFileDrop" @dragover.prevent>
          <input 
            ref="fileInput" 
            type="file" 
            accept=".xlsx,.csv" 
            class="hidden-input"
            @change="handleFileSelect"
          >
          <div class="upload-icon">
            <i class="i-ri-file-excel-2-line text-2xl" />
          </div>
          <p>点击或拖拽Excel文件到此处</p>
          <p class="text-xs text-slate-500">支持.xlsx和.csv格式</p>
        </div>
        
        <div v-if="selectedFileName" class="selected-file">
          <span>已选择: {{ selectedFileName }}</span>
          <button class="clear-btn" @click.stop="clearSelectedFile">
            <i class="i-ri-close-line" />
          </button>
        </div>
        
        <button
          class="import-btn" 
          :disabled="!selectedFile || isImporting"
          @click="importSelectedFile"
        >
          {{ isImporting ? '导入中...' : '导入' }}
        </button>
      </div>
      
      <!-- 文本导入选项卡 -->
      <div v-show="activeTab === 'text'" class="tab-content">
        <div class="text-area-container">
          <textarea 
            v-model="textInput"
            placeholder="请粘贴学生学号和姓名，每行一个学生，例如:
201830610000 张三
201830620000 李四"
            rows="8"
          ></textarea>
        </div>
        
        <button
          class="import-btn"
          :disabled="!textInput.trim() || isImporting"
          @click="importFromText"
        >
          {{ isImporting ? '导入中...' : '导入' }}
        </button>
      </div>
    </div>
    
    <!-- 导入进度 -->
    <div v-if="isImporting" class="import-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${importProgress}%` }" />
      </div>
      <div class="progress-text">{{ importProgress }}%</div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="importError" class="import-error">
      <i class="i-ri-error-warning-line mr-1" />
      <span>{{ importError }}</span>
    </div>
    
    <!-- 导入结果 -->
    <div v-if="importedStudents.length > 0" class="import-results">
      <div class="results-header">
        <h3>导入成功 ({{ importedStudents.length }}个学生)</h3>
        <button class="clear-btn" @click="clearImported">
          <i class="i-ri-delete-bin-5-line mr-1" />
          <span>清空</span>
        </button>
      </div>
      
      <div class="students-list">
        <div v-for="(student, index) in displayedStudents" :key="`${student.studentId}-${index}`" class="student-item">
          <span class="student-id">{{ student.studentId }}</span>
          <span class="student-name">{{ student.studentName }}</span>
        </div>
        
        <div v-if="importedStudents.length > displayLimit" class="more-students">
          还有 {{ importedStudents.length - displayLimit }} 个学生未显示
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImporter } from '~/composables/useImporter'

// 导入器组合函数
const {
  isImporting,
  importProgress,
  importError,
  importedStudents,
  textInput,
  importFromExcel,
  importFromText,
  clearImported
} = useImporter()

// 组件状态
const activeTab = ref('file')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const displayLimit = 10 // 最大显示学生数量

// 计算属性
const selectedFileName = computed(() => selectedFile.value?.name || '')
const displayedStudents = computed(() => importedStudents.value.slice(0, displayLimit))

// 文件选择方法
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

function handleFileDrop(event: DragEvent) {
  if (event.dataTransfer?.files.length) {
    const file = event.dataTransfer.files[0]
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'xlsx' || fileExtension === 'csv') {
      selectedFile.value = file
    } else {
      importError.value = '只支持.xlsx或.csv格式文件'
    }
  }
}

function clearSelectedFile(event: Event) {
  event.stopPropagation()
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 导入方法
async function importSelectedFile() {
  if (selectedFile.value) {
    await importFromExcel(selectedFile.value)
    // 导入成功后清空选择的文件
    if (!importError.value) {
      selectedFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }
}
</script>

<style scoped>
.import-students {
  max-width: 100%;
  margin: 0 auto;
}

.import-options {
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.tab-controls {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab-controls button {
  flex: 1;
  padding: 0.75rem;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tab-controls button.active {
  background: white;
  font-weight: 500;
  border-bottom: 2px solid #3b82f6;
}

.tab-content {
  padding: 1.5rem;
}

.file-upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 0.5rem;
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-upload-area:hover {
  border-color: #94a3b8;
}

.upload-icon {
  margin-bottom: 0.75rem;
  color: #64748b;
}

.hidden-input {
  display: none;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
}

.import-btn {
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.import-btn:hover:not(:disabled) {
  background: #2563eb;
}

.import-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.text-area-container {
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  resize: vertical;
}

.import-progress {
  margin: 1rem 0;
}

.progress-bar {
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: right;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.import-error {
  display: flex;
  align-items: center;
  margin: 1rem 0;
  padding: 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 0.25rem;
}

.import-results {
  margin-top: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.results-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.students-list {
  max-height: 20rem;
  overflow-y: auto;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.student-id {
  width: 40%;
  font-family: monospace;
  color: #475569;
}

.student-name {
  flex: 1;
}

.more-students {
  padding: 0.75rem 1rem;
  text-align: center;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.875rem;
}
</style> 