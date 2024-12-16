<template>
    <div class="leave-approval">
      <!-- Page Header with Statistics -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="stats-card">
            <div class="card">
              <div class="card-body">
                <h6>Pending Requests</h6>
                <h3 class="text-warning">{{ stats.pending }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stats-card">
            <div class="card">
              <div class="card-body">
                <h6>Approved Today</h6>
                <h3 class="text-success">{{ stats.approvedToday }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stats-card">
            <div class="card">
              <div class="card-body">
                <h6>Rejected Today</h6>
                <h3 class="text-danger">{{ stats.rejectedToday }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stats-card">
            <div class="card">
              <div class="card-body">
                <h6>On Leave Today</h6>
                <h3 class="text-info">{{ stats.onLeaveToday }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Filters Section -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select v-model="filters.status" class="form-select">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Department</label>
              <select v-model="filters.department" class="form-select">
                <option value="">All Departments</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Leave Type</label>
              <select v-model="filters.leaveType" class="form-select">
                <option value="">All Types</option>
                <option value="casual">Casual Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="other">Other Leave</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Date Range</label>
              <select v-model="filters.dateRange" class="form-select">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Leave Requests Table -->
      <div class="card">
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Leave Requests</h5>
            <button 
              class="btn btn-outline-primary btn-sm"
              @click="exportData"
            >
              Export Data
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in filteredRequests" :key="request.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar me-2">
                        {{ getInitials(request.employeeName) }}
                      </div>
                      <div>
                        <div class="fw-bold">{{ request.employeeName }}</div>
                        <small class="text-muted">{{ request.employeeId }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ request.department }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="getLeaveTypeBadgeClass(request.leaveType)"
                    >
                      {{ request.leaveType }}
                    </span>
                  </td>
                  <td>
                    <div>{{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}</div>
                    <small class="text-muted">{{ request.duration }} days</small>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(request.status)"
                    >
                      {{ request.status }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-link btn-sm"
                      v-if="request.hasDocuments"
                      @click="viewDocuments(request)"
                    >
                      View Documents
                    </button>
                    <span v-else>No documents</span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button 
                        class="btn btn-outline-primary btn-sm"
                        @click="viewDetails(request)"
                      >
                        View
                      </button>
                      <button 
                        class="btn btn-success btn-sm"
                        v-if="request.status === 'pending'"
                        @click="approveRequest(request)"
                      >
                        Approve
                      </button>
                      <button 
                        class="btn btn-danger btn-sm"
                        v-if="request.status === 'pending'"
                        @click="rejectRequest(request)"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Empty State -->
          <div 
            class="text-center py-4"
            v-if="!filteredRequests.length"
          >
            <p class="text-muted">No leave requests found matching your filters.</p>
          </div>
        </div>
      </div>
  
      <!-- Leave Details Modal -->
      <div 
        class="modal fade" 
        id="leaveDetailsModal" 
        tabindex="-1"
        ref="detailsModal"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Leave Request Details</h5>
              <button 
                type="button" 
                class="btn-close" 
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedRequest">
                <!-- Employee Details -->
                <div class="employee-details mb-4">
                  <h6>Employee Information</h6>
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Name:</strong> {{ selectedRequest.employeeName }}</p>
                      <p><strong>ID:</strong> {{ selectedRequest.employeeId }}</p>
                      <p><strong>Department:</strong> {{ selectedRequest.department }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Leave Balance:</strong></p>
                      <ul>
                        <li>Casual: {{ selectedRequest.leaveBalance.casual }}</li>
                        <li>Medical: {{ selectedRequest.leaveBalance.medical }}</li>
                        <li>Other: {{ selectedRequest.leaveBalance.other }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
  
                <!-- Leave Details -->
                <div class="leave-details mb-4">
                  <h6>Leave Information</h6>
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Type:</strong> {{ selectedRequest.leaveType }}</p>
                      <p><strong>Duration:</strong> {{ selectedRequest.duration }} days</p>
                      <p><strong>Dates:</strong> {{ formatDate(selectedRequest.startDate) }} - {{ formatDate(selectedRequest.endDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Status:</strong> {{ selectedRequest.status }}</p>
                      <p><strong>Applied On:</strong> {{ formatDate(selectedRequest.appliedDate) }}</p>
                      <p><strong>Emergency Contact:</strong> {{ selectedRequest.emergencyContact }}</p>
                    </div>
                  </div>
                </div>
  
                <!-- Reason -->
                <div class="reason mb-4">
                  <h6>Reason for Leave</h6>
                  <p>{{ selectedRequest.reason }}</p>
                </div>
  
                <!-- Documents -->
                <div class="documents mb-4" v-if="selectedRequest.hasDocuments">
                  <h6>Supporting Documents</h6>
                  <div class="document-list">
                    <div 
                      v-for="doc in selectedRequest.documents" 
                      :key="doc.id"
                      class="document-item"
                    >
                      <i class="bi bi-file-earmark"></i>
                      <span>{{ doc.name }}</span>
                      <button 
                        class="btn btn-link btn-sm"
                        @click="downloadDocument(doc)"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
  
                <!-- Approval Section -->
                <div class="approval-section" v-if="selectedRequest.status === 'pending'">
                  <h6>Approval Decision</h6>
                  <div class="mb-3">
                    <label class="form-label">Comments</label>
                    <textarea 
                      v-model="approvalComments"
                      class="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                  <div class="d-flex gap-2">
                    <button 
                      class="btn btn-success"
                      @click="approveRequest(selectedRequest)"
                    >
                      Approve Leave
                    </button>
                    <button 
                      class="btn btn-danger"
                      @click="rejectRequest(selectedRequest)"
                    >
                      Reject Leave
                    </button>
                  </div>
                </div>
  
                <!-- History -->
                <div class="history mt-4">
                  <h6>Request History</h6>
                  <div class="timeline">
                    <div 
                      v-for="event in selectedRequest.history" 
                      :key="event.id"
                      class="timeline-item"
                    >
                      <div class="timeline-date">{{ formatDate(event.date) }}</div>
                      <div class="timeline-content">
                        <p>{{ event.description }}</p>
                        <small class="text-muted">By {{ event.by }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useStore } from 'vuex'
import { formatDate } from '@/utils/dateHelpers'

export default {
  name: 'LeaveApproval',

  setup() {
    const store = useStore()
    const detailsModal = ref(null)
    
    // State Management
    const leaveRequests = ref([])
    const selectedRequest = ref(null)
    const approvalComments = ref('')
    const isLoading = ref(false)
    
    // Statistics tracking
    const stats = ref({
      pending: 0,
      approvedToday: 0,
      rejectedToday: 0,
      onLeaveToday: 0
    })

    // Filter states
    const filters = ref({
      status: 'pending',  // Default to showing pending requests
      department: '',
      leaveType: '',
      dateRange: 'week'
    })

    // Department list for filtering
    const departments = ref([
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'English' },
      { id: 4, name: 'Social Studies' }
    ])

    // Computed Properties
    const filteredRequests = computed(() => {
      let filtered = [...leaveRequests.value]

      // Apply status filter
      if (filters.value.status) {
        filtered = filtered.filter(request => 
          request.status === filters.value.status
        )
      }

      // Apply department filter
      if (filters.value.department) {
        filtered = filtered.filter(request => 
          request.department === filters.value.department
        )
      }

      // Apply leave type filter
      if (filters.value.leaveType) {
        filtered = filtered.filter(request => 
          request.leaveType === filters.value.leaveType
        )
      }

      // Apply date range filter
      const today = new Date()
      switch (filters.value.dateRange) {
        case 'today':
          filtered = filtered.filter(request => 
            formatDate(request.startDate) === formatDate(today)
          )
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(request => 
            new Date(request.startDate) >= weekAgo
          )
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(request => 
            new Date(request.startDate) >= monthAgo
          )
          break
      }

      return filtered
    })

    // Methods
    const loadLeaveRequests = async () => {
      try {
        isLoading.value = true
        const response = await store.dispatch('fetchLeaveRequests')
        leaveRequests.value = response
        updateStats()
      } catch (error) {
        store.commit('addNotification', {
          type: 'error',
          message: 'Failed to load leave requests'
        })
      } finally {
        isLoading.value = false
      }
    }

    const updateStats = () => {
      const today = formatDate(new Date())
      
      stats.value = {
        pending: leaveRequests.value.filter(r => r.status === 'pending').length,
        approvedToday: leaveRequests.value.filter(r => 
          r.status === 'approved' && 
          formatDate(r.approvedDate) === today
        ).length,
        rejectedToday: leaveRequests.value.filter(r => 
          r.status === 'rejected' && 
          formatDate(r.rejectedDate) === today
        ).length,
        onLeaveToday: leaveRequests.value.filter(r => 
          r.status === 'approved' && 
          new Date(r.startDate) <= new Date() && 
          new Date(r.endDate) >= new Date()
        ).length
      }
    }

    const viewDetails = (request) => {
      selectedRequest.value = request
      approvalComments.value = ''
      const modal = new Modal(detailsModal.value)
      modal.show()
    }

    const approveRequest = async (request) => {
      try {
        await store.dispatch('approveLeaveRequest', {
          requestId: request.id,
          comments: approvalComments.value
        })
        
        // Update local state
        const index = leaveRequests.value.findIndex(r => r.id === request.id)
        if (index !== -1) {
          leaveRequests.value[index].status = 'approved'
          leaveRequests.value[index].approvedDate = new Date()
        }
        
        updateStats()
        closeModal()
        
        store.commit('addNotification', {
          type: 'success',
          message: 'Leave request approved successfully'
        })
      } catch (error) {
        store.commit('addNotification', {
          type: 'error',
          message: 'Failed to approve leave request'
        })
      }
    }

    const rejectRequest = async (request) => {
      try {
        await store.dispatch('rejectLeaveRequest', {
          requestId: request.id,
          comments: approvalComments.value
        })
        
        // Update local state
        const index = leaveRequests.value.findIndex(r => r.id === request.id)
        if (index !== -1) {
          leaveRequests.value[index].status = 'rejected'
          leaveRequests.value[index].rejectedDate = new Date()
        }
        
        updateStats()
        closeModal()
        
        store.commit('addNotification', {
          type: 'success',
          message: 'Leave request rejected successfully'
        })
      } catch (error) {
        store.commit('addNotification', {
          type: 'error',
          message: 'Failed to reject leave request'
        })
      }
    }

    // Utility Methods
    const getInitials = (name) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        pending: 'bg-warning',
        approved: 'bg-success',
        rejected: 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    }

    const getLeaveTypeBadgeClass = (type) => {
      const classes = {
        casual: 'bg-info',
        medical: 'bg-primary',
        other: 'bg-secondary'
      }
      return classes[type] || 'bg-secondary'
    }

    const closeModal = () => {
      const modal = Modal.getInstance(detailsModal.value)
      if (modal) {
        modal.hide()
      }
    }

    // Lifecycle Hooks
    onMounted(() => {
      loadLeaveRequests()
    })

    return {
      stats,
      filters,
      departments,
      leaveRequests,
      filteredRequests,
      selectedRequest,
      approvalComments,
      detailsModal,
      formatDate,
      viewDetails,
      approveRequest,
      rejectRequest,
      getInitials,
      getStatusBadgeClass,
      getLeaveTypeBadgeClass
    }
  }
}
  </script>
  
  <style scoped>
  .leave-approval {
  padding: 20px;
}

.stats-card .card {
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.stats-card .card:hover {
  transform: translateY(-5px);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  margin-bottom: 20px;
}

.timeline-date {
  min-width: 120px;
  font-weight: 500;
  color: #6c757d;
}

.timeline-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-left: 20px;
  position: relative;
  flex: 1;
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #f8f9fa;
}

.document-list {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
}

.document-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 1rem;
  }
  
  .timeline-item {
    flex-direction: column;
  }
  
  .timeline-date {
    margin-bottom: 0.5rem;
  }
  
  .timeline-content {
    margin-left: 0;
  }
  
  .timeline-content::before {
    display: none;
  }
}
</style>