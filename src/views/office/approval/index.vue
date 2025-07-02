<template>
  <div class="approval-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">办公自动化-请假审批管理</h2>
      <div class="page-actions">
        <el-button type="primary" @click="showAddDialog = true" class="text-button">
          <el-icon><Plus /></el-icon>新增请假申请
        </el-button>
        <el-button type="success" @click="batchApprove" class="text-button">
          <el-icon><Check /></el-icon>批量审批
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
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applicant" placeholder="请输入申请人姓名" clearable />
        </el-form-item>
        <el-form-item label="请假类型">
          <el-select v-model="searchForm.type" placeholder="请选择请假类型" clearable>
            <el-option label="事假" value="事假" />
            <el-option label="病假" value="病假" />
            <el-option label="年假" value="年假" />
            <el-option label="调休" value="调休" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批状态">
          <el-select v-model="searchForm.status" placeholder="请选择审批状态" clearable>
            <el-option label="待审批" value="待审批" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已拒绝" value="已拒绝" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 请假申请列表 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>请假申请列表</span>
          <el-tag type="info">共 {{ total }} 条记录</el-tag>
        </div>
      </template>
      
      <el-table :data="approvalList" border stripe>
        <el-table-column prop="id" label="申请编号" width="100" />
        <el-table-column prop="applicant" label="申请人" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="type" label="请假类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" width="150" />
        <el-table-column prop="endDate" label="结束时间" width="150" />
        <el-table-column prop="days" label="请假天数" width="100" />
        <el-table-column prop="reason" label="请假原因" show-overflow-tooltip />
        <el-table-column prop="status" label="审批状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column prop="approvalTime" label="审批时间" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" class="text-button" @click="viewDetail(row)">查看</el-button>
            <el-button v-if="row.status === '待审批'" type="success" class="text-button" @click="approve(row)">通过</el-button>
            <el-button v-if="row.status === '待审批'" type="danger" class="text-button" @click="reject(row)">拒绝</el-button>
            <el-button type="warning" class="text-button" @click="editApproval(row)">编辑</el-button>
            <el-button type="danger" class="text-button" @click="deleteApproval(row)">删除</el-button>
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

    <!-- 新增请假申请对话框 -->
    <el-dialog v-model="showAddDialog" title="新增请假申请" width="600px">
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="100px">
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="approvalForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="approvalForm.department" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="approvalForm.type" placeholder="请选择请假类型">
            <el-option label="事假" value="事假" />
            <el-option label="病假" value="病假" />
            <el-option label="年假" value="年假" />
            <el-option label="调休" value="调休" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间" prop="dateRange">
          <el-date-picker
            v-model="approvalForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="approvalForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入请假原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">提交</el-button>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog v-model="showApprovalDialog" title="审批请假申请" width="500px">
      <el-form :model="approvalActionForm" ref="approvalActionFormRef" label-width="100px">
        <el-form-item label="审批结果" prop="action">
          <el-radio-group v-model="approvalActionForm.action">
            <el-radio value="approve">通过</el-radio>
            <el-radio value="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="approvalActionForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApprovalDialog = false">取消</el-button>
        <el-button type="primary" @click="submitApprovalAction">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="请假申请详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请编号">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentDetail.applicant }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentDetail.department }}</el-descriptions-item>
        <el-descriptions-item label="请假类型">
          <el-tag :type="getTypeTagType(currentDetail.type)">{{ currentDetail.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentDetail.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentDetail.endDate }}</el-descriptions-item>
        <el-descriptions-item label="请假天数">{{ currentDetail.days }} 天</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">{{ currentDetail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">{{ currentDetail.approver || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ currentDetail.approvalTime || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="请假原因" :span="2">{{ currentDetail.reason }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑请假申请对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑请假申请" width="600px">
      <el-form :model="editForm" :rules="approvalRules" ref="editFormRef" label-width="100px">
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="editForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="editForm.department" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择请假类型">
            <el-option label="事假" value="事假" />
            <el-option label="病假" value="病假" />
            <el-option label="年假" value="年假" />
            <el-option label="调休" value="调休" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间" prop="dateRange">
          <el-date-picker
            v-model="editForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="editForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入请假原因"
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
  { label: '待审批', value: 8, icon: 'Clock', type: 'warning' },
  { label: '已通过', value: 156, icon: 'Check', type: 'success' },
  { label: '已拒绝', value: 12, icon: 'Close', type: 'danger' },
  { label: '本月申请', value: 45, icon: 'Document', type: 'primary' }
])

// 搜索表单
const searchForm = reactive({
  applicant: '',
  type: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框控制
const showAddDialog = ref(false)
const showApprovalDialog = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)

// 当前操作的行数据
const currentRow = ref<any>(null)
const currentDetail = ref<any>({})
const editForm = reactive({
  id: '',
  applicant: '',
  department: '',
  type: '',
  dateRange: [] as string[],
  reason: '',
  status: ''
})

// 表单引用
const approvalFormRef = ref<FormInstance>()
const approvalActionFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 请假申请表单
const approvalForm = reactive({
  applicant: '',
  department: '',
  type: '',
  dateRange: [],
  reason: ''
})

// 审批操作表单
const approvalActionForm = reactive({
  action: 'approve',
  comment: ''
})

// 表单验证规则
const approvalRules = {
  applicant: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择请假时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }]
}

// 模拟数据
const approvalList = ref([
  {
    id: 'LQ001',
    applicant: '王明',
    department: '信息技术部',
    type: '事假',
    startDate: '2025-06-15',
    endDate: '2025-06-16',
    days: 2,
    reason: '家中老人生病需要照顾',
    status: '待审批',
    approver: '',
    approvalTime: ''
  },
  {
    id: 'LQ002',
    applicant: '李华',
    department: '教务处',
    type: '病假',
    startDate: '2025-06-14',
    endDate: '2025-06-14',
    days: 1,
    reason: '感冒发烧需要就医休息',
    status: '已通过',
    approver: '张主任',
    approvalTime: '2025-06-13 14:30'
  },
  {
    id: 'LQ003',
    applicant: '陈静',
    department: '学生处',
    type: '年假',
    startDate: '2025-06-20',
    endDate: '2025-06-22',
    days: 3,
    reason: '春节期间探亲访友',
    status: '已拒绝',
    approver: '刘主任',
    approvalTime: '2025-06-12 16:45'
  },
  {
    id: 'LQ004',
    applicant: '赵伟',
    department: '财务处',
    type: '调休',
    startDate: '2025-06-18',
    endDate: '2025-06-18',
    days: 1,
    reason: '上周末加班调休',
    status: '待审批',
    approver: '',
    approvalTime: ''
  },
  {
    id: 'LQ005',
    applicant: '杨丽',
    department: '图书馆',
    type: '事假',
    startDate: '2025-06-25',
    endDate: '2025-06-26',
    days: 2,
    reason: '参加亲友婚礼',
    status: '已通过',
    approver: '周馆长',
    approvalTime: '2025-06-14 09:15'
  },
  {
    id: 'LQ006',
    applicant: '张强',
    department: '后勤处',
    type: '病假',
    startDate: '2025-06-16',
    endDate: '2025-06-17',
    days: 2,
    reason: '腰椎间盘突出需要治疗',
    status: '已通过',
    approver: '刘处长',
    approvalTime: '2025-06-15 10:20'
  },
  {
    id: 'LQ007',
    applicant: '周婷',
    department: '招生办',
    type: '年假',
    startDate: '2025-02-01',
    endDate: '2025-02-05',
    days: 5,
    reason: '春节假期返乡',
    status: '待审批',
    approver: '',
    approvalTime: ''
  },
  {
    id: 'LQ008',
    applicant: '吴刚',
    department: '人事处',
    type: '事假',
    startDate: '2025-06-22',
    endDate: '2025-06-22',
    days: 1,
    reason: '办理个人住房贷款手续',
    status: '已拒绝',
    approver: '陈处长',
    approvalTime: '2025-06-21 15:30'
  },
  {
    id: 'LQ009',
    applicant: '郑小燕',
    department: '科研处',
    type: '病假',
    startDate: '2025-06-19',
    endDate: '2025-06-20',
    days: 2,
    reason: '急性胃炎需要住院治疗',
    status: '已通过',
    approver: '王主任',
    approvalTime: '2025-06-18 16:45'
  },
  {
    id: 'LQ010',
    applicant: '林志远',
    department: '国际交流处',
    type: '调休',
    startDate: '2025-06-24',
    endDate: '2025-06-24',
    days: 1,
    reason: '接待外宾加班调休',
    status: '待审批',
    approver: '',
    approvalTime: ''
  },
  {
    id: 'LQ011',
    applicant: '黄敏',
    department: '保卫处',
    type: '事假',
    startDate: '2025-06-28',
    endDate: '2025-06-29',
    days: 2,
    reason: '参加安保技能培训',
    status: '已通过',
    approver: '张处长',
    approvalTime: '2025-06-27 11:20'
  },
  {
    id: 'LQ012',
    applicant: '孙文彬',
    department: '团委',
    type: '年假',
    startDate: '2025-02-10',
    endDate: '2025-02-12',
    days: 3,
    reason: '寒假期间探亲',
    status: '待审批',
    approver: '',
    approvalTime: ''
  }
])

// 获取请假类型标签样式
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '事假': 'warning',
    '病假': 'danger',
    '年假': 'success',
    '调休': 'info'
  }
  return typeMap[type] || 'info'
}

// 获取状态标签样式
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    '待审批': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
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
  searchForm.applicant = ''
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
  showDetailDialog.value = true
}

// 审批
const approve = (row: any) => {
  approvalActionForm.action = 'approve'
  approvalActionForm.comment = ''
  showApprovalDialog.value = true
  // 保存当前操作的行数据
  currentRow.value = row
}

// 拒绝
const reject = (row: any) => {
  approvalActionForm.action = 'reject'
  approvalActionForm.comment = ''
  showApprovalDialog.value = true
  // 保存当前操作的行数据
  currentRow.value = row
}

// 编辑
const editApproval = (row: any) => {
  // 填充编辑表单
  editForm.id = row.id
  editForm.applicant = row.applicant
  editForm.department = row.department
  editForm.type = row.type
  editForm.dateRange = [row.startDate, row.endDate]
  editForm.reason = row.reason
  editForm.status = row.status
  
  showEditDialog.value = true
}

// 删除
const deleteApproval = (row: any) => {
  ElMessageBox.confirm(`确认删除请假申请"${row.id}"？`, '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = approvalList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      approvalList.value.splice(index, 1)
      total.value = approvalList.value.length
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 批量审批
const batchApprove = () => {
  const selectedRows = approvalList.value.filter(item => item.status === '待审批')
  if (selectedRows.length === 0) {
    ElMessage.warning('没有待审批的申请')
    return
  }
  ElMessageBox.confirm(`确认批量通过 ${selectedRows.length} 个申请？`, '批量审批', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.forEach(row => {
      row.status = '已通过'
      row.approver = '系统管理员'
      row.approvalTime = new Date().toLocaleString()
    })
    ElMessage.success('批量审批成功')
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

// 提交请假申请
const submitApproval = async () => {
  if (!approvalFormRef.value) return
  
  try {
    await approvalFormRef.value.validate()
    ElMessage.success('请假申请提交成功')
    showAddDialog.value = false
    // 重置表单
    Object.assign(approvalForm, {
      applicant: '',
      department: '',
      type: '',
      dateRange: [],
      reason: ''
    })
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

// 提交审批操作
const submitApprovalAction = async () => {
  if (!approvalActionFormRef.value) return
  
  try {
    await approvalActionFormRef.value.validate()
    const actionText = approvalActionForm.action === 'approve' ? '通过' : '拒绝'
    
    // 更新当前行的状态
    if (currentRow.value) {
      currentRow.value.status = approvalActionForm.action === 'approve' ? '已通过' : '已拒绝'
      currentRow.value.approver = '当前用户'
      currentRow.value.approvalTime = new Date().toLocaleString()
    }
    
    ElMessage.success(`审批操作成功：${actionText}`)
    showApprovalDialog.value = false
  } catch (error) {
    ElMessage.error('请完善审批信息')
  }
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    // 找到并更新数据
    const index = approvalList.value.findIndex(item => item.id === editForm.id)
    if (index > -1) {
      // 计算请假天数
      const startDate = new Date(editForm.dateRange[0])
      const endDate = new Date(editForm.dateRange[1])
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      // 更新数据
      approvalList.value[index] = {
        ...approvalList.value[index],
        applicant: editForm.applicant,
        department: editForm.department,
        type: editForm.type,
        startDate: editForm.dateRange[0],
        endDate: editForm.dateRange[1],
        days,
        reason: editForm.reason
      }
      
      ElMessage.success('请假申请更新成功')
      showEditDialog.value = false
    }
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

onMounted(() => {
  total.value = approvalList.value.length
})
</script>

<style scoped>
.approval-container {
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

.stat-icon.primary {
  background-color: #ecf5ff;
  color: #409eff;
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
</style> 