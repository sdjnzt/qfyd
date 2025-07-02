<template>
  <div class="storage-container">
    <h1>存储管理</h1>
<!--    <p>这里是曲阜远东职业技术学院存储管理模块</p>-->
    <el-card class="license-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Key /></el-icon>
            <span>存储设备许可概览</span>
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
            <div class="stat-value">20</div>
            <el-progress :percentage="100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">已使用</div>
            <div class="stat-value">{{ licenseStats.used }}</div>
            <el-progress :percentage="(licenseStats.used / 20) * 100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">告警设备</div>
            <div class="stat-value warning">{{ licenseStats.warning }}</div>
            <el-progress :percentage="(licenseStats.warning / 20) * 100" status="warning" />
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="storage-stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><DataAnalysis /></el-icon>
            <span>存储设备状态分析</span>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div ref="statusChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <div ref="usageChartRef" class="chart-container"></div>
        </el-col>
      </el-row>
    </el-card>

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
  day: { used: 19, warning: 4 },
  week: { used: 18, warning: 5 },
  month: { used: 18, warning: 6 }
})

const licenseStats = ref(timeRangeData.day)

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
  { id: 10, name: '云备份存储', type: 'Object Storage', capacity: '80TB', used: '50TB', usedPercentage: 62, location: '云中心', status: '正常' },
  { id: 11, name: '高性能计算存储', type: 'SAN', capacity: '20TB', used: '12TB', usedPercentage: 60, location: '科研中心', status: '正常' },
  { id: 12, name: '容灾备份存储', type: 'Object Storage', capacity: '60TB', used: '35TB', usedPercentage: 58, location: '容灾中心', status: '正常' },
  { id: 13, name: '虚拟化存储池', type: '分布式', capacity: '40TB', used: '28TB', usedPercentage: 70, location: '主机房', status: '正常' },
  { id: 14, name: '媒体资源存储', type: 'NAS', capacity: '25TB', used: '20TB', usedPercentage: 80, location: '媒体中心', status: '警告' },
  { id: 15, name: '实验数据存储', type: 'SAN', capacity: '15TB', used: '10TB', usedPercentage: 67, location: '实验楼', status: '正常' },
  { id: 16, name: '学生作品存储', type: 'NAS', capacity: '10TB', used: '8TB', usedPercentage: 80, location: '教学楼', status: '警告' },
  { id: 17, name: '图书馆存储', type: 'NAS', capacity: '20TB', used: '15TB', usedPercentage: 75, location: '图书馆', status: '正常' },
  { id: 18, name: '远程备份存储', type: 'Object Storage', capacity: '50TB', used: '30TB', usedPercentage: 60, location: '远程机房', status: '正常' },
  { id: 19, name: '档案资料存储', type: 'NAS', capacity: '30TB', used: '18TB', usedPercentage: 60, location: '档案室', status: '警告' }
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

// 图表相关变量
let statusChart: echarts.ECharts | null = null
let usageChart: echarts.ECharts | null = null
const statusChartRef = ref<HTMLElement | null>(null)
const usageChartRef = ref<HTMLElement | null>(null)

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
        
        const normalCount = storageDevices.value.filter(s => s.status === '正常').length
        const warningCount = storageDevices.value.filter(s => s.status === '警告').length
        const errorCount = storageDevices.value.filter(s => s.status === '错误').length
        const offlineCount = storageDevices.value.filter(s => s.status === '离线').length
        
        statusChart.setOption({
          title: {
            text: '存储设备状态分布',
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
              name: '设备状态',
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
                { value: normalCount, name: '正常', itemStyle: { color: '#67C23A' } },
                { value: warningCount, name: '警告', itemStyle: { color: '#E6A23C' } },
                { value: errorCount, name: '错误', itemStyle: { color: '#F56C6C' } },
                { value: offlineCount, name: '离线', itemStyle: { color: '#909399' } }
              ]
            }
          ]
        })
      }
      
      // 容量使用分布图
      if (usageChartRef.value) {
        if (usageChart) {
          usageChart.dispose()
        }
        usageChart = echarts.init(usageChartRef.value)
        
        // 按照存储类型统计总容量和已使用容量
        const typeStats: Record<string, { total: number, used: number }> = {}
        
        storageDevices.value.forEach(device => {
          // 提取容量数字部分
          const totalCapacity = parseInt(device.capacity.replace(/[^0-9]/g, ''))
          const usedCapacity = parseInt(device.used.replace(/[^0-9]/g, ''))
          
          if (!typeStats[device.type]) {
            typeStats[device.type] = { total: 0, used: 0 }
          }
          
          typeStats[device.type].total += totalCapacity
          typeStats[device.type].used += usedCapacity
        })
        
        const types = Object.keys(typeStats)
        const totalData = types.map(type => typeStats[type].total)
        const usedData = types.map(type => typeStats[type].used)
        
        usageChart.setOption({
          title: {
            text: '存储容量使用情况',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function(params: any) {
              const typeIndex = params[0].dataIndex
              const type = types[typeIndex]
              const total = typeStats[type].total
              const used = typeStats[type].used
              const percentage = Math.round((used / total) * 100)
              return `${type}<br/>总容量: ${total}TB<br/>已使用: ${used}TB (${percentage}%)`
            }
          },
          legend: {
            data: ['总容量', '已使用'],
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
            data: types
          },
          yAxis: {
            type: 'value',
            name: '容量(TB)'
          },
          series: [
            {
              name: '总容量',
              type: 'bar',
              emphasis: {
                focus: 'series'
              },
              data: totalData,
              itemStyle: {
                color: '#409EFF'
              }
            },
            {
              name: '已使用',
              type: 'bar',
              emphasis: {
                focus: 'series'
              },
              data: usedData,
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
    // 更新图表
    initCharts()
  })
}

function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除存储设备"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = storageDevices.value.findIndex(s => s.id === row.id)
      if (idx !== -1) {
        storageDevices.value.splice(idx, 1)
        ElMessage.success('删除成功')
        // 更新图表
        initCharts()
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

.license-card,
.storage-stats-card,
.storage-card {
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