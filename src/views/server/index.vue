<template>
  <div class="server-container">
    <h1>服务器管理</h1>
<!--    <p>这里是曲阜远东职业技术学院服务器管理模块</p>-->
    <el-card class="server-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索服务器（名称/IP/负责人/类型）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增服务器</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedServers" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="服务器名称" min-width="150" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="os" label="操作系统" width="150" />
        <el-table-column prop="cpu" label="CPU使用率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.cpu" :status="getCpuStatus(row.cpu)" />
          </template>
        </el-table-column>
        <el-table-column prop="memory" label="内存使用率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.memory" :status="getMemoryStatus(row.memory)" />
          </template>
        </el-table-column>
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
          :total="filteredServers.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增服务器' : '编辑服务器'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="editForm.ip" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="物理服务器" value="物理服务器" />
            <el-option label="虚拟服务器" value="虚拟服务器" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作系统" prop="os">
          <el-input v-model="editForm.os" />
        </el-form-item>
        <el-form-item label="CPU使用率" prop="cpu">
          <el-input v-model.number="editForm.cpu" type="number" min="0" max="100" />
        </el-form-item>
        <el-form-item label="内存使用率" prop="memory">
          <el-input v-model.number="editForm.memory" type="number" min="0" max="100" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="运行中" value="运行中" />
            <el-option label="已停止" value="已停止" />
            <el-option label="异常" value="异常" />
            <el-option label="维护中" value="维护中" />
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
    <el-dialog v-model="detailDialogVisible" title="服务器详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="服务器名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ detailData.os }}</el-descriptions-item>
        <el-descriptions-item label="CPU使用率">{{ detailData.cpu }}%</el-descriptions-item>
        <el-descriptions-item label="内存使用率">{{ detailData.memory }}%</el-descriptions-item>
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

const servers = ref([
  { id: 1, name: '教务系统服务器', ip: '192.168.1.10', type: '物理服务器', os: 'Linux CentOS 8', cpu: 45, memory: 60, status: '运行中' },
  { id: 2, name: '学生管理服务器', ip: '192.168.1.11', type: '物理服务器', os: 'Windows Server 2019', cpu: 65, memory: 75, status: '运行中' },
  { id: 3, name: '财务系统服务器', ip: '192.168.1.12', type: '虚拟服务器', os: 'Linux Ubuntu 20.04', cpu: 35, memory: 40, status: '运行中' },
  { id: 4, name: '图书管理服务器', ip: '192.168.1.13', type: '虚拟服务器', os: 'Windows Server 2016', cpu: 25, memory: 30, status: '运行中' },
  { id: 5, name: '备份数据库服务器', ip: '192.168.1.14', type: '物理服务器', os: 'Linux CentOS 8', cpu: 0, memory: 10, status: '已停止' },
  { id: 6, name: '虚拟化平台A', ip: '192.168.1.15', type: '虚拟服务器', os: 'Linux Kylin', cpu: 55, memory: 70, status: '运行中' },
  { id: 7, name: '虚拟化平台B', ip: '192.168.1.16', type: '虚拟服务器', os: 'Linux Ubuntu 22.04', cpu: 62, memory: 80, status: '运行中' },
  { id: 8, name: '门户网站服务器', ip: '192.168.1.17', type: '物理服务器', os: 'Windows Server 2019', cpu: 48, memory: 55, status: '运行中' },
  { id: 9, name: 'OA系统服务器', ip: '192.168.1.18', type: '物理服务器', os: 'Linux CentOS 7', cpu: 41, memory: 60, status: '运行中' },
  { id: 10, name: '应急指挥服务器', ip: '192.168.1.19', type: '虚拟服务器', os: 'Linux CentOS 8', cpu: 58, memory: 72, status: '已停止' },
  { id: 11, name: '云桌面服务器', ip: '192.168.1.20', type: '虚拟服务器', os: 'Linux Kylin', cpu: 38, memory: 55, status: '运行中' },
  { id: 12, name: '视频监控服务器', ip: '192.168.1.21', type: '物理服务器', os: 'Windows Server 2016', cpu: 52, memory: 68, status: '运行中' },
  { id: 13, name: '大数据分析服务器', ip: '192.168.1.22', type: '物理服务器', os: 'Linux Ubuntu 20.04', cpu: 75, memory: 85, status: '运行中' },
  { id: 14, name: '科研平台服务器', ip: '192.168.1.23', type: '虚拟服务器', os: 'Linux CentOS 8', cpu: 68, memory: 78, status: '运行中' },
  { id: 15, name: '云存储服务器', ip: '192.168.1.24', type: '物理服务器', os: 'Linux Kylin', cpu: 35, memory: 45, status: '运行中' },
  { id: 16, name: '教室多媒体服务器', ip: '192.168.1.25', type: '虚拟服务器', os: 'Windows Server 2019', cpu: 55, memory: 70, status: '运行中' },
  { id: 17, name: '实验室服务器', ip: '192.168.1.26', type: '物理服务器', os: 'Linux Ubuntu 22.04', cpu: 62, memory: 80, status: '运行中' },
  { id: 18, name: '云备份服务器', ip: '192.168.1.27', type: '虚拟服务器', os: 'Linux CentOS 7', cpu: 48, memory: 55, status: '运行中' },
  { id: 19, name: '档案管理服务器', ip: '192.168.1.28', type: '物理服务器', os: 'Windows Server 2016', cpu: 41, memory: 60, status: '运行中' },
  { id: 20, name: '门户备份服务器', ip: '192.168.1.29', type: '虚拟服务器', os: 'Linux CentOS 8', cpu: 58, memory: 72, status: '已停止' }
])

const filteredServers = computed(() => {
  if (!searchQuery.value) return servers.value
  return servers.value.filter(s =>
    s.name.includes(searchQuery.value) ||
    s.ip.includes(searchQuery.value) ||
    s.type.includes(searchQuery.value) ||
    s.os.includes(searchQuery.value)
  )
})

const pagedServers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredServers.value.slice(start, start + pageSize.value)
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

const getCpuStatus = (value: number) => {
  if (value > 80) return 'exception'
  if (value > 60) return 'warning'
  return 'success'
}
const getMemoryStatus = (value: number) => {
  if (value > 80) return 'exception'
  if (value > 60) return 'warning'
  return 'success'
}
const getStatusType = (status: string) => {
  switch (status) {
    case '运行中':
      return 'success'
    case '已停止':
      return 'info'
    case '异常':
      return 'danger'
    case '维护中':
      return 'warning'
    default:
      return 'info'
  }
}

// 新增/编辑弹窗
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
const editForm = reactive({
  name: '', ip: '', type: '', os: '', cpu: 0, memory: 0, status: '运行中'
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入服务器名称', trigger: 'blur' }],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  os: [{ required: true, message: '请输入操作系统', trigger: 'blur' }],
  cpu: [{ required: true, type: 'number', message: '请输入CPU使用率', trigger: 'blur' }],
  memory: [{ required: true, type: 'number', message: '请输入内存使用率', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}
function openAddDialog() {
  editMode.value = 'add'
  Object.assign(editForm, { name: '', ip: '', type: '', os: '', cpu: 0, memory: 0, status: '运行中' })
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
      const maxId = Math.max(...servers.value.map(s => s.id), 0)
      servers.value.unshift({ ...editForm, id: maxId + 1 })
      ElMessage.success('新增成功')
    } else {
      const idx = servers.value.findIndex(s => s.name === editForm.name && s.ip === editForm.ip)
      if (idx !== -1) {
        servers.value[idx] = { ...servers.value[idx], ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除服务器"${row.name}(${row.ip})"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = servers.value.findIndex(s => s.id === row.id)
      if (idx !== -1) {
        servers.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', ip: '', type: '', os: '', cpu: 0, memory: 0, status: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.server-container {
  padding: 20px;
}

.server-card {
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