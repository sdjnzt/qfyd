<template>
  <div class="device-manage-container">
    <el-card shadow="hover" class="device-header-card">
      <div class="header-title">
        <el-icon><Monitor /></el-icon>
        <span>设备管理平台</span>
      </div>
      <div>
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
                    <span class="label">总数:</span>
                    <span class="value">{{ cat.total }}</span>
                  </div>
                  <div class="category-row">
                    <span class="label">在线:</span>
                    <span class="value online">{{ cat.online }}</span>
                  </div>
                  <div class="category-row">
                    <span class="label">告警:</span>
                    <span class="value warning">{{ cat.warning }}</span>
                  </div>
                  <el-progress
                    :percentage="(cat.online/cat.total)*100"
                    :status="cat.warning > 0 ? 'warning' : 'success'"
                    :format="() => `${Math.round((cat.online/cat.total)*100)}% 在线`"
                  />
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Monitor, Cpu, Iphone } from '@element-plus/icons-vue'

const activeTab = ref('overview')

const deviceStats = ref({
  total: 200,
  online: 192,
  warning: 5
})

const deviceCategories = ref([
  {
    name: '多媒体教室设备',
    total: 120,
    online: 115,
    warning: 2,
    icon: Monitor
  },
  {
    name: '机房服务器',
    total: 50,
    online: 48,
    warning: 2,
    icon: Cpu
  },
  {
    name: '教学终端/智慧黑板',
    total: 30,
    online: 29,
    warning: 1,
    icon: Iphone
  }
])

const refreshStats = () => {
  // 这里可以模拟刷新数据
}
const addDevice = () => {
  // 这里可以弹出添加设备对话框
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
.device-stats-card {
  margin-bottom: 20px;
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
</style> 