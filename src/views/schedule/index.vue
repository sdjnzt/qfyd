<template>
  <div class="schedule-container">
    <h1>排课管理</h1>
<!--    <p>这里是曲阜远东职业技术学院排课管理模块</p>-->
    
    <el-card class="schedule-card">
      <template #header>
        <div class="card-header">
          <div class="filter-container">
            <el-select v-model="currentTerm" placeholder="选择学期" style="width: 150px;">
              <el-option v-for="term in terms" :key="term" :label="term" :value="term" />
            </el-select>
            <el-select v-model="currentDepartment" placeholder="选择院系" style="width: 180px;">
              <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
            </el-select>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="generateSchedule">生成课表</el-button>
            <el-button type="success" @click="exportSchedule">导出课表</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="周课表视图" name="weekly">
          <div class="schedule-weekly">
            <div class="time-header">
              <div class="time-cell"></div>
              <div class="day-cell" v-for="(day, index) in weekdays" :key="index">{{ day }}</div>
            </div>
            
            <div class="schedule-body">
              <div class="schedule-row" v-for="(time, timeIndex) in timeSlots" :key="timeIndex">
                <div class="time-cell">{{ time }}</div>
                <div class="schedule-cell" v-for="(_, dayIndex) in weekdays" :key="dayIndex">
                  <div 
                    v-for="course in getCoursesForTimeAndDay(timeIndex, dayIndex)" 
                    :key="course.id"
                    class="course-item"
                    :class="getCourseClass(course)"
                  >
                    <div class="course-name">{{ course.name }}</div>
                    <div class="course-info">{{ course.teacher }} | {{ course.classroom }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="课程列表" name="list">
          <el-table :data="scheduleList" style="width: 100%" border stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="courseName" label="课程名称" min-width="150" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="dayOfWeek" label="星期" width="100" />
            <el-table-column prop="timeSlot" label="时间段" width="150" />
            <el-table-column prop="classroom" label="教室" width="120" />
            <el-table-column prop="class" label="班级" width="120" />
            <el-table-column prop="startWeek" label="起始周" width="100" />
            <el-table-column prop="endWeek" label="结束周" width="100" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="warning" size="small" @click="editSchedule(row)">调课</el-button>
                <el-button type="danger" size="small" @click="cancelSchedule(row)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="教室占用" name="classroom">
          <div class="classroom-filters">
            <el-select v-model="currentBuilding" placeholder="选择教学楼" style="width: 150px;">
              <el-option v-for="building in buildings" :key="building" :label="building" :value="building" />
            </el-select>
            <el-button type="primary" size="default">查询</el-button>
          </div>
          
          <div class="classroom-usage">
            <el-card v-for="(room, index) in classroomUsage" :key="index" class="classroom-card">
              <template #header>
                <div class="room-header">
                  <span>{{ room.name }}</span>
                  <el-tag :type="room.usage > 80 ? 'danger' : room.usage > 60 ? 'warning' : 'success'">
                    利用率: {{ room.usage }}%
                  </el-tag>
                </div>
              </template>
              <div class="room-content">
                <el-progress :percentage="room.usage" :status="room.usage > 80 ? 'exception' : room.usage > 60 ? 'warning' : 'success'"></el-progress>
                <div class="room-info">
                  <div>容量: {{ room.capacity }}人</div>
                  <div>设备: {{ room.equipment }}</div>
                  <div>总课时: {{ room.totalHours }}课时/周</div>
                </div>
                <el-button type="primary" size="small" @click="viewRoomSchedule(room)">查看详情</el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('weekly')

// 基础数据
const currentTerm = ref('2025春季学期')
const currentDepartment = ref('全部')
const currentBuilding = ref('教学楼1号')

const terms = ref(['2025春季学期', '2025秋季学期', '2025春季学期'])
const departments = ref(['全部', '计算机科学系', '数学系', '外语系', '物理系'])
const buildings = ref(['教学楼1号', '教学楼2号', '实验楼', '综合楼'])
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const timeSlots = ['第1-2节 8:00-9:40', '第3-4节 10:00-11:40', '第5-6节 14:00-15:40', '第7-8节 16:00-17:40', '第9-10节 19:00-20:40']

// 课表数据
const courseScheduleData = ref([
  {
    id: 1,
    name: '计算机导论',
    teacher: '王教授',
    classroom: '教1-101',
    class: '计科1班',
    day: 0, // 周一
    time: 0, // 第1-2节
    type: 'required', // 必修课
    startWeek: 1,
    endWeek: 16
  },
  {
    id: 2,
    name: 'C语言程序设计',
    teacher: '李教授',
    classroom: '教1-202',
    class: '计科1班',
    day: 1, // 周二
    time: 1, // 第3-4节
    type: 'required',
    startWeek: 1,
    endWeek: 16
  },
  {
    id: 3,
    name: '高等数学',
    teacher: '赵教授',
    classroom: '教2-101',
    class: '计科1班',
    day: 2, // 周三
    time: 2, // 第5-6节
    type: 'required',
    startWeek: 1,
    endWeek: 16
  },
  {
    id: 4,
    name: '大学英语',
    teacher: '刘教授',
    classroom: '教1-301',
    class: '计科1班',
    day: 3, // 周四
    time: 3, // 第7-8节
    type: 'public',
    startWeek: 1,
    endWeek: 16
  },
  {
    id: 5,
    name: '数据结构',
    teacher: '张教授',
    classroom: '教1-204',
    class: '计科2班',
    day: 0, // 周一
    time: 2, // 第5-6节
    type: 'required',
    startWeek: 1,
    endWeek: 16
  }
])

// 课表列表视图数据
const scheduleList = computed(() => {
  return courseScheduleData.value.map(course => ({
    id: course.id,
    courseName: course.name,
    teacher: course.teacher,
    dayOfWeek: weekdays[course.day],
    timeSlot: timeSlots[course.time],
    classroom: course.classroom,
    class: course.class,
    startWeek: course.startWeek,
    endWeek: course.endWeek
  }))
})

// 教室使用情况数据
const classroomUsage = ref([
  {
    name: '教1-101',
    capacity: 60,
    equipment: '多媒体,投影仪',
    usage: 85,
    totalHours: 34
  },
  {
    name: '教1-102',
    capacity: 80,
    equipment: '多媒体,投影仪,电脑',
    usage: 65,
    totalHours: 26
  },
  {
    name: '教1-201',
    capacity: 60,
    equipment: '多媒体,投影仪',
    usage: 50,
    totalHours: 20
  },
  {
    name: '教1-202',
    capacity: 80,
    equipment: '多媒体,投影仪,电脑',
    usage: 75,
    totalHours: 30
  }
])

// 获取特定时间和日期的课程
const getCoursesForTimeAndDay = (time: number, day: number) => {
  return courseScheduleData.value.filter(course => course.time === time && course.day === day)
}

// 获取课程样式类
const getCourseClass = (course: any) => {
  return {
    'required-course': course.type === 'required',
    'optional-course': course.type === 'optional',
    'public-course': course.type === 'public'
  }
}

// 生成课表
const generateSchedule = () => {
  console.log('生成课表')
}

// 导出课表
const exportSchedule = () => {
  console.log('导出课表')
}

// 调课
const editSchedule = (row: any) => {
  console.log('调课', row)
}

// 取消排课
const cancelSchedule = (row: any) => {
  console.log('取消排课', row)
}

// 查看教室详情
const viewRoomSchedule = (room: any) => {
  console.log('查看教室详情', room)
}
</script>

<style scoped>
.schedule-container {
  padding: 20px;
}

.schedule-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  gap: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.schedule-weekly {
  margin-top: 20px;
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.time-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.time-cell {
  width: 150px;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #ebeef5;
}

.day-cell {
  flex: 1;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #ebeef5;
}

.day-cell:last-child {
  border-right: none;
}

.schedule-body {
  display: flex;
  flex-direction: column;
}

.schedule-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.schedule-row:last-child {
  border-bottom: none;
}

.schedule-cell {
  flex: 1;
  min-height: 100px;
  padding: 8px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.schedule-cell:last-child {
  border-right: none;
}

.course-item {
  padding: 8px;
  border-radius: 4px;
  background-color: #f0f9eb;
  font-size: 12px;
  height: 100%;
}

.required-course {
  background-color: #f0f9eb;
  border-left: 3px solid #67c23a;
}

.optional-course {
  background-color: #fdf6ec;
  border-left: 3px solid #e6a23c;
}

.public-course {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.course-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.course-info {
  color: #606266;
}

.classroom-filters {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.classroom-usage {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.classroom-card {
  margin-bottom: 20px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-content {
  padding: 10px 0;
}

.room-info {
  margin: 15px 0;
  color: #606266;
  font-size: 14px;
}
</style> 