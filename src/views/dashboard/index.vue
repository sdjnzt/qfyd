<template>
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title">曲阜远东职业技术学院云定制化平台</h1>
      </div>
      
      <!-- 顶部统计卡片 -->
      <el-row :gutter="20" class="stat-row">
        <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
          <el-card shadow="hover" class="stat-card" :class="item.type">
            <template #header>
              <div class="card-header">
                <span>{{ item.title }}</span>
                <el-tag :type="item.tagType">{{ item.tagText }}</el-tag>
              </div>
            </template>
            <div class="stat-content">
              <el-icon class="stat-icon"><component :is="item.icon" /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ item.value }}</div>
                <div class="stat-label">{{ item.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 云管平台概览 -->
      <el-card class="csight-overview" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Monitor /></el-icon>
              <span>云管平台概览</span>
              <el-tag type="success" effect="dark" class="ml-10">已授权</el-tag>
            </div>
            <div class="header-actions">
              <el-tooltip content="数据为实时同步">
                <span class="sync-time">最后同步: {{ formatTime(new Date()) }}</span>
              </el-tooltip>
              <el-button type="primary" size="small" @click="goToCloudManagement">进入云管平台</el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="20" class="csight-stats">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="csight-stat-card">
              <div class="stat-header">
                <span>教学管理平台</span>
              </div>
              <div class="stat-body">
                <div class="stat-num">4</div>
                <div class="stat-text">已授权套数</div>
                <div class="stat-progress">
                  <el-progress type="dashboard" :percentage="100" status="success" :width="80" />
                </div>
                <div class="stat-footer">
                  <span class="stat-label">全部已激活</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="csight-stat-card">
              <div class="stat-header">
                <span>网络设备管理</span>
              </div>
              <div class="stat-body">
                <div class="stat-num">48/50</div>
                <div class="stat-text">已授权设备数</div>
                <div class="stat-progress">
                  <el-progress type="dashboard" :percentage="96" status="success" :width="80" />
                </div>
                <div class="stat-footer">
                  <span class="stat-label">授权充足</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="csight-stat-card">
              <div class="stat-header">
                <span>服务器管理</span>
              </div>
              <div class="stat-body">
                <div class="stat-num">30/30</div>
                <div class="stat-text">已授权设备数</div>
                <div class="stat-progress">
                  <el-progress type="dashboard" :percentage="100" status="warning" :width="80" />
                </div>
                <div class="stat-footer">
                  <span class="stat-label warning-text">已用尽授权</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="csight-stat-card">
              <div class="stat-header">
                <span>存储设备管理</span>
              </div>
              <div class="stat-body">
                <div class="stat-num">19/20</div>
                <div class="stat-text">已授权设备数</div>
                <div class="stat-progress">
                  <el-progress type="dashboard" :percentage="95" status="success" :width="80" />
                </div>
                <div class="stat-footer">
                  <span class="stat-label">授权充足</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="platform-summary">
          <h3>云管平台状态概要</h3>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="平台版本">cSight v5.2.3</el-descriptions-item>
            <el-descriptions-item label="授权状态">已激活</el-descriptions-item>
            <el-descriptions-item label="到期时间">2025-12-31</el-descriptions-item>
            <el-descriptions-item label="部署位置">学院主数据中心</el-descriptions-item>
            <el-descriptions-item label="监控设备总数">103</el-descriptions-item>
            <el-descriptions-item label="告警数">
              <el-tag type="danger">12</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="系统健康度">
              <el-progress :percentage="92" :stroke-width="8" :format="() => '92%'" status="success" />
            </el-descriptions-item>
            <el-descriptions-item label="最近更新">2023-06-10</el-descriptions-item>
          </el-descriptions>

          <div class="platform-actions">
            <el-button type="primary" @click="viewCloudMonitoring">查看设备监控</el-button>
            <el-button type="warning" @click="viewAlarms">查看告警 <el-badge value="12" /></el-button>
            <el-button type="success" @click="viewLicenses">许可管理</el-button>
          </div>
        </div>
      </el-card>
  
      <!-- 教学系统状态 -->
      <el-card class="system-status" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Operation /></el-icon>
              <span>教学系统状态</span>
              <el-tag type="success" effect="dark" class="ml-10">全部正常</el-tag>
            </div>
            <div class="header-actions">
              <el-tooltip content="数据为实时同步">
                <span class="sync-time">最后同步: {{ formatTime(new Date()) }}</span>
              </el-tooltip>
              <el-button type="primary" size="small" :icon="Refresh" @click="refreshSystemStatus">刷新</el-button>
              <el-button type="success" size="small" :icon="Document" @click="generateReport">报表</el-button>
            </div>
          </div>
        </template>
        
        <el-row :gutter="20" class="system-summary">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card running">
              <div class="summary-icon"><el-icon><VideoPlay /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">运行中</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '运行中').length }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card maintenance">
              <div class="summary-icon"><el-icon><Tools /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">维护中</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '维护中').length }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card warning">
              <div class="summary-icon"><el-icon><WarningFilled /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">告警</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '告警').length }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card offline">
              <div class="summary-icon"><el-icon><CircleClose /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">离线</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '离线').length }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <el-table
          :data="systemList"
          style="width: 100%"
          :max-height="400"
          border
          stripe
          highlight-current-row
          v-loading="tableLoading"
        >
          <el-table-column prop="systemName" label="系统名称" min-width="180">
            <template #default="{ row }">
              <div class="system-name">
                <el-icon class="system-icon" :class="getSystemIconClass(row)">
                  <component :is="getSystemIcon(row)" />
                </el-icon>
                <span>{{ row.systemName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                effect="dark"
                size="small"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" />
          <el-table-column prop="usage" label="使用率" width="180">
            <template #default="{ row }">
              <el-progress
                :percentage="row.usage || 0"
                :status="row.usage > 80 ? 'exception' : row.usage > 60 ? 'warning' : 'success'"
                :stroke-width="8"
                :format="(p: number) => `${p}%`"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-tooltip content="查看详情" placement="top">
                  <el-button type="primary" :icon="View" circle size="small" @click="viewSystemDetail(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="系统设置" placement="top">
                  <el-button type="warning" :icon="Setting" circle size="small" @click="configSystem(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="重启系统" placement="top">
                  <el-button type="danger" :icon="RefreshRight" circle size="small" @click="restartSystem(row)"></el-button>
                </el-tooltip>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- 硬件资源监控 -->
      <el-row :gutter="20" class="monitor-row">
        <el-col :xs="24" :md="12">
          <el-card class="monitor-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon><TrendCharts /></el-icon>
                  <span>资源使用趋势</span>
                </div>
                <el-radio-group v-model="timeRange" size="small">
                  <el-radio-button label="day">24小时</el-radio-button>
                  <el-radio-button label="week">7天</el-radio-button>
                  <el-radio-button label="month">30天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card class="monitor-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon><Warning /></el-icon>
                  <span>系统告警</span>
                </div>
                <el-button type="primary" size="small" :icon="Refresh" @click="refreshAlarms">刷新</el-button>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(alarm, index) in alarmList"
                :key="index"
                :type="alarm.type"
                :timestamp="alarm.time"
                :hollow="alarm.type === 'info'"
              >
                <div class="alarm-content">{{ alarm.content }}</div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 教学管理 -->
      <el-card class="course-management" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Reading /></el-icon>
              <span>教学管理概况</span>
            </div>
            <el-button type="primary" size="small" @click="viewCourseDetail">查看详情</el-button>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(course, index) in courseData" :key="index">
            <div class="course-card" :class="`course-type-${course.type}`">
              <div class="course-header">
                <span class="course-name">{{ course.name }}</span>
                <el-tag size="small" :type="course.status === '进行中' ? 'success' : 'warning'">{{ course.status }}</el-tag>
              </div>
              <div class="course-content">
                <div class="course-row">
                  <span class="label">教师:</span>
                  <span class="value">{{ course.teacher }}</span>
                </div>
                <div class="course-row">
                  <span class="label">学时:</span>
                  <span class="value">{{ course.hours }}</span>
                </div>
                <div class="course-row">
                  <span class="label">教室:</span>
                  <span class="value">{{ course.classroom }}</span>
                </div>
                <div class="course-row">
                  <span class="label">学生数:</span>
                  <span class="value">{{ course.students }}</span>
                </div>
                <div class="course-row">
                  <span class="label">进度:</span>
                  <span class="value">{{ course.progress }}%</span>
                </div>
              </div>
              <div class="course-footer">
                <el-progress 
                  :percentage="course.progress" 
                  :color="course.progress > 80 ? '#67C23A' : '#E6A23C'"
                  :stroke-width="5"
                  :format="(p: number) => `${p}%完成率`"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 设备管理状态 -->
      <el-card class="device-stats" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Cpu /></el-icon>
              <span>校园设备管理</span>
            </div>
            <el-button type="primary" size="small" @click="viewAllDevices">查看所有设备</el-button>
          </div>
        </template>

        <el-row :gutter="20" class="device-summary">
          <el-col :span="8">
            <el-card shadow="never" class="device-category-card">
              <template #header>
                <div class="device-category-header">
                  <el-icon><Monitor /></el-icon>
                  <span>多媒体教室设备</span>
                </div>
              </template>
              <div class="device-category-content">
                <div class="device-stat-row">
                  <span class="label">总数:</span>
                  <span class="value">120</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">在线:</span>
                  <span class="value online">115</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">离线:</span>
                  <span class="value offline">5</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">告警:</span>
                  <span class="value warning">2</span>
                </div>
                <el-progress 
                  :percentage="96" 
                  :stroke-width="10" 
                  status="success" 
                  :format="() => '96% 在线'"
                />
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card shadow="never" class="device-category-card">
              <template #header>
                <div class="device-category-header">
                  <el-icon><Cpu /></el-icon>
                  <span>机房服务器</span>
                </div>
              </template>
              <div class="device-category-content">
                <div class="device-stat-row">
                  <span class="label">总数:</span>
                  <span class="value">30</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">在线:</span>
                  <span class="value online">29</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">离线:</span>
                  <span class="value offline">1</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">告警:</span>
                  <span class="value warning">1</span>
                </div>
                <el-progress 
                  :percentage="97" 
                  :stroke-width="10" 
                  status="success" 
                  :format="() => '97% 在线'"
                />
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card shadow="never" class="device-category-card">
              <template #header>
                <div class="device-category-header">
                  <el-icon><Iphone /></el-icon>
                  <span>教学终端/智慧黑板</span>
                </div>
              </template>
              <div class="device-category-content">
                <div class="device-stat-row">
                  <span class="label">总数:</span>
                  <span class="value">60</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">在线:</span>
                  <span class="value online">58</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">离线:</span>
                  <span class="value offline">2</span>
                </div>
                <div class="device-stat-row">
                  <span class="label">告警:</span>
                  <span class="value warning">0</span>
                </div>
                <el-progress 
                  :percentage="97" 
                  :stroke-width="10" 
                  status="success" 
                  :format="() => '97% 在线'"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
<!--      </el-card>-->
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import * as echarts from 'echarts'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { 
    Operation, 
    TrendCharts, 
    Warning, 
    WarningFilled,
    Refresh,
    RefreshRight,
    View,
    Setting,
    Document,
    Tools,
    VideoPlay,
    CircleClose,
    Reading,
    Cpu,
    Monitor,
    Iphone
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  
  // 统计卡片数据
  const statCards = [
    {
      title: '学生管理',
      icon: 'Tickets',
      value: '6',
      label: '系统总数',
      tagText: '运行中',
      tagType: 'success',
      type: 'primary'
    },
    {
      title: '教师管理',
      icon: 'HomeFilled',
      value: '4',
      label: '资源总数',
      tagText: '正常',
      tagType: 'primary',
      type: 'success'
    },
    {
      title: '课程资源',
      icon: 'Crop',
      value: '9TB',
      label: '已用/20TB',
      tagText: '使用中',
      tagType: 'warning',
      type: 'warning'
    },
    {
      title: '教学管理',
      icon: 'FirstAidKit',
      value: '65%',
      label: 'CPU使用率',
      tagText: '实时',
      tagType: 'info',
      type: 'danger'
    }
  ]
  
  // 时间范围选择
  const timeRange = ref('day')
  
  // 系统列表数据
  const systemList = ref([
    { id: 1, systemName: '学生管理系统', owner: '王晓强', status: '运行中', updateTime: '2025-06-01 09:00', usage: 78, type: 'public' },
    { id: 2, systemName: '教师管理系统', owner: '李文娜', status: '运行中', updateTime: '2025-06-01 08:30', usage: 65, type: 'village' },
    { id: 3, systemName: '课程资源平台', owner: '刘志洋', status: '运行中', updateTime: '2025-06-22 17:00', usage: 42, type: 'agriculture' },
    { id: 4, systemName: '教学管理系统', owner: '张丽敏', status: '运行中', updateTime: '2025-06-22 16:00', usage: 30, type: 'emergency' }
  ])
  
  // 告警列表
  const alarmList = ref([
    { type: 'warning', time: '2025-06-01 10:30', content: '存储空间使用率超过70%' },
    { type: 'info', time: '2025-06-01 09:15', content: '系统例行维护完成' },
    { type: 'success', time: '2025-06-01 08:00', content: '数据备份任务完成' }
  ])

  // 加载状态
  const tableLoading = ref(false)
  
  // 刷新方法
  const refreshSystemStatus = () => {
    tableLoading.value = true
    
    // 模拟API请求
    setTimeout(() => {
      // 这里可以增加一些随机状态变化来模拟真实环境
      const statusList = ['运行中', '维护中', '告警', '离线']
      const randomStatus = () => statusList[Math.floor(Math.random() * statusList.length)]
      
      // 随机更新一些系统状态
      systemList.value = systemList.value.map(system => ({
        ...system,
        status: Math.random() > 0.7 ? randomStatus() : system.status,
        usage: Math.min(100, system.usage + Math.floor(Math.random() * 10) - 5),
        updateTime: formatTime(new Date())
      }))
      
      tableLoading.value = false
      ElMessage.success('系统状态已刷新')
    }, 1000)
  }
  
  // 刷新告警方法
  const refreshAlarms = () => {
    // 模拟刷新告警数据
    ElMessage({
      message: '正在加载最新告警信息...',
      duration: 0,
      type: 'info'
    })
    
    setTimeout(() => {
      // 随机生成一些新告警
      const newAlertTypes = ['success', 'warning', 'info', 'error']
      const newAlertContents = [
        '系统内存使用率达到临界值',
        '备份任务完成',
        '网络连接异常',
        'CPU使用率过高',
        '存储空间不足',
        '安全漏洞检测完成'
      ]
      
      // 添加1-3个新告警
      const newAlertsCount = Math.floor(Math.random() * 3) + 1
      const now = new Date()
      
      for (let i = 0; i < newAlertsCount; i++) {
        const type = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)]
        const content = newAlertContents[Math.floor(Math.random() * newAlertContents.length)]
        const time = formatTime(new Date(now.getTime() - i * 60000)) // 每条告警间隔1分钟
        
        alarmList.value.unshift({
          type,
          time,
          content
        })
      }
      
      // 保持告警列表不超过10条
      if (alarmList.value.length > 10) {
        alarmList.value = alarmList.value.slice(0, 10)
      }
      
      // 关闭loading消息
      setTimeout(() => {
        ElMessage.closeAll()
        ElMessage.success('告警信息已更新')
      }, 500)
    }, 1200)
  }

  // 生成报表
  const generateReport = () => {
    ElMessage.info('正在生成系统状态报表...')
    setTimeout(() => {
      ElMessage.success('系统状态报表已生成')
      // 这里可以添加下载或查看报表的逻辑
    }, 1500)
  }
  
  // 查看系统详情
  const viewSystemDetail = (row: any) => {
    ElMessageBox.alert(
      `<div class="system-detail-popup">
        <h3>${row.systemName}</h3>
        <p><strong>ID:</strong> ${row.id}</p>
        <p><strong>负责人:</strong> ${row.owner}</p>
        <p><strong>状态:</strong> ${row.status}</p>
        <p><strong>更新时间:</strong> ${row.updateTime}</p>
        <p><strong>使用率:</strong> ${row.usage}%</p>
        <p><strong>类型:</strong> ${row.type}</p>
      </div>`,
      '系统详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
      }
    )
  }
  
  // 配置系统
  const configSystem = (row: any) => {
    ElMessage.info(`正在打开${row.systemName}的配置页面...`)
    setTimeout(() => {
      ElMessage.success(`已打开${row.systemName}的配置页面`)
    }, 1000)
  }
  
  // 重启系统
  const restartSystem = (row: any) => {
    ElMessageBox.confirm(
      `确定要重启 ${row.systemName} 吗？重启过程中系统将暂时不可用。`,
      '重启确认',
      {
        confirmButtonText: '确定重启',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        ElMessage({
          type: 'info',
          message: `${row.systemName} 正在重启中，请稍候...`
        })
        
        // 模拟重启过程
        setTimeout(() => {
          // 更新系统状态
          const index = systemList.value.findIndex(s => s.id === row.id)
          if (index !== -1) {
            systemList.value[index].status = '维护中'
          }
          
          // 再次模拟重启完成
          setTimeout(() => {
            if (index !== -1) {
              systemList.value[index].status = '运行中'
              systemList.value[index].usage = Math.floor(30 + Math.random() * 20)
              systemList.value[index].updateTime = formatTime(new Date())
            }
            ElMessage.success(`${row.systemName} 已成功重启`)
          }, 3000)
        }, 2000)
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消重启操作'
        })
      })
  }
  
  const trendChartRef = ref<HTMLElement | null>(null)
  let trendChart: echarts.ECharts | null = null
  
  const getTrendData = () => {
    // 根据 timeRange 返回不同的模拟数据
    if (timeRange.value === 'day') {
      return {
        x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        cpu: [65, 60, 62, 66, 68, 72, 69, 70, 68, 67, 66, 65, 64, 63, 62, 61, 60, 62, 64, 66, 68, 70, 72, 74],
        mem: [78, 75, 76, 77, 79, 81, 78, 77, 76, 75, 74, 73, 72, 71, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88],
        storage: [45, 44, 44, 45, 45, 46, 46, 47, 47, 48, 48, 49, 49, 50, 50, 51, 51, 52, 52, 53, 53, 54, 54, 55]
      }
    } else if (timeRange.value === 'week') {
      return {
        x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        cpu: [65, 60, 70, 66, 68, 72, 69],
        mem: [78, 75, 80, 77, 79, 81, 78],
        storage: [45, 44, 46, 45, 47, 48, 45]
      }
    } else {
      return {
        x: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
        cpu: Array.from({ length: 30 }, () => Math.floor(60 + Math.random() * 15)),
        mem: Array.from({ length: 30 }, () => Math.floor(70 + Math.random() * 20)),
        storage: Array.from({ length: 30 }, () => Math.floor(40 + Math.random() * 15))
      }
    }
  }
  
  const renderTrendChart = () => {
    nextTick(() => {
      if (!trendChartRef.value) return
      if (trendChart) {
        trendChart.dispose()
      }
      trendChart = echarts.init(trendChartRef.value)
      const data = getTrendData()
      const option = {
        tooltip: { 
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: { 
          data: ['CPU', '内存', '存储'],
          right: 10,
          top: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category', 
          data: data.x,
          boundaryGap: false
        },
        yAxis: { 
          type: 'value', 
          axisLabel: { formatter: '{value}%' } 
        },
        series: [
          { 
            name: 'CPU', 
            type: 'line', 
            data: data.cpu, 
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderWidth: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          },
          { 
            name: '内存', 
            type: 'line', 
            data: data.mem, 
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderWidth: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          },
          { 
            name: '存储', 
            type: 'line', 
            data: data.storage, 
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderWidth: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          }
        ]
      }
      trendChart.setOption(option)
    })
  }
  
  onMounted(() => {
    renderTrendChart()
    window.addEventListener('resize', () => trendChart?.resize())
  })
  onBeforeUnmount(() => {
    trendChart?.dispose()
    window.removeEventListener('resize', () => trendChart?.resize())
  })
  watch(timeRange, () => {
    renderTrendChart()
  })

  // 添加业务系统相关函数和变量
  const getStatusType = (status: string) => {
    switch (status) {
      case '运行中': return 'success'
      case '维护中': return 'info'
      case '告警': return 'warning'
      case '离线': return 'danger'
      default: return 'info'
    }
  }

  const getSystemIcon = (row: any) => {
    switch (row.type) {
      case 'public': return 'Tickets'
      case 'village': return 'HomeFilled'
      case 'agriculture': return 'Crop'
      case 'emergency': return 'FirstAidKit'
      default: return 'Document'
    }
  }

  const getSystemIconClass = (row: any) => {
    switch (row.type) {
      case 'public': return 'icon-public'
      case 'village': return 'icon-village'
      case 'agriculture': return 'icon-agriculture'
      case 'emergency': return 'icon-emergency'
      default: return ''
    }
  }

  // 格式化时间函数
  const formatTime = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 课程数据
  const courseData = ref([
    {
      id: 1,
      name: '高等数学',
      type: 'basic',
      teacher: '李教授',
      hours: 48,
      classroom: '教学楼101',
      students: 45,
      status: '进行中',
      progress: 65
    },
    {
      id: 2,
      name: '计算机网络',
      type: 'professional',
      teacher: '王教授',
      hours: 32,
      classroom: '教学楼205',
      students: 38,
      status: '进行中',
      progress: 80
    },
    {
      id: 3,
      name: '数据结构',
      type: 'professional',
      teacher: '张教授',
      hours: 40,
      classroom: '教学楼304',
      students: 42,
      status: '未开始',
      progress: 0
    },
    {
      id: 4,
      name: '大学英语',
      type: 'basic',
      teacher: '刘教授',
      hours: 32,
      classroom: '教学楼102',
      students: 50,
      status: '进行中',
      progress: 45
    }
  ])

  // 查看课程详情
  const viewCourseDetail = () => {
    console.log('查看课程详情')
  }

  // 查看所有设备
  const viewAllDevices = () => {
    console.log('查看所有设备')
  }
  
  // 云管平台相关功能
  const goToCloudManagement = () => {
    router.push('/cloud-management')
  }
  
  const viewCloudMonitoring = () => {
    router.push('/monitor')
  }
  
  const viewAlarms = () => {
    router.push('/alarms')
  }
  
  const viewLicenses = () => {
    router.push('/cloud-management')
  }
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
  }
  
  .dashboard-header {
    margin-bottom: 24px;
    background: linear-gradient(to right, #1976d2, #2196f3);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .dashboard-title {
    font-size: 24px;
    margin: 0;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .stat-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    margin-bottom: 20px;
    border-radius: 8px;
    transition: all 0.3s;
    overflow: hidden;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .stat-card.primary .stat-icon {
    color: #409EFF;
  }
  
  .stat-card.success .stat-icon {
    color: #67C23A;
  }
  
  .stat-card.warning .stat-icon {
    color: #E6A23C;
  }
  
  .stat-card.danger .stat-icon {
    color: #F56C6C;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .header-left .el-icon {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
  }
  
  .stat-icon {
    font-size: 48px;
    margin-right: 16px;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: bold;
    line-height: 1.2;
    color: #303133;
  }
  
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }
  
  .system-status {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .monitor-row {
    margin-bottom: 20px;
  }
  
  .monitor-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .chart-container {
    height: 350px;
  }
  
  .alarm-content {
    padding: 8px;
    background-color: #f8f8f8;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-timeline-item__node) {
    box-shadow: 0 0 0 2px #fff;
  }
  
  :deep(.el-table th) {
    background-color: #f5f7fa !important;
  }
  
  .system-summary {
    margin-bottom: 20px;
  }
  
  .summary-card {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    transition: all 0.3s;
  }
  
  .summary-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .summary-card.running {
    background-color: rgba(103, 194, 58, 0.1);
    border: 1px solid rgba(103, 194, 58, 0.2);
  }
  
  .summary-card.maintenance {
    background-color: rgba(144, 147, 153, 0.1);
    border: 1px solid rgba(144, 147, 153, 0.2);
  }
  
  .summary-card.warning {
    background-color: rgba(230, 162, 60, 0.1);
    border: 1px solid rgba(230, 162, 60, 0.2);
  }
  
  .summary-card.offline {
    background-color: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.2);
  }
  
  .summary-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border-radius: 50%;
    margin-right: 15px;
  }
  
  .summary-card.running .summary-icon {
    background-color: #67C23A;
    color: white;
  }
  
  .summary-card.maintenance .summary-icon {
    background-color: #909399;
    color: white;
  }
  
  .summary-card.warning .summary-icon {
    background-color: #E6A23C;
    color: white;
  }
  
  .summary-card.offline .summary-icon {
    background-color: #F56C6C;
    color: white;
  }
  
  .summary-info {
    flex: 1;
  }
  
  .summary-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 5px;
  }
  
  .summary-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
  }
  
  .system-name {
    display: flex;
    align-items: center;
  }
  
  .system-icon {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .icon-public {
    color: #409EFF;
  }
  
  .icon-village {
    color: #67C23A;
  }
  
  .icon-agriculture {
    color: #E6A23C;
  }
  
  .icon-emergency {
    color: #F56C6C;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .sync-time {
    font-size: 13px;
    color: #909399;
  }
  
  .ml-10 {
    margin-left: 10px;
  }
  
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 10px;
    }
    
    .dashboard-header {
      padding: 15px;
    }
    
    .stat-icon {
      font-size: 36px;
      margin-right: 12px;
    }
    
    .stat-number {
      font-size: 22px;
    }
    
    .chart-container {
      height: 280px;
    }
  }

  /* 网格化管理样式 */
  .grid-management {
    margin-bottom: 20px;
  }

  .grid-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 16px;
    margin-bottom: 20px;
    border-top: 3px solid #409EFF;
    height: 100%;
    transition: all 0.3s;
  }

  .grid-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .grid-card.grid-type-1 {
    border-top-color: #409EFF;
  }

  .grid-card.grid-type-2 {
    border-top-color: #67C23A;
  }

  .grid-card.grid-type-3 {
    border-top-color: #E6A23C;
  }

  .grid-card.grid-type-4 {
    border-top-color: #F56C6C;
  }

  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #EBEEF5;
    margin-bottom: 12px;
  }

  .grid-name {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  .grid-content {
    margin-bottom: 15px;
  }

  .grid-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .grid-row .label {
    color: #909399;
  }

  .grid-row .value {
    color: #606266;
    font-weight: 500;
  }

  /* 重点项目进展样式 */
  .projects-progress {
    margin-bottom: 20px;
  }

  .update-time {
    margin-right: 10px;
    color: #909399;
    font-size: 13px;
  }

  /* 云管平台样式 */
  .csight-overview {
    margin-bottom: 20px;
  }

  .csight-stats {
    margin-bottom: 20px;
  }

  .csight-stat-card {
    padding: 15px;
    border-radius: 8px;
    background-color: #f5f7fa;
    height: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
  }

  .csight-stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-header {
    font-size: 16px;
    font-weight: bold;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 15px;
  }

  .stat-body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-num {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #303133;
  }

  .stat-text {
    font-size: 14px;
    color: #909399;
    margin-bottom: 15px;
  }

  .stat-footer {
    margin-top: 10px;
    font-size: 14px;
    color: #67c23a;
  }

  .warning-text {
    color: #e6a23c;
  }

  .platform-summary {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
  }

  .platform-summary h3 {
    margin-bottom: 15px;
    font-size: 16px;
    color: #303133;
  }

  .platform-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }
  </style>
