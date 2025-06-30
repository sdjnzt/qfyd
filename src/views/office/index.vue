<template>
  <div class="office-container">
    <h1>办公自动化</h1>
<!--    <p>这里是曲阜远东职业技术学院办公自动化模块</p>-->
    
    <el-row :gutter="20" class="overview-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-icon todo-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-title">待办事项</div>
              <div class="overview-value">5</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-icon approve-icon">
              <el-icon><Stamp /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-title">待审批</div>
              <div class="overview-value">3</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-icon notice-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-title">通知公告</div>
              <div class="overview-value">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-icon meeting-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-title">今日会议</div>
              <div class="overview-value">2</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="office-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索办公设备（名称/类型/位置）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增办公设备</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedOfficeDevices" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="model" label="型号" width="150" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="最后维护" width="150" />
        <el-table-column prop="nextMaintenance" label="下次维护" width="150" />
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
          :total="filteredOfficeDevices.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增办公设备' : '编辑办公设备'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="打印机" value="打印机" />
            <el-option label="复印机" value="复印机" />
            <el-option label="扫描仪" value="扫描仪" />
            <el-option label="投影仪" value="投影仪" />
            <el-option label="碎纸机" value="碎纸机" />
            <el-option label="传真机" value="传真机" />
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="editForm.model" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="editForm.location" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="正常" value="正常" />
            <el-option label="维修中" value="维修中" />
            <el-option label="故障" value="故障" />
            <el-option label="报废" value="报废" />
          </el-select>
        </el-form-item>
        <el-form-item label="最后维护" prop="lastMaintenance">
          <el-input v-model="editForm.lastMaintenance" />
        </el-form-item>
        <el-form-item label="下次维护" prop="nextMaintenance">
          <el-input v-model="editForm.nextMaintenance" />
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
    <el-dialog v-model="detailDialogVisible" title="办公设备详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="型号">{{ detailData.model }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
        <el-descriptions-item label="最后维护">{{ detailData.lastMaintenance }}</el-descriptions-item>
        <el-descriptions-item label="下次维护">{{ detailData.nextMaintenance }}</el-descriptions-item>
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
import { 
  Document, 
  Stamp, 
  Bell, 
  Timer, 
  Search
} from '@element-plus/icons-vue'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const officeDevices = ref([
  { id: 1, name: '激光打印机A', type: '打印机', model: 'HP LaserJet Pro M404n', location: '行政楼1楼', status: '正常', lastMaintenance: '2025-06-10', nextMaintenance: '2025-04-10' },
  { id: 2, name: '激光打印机B', type: '打印机', model: 'HP LaserJet Pro M404n', location: '行政楼2楼', status: '正常', lastMaintenance: '2025-06-12', nextMaintenance: '2025-04-12' },
  { id: 3, name: '彩色打印机', type: '打印机', model: 'Canon PIXMA PRO-100', location: '教务处', status: '正常', lastMaintenance: '2025-06-08', nextMaintenance: '2025-04-08' },
  { id: 4, name: '多功能复印机A', type: '复印机', model: 'Ricoh MP C3004', location: '图书馆1楼', status: '正常', lastMaintenance: '2025-06-15', nextMaintenance: '2025-04-15' },
  { id: 5, name: '多功能复印机B', type: '复印机', model: 'Ricoh MP C3004', location: '图书馆2楼', status: '维修中', lastMaintenance: '2025-06-05', nextMaintenance: '2025-04-05' },
  { id: 6, name: '高速扫描仪', type: '扫描仪', model: 'Fujitsu ScanSnap iX1500', location: '档案室', status: '正常', lastMaintenance: '2025-06-03', nextMaintenance: '2025-04-03' },
  { id: 7, name: '投影仪A', type: '投影仪', model: 'Epson EB-X41', location: '多媒体教室1', status: '正常', lastMaintenance: '2025-06-14', nextMaintenance: '2025-04-14' },
  { id: 8, name: '投影仪B', type: '投影仪', model: 'Epson EB-X41', location: '多媒体教室2', status: '正常', lastMaintenance: '2025-06-16', nextMaintenance: '2025-04-16' },
  { id: 9, name: '碎纸机A', type: '碎纸机', model: 'Fellowes 62MC', location: '行政楼1楼', status: '正常', lastMaintenance: '2025-06-02', nextMaintenance: '2025-04-02' },
  { id: 10, name: '传真机', type: '传真机', model: 'Brother FAX-2840', location: '行政楼1楼', status: '故障', lastMaintenance: '2025-06-01', nextMaintenance: '2025-04-01' }
])

const filteredOfficeDevices = computed(() => {
  if (!searchQuery.value) return officeDevices.value
  return officeDevices.value.filter(o =>
    o.name.includes(searchQuery.value) ||
    o.type.includes(searchQuery.value) ||
    o.location.includes(searchQuery.value)
  )
})

const pagedOfficeDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOfficeDevices.value.slice(start, start + pageSize.value)
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
    case '正常':
      return 'success'
    case '维修中':
      return 'warning'
    case '故障':
      return 'danger'
    case '报废':
      return 'info'
    default:
      return 'info'
  }
}
// 新增/编辑弹窗
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
const editForm = reactive({
  id: 0,
  name: '', type: '', model: '', location: '', status: '正常', lastMaintenance: '', nextMaintenance: ''
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  lastMaintenance: [{ required: true, message: '请输入最后维护时间', trigger: 'blur' }],
  nextMaintenance: [{ required: true, message: '请输入下次维护时间', trigger: 'blur' }]
}
function openAddDialog() {
  editMode.value = 'add'
  const maxId = Math.max(...officeDevices.value.map(o => o.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', type: '', model: '', location: '', status: '正常', lastMaintenance: '', nextMaintenance: '' })
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
      officeDevices.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = officeDevices.value.findIndex(o => o.id === editForm.id)
      if (idx !== -1) {
        officeDevices.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除办公设备"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = officeDevices.value.findIndex(o => o.id === row.id)
      if (idx !== -1) {
        officeDevices.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', type: '', model: '', location: '', status: '', lastMaintenance: '', nextMaintenance: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.office-container {
  padding: 20px;
}

.overview-row {
  margin-bottom: 20px;
}

.overview-card {
  height: 100%;
}

.overview-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.overview-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 15px;
}

.todo-icon {
  background-color: #ecf5ff;
  color: #409eff;
}

.approve-icon {
  background-color: #f0f9eb;
  color: #67c23a;
}

.notice-icon {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.meeting-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.overview-info {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: #909399;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.office-card {
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