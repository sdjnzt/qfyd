<template>
  <div class="security-container">
    <h1>安全防护</h1>
<!--    <p>这里是曲阜远东职业技术学院安全防护模块</p>-->
    
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索安全设备（名称/类型/位置）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增安全设备</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="pagedSecurityDevices" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新" width="150" />
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
          :total="filteredSecurityDevices.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增安全设备' : '编辑安全设备'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="防火墙" value="防火墙" />
            <el-option label="入侵检测" value="入侵检测" />
            <el-option label="入侵防御" value="入侵防御" />
            <el-option label="VPN网关" value="VPN网关" />
            <el-option label="安全审计" value="安全审计" />
            <el-option label="漏洞扫描" value="漏洞扫描" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="editForm.ip" />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="editForm.version" />
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
        <el-form-item label="最后更新" prop="lastUpdate">
          <el-input v-model="editForm.lastUpdate" />
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
    <el-dialog v-model="detailDialogVisible" title="安全设备详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detailData.version }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ detailData.lastUpdate }}</el-descriptions-item>
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

const securityDevices = ref([
  { id: 1, name: '主防火墙A', type: '防火墙', ip: '192.168.0.1', version: 'v8.0.5', location: '主机房', status: '正常', lastUpdate: '2025-06-15' },
  { id: 2, name: '主防火墙B', type: '防火墙', ip: '192.168.0.2', version: 'v8.0.5', location: '主机房', status: '正常', lastUpdate: '2025-06-15' },
  { id: 3, name: '入侵检测系统A', type: '入侵检测', ip: '192.168.1.10', version: 'v6.2.1', location: '主机房', status: '正常', lastUpdate: '2025-06-14' },
  { id: 4, name: '入侵检测系统B', type: '入侵检测', ip: '192.168.1.11', version: 'v6.2.1', location: '主机房', status: '警告', lastUpdate: '2025-06-13' },
  { id: 5, name: '入侵防御系统', type: '入侵防御', ip: '192.168.1.20', version: 'v7.1.3', location: '主机房', status: '正常', lastUpdate: '2025-06-15' },
  { id: 6, name: 'VPN网关A', type: 'VPN网关', ip: '192.168.2.1', version: 'v5.8.2', location: '主机房', status: '正常', lastUpdate: '2025-06-12' },
  { id: 7, name: 'VPN网关B', type: 'VPN网关', ip: '192.168.2.2', version: 'v5.8.2', location: '主机房', status: '正常', lastUpdate: '2025-06-12' },
  { id: 8, name: '安全审计系统', type: '安全审计', ip: '192.168.3.1', version: 'v4.5.7', location: '主机房', status: '正常', lastUpdate: '2025-06-15' },
  { id: 9, name: '漏洞扫描器A', type: '漏洞扫描', ip: '192.168.4.1', version: 'v3.2.8', location: '主机房', status: '正常', lastUpdate: '2025-06-10' },
  { id: 10, name: '漏洞扫描器B', type: '漏洞扫描', ip: '192.168.4.2', version: 'v3.2.8', location: '主机房', status: '离线', lastUpdate: '2025-06-08' }
])

const filteredSecurityDevices = computed(() => {
  if (!searchQuery.value) return securityDevices.value
  return securityDevices.value.filter(s =>
    s.name.includes(searchQuery.value) ||
    s.type.includes(searchQuery.value) ||
    s.location.includes(searchQuery.value)
  )
})

const pagedSecurityDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSecurityDevices.value.slice(start, start + pageSize.value)
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
  name: '', type: '', ip: '', version: '', location: '', status: '正常', lastUpdate: ''
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  version: [{ required: true, message: '请输入版本', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  lastUpdate: [{ required: true, message: '请输入最后更新时间', trigger: 'blur' }]
}
function openAddDialog() {
  editMode.value = 'add'
  const maxId = Math.max(...securityDevices.value.map(s => s.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', type: '', ip: '', version: '', location: '', status: '正常', lastUpdate: '' })
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
      securityDevices.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = securityDevices.value.findIndex(s => s.id === editForm.id)
      if (idx !== -1) {
        securityDevices.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除安全设备"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = securityDevices.value.findIndex(s => s.id === row.id)
      if (idx !== -1) {
        securityDevices.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', type: '', ip: '', version: '', location: '', status: '', lastUpdate: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.security-container {
  padding: 20px;
}

.security-card {
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