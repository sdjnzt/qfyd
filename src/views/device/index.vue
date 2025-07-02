<template>
  <div class="device-manage-container">
    <el-card shadow="hover" class="device-header-card">
      <div class="header-title">
        <el-icon><Monitor /></el-icon>
        <span>设备管理平台</span>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="timeRange" size="small" class="time-filter">
          <el-radio-button label="day">今日</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="refreshStats">刷新</el-button>
        <el-button type="success" @click="addDevice">添加设备</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="device-stats-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">设备总数</div>
            <div class="stat-value">{{ deviceStats.total }}</div>
            <el-progress :percentage="100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">在线设备</div>
            <div class="stat-value">{{ deviceStats.online }}</div>
            <el-progress :percentage="(deviceStats.online/deviceStats.total)*100" status="success" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-box">
            <div class="stat-title">告警设备</div>
            <div class="stat-value warning">{{ deviceStats.warning }}</div>
            <el-progress :percentage="(deviceStats.warning/deviceStats.total)*100" status="warning" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover" class="device-license-card">
          <template #header>
            <div class="card-header">
          <div class="header-left">
            <el-icon><Key /></el-icon>
            <span>许可证使用情况</span>
          </div>
            </div>
      </template>
      <el-table :data="licenseData" style="width: 100%" border stripe>
        <el-table-column prop="name" label="许可名称" min-width="150" />
        <el-table-column prop="type" label="许可类型" width="120" />
        <el-table-column prop="total" label="许可数量" width="100" />
        <el-table-column prop="used" label="已使用" width="100" />
        <el-table-column prop="available" label="可用" width="100" />
        <el-table-column prop="expireDate" label="到期日期" width="120" />
        <el-table-column label="使用情况" width="180">
          <template #default="{ row }">
            <el-progress 
              :percentage="Math.round((row.used / row.total) * 100)" 
              :status="getLicenseStatus(row.used, row.total)"
            />
              </template>
            </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
            <el-tag :type="row.status === '有效' ? 'success' : 'danger'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

    <el-card shadow="hover" class="device-category-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="设备概览" name="overview">
          <el-row :gutter="20">
            <el-col :span="8" v-for="cat in deviceCategories" :key="cat.name">
              <el-card shadow="never" class="category-box">
          <template #header>
                  <div class="category-header">
                    <el-icon><component :is="cat.icon" /></el-icon>
                    <span>{{ cat.name }}</span>
            </div>
          </template>
                <div class="category-content">
                  <div class="category-row">
                    <span class="label">许可数量:</span>
                    <span class="value">{{ cat.total }}</span>
                  </div>
                  <div class="category-row">
                    <span class="label">已使用:</span>
                    <span class="value online">{{ cat.used }}</span>
                  </div>
                  <div class="category-row">
                    <span class="label">告警:</span>
                    <span class="value warning">{{ cat.warning }}</span>
                  </div>
                  <el-progress
                    :percentage="(cat.used/cat.total)*100"
                    :status="cat.warning > 0 ? 'warning' : 'success'"
                    :format="() => `${Math.round((cat.used/cat.total)*100)}% 已使用`"
                  />
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <el-tab-pane label="设备列表" name="list">
          <div class="filter-container">
            <el-input
              v-model="searchQuery"
              placeholder="搜索设备名称/IP/位置"
              style="width: 200px;"
              class="filter-item"
              @input="handleFilter"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select v-model="categoryFilter" placeholder="设备类型" clearable style="width: 150px" @change="handleFilter">
              <el-option v-for="cat in deviceCategories" :key="cat.name" :label="cat.name" :value="cat.name" />
            </el-select>
            
            <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px" @change="handleFilter">
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
              <el-option label="告警" value="warning" />
            </el-select>
            
            <el-button type="primary" @click="handleFilter">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </div>
          
          <el-table :data="filteredDeviceList" style="width: 100%" border stripe>
            <el-table-column prop="name" label="设备名称" min-width="150" />
            <el-table-column prop="category" label="设备类型" width="120" />
            <el-table-column prop="ip" label="IP地址" width="150" />
            <el-table-column prop="location" label="位置" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastActive" label="最后活动" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button type="primary" size="small" @click="viewDeviceDetail(row)">详情</el-button>
                  <el-button type="warning" size="small" @click="editDevice(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteDevice(row)">删除</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="filteredDeviceList.length"
              :page-sizes="[10, 20, 50, 100]"
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
            />
          </div>
      </el-tab-pane>

        <el-tab-pane label="统计分析" name="stats">
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="deviceStatusChart" class="chart-container"></div>
            </el-col>
            <el-col :span="12">
              <div ref="deviceTypeChart" class="chart-container"></div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <div ref="deviceTrendChart" class="chart-container trend-chart"></div>
            </el-col>
          </el-row>
      </el-tab-pane>
    </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { Monitor, Cpu, Connection, DataLine, Search, Key } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'

interface DeviceStats {
  total: number
  online: number
  warning: number
}

interface DeviceCategory {
  name: string
  total: number
  used: number
  warning: number
  icon: any // 使用组件图标
}

interface Device {
  id: number
  name: string
  category: string
  ip: string
  location: string
  status: string
  lastActive: string
}

interface License {
  name: string
  type: string
  total: number
  used: number
  available: number
  expireDate: string
  status: string
}

type TimeRangeKey = 'day' | 'week' | 'month'

const activeTab = ref('overview')
const timeRange = ref<TimeRangeKey>('day')
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 许可证数据
const licenseData = ref<License[]>([
  { name: '网络设备管理许可', type: '设备', total: 50, used: 48, available: 2, expireDate: '2025-12-31', status: '有效' },
  { name: '服务器管理许可', type: '设备', total: 30, used: 30, available: 0, expireDate: '2025-12-31', status: '有效' },
  { name: '存储设备管理许可', type: '设备', total: 20, used: 19, available: 1, expireDate: '2025-12-31', status: '有效' }
])

// 设备统计数据
const timeRangeData = reactive<Record<TimeRangeKey, DeviceStats>>({
  day: { total: 100, online: 97, warning: 5 },
  week: { total: 100, online: 95, warning: 7 },
  month: { total: 100, online: 92, warning: 10 }
})

const deviceStats = ref<DeviceStats>(timeRangeData.day)

// 设备分类数据
const categoryTimeData = reactive<Record<TimeRangeKey, DeviceCategory[]>>({
  day: [
    { name: '网络设备', total: 50, used: 48, warning: 2, icon: Connection },
    { name: '服务器', total: 30, used: 30, warning: 2, icon: Cpu },
    { name: '存储设备', total: 20, used: 19, warning: 1, icon: DataLine }
  ],
  week: [
    { name: '网络设备', total: 50, used: 47, warning: 3, icon: Connection },
    { name: '服务器', total: 30, used: 30, warning: 3, icon: Cpu },
    { name: '存储设备', total: 20, used: 18, warning: 1, icon: DataLine }
  ],
  month: [
    { name: '网络设备', total: 50, used: 46, warning: 4, icon: Connection },
    { name: '服务器', total: 30, used: 28, warning: 5, icon: Cpu },
    { name: '存储设备', total: 20, used: 18, warning: 1, icon: DataLine }
  ]
})

const deviceCategories = ref<DeviceCategory[]>(categoryTimeData.day)

// 设备列表
const deviceList = ref<Device[]>([
  // 网络设备
  { id: 1, name: '核心路由器-01', category: '网络设备', ip: '192.168.1.1', location: '数据中心A区', status: '在线', lastActive: '2025-06-10 15:30:45' },
  { id: 2, name: '核心交换机-01', category: '网络设备', ip: '192.168.1.2', location: '数据中心A区', status: '在线', lastActive: '2025-06-10 15:28:32' },
  { id: 3, name: '核心防火墙-01', category: '网络设备', ip: '192.168.1.3', location: '数据中心A区', status: '告警', lastActive: '2025-06-10 15:15:20' },
  { id: 4, name: '汇聚交换机-01', category: '网络设备', ip: '192.168.2.1', location: '教学楼A区', status: '在线', lastActive: '2025-06-10 15:10:45' },
  { id: 5, name: '汇聚交换机-02', category: '网络设备', ip: '192.168.3.1', location: '教学楼B区', status: '离线', lastActive: '2025-06-09 10:30:12' },
  
  // 服务器
  { id: 6, name: '应用服务器-01', category: '服务器', ip: '192.168.10.1', location: '数据中心A区', status: '在线', lastActive: '2025-06-10 15:05:30' },
  { id: 7, name: '数据库服务器-01', category: '服务器', ip: '192.168.10.2', location: '数据中心A区', status: '在线', lastActive: '2025-06-10 14:58:45' },
  { id: 8, name: '虚拟化平台-01', category: '服务器', ip: '192.168.10.3', location: '数据中心A区', status: '告警', lastActive: '2025-06-10 14:45:22' },
  { id: 9, name: '备份服务器-01', category: '服务器', ip: '192.168.10.4', location: '数据中心B区', status: '在线', lastActive: '2025-06-10 14:30:18' },
  { id: 10, name: '应用服务器-02', category: '服务器', ip: '192.168.10.5', location: '数据中心B区', status: '在线', lastActive: '2025-06-10 14:25:40' },
  
  // 存储设备
  { id: 11, name: '主存储阵列-01', category: '存储设备', ip: '192.168.20.1', location: '数据中心A区', status: '在线', lastActive: '2025-06-10 14:20:15' },
  { id: 12, name: '备份存储-01', category: '存储设备', ip: '192.168.20.2', location: '数据中心B区', status: '在线', lastActive: '2025-06-10 14:15:33' },
  { id: 13, name: 'SAN交换机-01', category: '存储设备', ip: '192.168.20.3', location: '数据中心A区', status: '告警', lastActive: '2025-06-10 14:10:22' },
  { id: 14, name: 'SAN交换机-02', category: '存储设备', ip: '192.168.20.4', location: '数据中心B区', status: '在线', lastActive: '2025-06-10 14:05:18' },
  { id: 15, name: '归档存储-01', category: '存储设备', ip: '192.168.20.5', location: '数据中心B区', status: '在线', lastActive: '2025-06-10 14:00:55' }
])

const filteredDeviceList = ref<Device[]>(deviceList.value)

// 图表实例
let deviceStatusChart: echarts.ECharts | null = null
let deviceTypeChart: echarts.ECharts | null = null
let deviceTrendChart: echarts.ECharts | null = null

// 监听时间范围变化
watch(timeRange, (newVal) => {
  deviceStats.value = timeRangeData[newVal]
  deviceCategories.value = categoryTimeData[newVal]
  ElMessage.success(`已切换到${newVal === 'day' ? '今日' : newVal === 'week' ? '本周' : '本月'}数据`)
  
  // 如果在统计分析标签页，更新图表
  if (activeTab.value === 'stats') {
    nextTick(() => {
      initCharts()
    })
  }
})

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'stats') {
    nextTick(() => {
      initCharts()
    })
  }
})

onMounted(() => {
  // 初始化页面
  handleFilter()
})

// 方法
function refreshStats() {
  ElMessage.success('数据已刷新')
}

function addDevice() {
  ElMessageBox.prompt('请输入设备名称', '添加设备', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入设备名称'
  }).then(({ value }) => {
    ElMessage({
      type: 'success',
      message: `添加设备: ${value}`
    })
  }).catch(() => {})
}

function handleFilter() {
  filteredDeviceList.value = deviceList.value.filter(device => {
    const nameMatch = searchQuery.value ? device.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                                       device.ip.includes(searchQuery.value) ||
                                       device.location.toLowerCase().includes(searchQuery.value.toLowerCase()) : true
    const categoryMatch = categoryFilter.value ? device.category === categoryFilter.value : true
    
    let statusMatch = true
    if (statusFilter.value) {
      if (statusFilter.value === 'online') statusMatch = device.status === '在线'
      else if (statusFilter.value === 'offline') statusMatch = device.status === '离线'
      else if (statusFilter.value === 'warning') statusMatch = device.status === '告警'
    }
    
    return nameMatch && categoryMatch && statusMatch
  })
}

function resetFilter() {
  searchQuery.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  handleFilter()
}

function getStatusType(status: string) {
  switch (status) {
    case '在线': return 'success'
    case '离线': return 'info'
    case '告警': return 'warning'
    default: return 'info'
  }
}

function getLicenseStatus(used: number, total: number) {
  const percentage = (used / total) * 100
  if (percentage > 90) return 'exception'
  if (percentage > 70) return 'warning'
  return 'success'
}

function viewDeviceDetail(row: Device) {
  ElMessageBox.alert(`设备详情: ${row.name}`, '设备详情', {
    confirmButtonText: '确定'
  })
}

function editDevice(row: Device) {
  ElMessageBox.alert(`编辑设备: ${row.name}`, '编辑设备', {
    confirmButtonText: '确定'
  })
}

function deleteDevice(row: Device) {
  ElMessageBox.confirm(`确认删除设备: ${row.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {})
}

// 初始化图表
function initCharts() {
  // 等待DOM更新完成
  nextTick(() => {
    // 设备状态分布图
    try {
      const chartElement = document.querySelector('.chart-container')
      if (chartElement) {
        // 如果已有实例先销毁
        if (deviceStatusChart && typeof deviceStatusChart.dispose === 'function') {
          deviceStatusChart.dispose()
        }
        deviceStatusChart = echarts.init(chartElement as HTMLElement)
        
        if (deviceStatusChart) {
          deviceStatusChart.setOption({
    title: {
              text: '设备状态分布',
              left: 'center'
    },
    tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
              bottom: '5%',
              left: 'center'
            },
            series: [
              {
                name: '设备状态',
                type: 'pie',
                radius: '50%',
                data: [
                  { value: deviceStats.value.online - deviceStats.value.warning, name: '在线正常' },
                  { value: deviceStats.value.warning, name: '告警' },
                  { value: deviceStats.value.total - deviceStats.value.online, name: '离线' }
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                },
                itemStyle: {
                  color: function(params: any) {
                    const colors = ['#67C23A', '#E6A23C', '#909399']
                    return colors[params.dataIndex]
                  }
                }
              }
            ]
          })
        }
      } else {
        console.warn('未找到设备状态图表容器')
      }
    } catch (error) {
      console.error('初始化设备状态图表失败:', error)
    }

    // 设备类型分布图
    try {
      const typeElements = document.querySelectorAll('.chart-container')
      if (typeElements && typeElements.length > 1) {
        const typeElement = typeElements[1]
        // 如果已有实例先销毁
        if (deviceTypeChart && typeof deviceTypeChart.dispose === 'function') {
          deviceTypeChart.dispose()
        }
        deviceTypeChart = echarts.init(typeElement as HTMLElement)
        
        if (deviceTypeChart) {
          deviceTypeChart.setOption({
            title: {
              text: '设备类型分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
              bottom: '5%',
              left: 'center'
            },
            series: [
              {
                name: '设备类型',
                type: 'pie',
                radius: '50%',
                data: deviceCategories.value.map(cat => {
                  return { value: cat.used, name: cat.name }
                }),
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          })
        }
      } else {
        console.warn('未找到设备类型图表容器')
      }
    } catch (error) {
      console.error('初始化设备类型图表失败:', error)
    }

    // 设备活动趋势图
    try {
      const trendElement = document.querySelector('.trend-chart')
      if (trendElement) {
        // 如果已有实例先销毁
        if (deviceTrendChart && typeof deviceTrendChart.dispose === 'function') {
          deviceTrendChart.dispose()
        }
        deviceTrendChart = echarts.init(trendElement as HTMLElement)
        
        if (deviceTrendChart) {
          // 根据时间范围生成X轴数据
          let xAxisData: string[] = []
          let onlineData: number[] = []
          let warningData: number[] = []
          
          if (timeRange.value === 'day') {
            // 今日24小时
            for (let i = 0; i < 24; i++) {
              xAxisData.push(`${i}:00`)
              const onlineRate = 92 + Math.floor(Math.random() * 6)
              onlineData.push(onlineRate)
              warningData.push(Math.floor(Math.random() * 5))
            }
          } else if (timeRange.value === 'week') {
            // 本周7天
            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            for (let i = 0; i < 7; i++) {
              xAxisData.push(days[i])
              const onlineRate = 90 + Math.floor(Math.random() * 8)
              onlineData.push(onlineRate)
              warningData.push(3 + Math.floor(Math.random() * 5))
            }
          } else {
            // 本月30天
            for (let i = 1; i <= 30; i++) {
              xAxisData.push(`${i}日`)
              const onlineRate = 88 + Math.floor(Math.random() * 10)
              onlineData.push(onlineRate)
              warningData.push(2 + Math.floor(Math.random() * 8))
            }
          }
          
          deviceTrendChart.setOption({
    title: {
              text: '设备在线率趋势',
              left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
            legend: {
              data: ['在线率', '告警数'],
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
              boundaryGap: false,
              data: xAxisData
    },
            yAxis: [
              {
      type: 'value',
                name: '在线率(%)',
                min: 80,
      max: 100
    },
              {
                type: 'value',
                name: '告警数',
                min: 0,
                max: 20
              }
            ],
            series: [
              {
                name: '在线率',
      type: 'line',
                data: onlineData,
                smooth: true,
                yAxisIndex: 0,
                itemStyle: {
                  color: '#409EFF'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(64,158,255,0.3)'
                    }, {
                        offset: 1, color: 'rgba(64,158,255,0.1)'
                    }]
                  }
                }
              },
              {
                name: '告警数',
                type: 'bar',
                data: warningData,
                yAxisIndex: 1,
                itemStyle: {
                  color: '#E6A23C'
                }
              }
            ]
          })
        }
      } else {
        console.warn('未找到设备趋势图表容器')
      }
    } catch (error) {
      console.error('初始化设备趋势图表失败:', error)
    }

    // 调整图表大小
    const resizeHandler = () => {
      if (deviceStatusChart) {
        deviceStatusChart.resize()
      }
      if (deviceTypeChart) {
        deviceTypeChart.resize()
      }
      if (deviceTrendChart) {
        deviceTrendChart.resize()
      }
    }
    
    // 移除之前的监听器，避免重复
    window.removeEventListener('resize', resizeHandler)
    // 添加新的监听器
    window.addEventListener('resize', resizeHandler)
  })
}
</script>

<style scoped>
.device-manage-container {
  padding: 20px;
}
.device-header-card {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  gap: 10px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.time-filter {
  margin-right: 10px;
}
.device-stats-card,
.device-license-card {
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
.device-category-card {
  margin-bottom: 20px;
}
.category-box {
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 20px;
}
.category-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  gap: 8px;
}
.category-content {
  padding: 10px 0;
}
.category-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.category-row .label {
  color: #909399;
}
.category-row .value {
  font-weight: 500;
}
.category-row .value.online {
  color: #67C23A;
}
.category-row .value.warning {
  color: #E6A23C;
}
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.filter-item {
  margin-bottom: 10px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.chart-container {
  height: 300px;
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
}
.trend-chart {
  height: 350px;
}
</style> 