<template>
  <div class="cloud-management-container">
    
    <!-- 平台概览 -->
    <el-card class="overview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Monitor /></el-icon>
            <span>云管平台概览</span>
          </div>
          <div class="header-right">
            <el-tag type="success">cSight 管理平台</el-tag>
            <el-button type="primary" size="small" :icon="Refresh" @click="refreshDashboard">刷新</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in overviewItems" :key="index">
          <div class="overview-item" :class="`status-${item.status}`">
            <div class="item-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-count">{{ item.count }}</div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 许可管理 -->
    <el-card class="license-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Key /></el-icon>
            <span>许可管理</span>
          </div>
          <div class="header-right">
            <el-button type="primary" size="small" @click="addLicense">添加许可</el-button>
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="viewLicenseDetail(row)">详情</el-button>
              <el-button type="warning" size="small" @click="renewLicense(row)">续期</el-button>
              <el-button type="danger" size="small" @click="deleteLicense(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 设备统计 -->
    <el-row :gutter="20" class="device-stats-row">
      <el-col :xs="24" :md="12">
        <el-card class="device-stats-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon><Cpu /></el-icon>
                <span>设备监控统计</span>
              </div>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="day">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="deviceStatsChart" class="chart-container" id="deviceStatsChart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="device-category-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon><PieChart /></el-icon>
                <span>设备类型分布</span>
              </div>
            </div>
          </template>
          <div ref="deviceCategoryChart" class="chart-container" id="deviceCategoryChart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 平台监控 -->
    <el-card class="platform-monitoring" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Warning /></el-icon>
            <span>平台监控</span>
          </div>
          <div class="header-right">
            <span class="last-update">最后更新: {{ formatTime(new Date()) }}</span>
            <el-button type="primary" size="small" :icon="Refresh" @click="refreshMonitoring">刷新</el-button>
          </div>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="服务器监控" name="server">
          <el-table :data="serverMonitorData" style="width: 100%" border stripe>
            <el-table-column prop="name" label="服务器名称" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cpu" label="CPU使用率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.cpu" :status="getResourceStatus(row.cpu)" />
              </template>
            </el-table-column>
            <el-table-column prop="memory" label="内存使用率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.memory" :status="getResourceStatus(row.memory)" />
              </template>
            </el-table-column>
            <el-table-column prop="disk" label="磁盘使用率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.disk" :status="getResourceStatus(row.disk)" />
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最后检查" width="180" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="网络监控" name="network">
          <el-table :data="networkMonitorData" style="width: 100%" border stripe>
            <el-table-column prop="name" label="设备名称" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="bandwidth" label="带宽使用率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.bandwidth" :status="getResourceStatus(row.bandwidth)" />
              </template>
            </el-table-column>
            <el-table-column prop="packets" label="数据包/秒" width="120" />
            <el-table-column prop="errors" label="错误率" width="120">
              <template #default="{ row }">
                <span :class="row.errors > 1 ? 'error-high' : 'error-normal'">{{ row.errors }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最后检查" width="180" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="存储监控" name="storage">
          <el-table :data="storageMonitorData" style="width: 100%" border stripe>
            <el-table-column prop="name" label="存储名称" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="capacity" label="容量" width="100" />
            <el-table-column prop="usage" label="使用率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.usage" :status="getResourceStatus(row.usage)" />
              </template>
            </el-table-column>
            <el-table-column prop="iops" label="IOPS" width="100" />
            <el-table-column prop="latency" label="延迟" width="100" />
            <el-table-column prop="lastCheck" label="最后检查" width="180" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="教学系统" name="education">
          <el-table :data="educationSystemData" style="width: 100%" border stripe>
            <el-table-column prop="name" label="系统名称" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="users" label="在线用户数" width="120" />
            <el-table-column prop="response" label="响应时间" width="120" />
            <el-table-column prop="load" label="系统负载" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.load" :status="getResourceStatus(row.load)" />
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最后检查" width="180" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 告警记录 -->
    <el-card class="alarm-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Bell /></el-icon>
            <span>告警记录</span>
            <el-badge :value="12" :max="99" class="alarm-badge" type="danger" />
          </div>
          <div class="header-right">
            <el-button type="primary" size="small" @click="viewAllAlarms">查看全部</el-button>
          </div>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(alarm, index) in alarmList"
          :key="index"
          :type="getAlarmType(alarm.level)"
          :timestamp="alarm.time"
          :hollow="alarm.level === '提示'"
        >
          <div class="alarm-content">
            <span class="alarm-level" :class="`level-${alarm.level.toLowerCase()}`">【{{ alarm.level }}】</span>
            {{ alarm.content }}
          </div>
          <div class="alarm-source">来源: {{ alarm.source }}</div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, Key, Refresh, Cpu, PieChart, Bell, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()
const timeRange = ref('day')
const activeTab = ref('server')

// 平台概览数据
const overviewItems = ref([
  { title: '教学管理平台', count: '4/4', description: '全部正常运行', icon: 'Reading', status: 'normal' },
  { title: '网络设备', count: '48/50', description: '已监控48台设备', icon: 'Connection', status: 'warning' },
  { title: '服务器', count: '30/30', description: '已监控全部服务器', icon: 'Cpu', status: 'normal' },
  { title: '存储设备', count: '19/20', description: '已监控19台设备', icon: 'DataLine', status: 'warning' }
])

// 许可管理数据
const licenseData = ref([
  { name: '教学管理平台许可', type: '平台', total: 4, used: 4, available: 0, expireDate: '2025-12-31', status: '有效' },
  { name: '网络设备管理许可', type: '设备', total: 50, used: 48, available: 2, expireDate: '2025-12-31', status: '有效' },
  { name: '服务器管理许可', type: '设备', total: 30, used: 30, available: 0, expireDate: '2025-12-31', status: '有效' },
  { name: '存储管理许可', type: '设备', total: 20, used: 19, available: 1, expireDate: '2025-12-31', status: '有效' }
])

// 监控数据
const serverMonitorData = ref([
  { name: '教务系统服务器', status: '正常', cpu: 65, memory: 70, disk: 55, lastCheck: '2025-06-10 15:30:45' },
  { name: '学生管理服务器', status: '正常', cpu: 55, memory: 60, disk: 48, lastCheck: '2025-06-10 15:30:42' },
  { name: '教师管理服务器', status: '正常', cpu: 45, memory: 52, disk: 60, lastCheck: '2025-06-10 15:30:40' },
  { name: '资源管理服务器', status: '警告', cpu: 85, memory: 75, disk: 68, lastCheck: '2025-06-10 15:30:38' },
  { name: '虚拟化平台主机', status: '正常', cpu: 60, memory: 65, disk: 50, lastCheck: '2025-06-10 15:30:35' }
])

const networkMonitorData = ref([
  { name: '核心路由器', status: '正常', bandwidth: 65, packets: '15000', errors: 0.2, lastCheck: '2025-06-10 15:30:45' },
  { name: '主防火墙', status: '正常', bandwidth: 60, packets: '12000', errors: 0.1, lastCheck: '2025-06-10 15:30:42' },
  { name: '教学楼交换机A', status: '警告', bandwidth: 85, packets: '8500', errors: 1.5, lastCheck: '2025-06-10 15:30:40' },
  { name: '教学楼交换机B', status: '正常', bandwidth: 55, packets: '7200', errors: 0.3, lastCheck: '2025-06-10 15:30:38' },
  { name: '办公楼交换机', status: '正常', bandwidth: 45, packets: '5000', errors: 0.2, lastCheck: '2025-06-10 15:30:35' }
])

const storageMonitorData = ref([
  { name: '主存储阵列', status: '正常', capacity: '50TB', usage: 68, iops: '1200', latency: '5ms', lastCheck: '2025-06-10 15:30:45' },
  { name: '备份存储', status: '正常', capacity: '30TB', usage: 55, iops: '800', latency: '8ms', lastCheck: '2025-06-10 15:30:42' },
  { name: '教学资源存储', status: '警告', capacity: '20TB', usage: 88, iops: '950', latency: '10ms', lastCheck: '2025-06-10 15:30:40' },
  { name: '数据归档存储', status: '正常', capacity: '40TB', usage: 45, iops: '300', latency: '12ms', lastCheck: '2025-06-10 15:30:38' },
  { name: '视频资源存储', status: '正常', capacity: '25TB', usage: 72, iops: '850', latency: '7ms', lastCheck: '2025-06-10 15:30:35' }
])

const educationSystemData = ref([
  { name: '教务管理系统', status: '正常', users: 120, response: '0.5s', load: 65, lastCheck: '2025-06-10 15:30:45' },
  { name: '学生管理系统', status: '正常', users: 85, response: '0.8s', load: 55, lastCheck: '2025-06-10 15:30:42' },
  { name: '教师管理系统', status: '正常', users: 42, response: '0.6s', load: 40, lastCheck: '2025-06-10 15:30:40' },
  { name: '资源管理系统', status: '警告', users: 68, response: '2.5s', load: 85, lastCheck: '2025-06-10 15:30:38' }
])

// 告警列表
const alarmList = ref([
  { level: '严重', content: '教学资源存储空间使用率达到88%，请及时清理', source: '存储监控', time: '2025-06-10 14:25:30' },
  { level: '警告', content: '教学楼交换机A带宽使用率超过85%，可能影响网络访问速度', source: '网络监控', time: '2025-06-10 13:45:12' },
  { level: '警告', content: '资源管理系统响应时间超过2秒，建议检查系统负载', source: '应用监控', time: '2025-06-10 13:20:05' },
  { level: '提示', content: '服务器计划性维护将于今晚23:00进行，预计持续2小时', source: '系统通知', time: '2025-06-10 12:10:56' },
  { level: '严重', content: '资源管理服务器CPU使用率持续超过85%，建议立即检查', source: '服务器监控', time: '2025-06-10 11:50:23' }
])

// 图表DOM引用
const deviceStatsChart = ref<HTMLElement | null>(null)
const deviceCategoryChart = ref<HTMLElement | null>(null)

// 图表实例
let deviceStatsChartInstance: echarts.ECharts | null = null
let deviceCategoryChartInstance: echarts.ECharts | null = null

// 图表数据
const chartData = reactive({
  day: {
    servers: [25, 3, 1, 1],
    network: [40, 6, 2, 2],
    storage: [16, 3, 0, 1],
    education: [4, 0, 0, 0]
  },
  week: {
    servers: [22, 5, 2, 1],
    network: [38, 8, 3, 1],
    storage: [15, 4, 1, 0],
    education: [3, 1, 0, 0]
  },
  month: {
    servers: [20, 6, 3, 1],
    network: [35, 10, 3, 2],
    storage: [14, 5, 1, 0],
    education: [3, 1, 0, 0]
  }
});

onMounted(() => {
  nextTick(() => {
    initCharts()
    
    // 添加窗口大小调整监听
    window.addEventListener('resize', handleResize)
  })
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  deviceStatsChartInstance?.dispose()
  deviceCategoryChartInstance?.dispose()
})

// 处理窗口大小调整
function handleResize() {
  deviceStatsChartInstance?.resize()
  deviceCategoryChartInstance?.resize()
}

// 监听timeRange变化
watch(timeRange, (newValue) => {
  updateDeviceStatsChart(newValue);
}, { immediate: false });

// 初始化图表
function initCharts() {
  // 设备监控统计图表
  if (deviceStatsChart.value) {
    deviceStatsChartInstance = echarts.init(deviceStatsChart.value)
    updateDeviceStatsChart(timeRange.value)
  }
  
  // 设备类型分布图表
  if (deviceCategoryChart.value) {
    deviceCategoryChartInstance = echarts.init(deviceCategoryChart.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: ['服务器', '网络设备', '存储设备', '教学系统', '其他']
      },
      series: [
        {
          name: '设备分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 30, name: '服务器' },
            { value: 50, name: '网络设备' },
            { value: 20, name: '存储设备' },
            { value: 4, name: '教学系统' },
            { value: 8, name: '其他' }
          ]
        }
      ]
    }
    deviceCategoryChartInstance.setOption(option)
  }
}

// 更新设备监控统计图表
function updateDeviceStatsChart(timeRangeValue: string) {
  if (!deviceStatsChartInstance) return;
  
  const data = chartData[timeRangeValue as keyof typeof chartData];
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['正常', '警告', '严重', '离线']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['服务器', '网络设备', '存储设备', '教学系统']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '正常',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [data.servers[0], data.network[0], data.storage[0], data.education[0]],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '警告',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [data.servers[1], data.network[1], data.storage[1], data.education[1]],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '严重',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [data.servers[2], data.network[2], data.storage[2], data.education[2]],
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '离线',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [data.servers[3], data.network[3], data.storage[3], data.education[3]],
        itemStyle: { color: '#909399' }
      }
    ]
  };
  
  deviceStatsChartInstance.setOption(option);
  ElMessage.success(`已切换到${timeRangeValue === 'day' ? '今日' : timeRangeValue === 'week' ? '本周' : '本月'}数据`);
}

// 工具函数
const formatTime = (date: Date) => {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

const getLicenseStatus = (used: number, total: number) => {
  const percentage = (used / total) * 100
  if (percentage > 90) return 'exception'
  if (percentage > 70) return 'warning'
  return 'success'
}

const getStatusType = (status: string) => {
  switch (status) {
    case '正常': return 'success'
    case '警告': return 'warning'
    case '严重': return 'danger'
    case '离线': return 'info'
    default: return 'info'
  }
}

const getResourceStatus = (value: number) => {
  if (value > 80) return 'exception'
  if (value > 60) return 'warning'
  return 'success'
}

const getAlarmType = (level: string) => {
  switch (level) {
    case '严重': return 'danger'
    case '警告': return 'warning'
    case '提示': return 'info'
    default: return 'info'
  }
}

// 按钮事件处理
function refreshDashboard() {
  ElMessage.success('仪表盘数据已刷新')
}

function refreshMonitoring() {
  ElMessage.success('监控数据已刷新')
}

function addLicense() {
  ElMessageBox.prompt('请输入许可证密钥', '添加许可', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(({ value }) => {
      ElMessage({
        type: 'success',
        message: `已添加许可证密钥: ${value}`
      })
    })
    .catch(() => {})
}

function viewLicenseDetail(row: any) {
  ElMessageBox.alert(`许可证详情: ${row.name}`, '许可详情', {
    confirmButtonText: '确定'
  })
}

function renewLicense(row: any) {
  ElMessageBox.confirm(`确认为"${row.name}"续期?`, '续期确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '许可已成功续期至2026-12-31'
      })
    })
    .catch(() => {})
}

function deleteLicense(row: any) {
  ElMessageBox.confirm(`确认删除"${row.name}"?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '许可已成功删除'
      })
    })
    .catch(() => {})
}

function viewAllAlarms() {
  router.push('/alarms')
}
</script>

<style scoped>
.cloud-management-container {
  padding: 20px;
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
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.overview-card,
.license-card,
.platform-monitoring,
.alarm-card {
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.overview-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.status-normal {
  border-left: 4px solid #67c23a;
}

.status-warning {
  border-left: 4px solid #e6a23c;
}

.status-danger {
  border-left: 4px solid #f56c6c;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #ecf5ff;
  margin-right: 15px;
  font-size: 24px;
  color: #409eff;
}

.item-content {
  flex: 1;
}

.item-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.item-count {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.item-desc {
  font-size: 12px;
  color: #909399;
}

.device-stats-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.alarm-content {
  font-size: 14px;
  margin-bottom: 5px;
}

.alarm-source {
  font-size: 12px;
  color: #909399;
}

.alarm-level {
  font-weight: bold;
  margin-right: 5px;
}

.level-严重 {
  color: #f56c6c;
}

.level-警告 {
  color: #e6a23c;
}

.level-提示 {
  color: #409eff;
}

.error-high {
  color: #f56c6c;
  font-weight: bold;
}

.error-normal {
  color: #67c23a;
}

.last-update {
  font-size: 12px;
  color: #909399;
}

.alarm-badge {
  margin-left: 5px;
}
</style> 