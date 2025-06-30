<template>
  <div class="course-container">
    <h1>课程资源</h1>
<!--    <p>这里是曲阜远东职业技术学院课程资源管理模块</p>-->
    <el-card class="course-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索课程（名称/编号/院系/教师）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增课程</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedCourses" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="课程编号" width="120" />
        <el-table-column prop="name" label="课程名称" width="150" />
        <el-table-column prop="department" label="所属院系" width="150" />
        <el-table-column prop="teacher" label="授课教师" width="120" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="hours" label="学时" width="80" />
        <el-table-column prop="type" label="课程类型" width="120" />
        <el-table-column prop="term" label="开课学期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
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
          :total="filteredCourses.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增课程' : '编辑课程'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="课程编号" prop="id">
          <el-input v-model="editForm.id" :disabled="editMode === 'edit'" />
        </el-form-item>
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-input v-model="editForm.department" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher">
          <el-input v-model="editForm.teacher" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input v-model.number="editForm.credit" type="number" min="1" max="10" />
        </el-form-item>
        <el-form-item label="学时" prop="hours">
          <el-input v-model.number="editForm.hours" type="number" min="1" max="200" />
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="必修课" value="必修课" />
            <el-option label="选修课" value="选修课" />
            <el-option label="公共课" value="公共课" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课学期" prop="term">
          <el-input v-model="editForm.term" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="进行中" value="进行中" />
            <el-option label="未开始" value="未开始" />
            <el-option label="已结束" value="已结束" />
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
    <el-dialog v-model="detailDialogVisible" title="课程详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课程编号">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">{{ detailData.department }}</el-descriptions-item>
        <el-descriptions-item label="授课教师">{{ detailData.teacher }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ detailData.credit }}</el-descriptions-item>
        <el-descriptions-item label="学时">{{ detailData.hours }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">{{ detailData.type }}</el-descriptions-item>
        <el-descriptions-item label="开课学期">{{ detailData.term }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.status }}</el-descriptions-item>
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

const courses = ref([
  { id: 'CS101', name: '高等数学', department: '数学系', teacher: '李明', credit: 5, hours: 80, type: '必修课', term: '2025春季', status: '进行中' },
  { id: 'CS102', name: 'C语言程序设计', department: '计算机科学系', teacher: '王磊', credit: 4, hours: 64, type: '必修课', term: '2025春季', status: '进行中' },
  { id: 'CS103', name: '大学英语', department: '外语系', teacher: '张敏', credit: 2, hours: 32, type: '公共课', term: '2025春季', status: '进行中' },
  { id: 'CS104', name: '数据结构', department: '计算机科学系', teacher: '刘洋', credit: 4, hours: 64, type: '必修课', term: '2025秋季', status: '未开始' },
  { id: 'CS105', name: '线性代数', department: '数学系', teacher: '陈静', credit: 3, hours: 48, type: '必修课', term: '2025秋季', status: '未开始' },
  { id: 'CS106', name: '操作系统', department: '计算机科学系', teacher: '杨磊', credit: 3, hours: 48, type: '必修课', term: '2025秋季', status: '未开始' },
  { id: 'CS107', name: '数据库原理', department: '计算机科学系', teacher: '赵丽', credit: 3, hours: 48, type: '必修课', term: '2025秋季', status: '未开始' },
  { id: 'CS108', name: '概率论与数理统计', department: '数学系', teacher: '周强', credit: 3, hours: 48, type: '必修课', term: '2025秋季', status: '未开始' },
  { id: 'CS109', name: '软件工程', department: '计算机科学系', teacher: '吴婷', credit: 3, hours: 48, type: '选修课', term: '2025秋季', status: '未开始' },
  { id: 'CS110', name: '人工智能导论', department: '计算机科学系', teacher: '徐杰', credit: 2, hours: 32, type: '选修课', term: '2025秋季', status: '未开始' },
  { id: 'CS111', name: '大学物理', department: '物理系', teacher: '孙悦', credit: 3, hours: 48, type: '公共课', term: '2025春季', status: '进行中' },
  { id: 'CS112', name: '离散数学', department: '数学系', teacher: '马超', credit: 3, hours: 48, type: '必修课', term: '2025春季', status: '进行中' },
  { id: 'CS113', name: '网络安全', department: '计算机科学系', teacher: '朱琳', credit: 2, hours: 32, type: '选修课', term: '2025秋季', status: '未开始' },
  { id: 'CS114', name: 'Web开发基础', department: '计算机科学系', teacher: '胡斌', credit: 2, hours: 32, type: '选修课', term: '2025秋季', status: '未开始' },
  { id: 'CS115', name: '数据分析基础', department: '计算机科学系', teacher: '郭娟', credit: 2, hours: 32, type: '选修课', term: '2025秋季', status: '未开始' },
  { id: 'CS116', name: '大学体育', department: '体育系', teacher: '林峰', credit: 1, hours: 32, type: '公共课', term: '2025春季', status: '进行中' },
  { id: 'CS117', name: '创新创业基础', department: '管理系', teacher: '何静', credit: 2, hours: 32, type: '公共课', term: '2025春季', status: '进行中' },
  { id: 'CS118', name: '电路基础', department: '电子系', teacher: '高翔', credit: 3, hours: 48, type: '必修课', term: '2025春季', status: '进行中' },
  { id: 'CS119', name: '信号与系统', department: '电子系', teacher: '罗敏', credit: 3, hours: 48, type: '必修课', term: '2025春季', status: '进行中' },
  { id: 'CS120', name: '数字逻辑', department: '电子系', teacher: '梁宇', credit: 3, hours: 48, type: '必修课', term: '2025春季', status: '进行中' }
])

const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value
  return courses.value.filter(c =>
    c.id.includes(searchQuery.value) ||
    c.name.includes(searchQuery.value) ||
    c.department.includes(searchQuery.value) ||
    c.teacher.includes(searchQuery.value)
  )
})

const pagedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCourses.value.slice(start, start + pageSize.value)
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
    case '进行中':
      return 'success'
    case '未开始':
      return 'info'
    case '已结束':
      return 'info'
    default:
      return 'info'
  }
}

// 新增/编辑弹窗
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
const editForm = reactive({
  id: '', name: '', department: '', teacher: '', credit: 1, hours: 32, type: '', term: '', status: '未开始'
})
const editFormRef = ref()
const editRules = {
  id: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  department: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  teacher: [{ required: true, message: '请输入授课教师', trigger: 'blur' }],
  credit: [{ required: true, type: 'number', message: '请输入学分', trigger: 'blur' }],
  hours: [{ required: true, type: 'number', message: '请输入学时', trigger: 'blur' }],
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  term: [{ required: true, message: '请输入开课学期', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function openAddDialog() {
  editMode.value = 'add'
  Object.assign(editForm, { id: '', name: '', department: '', teacher: '', credit: 1, hours: 32, type: '', term: '', status: '未开始' })
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
      if (courses.value.some(c => c.id === editForm.id)) {
        ElMessage.error('课程编号已存在')
        return
      }
      courses.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = courses.value.findIndex(c => c.id === editForm.id)
      if (idx !== -1) {
        courses.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除课程"${row.name}(${row.id})"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = courses.value.findIndex(c => c.id === row.id)
      if (idx !== -1) {
        courses.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ id: '', name: '', department: '', teacher: '', credit: 0, hours: 0, type: '', term: '', status: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.course-container {
  padding: 20px;
}

.course-card {
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