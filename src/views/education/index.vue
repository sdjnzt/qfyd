<template>
  <div class="education-container">
    <h1>教学管理</h1>
<!--    <p>这里是曲阜远东职业技术学院教学管理模块</p>-->
    <el-card class="education-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索教学计划（名称/专业/学期）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增教学计划</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedEducationPlans" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="计划名称" min-width="150" />
        <el-table-column prop="major" label="专业" width="120" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="totalHours" label="总学时" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="制定人" width="120" />
        <el-table-column prop="createTime" label="制定时间" width="150" />
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
          :total="filteredEducationPlans.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增教学计划' : '编辑教学计划'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-select v-model="editForm.major" placeholder="请选择">
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
            <el-option label="软件工程" value="软件工程" />
            <el-option label="网络工程" value="网络工程" />
            <el-option label="信息安全" value="信息安全" />
            <el-option label="数据科学与大数据技术" value="数据科学与大数据技术" />
            <el-option label="人工智能" value="人工智能" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="editForm.grade" placeholder="请选择">
            <el-option label="2021级" value="2021级" />
            <el-option label="2022级" value="2022级" />
            <el-option label="2025级" value="2025级" />
            <el-option label="2025级" value="2025级" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="editForm.semester" placeholder="请选择">
            <el-option label="第一学期" value="第一学期" />
            <el-option label="第二学期" value="第二学期" />
            <el-option label="第三学期" value="第三学期" />
            <el-option label="第四学期" value="第四学期" />
            <el-option label="第五学期" value="第五学期" />
            <el-option label="第六学期" value="第六学期" />
            <el-option label="第七学期" value="第七学期" />
            <el-option label="第八学期" value="第八学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="总学时" prop="totalHours">
          <el-input v-model.number="editForm.totalHours" type="number" min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="草稿" value="草稿" />
            <el-option label="审核中" value="审核中" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已驳回" value="已驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="制定人" prop="creator">
          <el-input v-model="editForm.creator" />
        </el-form-item>
        <el-form-item label="制定时间" prop="createTime">
          <el-input v-model="editForm.createTime" />
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
    <el-dialog v-model="detailDialogVisible" title="教学计划详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="计划名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ detailData.major }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ detailData.grade }}</el-descriptions-item>
        <el-descriptions-item label="学期">{{ detailData.semester }}</el-descriptions-item>
        <el-descriptions-item label="总学时">{{ detailData.totalHours }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
        <el-descriptions-item label="制定人">{{ detailData.creator }}</el-descriptions-item>
        <el-descriptions-item label="制定时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const educationPlans = ref([
  { id: 1, name: '计算机科学与技术2025级第一学期教学计划', major: '计算机科学与技术', grade: '2025级', semester: '第一学期', totalHours: 480, status: '已通过', creator: '张教授', createTime: '2025-06-10 09:00:00' },
  { id: 2, name: '软件工程2025级第一学期教学计划', major: '软件工程', grade: '2025级', semester: '第一学期', totalHours: 520, status: '已通过', creator: '李教授', createTime: '2025-06-11 10:30:00' },
  { id: 3, name: '网络工程2025级第一学期教学计划', major: '网络工程', grade: '2025级', semester: '第一学期', totalHours: 500, status: '已通过', creator: '王教授', createTime: '2025-06-12 14:20:00' },
  { id: 4, name: '信息安全2025级第一学期教学计划', major: '信息安全', grade: '2025级', semester: '第一学期', totalHours: 540, status: '审核中', creator: '刘教授', createTime: '2025-06-13 16:45:00' },
  { id: 5, name: '数据科学与大数据技术2025级第一学期教学计划', major: '数据科学与大数据技术', grade: '2025级', semester: '第一学期', totalHours: 560, status: '草稿', creator: '赵教授', createTime: '2025-06-14 11:15:00' },
  { id: 6, name: '人工智能2025级第一学期教学计划', major: '人工智能', grade: '2025级', semester: '第一学期', totalHours: 580, status: '已通过', creator: '陈教授', createTime: '2025-06-15 09:30:00' },
  { id: 7, name: '计算机科学与技术2022级第五学期教学计划', major: '计算机科学与技术', grade: '2022级', semester: '第五学期', totalHours: 480, status: '已通过', creator: '张教授', createTime: '2025-06-08 15:20:00' },
  { id: 8, name: '软件工程2022级第五学期教学计划', major: '软件工程', grade: '2022级', semester: '第五学期', totalHours: 520, status: '已通过', creator: '李教授', createTime: '2025-06-09 10:45:00' },
  { id: 9, name: '网络工程2022级第五学期教学计划', major: '网络工程', grade: '2022级', semester: '第五学期', totalHours: 500, status: '已驳回', creator: '王教授', createTime: '2025-06-07 14:10:00' },
  { id: 10, name: '信息安全2022级第五学期教学计划', major: '信息安全', grade: '2022级', semester: '第五学期', totalHours: 540, status: '已通过', creator: '刘教授', createTime: '2025-06-06 16:30:00' }
])

const filteredEducationPlans = computed(() => {
  if (!searchQuery.value) return educationPlans.value
  return educationPlans.value.filter(e =>
    e.name.includes(searchQuery.value) ||
    e.major.includes(searchQuery.value) ||
    e.semester.includes(searchQuery.value)
  )
})

const pagedEducationPlans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEducationPlans.value.slice(start, start + pageSize.value)
})

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
    case '已通过':
      return 'success'
    case '审核中':
      return 'warning'
    case '已驳回':
      return 'danger'
    case '草稿':
      return 'info'
    default:
      return 'info'
  }
}
// 新增/编辑弹窗
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
const editForm = reactive({
  id: 0,
  name: '', major: '', grade: '', semester: '', totalHours: 0, status: '草稿', creator: '', createTime: ''
})
const editFormRef = ref()
const editRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  major: [{ required: true, message: '请选择专业', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  totalHours: [{ required: true, type: 'number', message: '请输入总学时', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制定人', trigger: 'blur' }],
  createTime: [{ required: true, message: '请输入制定时间', trigger: 'blur' }]
}
function openAddDialog() {
  editMode.value = 'add'
  const maxId = Math.max(...educationPlans.value.map(e => e.id), 0)
  Object.assign(editForm, { id: maxId + 1, name: '', major: '', grade: '', semester: '', totalHours: 0, status: '草稿', creator: '', createTime: '' })
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
      educationPlans.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = educationPlans.value.findIndex(e => e.id === editForm.id)
      if (idx !== -1) {
        educationPlans.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除教学计划"${row.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = educationPlans.value.findIndex(e => e.id === row.id)
      if (idx !== -1) {
        educationPlans.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ name: '', major: '', grade: '', semester: '', totalHours: 0, status: '', creator: '', createTime: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.education-container {
  padding: 20px;
}

.education-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 