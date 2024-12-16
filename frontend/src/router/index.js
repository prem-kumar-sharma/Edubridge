import { createRouter, createWebHistory } from 'vue-router'

// Import auth components
import Login from '@/components/auth/Login.vue'
import Register from '@/components/auth/Register.vue'

// Import dashboard components
import TeacherDashboard from '@/components/dashboard/TeacherDashboard.vue'
import StudentDashboard from '@/components/dashboard/StudentDashboard.vue'
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue'
import ClerkDashboard from '@/components/dashboard/ClerkDashboard.vue'

// Import attendance components
import AttendanceMarking from '@/components/attendance/AttendanceMarking.vue'
import AttendanceReport from '@/components/attendance/AttendanceReport.vue'

// Import leave management components
import LeaveRequest from '@/components/leave/LeaveRequest.vue'
import LeaveApproval from '@/components/leave/LeaveApproval.vue'
import LeaveStatus from '@/components/leave/LeaveStatus.vue'

// Import document management components
import DocumentUpload from '@/components/documents/DocumentUpload.vue'
import DocumentList from '@/components/documents/DocumentList.vue'

// Router authentication guard
const requireAuth = (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if (!user) {
    // Redirect to login if not authenticated
    next({ 
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    // Check role authorization
    next({ path: '/unauthorized' })
  } else {
    next()
  }
}

const routes = [
  // Public routes
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: 'Login - EduBridge',
      requiresAuth: false 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      title: 'Register - EduBridge',
      requiresAuth: false 
    }
  },

  // Protected routes - Dashboard
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: {
      requiresAuth: true,
      roles: ['teacher'],
      title: 'Teacher Dashboard'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: {
      requiresAuth: true,
      roles: ['student'],
      title: 'Student Dashboard'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Admin Dashboard'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/clerk/dashboard',
    name: 'ClerkDashboard',
    component: ClerkDashboard,
    meta: {
      requiresAuth: true,
      roles: ['clerk'],
      title: 'Clerk Dashboard'
    },
    beforeEnter: requireAuth
  },

  // Attendance routes
  {
    path: '/attendance/mark',
    name: 'AttendanceMarking',
    component: AttendanceMarking,
    meta: {
      requiresAuth: true,
      roles: ['teacher'],
      title: 'Mark Attendance'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/attendance/report',
    name: 'AttendanceReport',
    component: AttendanceReport,
    meta: {
      requiresAuth: true,
      roles: ['teacher', 'admin'],
      title: 'Attendance Report'
    },
    beforeEnter: requireAuth
  },

  // Leave management routes
  {
    path: '/leave/request',
    name: 'LeaveRequest',
    component: LeaveRequest,
    meta: {
      requiresAuth: true,
      roles: ['teacher', 'student', 'clerk'],
      title: 'Request Leave'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/leave/approval',
    name: 'LeaveApproval',
    component: LeaveApproval,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Leave Approval'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/leave/status',
    name: 'LeaveStatus',
    component: LeaveStatus,
    meta: {
      requiresAuth: true,
      title: 'Leave Status'
    },
    beforeEnter: requireAuth
  },

  // Document management routes
  {
    path: '/documents/upload',
    name: 'DocumentUpload',
    component: DocumentUpload,
    meta: {
      requiresAuth: true,
      title: 'Upload Document'
    },
    beforeEnter: requireAuth
  },
  {
    path: '/documents/list',
    name: 'DocumentList',
    component: DocumentList,
    meta: {
      requiresAuth: true,
      title: 'Document List'
    },
    beforeEnter: requireAuth
  },

  // Error routes
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/components/error/Unauthorized.vue'),
    meta: { title: 'Unauthorized Access' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/error/NotFound.vue'),
    meta: { title: 'Page Not Found' }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = to.meta.title || 'EduBridge'
  
  // Handle navigation
  next()
})

export default router