<template>
  <div class="teacher-container">
    <h1>教职工管理</h1>

    
    <el-card class="teacher-card">
      <template #header>
        <div class="card-header">
          <span>教职工信息管理</span>
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索教职工..." 
              clearable 
              prefix-icon="Search" 
              style="width: 300px;" 
            />
            <el-button type="primary">查询</el-button>
            <el-button type="success">新增教职工</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="teachers" style="width: 100%" border stripe>
        <el-table-column prop="id" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="department" label="所属院系" width="150" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="education" label="学历" width="120" />
        <el-table-column prop="subject" label="专业" width="150" />
        <el-table-column prop="email" label="电子邮箱" min-width="200" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default>
            <el-button type="primary" size="small">查看</el-button>
            <el-button type="warning" size="small">编辑</el-button>
            <el-button type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const teachers = ref([
  {
    id: 'T001',
    name: '张教授',
    gender: '男',
    department: '计算机科学系',
    title: '教授',
    education: '博士',
    subject: '计算机科学',
    email: 'zhang@example.com',
    phone: '13800138001',
    status: '在职'
  },
  {
    id: 'T002',
    name: '李副教授',
    gender: '女',
    department: '数学系',
    title: '副教授',
    education: '博士',
    subject: '应用数学',
    email: 'li@example.com',
    phone: '13800138002',
    status: '在职'
  },
  {
    id: 'T003',
    name: '王讲师',
    gender: '男',
    department: '外语系',
    title: '讲师',
    education: '硕士',
    subject: '英语教育',
    email: 'wang@example.com',
    phone: '13800138003',
    status: '在职'
  },
  {
    id: 'T004',
    name: '刘助教',
    gender: '女',
    department: '计算机科学系',
    title: '助教',
    education: '硕士',
    subject: '软件工程',
    email: 'liu@example.com',
    phone: '13800138004',
    status: '休假'
  },
  {
    id: 'T005',
    name: '赵教授',
    gender: '男',
    department: '物理系',
    title: '教授',
    education: '博士',
    subject: '理论物理',
    email: 'zhao@example.com',
    phone: '13800138005',
    status: '在职'
  }
])

const getStatusType = (status: string) => {
  switch (status) {
    case '在职':
      return 'success'
    case '休假':
      return 'info'
    case '离职':
      return 'danger'
    default:
      return 'info'
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 加载数据
}
</script>

<style scoped>
.teacher-container {
  padding: 20px;
}

.teacher-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
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