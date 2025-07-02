<template>
  <div class="alarms-container">
    <h1>告警中心</h1>
    
    <el-card class="alarm-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Bell /></el-icon>
            <span>告警管理</span>
          </div>
          <div class="header-right">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索告警信息..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="refreshAlarms">刷新</el-button>
            <el-button type="danger" @click="batchClear">批量清除</el-button>
          </div>
        </div>
      </template>
      
      <!-- 过滤器 -->
      <div class="filter-container">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="levelFilter" placeholder="告警级别" clearable style="width: 100%">
              <el-option label="全部级别" value="" />
              <el-option label="严重" value="严重" />
              <el-option label="警告" value="警告" />
              <el-option label="提示" value="提示" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="sourceFilter" placeholder="告警来源" clearable style="width: 100%">
              <el-option label="全部来源" value="" />
              <el-option label="服务器监控" value="服务器监控" />
              <el-option label="网络监控" value="网络监控" />
              <el-option label="存储监控" value="存储监控" />
              <el-option label="应用监控" value="应用监控" />
              <el-option label="系统通知" value="系统通知" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="8" :md="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
            <div class="filter-actions">
              <el-button type="primary" @click="applyFilters">应用筛选</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 告警表格 -->
      <el-table
        :data="pagedAlarms"
        style="width: 100%; margin-top: 20px"
        border
        stripe
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmType(row.level)" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="告警内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="time" label="时间" width="180" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已处理' ? 'success' : 'info'" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
              <el-button 
                :type="row.status === '已处理' ? 'warning' : 'success'" 
                size="small" 
                @click="toggleStatus(row)"
              >
                {{ row.status === '已处理' ? '取消处理' : '标记处理' }}
              </el-button>
              <el-button type="danger" size="small" @click="clearAlarm(row)">清除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredAlarms.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 告警详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="告警详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="告警ID" :span="2">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="告警级别">
          <el-tag :type="getAlarmType(detailData.level)" effect="dark">{{ detailData.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="告警状态">
          <el-tag :type="detailData.status === '已处理' ? 'success' : 'info'" effect="plain">{{ detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="告警来源">{{ detailData.source }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ detailData.time }}</el-descriptions-item>
        <el-descriptions-item label="告警内容" :span="2">{{ detailData.content }}</el-descriptions-item>
        <el-descriptions-item label="详细信息" :span="2">{{ detailData.detail || '无详细信息' }}</el-descriptions-item>
        <el-descriptions-item label="建议处理方法" :span="2">{{ detailData.suggestion || '无处理建议' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detailData.status === '已处理'" class="process-info">
        <h4>处理记录</h4>
        <p><strong>处理人：</strong>{{ detailData.processor || '系统自动' }}</p>
        <p><strong>处理时间：</strong>{{ detailData.processTime || '-' }}</p>
        <p><strong>处理备注：</strong>{{ detailData.processNote || '无备注' }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            :type="detailData.status === '已处理' ? 'warning' : 'success'" 
            @click="processAlarm"
          >
            {{ detailData.status === '已处理' ? '取消处理' : '标记处理' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 标记处理弹窗 -->
    <el-dialog v-model="processDialogVisible" title="标记处理" width="400px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理人">
          <el-input v-model="processForm.processor" placeholder="请输入处理人姓名" />
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="processForm.note" type="textarea" :rows="3" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcess">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Search } from '@element-plus/icons-vue'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const levelFilter = ref('')
const sourceFilter = ref('')
const dateRange = ref([])
const selectedAlarms = ref([])

// 告警数据
const alarmList = ref([
  { id: 1, level: '严重', content: '教学资源存储空间使用率达到88%，请及时清理', source: '存储监控', time: '2023-06-10 14:25:30', status: '未处理', detail: '存储设备"教学资源存储"剩余空间不足3TB，可能影响系统正常运行。', suggestion: '清理临时文件和过期数据，或者扩容存储设备。' },
  { id: 2, level: '警告', content: '教学楼交换机A带宽使用率超过85%，可能影响网络访问速度', source: '网络监控', time: '2023-06-10 13:45:12', status: '未处理', detail: '教学楼交换机A上行链路带宽使用率持续15分钟超过85%，下行链路正常。', suggestion: '检查是否有大量数据上传任务，必要时增加带宽或分流业务。' },
  { id: 3, level: '警告', content: '资源管理系统响应时间超过2秒，建议检查系统负载', source: '应用监控', time: '2023-06-10 13:20:05', status: '已处理', detail: '资源管理系统平均响应时间为2.5秒，超过警告阈值2秒。', suggestion: '检查系统负载情况，必要时进行资源扩容或优化SQL查询。', processor: '张工', processTime: '2023-06-10 14:30:15', processNote: '已重启应用服务，恢复正常' },
  { id: 4, level: '提示', content: '服务器计划性维护将于今晚23:00进行，预计持续2小时', source: '系统通知', time: '2023-06-10 12:10:56', status: '未处理', detail: '计划对主要服务器进行系统更新和安全补丁安装，预计维护时间为23:00-01:00。', suggestion: '请相关人员提前做好数据备份和应用下线准备。' },
  { id: 5, level: '严重', content: '资源管理服务器CPU使用率持续超过85%，建议立即检查', source: '服务器监控', time: '2023-06-10 11:50:23', status: '未处理', detail: '服务器"资源管理服务器"CPU使用率持续30分钟超过85%，内存使用率75%。', suggestion: '检查是否有异常进程占用资源，必要时重启服务或增加资源配置。' },
  { id: 6, level: '警告', content: '学生管理系统数据库连接池接近饱和，当前使用率92%', source: '应用监控', time: '2023-06-10 10:15:42', status: '已处理', detail: '学生管理系统数据库连接池最大连接数100，当前已使用92个连接。', suggestion: '检查是否存在连接泄漏，或增加连接池最大连接数。', processor: '李工', processTime: '2023-06-10 10:45:20', processNote: '已优化连接池配置，释放空闲连接' },
  { id: 7, level: '严重', content: '主防火墙检测到疑似DDoS攻击，已触发自动防护', source: '安全监控', time: '2023-06-10 09:30:15', status: '未处理', detail: '主防火墙检测到大量SYN请求，IP来源分散，疑似DDoS攻击。', suggestion: '检查网络流量情况，必要时联系网络服务提供商增加防护措施。' },
  { id: 8, level: '提示', content: '系统备份任务已完成，备份大小25GB', source: '备份系统', time: '2023-06-10 08:00:00', status: '已处理', detail: '每日系统备份任务正常完成，备份文件已存储至备份存储设备。', suggestion: '定期检查备份文件完整性，并进行恢复测试。', processor: '系统自动', processTime: '2023-06-10 08:00:05', processNote: '自动完成' },
  { id: 9, level: '警告', content: '存储系统RAID降级，硬盘3疑似故障', source: '存储监控', time: '2023-06-09 22:10:35', status: '未处理', detail: 'RAID5阵列中硬盘3读取错误率增加，可能即将故障。', suggestion: '尽快替换可能故障的硬盘，避免数据丢失。' },
  { id: 10, level: '警告', content: '备份存储B使用率达到73%，超过预警阈值', source: '存储监控', time: '2023-06-09 20:45:12', status: '未处理', detail: '备份存储B总容量30TB，已使用22TB，使用率73%。', suggestion: '清理过期备份数据，或规划存储扩容。' },
  { id: 11, level: '提示', content: '系统自动更新已完成，所有安全补丁已安装', source: '系统通知', time: '2023-06-09 18:30:00', status: '已处理', detail: '系统自动更新包含10个安全补丁和5个功能更新。', suggestion: '无需操作，系统已处于最新状态。', processor: '系统自动', processTime: '2023-06-09 18:30:10', processNote: '自动完成' },
  { id: 12, level: '严重', content: '数据库主从同步中断，需要手动干预', source: '数据库监控', time: '2023-06-09 16:20:45', status: '已处理', detail: '主从数据库同步延迟超过30分钟，可能存在数据不一致。', suggestion: '检查主从同步状态，修复同步问题，必要时重建从库。', processor: '王工', processTime: '2023-06-09 17:15:30', processNote: '已修复主从同步配置，恢复正常' },
  { id: 13, level: '警告', content: '无线AP-3F离线，可能影响教学楼3楼网络使用', source: '网络监控', time: '2023-06-09 15:10:22', status: '未处理', detail: '无线AP-3F已离线超过10分钟，Ping不通。', suggestion: '检查设备电源和网络连接，必要时重启或更换设备。' },
  { id: 14, level: '警告', content: '系统日志空间不足，当前剩余10%', source: '系统监控', time: '2023-06-09 14:05:18', status: '未处理', detail: '系统日志分区总容量50GB，剩余5GB，即将耗尽。', suggestion: '清理过期日志文件，或增加日志分区容量。' },
  { id: 15, level: '提示', content: '新版本教务管理系统已发布，可以升级', source: '系统通知', time: '2023-06-09 12:00:00', status: '未处理', detail: '教务管理系统v2.5已发布，包含新功能和bug修复。', suggestion: '在维护时间窗口进行系统升级，升级前请备份数据。' }
])

// 查询和过滤
const filteredAlarms = computed(() => {
  let result = alarmList.value
  
  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(alarm => 
      alarm.content.includes(searchQuery.value) || 
      alarm.source.includes(searchQuery.value)
    )
  }
  
  // 级别过滤
  if (levelFilter.value) {
    result = result.filter(alarm => alarm.level === levelFilter.value)
  }
  
  // 来源过滤
  if (sourceFilter.value) {
    result = result.filter(alarm => alarm.source === sourceFilter.value)
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    
    result = result.filter(alarm => {
      const alarmDate = new Date(alarm.time)
      return alarmDate >= startDate && alarmDate <= endDate
    })
  }
  
  return result
})

// 分页
const pagedAlarms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAlarms.value.slice(start, start + pageSize.value)
})

// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ id: 0, level: '', content: '', source: '', time: '', status: '', detail: '', suggestion: '', processor: '', processTime: '', processNote: '' })

// 处理弹窗
const processDialogVisible = ref(false)
const currentAlarmId = ref(0)
const processForm = reactive({
  processor: '',
  note: ''
})

// 工具函数
const getAlarmType = (level: string) => {
  switch (level) {
    case '严重': return 'danger'
    case '警告': return 'warning'
    case '提示': return 'info'
    default: return 'info'
  }
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

function handleSelectionChange(val: any[]) {
  selectedAlarms.value = val
}

function refreshAlarms() {
  ElMessage.success('告警数据已刷新')
}

function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}

function toggleStatus(row: any) {
  if (row.status === '已处理') {
    // 直接取消处理
    const idx = alarmList.value.findIndex(a => a.id === row.id)
    if (idx !== -1) {
      alarmList.value[idx].status = '未处理'
      alarmList.value[idx].processor = undefined
      alarmList.value[idx].processTime = undefined
      alarmList.value[idx].processNote = undefined
      ElMessage.success('已取消处理标记')
    }
  } else {
    // 打开处理弹窗
    currentAlarmId.value = row.id
    processForm.processor = ''
    processForm.note = ''
    processDialogVisible.value = true
  }
}

function processAlarm() {
  if (detailData.status === '已处理') {
    // 直接取消处理
    const idx = alarmList.value.findIndex(a => a.id === detailData.id)
    if (idx !== -1) {
      alarmList.value[idx].status = '未处理'
      alarmList.value[idx].processor = undefined
      alarmList.value[idx].processTime = undefined
      alarmList.value[idx].processNote = undefined
      
      // 更新详情数据
      detailData.status = '未处理'
      detailData.processor = undefined
      detailData.processTime = undefined
      detailData.processNote = undefined
      
      ElMessage.success('已取消处理标记')
    }
  } else {
    // 打开处理弹窗
    currentAlarmId.value = detailData.id
    processForm.processor = ''
    processForm.note = ''
    processDialogVisible.value = true
  }
}

function confirmProcess() {
  const now = new Date().toLocaleString()
  
  // 更新告警列表
  const idx = alarmList.value.findIndex(a => a.id === currentAlarmId.value)
  if (idx !== -1) {
    alarmList.value[idx].status = '已处理'
    alarmList.value[idx].processor = processForm.processor || '管理员'
    alarmList.value[idx].processTime = now
    alarmList.value[idx].processNote = processForm.note || '无备注'
    
    // 如果是当前详情中的告警，也更新详情数据
    if (detailData.id === currentAlarmId.value) {
      detailData.status = '已处理'
      detailData.processor = processForm.processor || '管理员'
      detailData.processTime = now
      detailData.processNote = processForm.note || '无备注'
    }
    
    ElMessage.success('告警已标记为已处理')
    processDialogVisible.value = false
  }
}

function clearAlarm(row: any) {
  ElMessageBox.confirm(`确认清除此告警记录？此操作不可撤销！`, '确认清除', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const idx = alarmList.value.findIndex(a => a.id === row.id)
      if (idx !== -1) {
        alarmList.value.splice(idx, 1)
        ElMessage.success('告警已清除')
        
        // 如果是当前详情中的告警，关闭详情弹窗
        if (detailData.id === row.id) {
          detailDialogVisible.value = false
        }
      }
    })
    .catch(() => {})
}

function batchClear() {
  if (selectedAlarms.value.length === 0) {
    ElMessage.warning('请先选择要清除的告警')
    return
  }
  
  ElMessageBox.confirm(`确认清除选中的${selectedAlarms.value.length}条告警记录？此操作不可撤销！`, '批量清除', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const idsToRemove = selectedAlarms.value.map(a => a.id)
      alarmList.value = alarmList.value.filter(a => !idsToRemove.includes(a.id))
      ElMessage.success(`已清除${idsToRemove.length}条告警`)
      
      // 如果当前详情中的告警被清除，关闭详情弹窗
      if (idsToRemove.includes(detailData.id)) {
        detailDialogVisible.value = false
      }
    })
    .catch(() => {})
}

function applyFilters() {
  currentPage.value = 1
  ElMessage.success('筛选条件已应用')
}

function resetFilters() {
  searchQuery.value = ''
  levelFilter.value = ''
  sourceFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
  ElMessage.success('筛选条件已重置')
}

// 监听筛选条件变化，自动更新页面
watch([searchQuery, levelFilter, sourceFilter, dateRange], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.alarms-container {
  padding: 20px;
}

.alarm-card {
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
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.process-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-left: 4px solid #67c23a;
  border-radius: 4px;
}

.process-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #67c23a;
}

.alarm-content {
  font-size: 14px;
  margin-bottom: 5px;
}

.alarm-source {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .filter-container .el-col {
    margin-bottom: 10px;
  }
  
  .filter-actions {
    justify-content: flex-start;
  }
}
</style> 