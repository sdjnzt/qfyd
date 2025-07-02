import { createRouter, createWebHashHistory } from 'vue-router'

// 预加载关键路由组件
import Layout from '@/views/layout/index.vue'
import Dashboard from '@/views/dashboard/index.vue'
import Login from '@/views/login/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: { title: '首页', icon: 'House' }
        },
        {
          path: 'cloud-management',
          name: 'CloudManagement',
          component: () => import('@/views/cloud-management/index.vue'),
          meta: { title: '云管平台', icon: 'Monitor' }
        },
        {
          path: 'education',
          name: 'Education',
          component: () => import(/* webpackChunkName: "education" */ '@/views/education/index.vue'),
          meta: { title: '教学管理', icon: 'Reading' }
        },
        {
          path: 'student',
          name: 'Student',
          component: () => import(/* webpackChunkName: "student" */ '@/views/student/index.vue'),
          meta: { title: '学生管理', icon: 'User' }
        },
        {
          path: 'teacher',
          name: 'Teacher',
          component: () => import(/* webpackChunkName: "teacher" */ '@/views/teacher/index.vue'),
          meta: { title: '教职工管理', icon: 'UserFilled' }
        },
        {
          path: 'course',
          name: 'Course',
          component: () => import(/* webpackChunkName: "course" */ '@/views/course/index.vue'),
          meta: { title: '课程资源', icon: 'Document' }
        },
        {
          path: 'schedule',
          name: 'Schedule',
          component: () => import(/* webpackChunkName: "schedule" */ '@/views/schedule/index.vue'),
          meta: { title: '排课管理', icon: 'Calendar' }
        },
        {
          path: 'exam',
          name: 'Exam',
          component: () => import(/* webpackChunkName: "exam" */ '@/views/exam/index.vue'),
          meta: { title: '考试管理', icon: 'EditPen' }
        },
        {
          path: 'office',
          name: 'Office',
          component: () => import(/* webpackChunkName: "office" */ '@/views/office/index.vue'),
          meta: { title: '办公自动化', icon: 'Suitcase' },
          children: [
            {
              path: 'approval',
              name: 'OfficeApproval',
              component: () => import('@/views/office/approval/index.vue'),
              meta: { title: '请假审批', icon: 'Clock' }
            },
            {
              path: 'document',
              name: 'OfficeDocument',
              component: () => import('@/views/office/document/index.vue'),
              meta: { title: '公文流转', icon: 'Document' }
            },
            {
              path: 'meeting',
              name: 'OfficeMeeting',
              component: () => import('@/views/office/meeting/index.vue'),
              meta: { title: '会议管理', icon: 'Timer' }
            }
          ]
        },
        {
          path: 'device',
          name: 'Device',
          component: () => import('@/views/device/index.vue'),
          meta: { title: '设备管理', icon: 'Monitor' }
        },
        {
          path: 'network',
          name: 'Network',
          component: () => import('@/views/network/index.vue'),
          meta: { title: '网络管理', icon: 'Connection' }
        },
        {
          path: 'server',
          name: 'Server',
          component: () => import('@/views/server/index.vue'),
          meta: { title: '服务器管理', icon: 'Cpu' }
        },
        {
          path: 'storage',
          name: 'Storage',
          component: () => import('@/views/storage/index.vue'),
          meta: { title: '存储管理', icon: 'DataLine' }
        },
        {
          path: 'monitor',
          name: 'Monitor',
          component: () => import('@/views/monitor/index.vue'),
          meta: { title: '监控告警', icon: 'Warning' }
        },
        // {
        //   path: 'data',
        //   name: 'Data',
        //   component: () => import('@/views/data/index.vue'),
        //   meta: { title: '数据服务', icon: 'DataLine' }
        // },
        {
          path: 'backup',
          name: 'Backup',
          component: () => import('@/views/backup/index.vue'),
          meta: { title: '备份管理', icon: 'DocumentCopy' }
        },
        {
          path: 'security',
          name: 'Security',
          component: () => import('@/views/security/index.vue'),
          meta: { title: '安全防护', icon: 'Lock' }
        },
        {
          path: 'alarms',
          name: 'Alarms',
          component: () => import('@/views/alarms/index.vue'),
          meta: { title: '告警中心', icon: 'Bell' }
        }
      ]
    }
  ]
})

export default router 
