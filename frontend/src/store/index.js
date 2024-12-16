import { createStore } from 'vuex'
import axios from 'axios'

// Create a new store instance
export default createStore({
  // State holds our application's shared data
  state: {
    // User authentication and profile information
    user: {
      id: null,
      username: null,
      role: null,
      token: null,
      firstName: null,
      lastName: null
    },
    
    // UI state management
    isLoading: false,
    notifications: [],
    
    // Application data
    attendanceRecords: [],
    leaveRequests: [],
    documents: [],
    
    // Dashboard data
    dashboardStats: {
      totalStudents: 0,
      totalTeachers: 0,
      attendanceRate: 0,
      pendingLeaves: 0
    }
  },

  // Mutations are functions that directly change the state
  mutations: {
    // User mutations
    setUser(state, userData) {
      state.user = { ...state.user, ...userData }
    },

    clearUser(state) {
      state.user = {
        id: null,
        username: null,
        role: null,
        token: null,
        firstName: null,
        lastName: null
      }
    },

    // Loading state mutations
    setLoading(state, status) {
      state.isLoading = status
    },

    // Notification mutations
    addNotification(state, notification) {
      state.notifications.push({
        id: Date.now(),
        ...notification
      })
    },

    removeNotification(state, notificationId) {
      state.notifications = state.notifications.filter(n => n.id !== notificationId)
    },

    // Data mutations
    setAttendanceRecords(state, records) {
      state.attendanceRecords = records
    },

    setLeaveRequests(state, requests) {
      state.leaveRequests = requests
    },

    setDocuments(state, documents) {
      state.documents = documents
    },

    setDashboardStats(state, stats) {
      state.dashboardStats = stats
    }
  },

  // Actions are functions that can perform asynchronous operations
  actions: {
    // Authentication actions
    async login({ commit }, credentials) {
      try {
        commit('setLoading', true)
        const response = await axios.post('/login', credentials)
        
        // Store user data
        commit('setUser', response.data.user)
        
        // Store token in localStorage
        localStorage.setItem('token', response.data.token)
        
        return response.data
      } catch (error) {
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async logout({ commit }) {
      // Clear user data from store
      commit('clearUser')
      
      // Remove token from localStorage
      localStorage.removeItem('token')
      
      // Clear any cached data
      commit('setAttendanceRecords', [])
      commit('setLeaveRequests', [])
      commit('setDocuments', [])
    },

    // Data fetching actions
    async fetchDashboardStats({ commit, state }) {
      try {
        commit('setLoading', true)
        const response = await axios.get(`/api/${state.user.role}/dashboard-stats`)
        commit('setDashboardStats', response.data)
      } catch (error) {
        commit('addNotification', {
          type: 'error',
          message: 'Failed to load dashboard statistics'
        })
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async fetchAttendanceRecords({ commit, state }) {
      try {
        const response = await axios.get('/api/attendance/records')
        commit('setAttendanceRecords', response.data)
      } catch (error) {
        commit('addNotification', {
          type: 'error',
          message: 'Failed to load attendance records'
        })
        throw error
      }
    },

    async fetchLeaveRequests({ commit }) {
      try {
        const response = await axios.get('/api/leave/requests')
        commit('setLeaveRequests', response.data)
      } catch (error) {
        commit('addNotification', {
          type: 'error',
          message: 'Failed to load leave requests'
        })
        throw error
      }
    }
  },

  // Getters are like computed properties for stores
  getters: {
    isAuthenticated: state => !!state.user.token,
    
    userRole: state => state.user.role,
    
    fullName: state => {
      if (state.user.firstName && state.user.lastName) {
        return `${state.user.firstName} ${state.user.lastName}`
      }
      return state.user.username
    },

    pendingLeaveRequests: state => {
      return state.leaveRequests.filter(request => request.status === 'pending')
    },

    attendanceStatistics: state => {
      // Calculate attendance statistics
      const total = state.attendanceRecords.length
      const present = state.attendanceRecords.filter(r => r.status === 'present').length
      
      return {
        total,
        present,
        rate: total ? (present / total) * 100 : 0
      }
    },

    recentDocuments: state => {
      // Return 5 most recent documents
      return [...state.documents]
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 5)
    }
  }
})