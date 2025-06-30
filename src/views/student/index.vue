<template>
  <div class="student-container">
    <h1>学生管理</h1>
<!--    <p>这里是曲阜远东职业技术学院学生管理模块</p>-->
    <el-card class="student-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索学生（姓名/学号/班级/专业）..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px; margin-right: 10px;" 
              @input="handleSearch"
            />
            <el-button type="primary" @click="openAddDialog">新增学生</el-button>
          </div>
        </div>
      </template>
      <el-table :data="pagedStudents" style="width: 100%" border stripe highlight-current-row>
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="class" label="班级" width="150" />
        <el-table-column prop="department" label="系部" width="180" />
        <el-table-column prop="major" label="专业" width="180" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
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
          :total="filteredStudents.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editMode === 'add' ? '新增学生' : '编辑学生'" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="学号" prop="id">
          <el-input v-model="editForm.id" :disabled="editMode === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender" placeholder="请选择">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="editForm.age" type="number" min="15" max="30" />
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-input v-model="editForm.class" />
        </el-form-item>
        <el-form-item label="系部" prop="department">
          <el-input v-model="editForm.department" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="editForm.major" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
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
    <el-dialog v-model="detailDialogVisible" title="学生详情" width="400px" :show-close="true">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学号">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ detailData.gender }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ detailData.age }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ detailData.class }}</el-descriptions-item>
        <el-descriptions-item label="系部">{{ detailData.department }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ detailData.major }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailData.email }}</el-descriptions-item>
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

// 真实数据样例
const students = ref([
  { id: '20250001', name: '王伟', gender: '男', age: 20, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138000', email: 'wangwei@example.com' },
  { id: '20250002', name: '李娜', gender: '女', age: 19, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138001', email: 'lina@example.com' },
  { id: '20250003', name: '张敏', gender: '女', age: 21, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138002', email: 'zhangmin@example.com' },
  { id: '20250004', name: '刘洋', gender: '男', age: 20, class: '计科21-3', department: '信息工程系', major: '网络工程', phone: '13800138003', email: 'liuyang@example.com' },
  { id: '20250005', name: '陈静', gender: '女', age: 22, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138004', email: 'chenjing@example.com' },
  { id: '20250006', name: '杨磊', gender: '男', age: 19, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138005', email: 'yanglei@example.com' },
  { id: '20250007', name: '赵丽', gender: '女', age: 20, class: '计科21-3', department: '信息工程系', major: '网络工程', phone: '13800138006', email: 'zhaoli@example.com' },
  { id: '20250008', name: '周强', gender: '男', age: 21, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138007', email: 'zhouqiang@example.com' },
  { id: '20250009', name: '吴婷', gender: '女', age: 20, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138008', email: 'wuting@example.com' },
  { id: '20250010', name: '徐杰', gender: '男', age: 19, class: '计科21-3', department: '信息工程系', major: '网络工程', phone: '13800138009', email: 'xujie@example.com' },
  { id: '20250011', name: '孙悦', gender: '女', age: 21, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138010', email: 'sunyue@example.com' },
  { id: '20250012', name: '马超', gender: '男', age: 20, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138011', email: 'machao@example.com' },
  { id: '20250013', name: '朱琳', gender: '女', age: 22, class: '计科21-3', department: '信息工程系', major: '网络工程', phone: '13800138012', email: 'zhulin@example.com' },
  { id: '20250014', name: '胡斌', gender: '男', age: 19, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138013', email: 'hubin@example.com' },
  { id: '20250015', name: '郭娟', gender: '女', age: 20, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138014', email: 'guoj@example.com' },
  { id: '20250016', name: '林峰', gender: '男', age: 21, class: '计科21-3', department: '信息工程系', major: '网络工程', phone: '13800138015', email: 'linfeng@example.com' },
  { id: '20250017', name: '何静', gender: '女', age: 19, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138016', email: 'hejing@example.com' },
  { id: '20250018', name: '高翔', gender: '男', age: 20, class: '计科21-1', department: '信息工程系', major: '计算机科学与技术', phone: '13800138017', email: 'gaoxiang@example.com' },
  { id: '20250019', name: '罗敏', gender: '女', age: 22, class: '计科21-3', department: '信息工程系', major: '网络工程', phone: '13800138018', email: 'luomin@example.com' },
  { id: '20250020', name: '梁宇', gender: '男', age: 21, class: '计科21-2', department: '信息工程系', major: '软件工程', phone: '13800138019', email: 'liangyu@example.com' }
])

const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  return students.value.filter(s =>
    s.id.includes(searchQuery.value) ||
    s.name.includes(searchQuery.value) ||
    s.class.includes(searchQuery.value) ||
    s.major.includes(searchQuery.value)
  )
})

const pagedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
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

// 新增/编辑弹窗
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
const editForm = reactive({
  id: '', name: '', gender: '', age: 18, class: '', department: '', major: '', phone: '', email: ''
})
const editFormRef = ref()
const editRules = {
  id: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, type: 'number', message: '请输入年龄', trigger: 'blur' }],
  class: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  department: [{ required: true, message: '请输入系部', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

function openAddDialog() {
  editMode.value = 'add'
  Object.assign(editForm, { id: '', name: '', gender: '', age: 18, class: '', department: '', major: '', phone: '', email: '' })
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
      if (students.value.some(s => s.id === editForm.id)) {
        ElMessage.error('学号已存在')
        return
      }
      students.value.unshift({ ...editForm })
      ElMessage.success('新增成功')
    } else {
      const idx = students.value.findIndex(s => s.id === editForm.id)
      if (idx !== -1) {
        students.value[idx] = { ...editForm }
        ElMessage.success('编辑成功')
      }
    }
    editDialogVisible.value = false
  })
}
function confirmDelete(row: any) {
  ElMessageBox.confirm(`确定要删除学生"${row.name}(${row.id})"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      const idx = students.value.findIndex(s => s.id === row.id)
      if (idx !== -1) {
        students.value.splice(idx, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = reactive({ id: '', name: '', gender: '', age: 0, class: '', department: '', major: '', phone: '', email: '' })
function viewDetail(row: any) {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}
</script>

<style scoped>
.student-container {
  padding: 20px;
}

.student-card {
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