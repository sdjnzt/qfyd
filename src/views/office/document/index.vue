<template>
  <div class="document-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">办公自动化-文档管理</h2>
      <div class="page-actions">
        <el-button type="primary" @click="showAddDialog = true" class="text-button">
          <el-icon><Plus /></el-icon>新增文档
        </el-button>
        <el-button type="success" @click="batchApprove" class="text-button">
          <el-icon><Check /></el-icon>批量审核
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
        <el-form-item label="文档标题">
          <el-input v-model="searchForm.title" placeholder="请输入文档标题" clearable />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select v-model="searchForm.type" placeholder="请选择文档类型" clearable>
            <el-option label="工作计划" value="工作计划" />
            <el-option label="制度文件" value="制度文件" />
            <el-option label="学生管理" value="学生管理" />
            <el-option label="财务制度" value="财务制度" />
            <el-option label="安全制度" value="安全制度" />
            <el-option label="培训计划" value="培训计划" />
            <el-option label="文化建设" value="文化建设" />
            <el-option label="招生宣传" value="招生宣传" />
            <el-option label="管理制度" value="管理制度" />
            <el-option label="服务标准" value="服务标准" />
            <el-option label="科研管理" value="科研管理" />
            <el-option label="合作协议" value="合作协议" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="searchForm.status" placeholder="请选择发布状态" clearable>
            <el-option label="已发布" value="已发布" />
            <el-option label="待审核" value="待审核" />
            <el-option label="已下架" value="已下架" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文档列表 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文档列表</span>
          <el-tag type="info">共 {{ total }} 条记录</el-tag>
        </div>
      </template>
      
      <el-table :data="documentList" border stripe>
        <el-table-column prop="id" label="文档编号" width="100" />
        <el-table-column prop="title" label="文档标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="文档类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="发布部门" width="150" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column prop="updateTime" label="更新时间" width="150" />
        <el-table-column prop="status" label="发布状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="100" />
        <el-table-column prop="downloads" label="下载次数" width="100" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" class="text-button" @click="viewDetail(row)">查看</el-button>
            <el-button type="success" class="text-button" @click="downloadDocument(row)">下载</el-button>
            <el-button type="warning" class="text-button" @click="editDocument(row)">编辑</el-button>
            <el-button type="danger" class="text-button" @click="deleteDocument(row)">删除</el-button>
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

    <!-- 新建公文对话框 -->
    <el-dialog v-model="showAddDialog" title="新建公文" width="700px">
      <el-form :model="documentForm" :rules="documentRules" ref="documentFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公文标题" prop="title">
              <el-input v-model="documentForm.title" placeholder="请输入公文标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公文类型" prop="type">
              <el-select v-model="documentForm.type" placeholder="请选择公文类型">
                <el-option label="通知" value="通知" />
                <el-option label="决定" value="决定" />
                <el-option label="报告" value="报告" />
                <el-option label="请示" value="请示" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发文单位" prop="sender">
              <el-input v-model="documentForm.sender" placeholder="请输入发文单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收文单位" prop="receiver">
              <el-input v-model="documentForm.receiver" placeholder="请输入收文单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="priority">
              <el-select v-model="documentForm.priority" placeholder="请选择紧急程度">
                <el-option label="普通" value="普通" />
                <el-option label="紧急" value="紧急" />
                <el-option label="特急" value="特急" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密级" prop="security">
              <el-select v-model="documentForm.security" placeholder="请选择密级">
                <el-option label="公开" value="公开" />
                <el-option label="内部" value="内部" />
                <el-option label="秘密" value="秘密" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="公文内容" prop="content">
          <el-input
            v-model="documentForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公文内容"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持jpg/png/pdf/doc/docx格式，单个文件不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDocument">提交</el-button>
      </template>
    </el-dialog>

    <!-- 处理公文对话框 -->
    <el-dialog v-model="showProcessDialog" title="处理公文" width="600px">
      <el-form :model="processForm" ref="processFormRef" label-width="100px">
        <el-form-item label="处理意见" prop="comment">
          <el-input
            v-model="processForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
        <el-form-item label="下一步处理人" prop="nextHandler">
          <el-select v-model="processForm.nextHandler" placeholder="请选择下一步处理人">
            <el-option label="张主任" value="张主任" />
            <el-option label="李院长" value="李院长" />
            <el-option label="王处长" value="王处长" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果" prop="result">
          <el-radio-group v-model="processForm.result">
            <el-radio value="approve">同意</el-radio>
            <el-radio value="reject">退回</el-radio>
            <el-radio value="complete">完成</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">确定</el-button>
      </template>
    </el-dialog>

    <!-- 文档详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="文档详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文档编号">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="文档标题">{{ currentDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="文档类型">
          <el-tag :type="getTypeTagType(currentDetail.type)">{{ currentDetail.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布部门">{{ currentDetail.department }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentDetail.author }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">{{ currentDetail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentDetail.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ currentDetail.size }}</el-descriptions-item>
        <el-descriptions-item label="下载次数">{{ currentDetail.downloads }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="document-preview" v-if="currentDetail.id">
        <h3>文档预览</h3>
        <div class="preview-placeholder">
          <el-empty description="文档预览区域" />
          <div class="preview-actions">
            <el-button type="primary" @click="downloadDocument(currentDetail)">下载文档</el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑文档对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑文档" width="700px">
      <el-form :model="editForm" :rules="documentRules" ref="editFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文档标题" prop="title">
              <el-input v-model="editForm.title" placeholder="请输入文档标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文档类型" prop="type">
              <el-select v-model="editForm.type" placeholder="请选择文档类型">
                <el-option label="工作计划" value="工作计划" />
                <el-option label="制度文件" value="制度文件" />
                <el-option label="学生管理" value="学生管理" />
                <el-option label="财务制度" value="财务制度" />
                <el-option label="安全制度" value="安全制度" />
                <el-option label="培训计划" value="培训计划" />
                <el-option label="文化建设" value="文化建设" />
                <el-option label="招生宣传" value="招生宣传" />
                <el-option label="管理制度" value="管理制度" />
                <el-option label="服务标准" value="服务标准" />
                <el-option label="科研管理" value="科研管理" />
                <el-option label="合作协议" value="合作协议" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布部门" prop="department">
              <el-input v-model="editForm.department" placeholder="请输入发布部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="editForm.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布状态" prop="status">
              <el-select v-model="editForm.status" placeholder="请选择发布状态">
                <el-option label="已发布" value="已发布" />
                <el-option label="待审核" value="待审核" />
                <el-option label="已下架" value="已下架" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持jpg/png/pdf/doc/docx格式，单个文件不超过10MB</div>
            </template>
          </el-upload>
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
import { Plus, Refresh, Document, Clock, Check, Warning, Download, Printer } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'

// 统计卡片数据
const statCards = ref([
  { label: '总文档数', value: 156, icon: 'Document', type: 'primary' },
  { label: '已发布', value: 89, icon: 'Check', type: 'success' },
  { label: '待审核', value: 12, icon: 'Clock', type: 'warning' },
  { label: '本月新增', value: 23, icon: 'Plus', type: 'info' }
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
const showProcessDialog = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)

// 表单引用
const documentFormRef = ref<FormInstance>()
const processFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 公文表单
const documentForm = reactive({
  title: '',
  type: '',
  sender: '',
  receiver: '',
  priority: '',
  security: '',
  content: ''
})

// 处理表单
const processForm = reactive({
  comment: '',
  nextHandler: '',
  result: 'approve'
})

// 文件列表
const fileList = ref<UploadFile[]>([])

// 当前详情数据
const currentDetail = ref<any>({})

// 编辑表单
const editForm = reactive({
  id: '',
  title: '',
  type: '',
  department: '',
  author: '',
  status: ''
})

// 表单验证规则
const documentRules = {
  title: [{ required: true, message: '请输入公文标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公文类型', trigger: 'change' }],
  sender: [{ required: true, message: '请输入发文单位', trigger: 'blur' }],
  receiver: [{ required: true, message: '请输入收文单位', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  content: [{ required: true, message: '请输入公文内容', trigger: 'blur' }]
}

// 模拟数据
const documentList = ref([
  {
    id: 'DOC001',
    title: '学院年度工作计划',
    type: '工作计划',
    department: '院长办公室',
    author: '张院长',
    createTime: '2025-06-10 09:30',
    updateTime: '2025-06-15 14:20',
    status: '已发布',
    size: '2.5MB',
    downloads: 156
  },
  {
    id: 'DOC002',
    title: '教学管理制度修订稿',
    type: '制度文件',
    department: '教务处',
    author: '李主任',
    createTime: '2025-06-12 10:15',
    updateTime: '2025-06-12 10:15',
    status: '待审核',
    size: '1.8MB',
    downloads: 0
  },
  {
    id: 'DOC003',
    title: '学生手册2025版',
    type: '学生管理',
    department: '学生处',
    author: '王主任',
    createTime: '2025-06-08 16:45',
    updateTime: '2025-06-14 11:30',
    status: '已发布',
    size: '3.2MB',
    downloads: 289
  },
  {
    id: 'DOC004',
    title: '财务报销流程说明',
    type: '财务制度',
    department: '财务处',
    author: '赵会计',
    createTime: '2025-06-11 14:20',
    updateTime: '2025-06-11 14:20',
    status: '已发布',
    size: '0.8MB',
    downloads: 89
  },
  {
    id: 'DOC005',
    title: '实验室安全管理制度',
    type: '安全制度',
    department: '实验实训中心',
    author: '钱主任',
    createTime: '2025-06-09 09:00',
    updateTime: '2025-06-13 15:45',
    status: '已发布',
    size: '1.5MB',
    downloads: 134
  },
  {
    id: 'DOC006',
    title: '教师培训计划',
    type: '培训计划',
    department: '人事处',
    author: '孙主任',
    createTime: '2025-06-13 11:30',
    updateTime: '2025-06-13 11:30',
    status: '待审核',
    size: '1.2MB',
    downloads: 0
  },
  {
    id: 'DOC007',
    title: '校园文化建设方案',
    type: '文化建设',
    department: '宣传部',
    author: '周主任',
    createTime: '2025-06-07 15:20',
    updateTime: '2025-06-16 10:15',
    status: '已发布',
    size: '2.1MB',
    downloads: 67
  },
  {
    id: 'DOC008',
    title: '招生简章2025',
    type: '招生宣传',
    department: '招生办',
    author: '吴主任',
    createTime: '2025-06-14 13:45',
    updateTime: '2025-06-14 13:45',
    status: '待审核',
    size: '4.5MB',
    downloads: 0
  },
  {
    id: 'DOC009',
    title: '图书馆借阅规则',
    type: '管理制度',
    department: '图书馆',
    author: '郑主任',
    createTime: '2025-06-06 10:30',
    updateTime: '2025-06-12 16:20',
    status: '已发布',
    size: '0.9MB',
    downloads: 234
  },
  {
    id: 'DOC010',
    title: '后勤服务标准',
    type: '服务标准',
    department: '后勤处',
    author: '王主任',
    createTime: '2025-06-15 09:15',
    updateTime: '2025-06-15 09:15',
    status: '待审核',
    size: '1.6MB',
    downloads: 0
  },
  {
    id: 'DOC011',
    title: '科研项目管理办法',
    type: '科研管理',
    department: '科研处',
    author: '李主任',
    createTime: '2025-06-05 14:00',
    updateTime: '2025-06-17 11:45',
    status: '已发布',
    size: '2.8MB',
    downloads: 178
  },
  {
    id: 'DOC012',
    title: '国际交流合作协议',
    type: '合作协议',
    department: '国际交流处',
    author: '张主任',
    createTime: '2025-06-16 16:30',
    updateTime: '2025-06-16 16:30',
    status: '待审核',
    size: '3.1MB',
    downloads: 0
  }
])

// 获取文档类型标签样式
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '工作计划': 'primary',
    '制度文件': 'success',
    '学生管理': 'warning',
    '财务制度': 'danger',
    '安全制度': 'info',
    '培训计划': 'primary',
    '文化建设': 'success',
    '招生宣传': 'warning',
    '管理制度': 'danger',
    '服务标准': 'info',
    '科研管理': 'primary',
    '合作协议': 'success'
  }
  return typeMap[type] || 'info'
}

// 获取状态标签样式
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    '已发布': 'success',
    '待审核': 'warning',
    '已下架': 'danger'
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
  showDetailDialog.value = true
}

// 处理公文
const processDocument = (row: any) => {
  processForm.comment = ''
  processForm.nextHandler = ''
  processForm.result = 'approve'
  showProcessDialog.value = true
}

// 审批公文
const approveDocument = (row: any) => {
  ElMessage.info(`审批公文：${row.id}`)
}

// 查看流程
const viewFlow = (row: any) => {
  ElMessage.info(`查看公文流程：${row.id}`)
}

// 文件上传处理
const handleFileChange = (file: UploadFile) => {
  ElMessage.info(`选择文件：${file.name}`)
}

// 提交公文
const submitDocument = async () => {
  if (!documentFormRef.value) return
  
  try {
    await documentFormRef.value.validate()
    ElMessage.success('公文创建成功')
    showAddDialog.value = false
    // 重置表单
    Object.assign(documentForm, {
      title: '',
      type: '',
      sender: '',
      receiver: '',
      priority: '',
      security: '',
      content: ''
    })
    fileList.value = []
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

// 提交处理
const submitProcess = async () => {
  if (!processFormRef.value) return
  
  try {
    await processFormRef.value.validate()
    const resultText = processForm.result === 'approve' ? '同意' : 
                      processForm.result === 'reject' ? '退回' : '完成'
    ElMessage.success(`处理操作成功：${resultText}`)
    showProcessDialog.value = false
  } catch (error) {
    ElMessage.error('请完善处理信息')
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

// 下载
const downloadDocument = (row: any) => {
  ElMessage.success(`开始下载文档：${row.title}`)
  // 这里可以实现下载功能
}

// 编辑
const editDocument = (row: any) => {
  editForm.id = row.id
  editForm.title = row.title
  editForm.type = row.type
  editForm.department = row.department
  editForm.author = row.author
  editForm.status = row.status
  
  showEditDialog.value = true
}

// 删除
const deleteDocument = (row: any) => {
  ElMessageBox.confirm(`确认删除文档"${row.title}"？`, '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = documentList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      documentList.value.splice(index, 1)
      total.value = documentList.value.length
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 批量审核
const batchApprove = () => {
  const selectedRows = documentList.value.filter(item => item.status === '待审核')
  if (selectedRows.length === 0) {
    ElMessage.warning('没有待审核的文档')
    return
  }
  ElMessageBox.confirm(`确认批量审核通过 ${selectedRows.length} 个文档？`, '批量审核', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.forEach(row => {
      row.status = '已发布'
    })
    ElMessage.success('批量审核成功')
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

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    // 找到并更新数据
    const index = documentList.value.findIndex(item => item.id === editForm.id)
    if (index > -1) {
      // 更新数据
      documentList.value[index] = {
        ...documentList.value[index],
        title: editForm.title,
        type: editForm.type,
        department: editForm.department,
        author: editForm.author,
        status: editForm.status,
        updateTime: new Date().toLocaleString()
      }
      
      ElMessage.success('文档更新成功')
      showEditDialog.value = false
    }
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

onMounted(() => {
  total.value = documentList.value.length
})
</script>

<style scoped>
.document-container {
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

.stat-icon.primary {
  background-color: #ecf5ff;
  color: #409eff;
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

:deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.document-preview {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.preview-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.preview-actions {
  margin-top: 20px;
}
</style> 