<template>
  <div class="meeting-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">办公自动化-会议管理</h2>
      <div class="page-actions">
        <el-button type="primary" @click="showAddDialog = true" class="text-button">
          <el-icon><Plus /></el-icon>新增会议
        </el-button>
        <el-button type="success" @click="batchPublish" class="text-button">
          <el-icon><Check /></el-icon>批量发布
        </el-button>
        <el-button type="info" @click="exportData" class="text-button">
          <el-icon><Download /></el-icon>导出数据
        </el-button>
        <el-button type="warning" @click="printData" class="text-button">
          <el-icon><Printer /></el-icon>打印
        </el-button>
        <el-button @click="refreshData" class="text-button">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :class="item.type"><component :is="item.icon" /></el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="会议标题">
          <el-input v-model="searchForm.title" placeholder="请输入会议标题" clearable />
        </el-form-item>
        <el-form-item label="会议类型">
          <el-select v-model="searchForm.type" placeholder="请选择会议类型" clearable>
            <el-option label="教学工作" value="教学工作" />
            <el-option label="安全管理" value="安全管理" />
            <el-option label="学生管理" value="学生管理" />
            <el-option label="财务管理" value="财务管理" />
            <el-option label="实验室建设" value="实验室建设" />
            <el-option label="招生工作" value="招生工作" />
            <el-option label="教师培训" value="教师培训" />
            <el-option label="资源建设" value="资源建设" />
            <el-option label="后勤服务" value="后勤服务" />
            <el-option label="科研工作" value="科研工作" />
            <el-option label="国际交流" value="国际交流" />
            <el-option label="团学工作" value="团学工作" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议状态">
          <el-select v-model="searchForm.status" placeholder="请选择会议状态" clearable>
            <el-option label="待开始" value="待开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 会议列表 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>会议列表</span>
          <el-tag type="info">共 {{ total }} 条记录</el-tag>
        </div>
      </template>
      
      <el-table :data="meetingList" border stripe>
        <el-table-column prop="id" label="会议编号" width="100" />
        <el-table-column prop="title" label="会议标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="type" label="会议类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="organizer" label="组织部门" width="150" />
        <el-table-column prop="location" label="会议地点" width="150" />
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="endTime" label="结束时间" width="150" />
        <el-table-column prop="participants" label="参会人员" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="会议状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="参会情况" width="120">
          <template #default="{ row }">
            <span>{{ row.attendees }}/{{ row.total }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" class="text-button" @click="viewDetail(row)">查看</el-button>
            <el-button v-if="row.status === '待开始'" type="success" class="text-button" @click="checkIn(row)">签到</el-button>
            <el-button type="warning" class="text-button" @click="editMeeting(row)">编辑</el-button>
            <el-button type="danger" class="text-button" @click="deleteMeeting(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建会议对话框 -->
    <el-dialog v-model="showAddDialog" title="新建会议" width="700px">
      <el-form :model="meetingForm" :rules="meetingRules" ref="meetingFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会议主题" prop="title">
              <el-input v-model="meetingForm.title" placeholder="请输入会议主题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议类型" prop="type">
              <el-select v-model="meetingForm.type" placeholder="请选择会议类型">
                <el-option label="部门会议" value="部门会议" />
                <el-option label="全体会议" value="全体会议" />
                <el-option label="专题会议" value="专题会议" />
                <el-option label="培训会议" value="培训会议" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组织者" prop="organizer">
              <el-input v-model="meetingForm.organizer" placeholder="请输入组织者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议地点" prop="location">
              <el-input v-model="meetingForm.location" placeholder="请输入会议地点" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="meetingForm.startTime"
                type="datetime"
                placeholder="请选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="meetingForm.endTime"
                type="datetime"
                placeholder="请选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="会议议程" prop="agenda">
          <el-input
            v-model="meetingForm.agenda"
            type="textarea"
            :rows="4"
            placeholder="请输入会议议程"
          />
        </el-form-item>
        <el-form-item label="参会人员" prop="participants">
          <el-select
            v-model="meetingForm.participants"
            multiple
            filterable
            placeholder="请选择参会人员"
            style="width: 100%"
          >
            <el-option label="张主任" value="张主任" />
            <el-option label="李院长" value="李院长" />
            <el-option label="王处长" value="王处长" />
            <el-option label="陈老师" value="陈老师" />
            <el-option label="刘老师" value="刘老师" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="meetingForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitMeeting">提交</el-button>
      </template>
    </el-dialog>

    <!-- 参会人员对话框 -->
    <el-dialog v-model="showParticipantsDialog" title="参会人员" width="500px">
      <el-table :data="participantsList" border>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已确认' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
      <template #footer>
        <el-button @click="showParticipantsDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 会议详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="会议详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="会议编号">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="会议标题">{{ currentDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="会议类型">
          <el-tag :type="getTypeTagType(currentDetail.type)">{{ currentDetail.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="组织部门">{{ currentDetail.organizer }}</el-descriptions-item>
        <el-descriptions-item label="会议地点">{{ currentDetail.location }}</el-descriptions-item>
        <el-descriptions-item label="会议状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">{{ currentDetail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentDetail.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentDetail.endTime }}</el-descriptions-item>
        <el-descriptions-item label="参会人员">{{ currentDetail.participants }}</el-descriptions-item>
        <el-descriptions-item label="参会情况">{{ currentDetail.attendees }}/{{ currentDetail.total }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="meeting-agenda" v-if="currentDetail.id">
        <h3>会议议程</h3>
        <el-card shadow="never" class="agenda-card">
          <p>{{ currentDetail.agenda || '暂无会议议程' }}</p>
        </el-card>
      </div>
      
      <div class="meeting-participants" v-if="currentDetail.id">
        <h3>参会人员</h3>
        <el-button type="primary" size="small" @click="viewParticipants(currentDetail)">查看参会人员详情</el-button>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="currentDetail.status === '待开始'" type="success" @click="startMeeting(currentDetail)">开始会议</el-button>
        <el-button v-if="currentDetail.status === '进行中'" type="warning" @click="endMeeting(currentDetail)">结束会议</el-button>
      </template>
    </el-dialog>

    <!-- 编辑会议对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑会议" width="700px">
      <el-form :model="editForm" :rules="meetingRules" ref="editFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会议主题" prop="title">
              <el-input v-model="editForm.title" placeholder="请输入会议主题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议类型" prop="type">
              <el-select v-model="editForm.type" placeholder="请选择会议类型">
                <el-option label="部门会议" value="部门会议" />
                <el-option label="全体会议" value="全体会议" />
                <el-option label="专题会议" value="专题会议" />
                <el-option label="培训会议" value="培训会议" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组织者" prop="organizer">
              <el-input v-model="editForm.organizer" placeholder="请输入组织者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议地点" prop="location">
              <el-input v-model="editForm.location" placeholder="请输入会议地点" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="editForm.startTime"
                type="datetime"
                placeholder="请选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="editForm.endTime"
                type="datetime"
                placeholder="请选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="会议议程" prop="agenda">
          <el-input
            v-model="editForm.agenda"
            type="textarea"
            :rows="4"
            placeholder="请输入会议议程"
          />
        </el-form-item>
        <el-form-item label="参会人员" prop="participants">
          <el-select
            v-model="editForm.participants"
            multiple
            filterable
            placeholder="请选择参会人员"
            style="width: 100%"
          >
            <el-option label="张主任" value="张主任" />
            <el-option label="李院长" value="李院长" />
            <el-option label="王处长" value="王处长" />
            <el-option label="陈老师" value="陈老师" />
            <el-option label="刘老师" value="刘老师" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Check, Download, Printer } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 统计卡片数据
const statCards = ref([
  { label: '总会议数', value: 89, icon: 'Calendar', type: 'primary' },
  { label: '待开始', value: 15, icon: 'Timer', type: 'warning' },
  { label: '进行中', value: 3, icon: 'Clock', type: 'success' },
  { label: '已结束', value: 71, icon: 'Check', type: 'info' }
])

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框控制
const showAddDialog = ref(false)
const showParticipantsDialog = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)

// 表单引用
const meetingFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 会议表单
const meetingForm = reactive({
  title: '',
  type: '',
  organizer: '',
  location: '',
  startTime: '',
  endTime: '',
  agenda: '',
  participants: [],
  remark: ''
})

// 当前详情数据
const currentDetail = ref<any>({})

// 编辑表单
const editForm = reactive({
  id: '',
  title: '',
  type: '',
  organizer: '',
  location: '',
  startTime: '',
  endTime: '',
  agenda: '',
  participants: [] as string[],
  remark: ''
})

// 表单验证规则
const meetingRules = {
  title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  organizer: [{ required: true, message: '请输入组织者', trigger: 'blur' }],
  location: [{ required: true, message: '请输入会议地点', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  agenda: [{ required: true, message: '请输入会议议程', trigger: 'blur' }],
  participants: [{ required: true, message: '请选择参会人员', trigger: 'change' }]
}

// 模拟数据
const meetingList = ref([
  {
    id: 'MT001',
    title: '2025年春季学期教学工作部署会议',
    type: '教学工作',
    organizer: '教务处',
    location: '行政楼会议室A',
    startTime: '2025-06-20 09:00',
    endTime: '2025-06-20 11:00',
    participants: '各院系主任、教学秘书',
    status: '已结束',
    attendees: 25,
    total: 30,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT002',
    title: '校园安全管理工作会议',
    type: '安全管理',
    organizer: '保卫处',
    location: '保卫处会议室',
    startTime: '2025-06-22 14:30',
    endTime: '2025-06-22 16:00',
    participants: '各部门安全负责人',
    status: '进行中',
    attendees: 18,
    total: 20,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT003',
    title: '学生管理工作研讨会',
    type: '学生管理',
    organizer: '学生处',
    location: '学生活动中心',
    startTime: '2025-06-25 10:00',
    endTime: '2025-06-25 12:00',
    participants: '辅导员、班主任',
    status: '待开始',
    attendees: 0,
    total: 45,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT004',
    title: '财务预算编制会议',
    type: '财务管理',
    organizer: '财务处',
    location: '财务处会议室',
    startTime: '2025-06-18 15:00',
    endTime: '2025-06-18 17:30',
    participants: '各部门负责人',
    status: '已结束',
    attendees: 22,
    total: 25,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT005',
    title: '实验室建设规划会议',
    type: '实验室建设',
    organizer: '实验实训中心',
    location: '实验楼会议室',
    startTime: '2025-06-27 09:30',
    endTime: '2025-06-27 11:30',
    participants: '相关专业教师',
    status: '待开始',
    attendees: 0,
    total: 15,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT006',
    title: '招生工作协调会',
    type: '招生工作',
    organizer: '招生办',
    location: '招生办会议室',
    startTime: '2025-06-24 14:00',
    endTime: '2025-06-24 16:00',
    participants: '招生办全体人员',
    status: '已结束',
    attendees: 12,
    total: 12,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT007',
    title: '教师培训计划讨论会',
    type: '教师培训',
    organizer: '人事处',
    location: '人事处会议室',
    startTime: '2025-06-29 10:00',
    endTime: '2025-06-29 12:00',
    participants: '各院系教学副院长',
    status: '待开始',
    attendees: 0,
    total: 8,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT008',
    title: '图书馆资源建设会议',
    type: '资源建设',
    organizer: '图书馆',
    location: '图书馆会议室',
    startTime: '2025-06-21 15:30',
    endTime: '2025-06-21 17:00',
    participants: '图书馆工作人员',
    status: '已结束',
    attendees: 8,
    total: 8,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT009',
    title: '后勤服务改进会议',
    type: '后勤服务',
    organizer: '后勤处',
    location: '后勤处会议室',
    startTime: '2025-06-26 14:00',
    endTime: '2025-06-26 16:00',
    participants: '后勤各部门负责人',
    status: '待开始',
    attendees: 0,
    total: 10,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT010',
    title: '科研项目申报指导会',
    type: '科研工作',
    organizer: '科研处',
    location: '科研处会议室',
    startTime: '2025-06-23 09:00',
    endTime: '2025-06-23 11:00',
    participants: '科研骨干教师',
    status: '已结束',
    attendees: 35,
    total: 40,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT011',
    title: '国际交流合作洽谈会',
    type: '国际交流',
    organizer: '国际交流处',
    location: '国际交流中心',
    startTime: '2025-06-30 14:00',
    endTime: '2025-06-30 16:30',
    participants: '相关院系负责人',
    status: '待开始',
    attendees: 0,
    total: 12,
    agenda: '',
    remark: ''
  },
  {
    id: 'MT012',
    title: '团委工作部署会议',
    type: '团学工作',
    organizer: '团委',
    location: '团委会议室',
    startTime: '2025-06-28 10:30',
    endTime: '2025-06-28 12:00',
    participants: '各院系团总支书记',
    status: '待开始',
    attendees: 0,
    total: 15,
    agenda: '',
    remark: ''
  }
])

// 参会人员列表
const participantsList = ref([
  { name: '张主任', department: '教务处', status: '已确认', remark: '' },
  { name: '李院长', department: '信息技术部', status: '已确认', remark: '' },
  { name: '王处长', department: '学生处', status: '待确认', remark: '时间冲突' }
])

// 获取会议类型标签样式
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '教学工作': 'primary',
    '安全管理': 'danger',
    '学生管理': 'warning',
    '财务管理': 'success',
    '实验室建设': 'info',
    '招生工作': 'primary',
    '教师培训': 'warning',
    '资源建设': 'success',
    '后勤服务': 'info',
    '科研工作': 'primary',
    '国际交流': 'success',
    '团学工作': 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取状态标签样式
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    '待开始': 'warning',
    '进行中': 'success',
    '已结束': 'info',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

// 搜索
const handleSearch = () => {
  ElMessage.info('执行搜索操作')
  // 这里可以调用API进行搜索
}

// 重置搜索
const resetSearch = () => {
  searchForm.title = ''
  searchForm.type = ''
  searchForm.status = ''
  handleSearch()
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
  // 这里可以重新获取数据
}

// 查看详情
const viewDetail = (row: any) => {
  currentDetail.value = { ...row }
  // 为了演示，添加议程数据
  if (!currentDetail.value.agenda) {
    currentDetail.value.agenda = `1. 会议开场和介绍 (10分钟)\n2. 主题讨论 (40分钟)\n3. 问题解答 (20分钟)\n4. 总结和下一步计划 (10分钟)`
  }
  showDetailDialog.value = true
}

// 开始会议
const startMeeting = (row: any) => {
  ElMessageBox.confirm(`确认开始会议"${row.title}"？`, '开始会议', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('会议已开始')
    // 这里可以更新会议状态
  }).catch(() => {})
}

// 结束会议
const endMeeting = (row: any) => {
  ElMessageBox.confirm(`确认结束会议"${row.title}"？`, '结束会议', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('会议已结束')
    // 这里可以更新会议状态
  }).catch(() => {})
}

// 查看参会人员
const viewParticipants = (row: any) => {
  showParticipantsDialog.value = true
}

// 提交会议
const submitMeeting = async () => {
  if (!meetingFormRef.value) return
  
  try {
    await meetingFormRef.value.validate()
    ElMessage.success('会议创建成功')
    showAddDialog.value = false
    // 重置表单
    Object.assign(meetingForm, {
      title: '',
      type: '',
      organizer: '',
      location: '',
      startTime: '',
      endTime: '',
      agenda: '',
      participants: [],
      remark: ''
    })
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新获取数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新获取数据
}

// 签到
const checkIn = (row: any) => {
  ElMessage.success(`签到成功：${row.title}`)
  // 这里可以实现签到功能
}

// 编辑
const editMeeting = (row: any) => {
  editForm.id = row.id
  editForm.title = row.title
  editForm.type = row.type
  editForm.organizer = row.organizer
  editForm.location = row.location
  editForm.startTime = row.startTime
  editForm.endTime = row.endTime
  editForm.agenda = row.agenda || ''
  editForm.participants = row.participants ? row.participants.split('、') : []
  editForm.remark = row.remark || ''
  
  showEditDialog.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    // 找到并更新数据
    const index = meetingList.value.findIndex(item => item.id === editForm.id)
    if (index > -1) {
      // 更新数据
      meetingList.value[index] = {
        ...meetingList.value[index],
        title: editForm.title,
        type: editForm.type,
        organizer: editForm.organizer,
        location: editForm.location,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        agenda: editForm.agenda,
        participants: editForm.participants.join('、')
      }
      
      ElMessage.success('会议更新成功')
      showEditDialog.value = false
    }
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

// 删除
const deleteMeeting = (row: any) => {
  ElMessageBox.confirm(`确认删除会议"${row.title}"？`, '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = meetingList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      meetingList.value.splice(index, 1)
      total.value = meetingList.value.length
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 批量发布
const batchPublish = () => {
  const selectedRows = meetingList.value.filter(item => item.status === '待开始')
  if (selectedRows.length === 0) {
    ElMessage.warning('没有待开始的会议')
    return
  }
  ElMessageBox.confirm(`确认批量发布 ${selectedRows.length} 个会议通知？`, '批量发布', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量发布成功')
  }).catch(() => {})
}

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出成功')
  // 这里可以实现导出功能
}

// 打印
const printData = () => {
  ElMessage.info('准备打印数据')
  // 这里可以实现打印功能
}

onMounted(() => {
  total.value = meetingList.value.length
})
</script>

<style scoped>
.meeting-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
  padding: 12px;
  border-radius: 8px;
}

.stat-icon.primary {
  background-color: #ecf5ff;
  color: #409eff;
}

.stat-icon.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.success {
  background-color: #f0f9ff;
  color: #67c23a;
}

.stat-icon.danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-card) {
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-button--link) {
  background: transparent !important;
  color: var(--el-color-primary) !important;
  border: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
  padding: 4px 8px !important;
  height: auto !important;
}

:deep(.el-button--link.el-button--primary) {
  color: var(--el-color-primary) !important;
  background: transparent !important;
}

:deep(.el-button--link.el-button--danger) {
  color: var(--el-color-danger) !important;
  background: transparent !important;
}

:deep(.el-button--link.el-button--success) {
  color: var(--el-color-success) !important;
  background: transparent !important;
}

:deep(.el-button--link.el-button--warning) {
  color: var(--el-color-warning) !important;
  background: transparent !important;
}

.meeting-agenda, .meeting-participants {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.agenda-card {
  margin-top: 10px;
  white-space: pre-line;
}
</style> 