<template>
  <div class="server-container">
    <h1>服务器管理</h1>
<!--    <p>这里是曲阜远东职业技术学院服务器管理模块</p>-->
    <el-card class="license-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Key /></el-icon>
            <span>服务器许可概览</span>
          </div>
          <div class="header-right">
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button label="day">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">许可总数</div>
            <div class="stat-value">30</div>
            <el-progress :percentage="100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">已使用</div>
            <div class="stat-value">{{ licenseStats.used }}</div>
            <el-progress :percentage="(licenseStats.used / 30) * 100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">告警服务器</div>
            <div class="stat-value warning">{{ licenseStats.warning }}</div>
            <el-progress :percentage="(licenseStats.warning / 30) * 100" status="warning" />
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="server-stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><DataAnalysis /></el-icon>
            <span>服务器状态分析</span>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div ref="statusChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <div ref="resourceChartRef" class="chart-container"></div>
        </el-col>
      </el-row>
    </el-card>

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
import { ref, computed, reactive, nextTick, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { Key, DataAnalysis } from '@element-plus/icons-vue'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const timeRange = ref('day')

// 统计信息
const timeRangeData = reactive({
  day: { used: 30, warning: 2 },
  week: { used: 29, warning: 3 },
  month: { used: 28, warning: 5 }
})

const licenseStats = ref(timeRangeData.day)

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
  { id: 13, name: '大数据分析服务器', ip: '192.168.1.22', type: '物理服务器', os: 'Linux Ubuntu 20.04', cpu: 75, memory: 85, status: '异常' },
  { id: 14, name: '科研平台服务器', ip: '192.168.1.23', type: '虚拟服务器', os: 'Linux CentOS 8', cpu: 68, memory: 78, status: '运行中' },
  { id: 15, name: '云存储服务器', ip: '192.168.1.24', type: '物理服务器', os: 'Linux Kylin', cpu: 35, memory: 45, status: '运行中' },
  { id: 16, name: '教室多媒体服务器', ip: '192.168.1.25', type: '虚拟服务器', os: 'Windows Server 2019', cpu: 55, memory: 70, status: '运行中' },
  { id: 17, name: '实验室服务器', ip: '192.168.1.26', type: '物理服务器', os: 'Linux Ubuntu 22.04', cpu: 62, memory: 80, status: '运行中' },
  { id: 18, name: '云备份服务器', ip: '192.168.1.27', type: '虚拟服务器', os: 'Linux CentOS 7', cpu: 48, memory: 55, status: '运行中' },
  { id: 19, name: '档案管理服务器', ip: '192.168.1.28', type: '物理服务器', os: 'Windows Server 2016', cpu: 41, memory: 60, status: '运行中' },
  { id: 20, name: '门户备份服务器', ip: '192.168.1.29', type: '虚拟服务器', os: 'Linux CentOS 8', cpu: 58, memory: 72, status: '已停止' },
  { id: 21, name: '教学资源服务器', ip: '192.168.1.30', type: '物理服务器', os: 'Linux Ubuntu 20.04', cpu: 45, memory: 65, status: '运行中' },
  { id: 22, name: '数据挖掘服务器', ip: '192.168.1.31', type: '物理服务器', os: 'Linux CentOS 8', cpu: 70, memory: 80, status: '维护中' },
  { id: 23, name: '虚拟化平台C', ip: '192.168.1.32', type: '虚拟服务器', os: 'Linux Kylin', cpu: 50, memory: 60, status: '运行中' },
  { id: 24, name: '考试系统服务器', ip: '192.168.1.33', type: '物理服务器', os: 'Windows Server 2019', cpu: 40, memory: 55, status: '运行中' },
  { id: 25, name: '校园卡系统服务器', ip: '192.168.1.34', type: '虚拟服务器', os: 'Linux CentOS 7', cpu: 35, memory: 50, status: '运行中' },
  { id: 26, name: '统一认证服务器', ip: '192.168.1.35', type: '物理服务器', os: 'Linux Ubuntu 20.04', cpu: 60, memory: 70, status: '运行中' },
  { id: 27, name: '科研数据备份服务器', ip: '192.168.1.36', type: '物理服务器', os: 'Linux CentOS 8', cpu: 25, memory: 40, status: '运行中' },
  { id: 28, name: '虚拟实验室服务器', ip: '192.168.1.37', type: '虚拟服务器', os: 'Windows Server 2019', cpu: 65, memory: 75, status: '运行中' },
  { id: 29, name: '远程教学服务器', ip: '192.168.1.38', type: '物理服务器', os: 'Linux Kylin', cpu: 70, memory: 80, status: '异常' },
  { id: 30, name: '课程资源服务器', ip: '192.168.1.39', type: '虚拟服务器', os: 'Linux Ubuntu 22.04', cpu: 55, memory: 65, status: '运行中' }
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

// 图表相关变量
let statusChart: echarts.ECharts | null = null
let resourceChart: echarts.ECharts | null = null
const statusChartRef = ref<HTMLElement | null>(null)
const resourceChartRef = ref<HTMLElement | null>(null)

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

// 监听时间范围变化
watch(timeRange, (newVal) => {
  licenseStats.value = timeRangeData[newVal as keyof typeof timeRangeData]
  ElMessage.success(`已切换到${newVal === 'day' ? '今日' : newVal === 'week' ? '本周' : '本月'}数据`)
  initCharts()
})

// 初始化图表
function initCharts() {
  nextTick(() => {
    try {
      // 状态分布图
      if (statusChartRef.value) {
        if (statusChart) {
          statusChart.dispose()
        }
        statusChart = echarts.init(statusChartRef.value)
        
        const runningCount = servers.value.filter(s => s.status === '运行中').length
        const stoppedCount = servers.value.filter(s => s.status === '已停止').length
        const errorCount = servers.value.filter(s => s.status === '异常').length
        const maintCount = servers.value.filter(s => s.status === '维护中').length
        
        statusChart.setOption({
          title: {
            text: '服务器状态分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            bottom: '5%',
            left: 'center'
          },
          series: [
            {
              name: '服务器状态',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '16',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: runningCount, name: '运行中', itemStyle: { color: '#67C23A' } },
                { value: stoppedCount, name: '已停止', itemStyle: { color: '#909399' } },
                { value: errorCount, name: '异常', itemStyle: { color: '#F56C6C' } },
                { value: maintCount, name: '维护中', itemStyle: { color: '#E6A23C' } }
              ]
            }
          ]
        })
      }
      
      // 资源使用分布图
      if (resourceChartRef.value) {
        if (resourceChart) {
          resourceChart.dispose()
        }
        resourceChart = echarts.init(resourceChartRef.value)
        
        // 计算服务器资源使用率分布
        const cpuData = [0, 0, 0, 0]  // <25%, 25-50%, 50-75%, >75%
        const memoryData = [0, 0, 0, 0]  // <25%, 25-50%, 50-75%, >75%
        
        servers.value.forEach(server => {
          if (server.cpu < 25) cpuData[0]++
          else if (server.cpu < 50) cpuData[1]++
          else if (server.cpu < 75) cpuData[2]++
          else cpuData[3]++
          
          if (server.memory < 25) memoryData[0]++
          else if (server.memory < 50) memoryData[1]++
          else if (server.memory < 75) memoryData[2]++
          else memoryData[3]++
        })
        
        resourceChart.setOption({
          title: {
            text: '服务器资源使用分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['CPU', '内存'],
            bottom: '5%'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['0-25%', '25-50%', '50-75%', '75-100%']
          },
          yAxis: {
            type: 'value',
            name: '服务器数量'
          },
          series: [
            {
              name: 'CPU',
              type: 'bar',
              emphasis: {
                focus: 'series'
              },
              data: cpuData,
              itemStyle: {
                color: '#409EFF'
              }
            },
            {
              name: '内存',
              type: 'bar',
              emphasis: {
                focus: 'series'
              },
              data: memoryData,
              itemStyle: {
                color: '#67C23A'
              }
            }
          ]
        })
      }
    } catch (error) {
      console.error('初始化图表失败:', error)
    }
  })
}

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
  id: 0,
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
  const maxId = Math.max(...servers.value.map(s => s.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', ip: '', type: '', os: '', cpu: 0, memory: 0, status: '运行中' })
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
      servers.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = servers.value.findIndex(s => s.id === editForm.id)
      if (idx !== -1) {
        servers.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
    // 更新图表
    initCharts()
  })
}

function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除服务器"${row.name}(${row.ip})"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = servers.value.findIndex(s => s.id === row.id)
      if (idx !== -1) {
        servers.value.splice(idx, 1)
        ElMessage.success('删除成功')
        // 更新图表
        initCharts()
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

.license-card,
.server-stats-card,
.server-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stat-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 16px;
  text-align: center;
}

.stat-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-value.warning {
  color: #E6A23C;
}

.chart-container {
  height: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 