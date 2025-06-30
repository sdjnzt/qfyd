<template>
  <div class="exam-container">
    <h1>考试管理</h1>
<!--    <p>这里是曲阜远东职业技术学院考试管理模块</p>-->
    
    <el-card class="exam-card">
      <template #header>
        <div class="card-header">
          <span>考试安排</span>
          <div class="header-actions">
            <el-button type="primary" @click="createExam">新增考试</el-button>
            <el-button type="success" @click="exportExamSchedule">导出考试安排</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="考试安排" name="schedule">
          <div class="filter-row">
            <el-select v-model="currentTerm" placeholder="选择学期" style="width: 150px;">
              <el-option v-for="term in terms" :key="term" :label="term" :value="term" />
            </el-select>
            <el-select v-model="examType" placeholder="考试类型" style="width: 150px;">
              <el-option v-for="type in examTypes" :key="type" :label="type" :value="type" />
            </el-select>
            <el-button type="primary">查询</el-button>
          </div>
          
          <el-table :data="examList" style="width: 100%" border stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="courseName" label="课程名称" min-width="150" />
            <el-table-column prop="examType" label="考试类型" width="120" />
            <el-table-column prop="examDate" label="考试日期" width="120" />
            <el-table-column prop="examTime" label="考试时间" width="150" />
            <el-table-column prop="location" label="考场" width="120" />
            <el-table-column prop="invigilator" label="监考老师" width="120" />
            <el-table-column prop="studentCount" label="考试人数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewExamDetail(row)">查看</el-button>
                <el-button type="warning" size="small" @click="editExam(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteExam(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="考场分配" name="room">
          <div class="exam-room-allocation">
            <el-card v-for="(building, index) in examBuildings" :key="index" class="building-card">
              <template #header>
                <div class="building-header">
                  <span>{{ building.name }}</span>
                  <el-tag>可用考场: {{ building.availableRooms }}/{{ building.totalRooms }}</el-tag>
                </div>
              </template>
              
              <div class="room-grid">
                <div 
                  v-for="(room, roomIndex) in building.rooms" 
                  :key="roomIndex" 
                  class="room-item"
                  :class="{ 'room-occupied': room.isOccupied }"
                  @click="viewRoomDetail(room)"
                >
                  <div class="room-number">{{ room.number }}</div>
                  <div class="room-info">
                    <div>{{ room.isOccupied ? room.courseName : '空闲' }}</div>
                    <div v-if="room.isOccupied">{{ room.examDate }} {{ room.examTime }}</div>
                    <div v-if="room.isOccupied">座位: {{ room.capacity }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="成绩管理" name="grade">
          <div class="filter-row">
            <el-select v-model="gradeCourseName" placeholder="选择课程" style="width: 200px;">
              <el-option v-for="course in courses" :key="course" :label="course" :value="course" />
            </el-select>
            <el-select v-model="gradeClass" placeholder="选择班级" style="width: 150px;">
              <el-option v-for="cls in classes" :key="cls" :label="cls" :value="cls" />
            </el-select>
            <el-button type="primary">查询</el-button>
            <el-button type="success">导入成绩</el-button>
          </div>
          
          <el-table :data="gradeList" style="width: 100%" border stripe>
            <el-table-column prop="id" label="学号" width="100" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="class" label="班级" width="150" />
            <el-table-column prop="courseName" label="课程" min-width="150" />
            <el-table-column prop="score" label="成绩" width="100" sortable>
              <template #default="{ row }">
                <span :style="{ color: getScoreColor(row.score) }">{{ row.score }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="rank" label="排名" width="100" sortable />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getGradeStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editGrade(row)">修改成绩</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="grade-statistics">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover">
                  <template #header>
                    <div class="stat-header">成绩分布</div>
                  </template>
                  <div class="chart-placeholder">
                    成绩分布图表将显示在这里
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <template #header>
                    <div class="stat-header">及格率统计</div>
                  </template>
                  <div class="chart-placeholder">
                    及格率统计图表将显示在这里
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <template #header>
                    <div class="stat-header">优秀率统计</div>
                  </template>
                  <div class="chart-placeholder">
                    优秀率统计图表将显示在这里
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('schedule')

// 基础数据
const currentTerm = ref('2025春季学期')
const examType = ref('')
const gradeCourseName = ref('')
const gradeClass = ref('')

const terms = ['2025春季学期', '2025秋季学期', '2025春季学期']
const examTypes = ['全部', '期中考试', '期末考试', '补考', '水平测试']
const courses = ['高等数学', 'C语言程序设计', '大学英语', '计算机导论', '数据结构']
const classes = ['计科2101班', '计科2102班', '软工2101班', '网络2101班']

// 考试列表数据
const examList = ref([
  {
    id: 1,
    courseName: '高等数学',
    examType: '期末考试',
    examDate: '2025-07-05',
    examTime: '09:00-11:00',
    location: '教1-101',
    invigilator: '张教授,李老师',
    studentCount: 60,
    status: '未开始'
  },
  {
    id: 2,
    courseName: 'C语言程序设计',
    examType: '期末考试',
    examDate: '2025-07-06',
    examTime: '09:00-11:00',
    location: '教1-102',
    invigilator: '王教授,刘老师',
    studentCount: 55,
    status: '未开始'
  },
  {
    id: 3,
    courseName: '大学英语',
    examType: '期末考试',
    examDate: '2025-07-07',
    examTime: '09:00-11:00',
    location: '教2-201',
    invigilator: '赵教授,孙老师',
    studentCount: 120,
    status: '未开始'
  },
  {
    id: 4,
    courseName: '计算机导论',
    examType: '期中考试',
    examDate: '2025-05-10',
    examTime: '14:00-16:00',
    location: '教1-201',
    invigilator: '张教授,周老师',
    studentCount: 58,
    status: '已结束'
  },
  {
    id: 5,
    courseName: '数据结构',
    examType: '期中考试',
    examDate: '2025-05-12',
    examTime: '14:00-16:00',
    location: '教1-202',
    invigilator: '李教授,吴老师',
    studentCount: 60,
    status: '已结束'
  }
])

// 考场建筑数据
const examBuildings = ref([
  {
    name: '教学楼1号楼',
    availableRooms: 8,
    totalRooms: 10,
    rooms: [
      { number: '101', isOccupied: true, courseName: '高等数学', examDate: '2025-07-05', examTime: '09:00-11:00', capacity: 60 },
      { number: '102', isOccupied: true, courseName: 'C语言程序设计', examDate: '2025-07-06', examTime: '09:00-11:00', capacity: 60 },
      { number: '103', isOccupied: false },
      { number: '104', isOccupied: false },
      { number: '201', isOccupied: false },
      { number: '202', isOccupied: false },
      { number: '203', isOccupied: false },
      { number: '204', isOccupied: false },
      { number: '301', isOccupied: false },
      { number: '302', isOccupied: false }
    ]
  },
  {
    name: '教学楼2号楼',
    availableRooms: 9,
    totalRooms: 10,
    rooms: [
      { number: '201', isOccupied: true, courseName: '大学英语', examDate: '2025-07-07', examTime: '09:00-11:00', capacity: 120 },
      { number: '202', isOccupied: false },
      { number: '203', isOccupied: false },
      { number: '204', isOccupied: false },
      { number: '205', isOccupied: false },
      { number: '301', isOccupied: false },
      { number: '302', isOccupied: false },
      { number: '303', isOccupied: false },
      { number: '304', isOccupied: false },
      { number: '305', isOccupied: false }
    ]
  }
])

// 成绩列表数据
const gradeList = ref([
  {
    id: '2021001',
    name: '张三',
    class: '计科2101班',
    courseName: '高等数学',
    score: 92,
    rank: 1,
    status: '已登记'
  },
  {
    id: '2021002',
    name: '李四',
    class: '计科2101班',
    courseName: '高等数学',
    score: 85,
    rank: 2,
    status: '已登记'
  },
  {
    id: '2021003',
    name: '王五',
    class: '计科2101班',
    courseName: '高等数学',
    score: 78,
    rank: 3,
    status: '已登记'
  },
  {
    id: '2021004',
    name: '赵六',
    class: '计科2101班',
    courseName: '高等数学',
    score: 65,
    rank: 4,
    status: '已登记'
  },
  {
    id: '2021005',
    name: '钱七',
    class: '计科2101班',
    courseName: '高等数学',
    score: 59,
    rank: 5,
    status: '已登记'
  }
])

// 获取考试状态样式
const getStatusType = (status: string) => {
  switch (status) {
    case '未开始':
      return 'info'
    case '进行中':
      return 'warning'
    case '已结束':
      return 'success'
    default:
      return 'info'
  }
}

// 获取成绩状态样式
const getGradeStatusType = (status: string) => {
  switch (status) {
    case '已登记':
      return 'success'
    case '未登记':
      return 'warning'
    case '有异议':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取成绩颜色
const getScoreColor = (score: number) => {
  if (score >= 90) return '#67C23A'
  if (score >= 60) return '#409EFF'
  return '#F56C6C'
}

// 考试管理相关操作
const createExam = () => {
  console.log('新增考试')
}

const exportExamSchedule = () => {
  console.log('导出考试安排')
}

const viewExamDetail = (row: any) => {
  console.log('查看考试详情', row)
}

const editExam = (row: any) => {
  console.log('编辑考试', row)
}

const deleteExam = (row: any) => {
  console.log('删除考试', row)
}

// 考场相关操作
const viewRoomDetail = (room: any) => {
  console.log('查看考场详情', room)
}

// 成绩管理相关操作
const editGrade = (row: any) => {
  console.log('修改成绩', row)
}
</script>

<style scoped>
.exam-container {
  padding: 20px;
}

.exam-card {
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

.filter-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.exam-room-allocation {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.building-card {
  margin-bottom: 10px;
}

.building-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.room-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.room-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.room-occupied {
  background-color: #f0f9eb;
  border-left: 3px solid #67c23a;
}

.room-number {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 16px;
}

.room-info {
  color: #606266;
  font-size: 14px;
}

.grade-statistics {
  margin-top: 30px;
}

.stat-header {
  font-weight: bold;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 1px dashed #ccc;
  color: #909399;
}
</style> 