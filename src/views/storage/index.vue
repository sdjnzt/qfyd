<template>
  <div class="storage-container">
    <h1>存储管理</h1>
<!--    <p>这里是曲阜远东职业技术学院存储管理模块</p>-->
    <el-card class="storage-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索存储设备（名称/类型/位置）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增存储设备</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedStorageDevices" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="capacity" label="总容量" width="120" />
        <el-table-column prop="used" label="已用容量" width="120" />
        <el-table-column prop="usedPercentage" label="使用率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.usedPercentage" :status="getUsageStatus(row.usedPercentage)" :format="() => row.usedPercentage + '%'" />
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
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
          :total="filteredStorageDevices.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增存储设备' : '编辑存储设备'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="SAN" value="SAN" />
            <el-option label="NAS" value="NAS" />
            <el-option label="Object Storage" value="Object Storage" />
            <el-option label="分布式" value="分布式" />
          </el-select>
        </el-form-item>
        <el-form-item label="总容量" prop="capacity">
          <el-input v-model="editForm.capacity" />
        </el-form-item>
        <el-form-item label="已用容量(%)" prop="usedPercentage">
          <el-input v-model.number="editForm.usedPercentage" type="number" min="0" max="100" />
        </el-form-item>
        <el-form-item label="已用容量" prop="used">
          <el-input v-model="editForm.used" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="editForm.location" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="正常" value="正常" />
            <el-option label="离线" value="离线" />
            <el-option label="错误" value="错误" />
            <el-option label="警告" value="警告" />
          </el-select>
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
    <el-dialog v-model="detailDialogVisible" title="存储设备详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="总容量">{{ detailData.capacity }}</el-descriptions-item>
        <el-descriptions-item label="已用容量">{{ detailData.used }}</el-descriptions-item>
        <el-descriptions-item label="使用率">{{ detailData.usedPercentage }}%</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
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

const storageDevices = ref([
  { id: 1, name: '主存储阵列A', type: 'SAN', capacity: '50TB', used: '30TB', usedPercentage: 60, location: '主机房', status: '正常' },
  { id: 2, name: '主存储阵列B', type: 'SAN', capacity: '50TB', used: '28TB', usedPercentage: 56, location: '主机房', status: '正常' },
  { id: 3, name: '备份存储A', type: 'NAS', capacity: '30TB', used: '20TB', usedPercentage: 67, location: '备份机房', status: '正常' },
  { id: 4, name: '备份存储B', type: 'NAS', capacity: '30TB', used: '22TB', usedPercentage: 73, location: '备份机房', status: '警告' },
  { id: 5, name: '归档存储', type: 'Object Storage', capacity: '100TB', used: '65TB', usedPercentage: 65, location: '数据中心', status: '正常' },
  { id: 6, name: '分布式存储A', type: '分布式', capacity: '50TB', used: '22TB', usedPercentage: 44, location: '主机房', status: '正常' },
  { id: 7, name: '分布式存储B', type: '分布式', capacity: '50TB', used: '18TB', usedPercentage: 36, location: '主机房', status: '正常' },
  { id: 8, name: '教学资源存储', type: 'NAS', capacity: '30TB', used: '25TB', usedPercentage: 83, location: '主机房', status: '警告' },
  { id: 9, name: '研究数据存储', type: 'SAN', capacity: '40TB', used: '15TB', usedPercentage: 38, location: '研究中心', status: '正常' },
  { id: 10, name: '云备份存储', type: 'Object Storage', capacity: '80TB', used: '50TB', usedPercentage: 62, location: '云中心', status: '正常' }
])

const filteredStorageDevices = computed(() => {
  if (!searchQuery.value) return storageDevices.value
  return storageDevices.value.filter(s =>
    s.name.includes(searchQuery.value) ||
    s.type.includes(searchQuery.value) ||
    s.location.includes(searchQuery.value)
  )
})

const pagedStorageDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStorageDevices.value.slice(start, start + pageSize.value)
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

const getUsageStatus = (percentage: number) => {
  if (percentage > 80) return 'exception'
  if (percentage > 60) return 'warning'
  return 'success'
}
const getStatusType = (status: string) => {
  switch (status) {
    case '正常':
      return 'success'
    case '离线':
      return 'info'
    case '错误':
      return 'danger'
    case '警告':
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
  name: '', type: '', capacity: '', used: '', usedPercentage: 0, location: '', status: '正常'
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  capacity: [{ required: true, message: '请输入总容量', trigger: 'blur' }],
  used: [{ required: true, message: '请输入已用容量', trigger: 'blur' }],
  usedPercentage: [{ required: true, type: 'number', message: '请输入使用率', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}
function openAddDialog() {
  editMode.value = 'add'
  const maxId = Math.max(...storageDevices.value.map(s => s.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', type: '', capacity: '', used: '', usedPercentage: 0, location: '', status: '正常' })
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
      storageDevices.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = storageDevices.value.findIndex(s => s.id === editForm.id)
      if (idx !== -1) {
        storageDevices.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除存储设备"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = storageDevices.value.findIndex(s => s.id === row.id)
      if (idx !== -1) {
        storageDevices.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', type: '', capacity: '', used: '', usedPercentage: 0, location: '', status: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.storage-container {
  padding: 20px;
}

.storage-card {
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