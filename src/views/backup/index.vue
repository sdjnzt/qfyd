<template>
  <div class="backup-container">
    <h1>备份管理</h1>
<!--    <p>这里是曲阜远东职业技术学院备份管理模块</p>-->
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索备份任务（名称/类型/状态）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增备份任务</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedBackupTasks" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="source" label="备份源" width="150" />
        <el-table-column prop="destination" label="备份目标" width="150" />
        <el-table-column prop="schedule" label="执行计划" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastBackup" label="最后备份" width="150" />
        <el-table-column prop="nextBackup" label="下次备份" width="150" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">查看</el-button>
            <el-button type="warning" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredBackupTasks.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增备份任务' : '编辑备份任务'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="完整备份" value="完整备份" />
            <el-option label="增量备份" value="增量备份" />
            <el-option label="差异备份" value="差异备份" />
            <el-option label="日志备份" value="日志备份" />
          </el-select>
        </el-form-item>
        <el-form-item label="备份源" prop="source">
          <el-input v-model="editForm.source" />
        </el-form-item>
        <el-form-item label="备份目标" prop="destination">
          <el-input v-model="editForm.destination" />
        </el-form-item>
        <el-form-item label="执行计划" prop="schedule">
          <el-select v-model="editForm.schedule" placeholder="请选择">
            <el-option label="每日" value="每日" />
            <el-option label="每周" value="每周" />
            <el-option label="每月" value="每月" />
            <el-option label="手动" value="手动" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
            <el-option label="错误" value="错误" />
            <el-option label="运行中" value="运行中" />
          </el-select>
        </el-form-item>
        <el-form-item label="最后备份" prop="lastBackup">
          <el-input v-model="editForm.lastBackup" />
        </el-form-item>
        <el-form-item label="下次备份" prop="nextBackup">
          <el-input v-model="editForm.nextBackup" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="备份任务详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="任务名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="备份源">{{ detailData.source }}</el-descriptions-item>
        <el-descriptions-item label="备份目标">{{ detailData.destination }}</el-descriptions-item>
        <el-descriptions-item label="执行计划">{{ detailData.schedule }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
        <el-descriptions-item label="最后备份">{{ detailData.lastBackup }}</el-descriptions-item>
        <el-descriptions-item label="下次备份">{{ detailData.nextBackup }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const backupTasks = ref([
  { id: 1, name: '学生数据库备份', type: '完整备份', source: '/data/student_db', destination: '/backup/student_db', schedule: '每日', status: '启用', lastBackup: '2025-06-15 02:00:00', nextBackup: '2025-06-16 02:00:00' },
  { id: 2, name: '教务系统备份', type: '完整备份', source: '/data/academic_sys', destination: '/backup/academic_sys', schedule: '每日', status: '启用', lastBackup: '2025-06-15 03:00:00', nextBackup: '2025-06-16 03:00:00' },
  { id: 3, name: '财务系统备份', type: '完整备份', source: '/data/finance_sys', destination: '/backup/finance_sys', schedule: '每日', status: '启用', lastBackup: '2025-06-15 04:00:00', nextBackup: '2025-06-16 04:00:00' },
  { id: 4, name: '教学资源备份', type: '增量备份', source: '/data/teaching_resources', destination: '/backup/teaching_resources', schedule: '每周', status: '启用', lastBackup: '2025-06-14 01:00:00', nextBackup: '2025-06-21 01:00:00' },
  { id: 5, name: '人事档案备份', type: '完整备份', source: '/data/hr_records', destination: '/backup/hr_records', schedule: '每周', status: '启用', lastBackup: '2025-06-13 02:00:00', nextBackup: '2025-06-20 02:00:00' },
  { id: 6, name: '系统日志备份', type: '日志备份', source: '/var/log', destination: '/backup/system_logs', schedule: '每日', status: '启用', lastBackup: '2025-06-15 01:00:00', nextBackup: '2025-06-16 01:00:00' },
  { id: 7, name: '网站文件备份', type: '差异备份', source: '/var/www', destination: '/backup/website_files', schedule: '每周', status: '启用', lastBackup: '2025-06-12 03:00:00', nextBackup: '2025-06-19 03:00:00' },
  { id: 8, name: '邮件系统备份', type: '完整备份', source: '/data/mail_system', destination: '/backup/mail_system', schedule: '每日', status: '错误', lastBackup: '2025-06-14 05:00:00', nextBackup: '2025-06-15 05:00:00' },
  { id: 9, name: '图书馆系统备份', type: '完整备份', source: '/data/library_sys', destination: '/backup/library_sys', schedule: '每日', status: '运行中', lastBackup: '2025-06-15 06:00:00', nextBackup: '2025-06-16 06:00:00' },
  { id: 10, name: '研究数据备份', type: '增量备份', source: '/data/research_data', destination: '/backup/research_data', schedule: '每月', status: '禁用', lastBackup: '2025-06-01 02:00:00', nextBackup: '2025-02-01 02:00:00' }
])

const filteredBackupTasks = computed(() => {
  if (!searchQuery.value) return backupTasks.value
  return backupTasks.value.filter(b =>
    b.name.includes(searchQuery.value) ||
    b.type.includes(searchQuery.value) ||
    b.status.includes(searchQuery.value)
  )
})

const pagedBackupTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredBackupTasks.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  currentPage.value = 1
}
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
}
function handleCurrentChange(val: number) {
  currentPage.value = val
}

const getStatusType = (status: string) => {
  switch (status) {
    case '启用':
      return 'success'
    case '禁用':
      return 'info'
    case '错误':
      return 'danger'
    case '运行中':
      return 'warning'
    default:
      return 'info'
  }
}
// 新增/编辑弹窗
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
const editForm = reactive({
  id: 0,
  name: '', type: '', source: '', destination: '', schedule: '', status: '启用', lastBackup: '', nextBackup: ''
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  source: [{ required: true, message: '请输入备份源', trigger: 'blur' }],
  destination: [{ required: true, message: '请输入备份目标', trigger: 'blur' }],
  schedule: [{ required: true, message: '请选择执行计划', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  lastBackup: [{ required: true, message: '请输入最后备份时间', trigger: 'blur' }],
  nextBackup: [{ required: true, message: '请输入下次备份时间', trigger: 'blur' }]
}
function openAddDialog() {
  editMode.value = 'add'
  const maxId = Math.max(...backupTasks.value.map(b => b.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', type: '', source: '', destination: '', schedule: '', status: '启用', lastBackup: '', nextBackup: '' })
  editDialogVisible.value = true
  nextTick(() => editFormRef.value?.clearValidate())
}
function openEditDialog(row: any) {
  editMode.value = 'edit'
  Object.assign(editForm, row)
  editDialogVisible.value = true
  nextTick(() => editFormRef.value?.clearValidate())
}
function submitEdit() {
  editFormRef.value.validate((valid: boolean) => {
    if (!valid) return
    if (editMode.value === 'add') {
      backupTasks.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
      } else {
      const idx = backupTasks.value.findIndex(b => b.id === editForm.id)
      if (idx !== -1) {
        backupTasks.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除备份任务"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = backupTasks.value.findIndex(b => b.id === row.id)
      if (idx !== -1) {
        backupTasks.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', type: '', source: '', destination: '', schedule: '', status: '', lastBackup: '', nextBackup: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.backup-container {
  padding: 20px;
}

.backup-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 