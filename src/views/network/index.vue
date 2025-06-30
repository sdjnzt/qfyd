<template>
  <div class="network-container">
    <h1>网络管理</h1>
<!--    <p>这里是曲阜远东职业技术学院网络管理模块</p>-->
    <el-card class="network-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索网络设备（名称/类型/位置）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增网络设备</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedNetworkDevices" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="bandwidth" label="带宽" width="120" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时间" width="120" />
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
          :total="filteredNetworkDevices.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增网络设备' : '编辑网络设备'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="路由器" value="路由器" />
            <el-option label="交换机" value="交换机" />
            <el-option label="防火墙" value="防火墙" />
            <el-option label="负载均衡器" value="负载均衡器" />
            <el-option label="无线AP" value="无线AP" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="editForm.ip" />
        </el-form-item>
        <el-form-item label="带宽" prop="bandwidth">
          <el-input v-model="editForm.bandwidth" />
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
        <el-form-item label="运行时间" prop="uptime">
          <el-input v-model="editForm.uptime" />
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
    <el-dialog v-model="detailDialogVisible" title="网络设备详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item label="带宽">{{ detailData.bandwidth }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
        <el-descriptions-item label="运行时间">{{ detailData.uptime }}</el-descriptions-item>
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

const networkDevices = ref([
  { id: 1, name: '核心路由器A', type: '路由器', ip: '192.168.1.1', bandwidth: '10Gbps', location: '主机房', status: '正常', uptime: '30天' },
  { id: 2, name: '核心路由器B', type: '路由器', ip: '192.168.1.2', bandwidth: '10Gbps', location: '主机房', status: '正常', uptime: '28天' },
  { id: 3, name: '接入交换机A', type: '交换机', ip: '192.168.2.1', bandwidth: '1Gbps', location: '教学楼A', status: '正常', uptime: '25天' },
  { id: 4, name: '接入交换机B', type: '交换机', ip: '192.168.2.2', bandwidth: '1Gbps', location: '教学楼B', status: '正常', uptime: '22天' },
  { id: 5, name: '防火墙A', type: '防火墙', ip: '192.168.0.1', bandwidth: '5Gbps', location: '主机房', status: '正常', uptime: '35天' },
  { id: 6, name: '防火墙B', type: '防火墙', ip: '192.168.0.2', bandwidth: '5Gbps', location: '主机房', status: '警告', uptime: '15天' },
  { id: 7, name: '负载均衡器', type: '负载均衡器', ip: '192.168.3.1', bandwidth: '2Gbps', location: '主机房', status: '正常', uptime: '20天' },
  { id: 8, name: '无线AP-1F', type: '无线AP', ip: '192.168.4.1', bandwidth: '500Mbps', location: '教学楼1楼', status: '正常', uptime: '18天' },
  { id: 9, name: '无线AP-2F', type: '无线AP', ip: '192.168.4.2', bandwidth: '500Mbps', location: '教学楼2楼', status: '正常', uptime: '16天' },
  { id: 10, name: '无线AP-3F', type: '无线AP', ip: '192.168.4.3', bandwidth: '500Mbps', location: '教学楼3楼', status: '离线', uptime: '0天' }
])

const filteredNetworkDevices = computed(() => {
  if (!searchQuery.value) return networkDevices.value
  return networkDevices.value.filter(n =>
    n.name.includes(searchQuery.value) ||
    n.type.includes(searchQuery.value) ||
    n.location.includes(searchQuery.value)
  )
})

const pagedNetworkDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredNetworkDevices.value.slice(start, start + pageSize.value)
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
  name: '', type: '', ip: '', bandwidth: '', location: '', status: '正常', uptime: ''
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  bandwidth: [{ required: true, message: '请输入带宽', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  uptime: [{ required: true, message: '请输入运行时间', trigger: 'blur' }]
}
function openAddDialog() {
  editMode.value = 'add'
  const maxId = Math.max(...networkDevices.value.map(n => n.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', type: '', ip: '', bandwidth: '', location: '', status: '正常', uptime: '' })
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
      networkDevices.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = networkDevices.value.findIndex(n => n.id === editForm.id)
      if (idx !== -1) {
        networkDevices.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除网络设备"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = networkDevices.value.findIndex(n => n.id === row.id)
      if (idx !== -1) {
        networkDevices.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', type: '', ip: '', bandwidth: '', location: '', status: '', uptime: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.network-container {
  padding: 20px;
}

.network-card {
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