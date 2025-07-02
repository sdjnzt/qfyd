<template>
  <div class="network-container">
    <h1>网络管理</h1>
<!--    <p>这里是曲阜远东职业技术学院网络管理模块</p>-->
    <el-card class="license-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Key /></el-icon>
            <span>网络设备许可概览</span>
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
            <div class="stat-value">50</div>
            <el-progress :percentage="100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">已使用</div>
            <div class="stat-value">{{ licenseStats.used }}</div>
            <el-progress :percentage="(licenseStats.used / 50) * 100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">告警设备</div>
            <div class="stat-value warning">{{ licenseStats.warning }}</div>
            <el-progress :percentage="(licenseStats.warning / 50) * 100" status="warning" />
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="network-stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><DataAnalysis /></el-icon>
            <span>设备状态分析</span>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div ref="statusChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <div ref="typeChartRef" class="chart-container"></div>
        </el-col>
      </el-row>
    </el-card>

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
  day: { used: 48, warning: 3 },
  week: { used: 47, warning: 4 },
  month: { used: 46, warning: 5 }
})

const licenseStats = ref(timeRangeData.day)

// 网络设备数据
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
  { id: 10, name: '无线AP-3F', type: '无线AP', ip: '192.168.4.3', bandwidth: '500Mbps', location: '教学楼3楼', status: '离线', uptime: '0天' },
  { id: 11, name: '教学区汇聚交换机', type: '交换机', ip: '192.168.2.10', bandwidth: '10Gbps', location: '教学区机房', status: '正常', uptime: '45天' },
  { id: 12, name: '办公区汇聚交换机', type: '交换机', ip: '192.168.2.11', bandwidth: '10Gbps', location: '办公区机房', status: '正常', uptime: '40天' },
  { id: 13, name: '宿舍区汇聚交换机', type: '交换机', ip: '192.168.2.12', bandwidth: '10Gbps', location: '宿舍区机房', status: '正常', uptime: '38天' },
  { id: 14, name: '实验室汇聚交换机', type: '交换机', ip: '192.168.2.13', bandwidth: '10Gbps', location: '实验楼机房', status: '正常', uptime: '35天' },
  { id: 15, name: '网关路由器A', type: '路由器', ip: '192.168.0.10', bandwidth: '10Gbps', location: '网络出口区', status: '正常', uptime: '50天' },
  { id: 16, name: '网关路由器B', type: '路由器', ip: '192.168.0.11', bandwidth: '10Gbps', location: '网络出口区', status: '正常', uptime: '48天' },
  { id: 17, name: '教学楼A-1F交换机', type: '交换机', ip: '192.168.5.1', bandwidth: '1Gbps', location: '教学楼A-1F', status: '正常', uptime: '30天' },
  { id: 18, name: '教学楼A-2F交换机', type: '交换机', ip: '192.168.5.2', bandwidth: '1Gbps', location: '教学楼A-2F', status: '正常', uptime: '30天' },
  { id: 19, name: '教学楼A-3F交换机', type: '交换机', ip: '192.168.5.3', bandwidth: '1Gbps', location: '教学楼A-3F', status: '正常', uptime: '30天' },
  { id: 20, name: '教学楼A-4F交换机', type: '交换机', ip: '192.168.5.4', bandwidth: '1Gbps', location: '教学楼A-4F', status: '正常', uptime: '30天' },
  { id: 21, name: '教学楼B-1F交换机', type: '交换机', ip: '192.168.6.1', bandwidth: '1Gbps', location: '教学楼B-1F', status: '正常', uptime: '28天' },
  { id: 22, name: '教学楼B-2F交换机', type: '交换机', ip: '192.168.6.2', bandwidth: '1Gbps', location: '教学楼B-2F', status: '正常', uptime: '28天' },
  { id: 23, name: '教学楼B-3F交换机', type: '交换机', ip: '192.168.6.3', bandwidth: '1Gbps', location: '教学楼B-3F', status: '警告', uptime: '28天' },
  { id: 24, name: '教学楼B-4F交换机', type: '交换机', ip: '192.168.6.4', bandwidth: '1Gbps', location: '教学楼B-4F', status: '正常', uptime: '28天' },
  { id: 25, name: '实验楼-1F交换机', type: '交换机', ip: '192.168.7.1', bandwidth: '1Gbps', location: '实验楼-1F', status: '正常', uptime: '25天' },
  { id: 26, name: '实验楼-2F交换机', type: '交换机', ip: '192.168.7.2', bandwidth: '1Gbps', location: '实验楼-2F', status: '正常', uptime: '25天' },
  { id: 27, name: '实验楼-3F交换机', type: '交换机', ip: '192.168.7.3', bandwidth: '1Gbps', location: '实验楼-3F', status: '正常', uptime: '25天' },
  { id: 28, name: '实验楼-4F交换机', type: '交换机', ip: '192.168.7.4', bandwidth: '1Gbps', location: '实验楼-4F', status: '正常', uptime: '25天' },
  { id: 29, name: '办公楼-1F交换机', type: '交换机', ip: '192.168.8.1', bandwidth: '1Gbps', location: '办公楼-1F', status: '正常', uptime: '22天' },
  { id: 30, name: '办公楼-2F交换机', type: '交换机', ip: '192.168.8.2', bandwidth: '1Gbps', location: '办公楼-2F', status: '正常', uptime: '22天' },
  { id: 31, name: '办公楼-3F交换机', type: '交换机', ip: '192.168.8.3', bandwidth: '1Gbps', location: '办公楼-3F', status: '正常', uptime: '22天' },
  { id: 32, name: '宿舍1号楼交换机', type: '交换机', ip: '192.168.9.1', bandwidth: '1Gbps', location: '宿舍1号楼', status: '正常', uptime: '20天' },
  { id: 33, name: '宿舍2号楼交换机', type: '交换机', ip: '192.168.9.2', bandwidth: '1Gbps', location: '宿舍2号楼', status: '正常', uptime: '20天' },
  { id: 34, name: '宿舍3号楼交换机', type: '交换机', ip: '192.168.9.3', bandwidth: '1Gbps', location: '宿舍3号楼', status: '正常', uptime: '20天' },
  { id: 35, name: '宿舍4号楼交换机', type: '交换机', ip: '192.168.9.4', bandwidth: '1Gbps', location: '宿舍4号楼', status: '离线', uptime: '0天' },
  { id: 36, name: '图书馆-1F交换机', type: '交换机', ip: '192.168.10.1', bandwidth: '1Gbps', location: '图书馆-1F', status: '正常', uptime: '18天' },
  { id: 37, name: '图书馆-2F交换机', type: '交换机', ip: '192.168.10.2', bandwidth: '1Gbps', location: '图书馆-2F', status: '正常', uptime: '18天' },
  { id: 38, name: '图书馆-3F交换机', type: '交换机', ip: '192.168.10.3', bandwidth: '1Gbps', location: '图书馆-3F', status: '正常', uptime: '18天' },
  { id: 39, name: '无线AP-图书馆', type: '无线AP', ip: '192.168.4.10', bandwidth: '500Mbps', location: '图书馆', status: '正常', uptime: '15天' },
  { id: 40, name: '无线AP-办公楼', type: '无线AP', ip: '192.168.4.11', bandwidth: '500Mbps', location: '办公楼', status: '正常', uptime: '15天' },
  { id: 41, name: '无线AP-实验楼', type: '无线AP', ip: '192.168.4.12', bandwidth: '500Mbps', location: '实验楼', status: '正常', uptime: '15天' },
  { id: 42, name: '无线AP-食堂', type: '无线AP', ip: '192.168.4.13', bandwidth: '500Mbps', location: '食堂', status: '正常', uptime: '15天' },
  { id: 43, name: '无线AP-操场', type: '无线AP', ip: '192.168.4.14', bandwidth: '500Mbps', location: '操场', status: '正常', uptime: '15天' },
  { id: 44, name: '无线AP-宿舍区', type: '无线AP', ip: '192.168.4.15', bandwidth: '500Mbps', location: '宿舍区', status: '警告', uptime: '15天' },
  { id: 45, name: '边界防火墙', type: '防火墙', ip: '192.168.0.3', bandwidth: '5Gbps', location: '网络出口区', status: '正常', uptime: '40天' },
  { id: 46, name: '内网防火墙', type: '防火墙', ip: '192.168.0.4', bandwidth: '5Gbps', location: '主机房', status: '正常', uptime: '40天' },
  { id: 47, name: '备用负载均衡器', type: '负载均衡器', ip: '192.168.3.2', bandwidth: '2Gbps', location: '主机房', status: '正常', uptime: '35天' },
  { id: 48, name: '行政区路由器', type: '路由器', ip: '192.168.1.5', bandwidth: '5Gbps', location: '行政楼', status: '正常', uptime: '30天' }
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

// 图表相关变量
let statusChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
const statusChartRef = ref<HTMLElement | null>(null)
const typeChartRef = ref<HTMLElement | null>(null)

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
        
        const normalCount = networkDevices.value.filter(d => d.status === '正常').length
        const warningCount = networkDevices.value.filter(d => d.status === '警告').length
        const errorCount = networkDevices.value.filter(d => d.status === '错误').length
        const offlineCount = networkDevices.value.filter(d => d.status === '离线').length
        
        statusChart.setOption({
          title: {
            text: '网络设备状态分布',
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
      
      // 设备类型分布图
      if (typeChartRef.value) {
        if (typeChart) {
          typeChart.dispose()
        }
        typeChart = echarts.init(typeChartRef.value)
        
        // 统计各类型设备数量
        const typeStats: Record<string, number> = {}
        networkDevices.value.forEach(device => {
          typeStats[device.type] = (typeStats[device.type] || 0) + 1
        })
        
        const typeData = Object.keys(typeStats).map(type => ({
          value: typeStats[type],
          name: type
        }))
        
        typeChart.setOption({
          title: {
            text: '网络设备类型分布',
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
              name: '设备类型',
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
              data: typeData
            }
          ]
        })
      }
    } catch (error) {
      console.error('初始化图表失败:', error)
    }
  })
}

// 其他方法
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
    // 更新图表
    initCharts()
  })
}

function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除网络设备"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = networkDevices.value.findIndex(n => n.id === row.id)
      if (idx !== -1) {
        networkDevices.value.splice(idx, 1)
        ElMessage.success('删除成功')
        // 更新图表
        initCharts()
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

.license-card,
.network-stats-card,
.network-card {
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