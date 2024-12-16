<template>
    <div class="leave-status">
      <!-- Overview Cards Section -->
      <div class="row mb-4">
        <!-- Leave Balance Card -->
        <div class="col-md-4">
          <div class="card overview-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3">Available Leave Balance</h6>
              <div class="balance-chart">
                <div class="balance-item">
                  <div class="progress-circle" :style="getProgressStyle(leaveBalance.casual, 12)">
                    <span>{{ leaveBalance.casual }}</span>
                  </div>
                  <div class="balance-label">Casual</div>
                </div>
                <div class="balance-item">
                  <div class="progress-circle" :style="getProgressStyle(leaveBalance.medical, 15)">
                    <span>{{ leaveBalance.medical }}</span>
                  </div>
                  <div class="balance-label">Medical</div>
                </div>
                <div class="balance-item">
                  <div class="progress-circle" :style="getProgressStyle(leaveBalance.other, 5)">
                    <span>{{ leaveBalance.other }}</span>
                  </div>
                  <div class="balance-label">Other</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Current Status Card -->
        <div class="col-md-4">
          <div class="card overview-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3">Leave Status</h6>
              <div class="status-summary">
                <div class="status-item">
                  <div class="status-label">Pending</div>
                  <div class="status-value text-warning">{{ stats.pending }}</div>
                </div>
                <div class="status-item">
                  <div class="status-label">Approved</div>
                  <div class="status-value text-success">{{ stats.approved }}</div>
                </div>
                <div class="status-item">
                  <div class="status-label">Rejected</div>
                  <div class="status-value text-danger">{{ stats.rejected }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Quick Actions Card -->
        <div class="col-md-4">
          <div class="card overview-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3">Quick Actions</h6>
              <div class="d-grid gap-2">
                <button 
                  class="btn btn-primary"
                  @click="$router.push('/leave/request')"
                >
                  Request New Leave
                </button>
                <button 
                  class="btn btn-outline-secondary"
                  @click="downloadHistory"
                >
                  Download History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Leave History Section -->
      <div class="card">
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Leave History</h5>
            
            <!-- Year Filter -->
            <select 
              v-model="selectedYear"
              class="form-select form-select-sm w-auto"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="card-body">
          <!-- Timeline View -->
          <div class="leave-timeline mb-4">
            <div 
              v-for="request in yearlyLeaveHistory" 
              :key="request.id"
              class="timeline-item"
              :class="getStatusClass(request.status)"
            >
              <div class="timeline-badge">
                <i class="bi" :class="getStatusIcon(request.status)"></i>
              </div>
              <div class="timeline-content">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ request.leaveType }} Leave</h6>
                    <p class="mb-1">{{ formatDateRange(request.startDate, request.endDate) }}</p>
                    <p class="text-muted mb-1">{{ request.reason }}</p>
                  </div>
                  <span 
                    class="badge"
                    :class="getStatusBadgeClass(request.status)"
                  >
                    {{ request.status }}
                  </span>
                </div>
                
                <!-- Status Updates -->
                <div class="status-updates mt-2" v-if="request.updates.length">
                  <div 
                    v-for="update in request.updates" 
                    :key="update.id"
                    class="status-update"
                  >
                    <small class="text-muted">
                      {{ update.message }} - {{ formatDate(update.date) }}
                    </small>
                  </div>
                </div>
  
                <!-- Action Buttons -->
                <div class="action-buttons mt-2">
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="viewDetails(request)"
                  >
                    View Details
                  </button>
                  <button 
                    class="btn btn-sm btn-danger"
                    v-if="request.status === 'pending'"
                    @click="cancelRequest(request)"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Empty State -->
          <div 
            class="text-center py-4"
            v-if="!yearlyLeaveHistory.length"
          >
            <p class="text-muted">No leave history found for {{ selectedYear }}</p>
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
        <div class="modal-dialog">
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
              <div v-if="selectedRequest" class="leave-details">
                <!-- Request Information -->
                <div class="info-section mb-3">
                  <h6>Leave Information</h6>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Type:</span>
                      <span class="value">{{ selectedRequest.leaveType }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Duration:</span>
                      <span class="value">{{ selectedRequest.duration }} days</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Status:</span>
                      <span 
                        class="badge"
                        :class="getStatusBadgeClass(selectedRequest.status)"
                      >
                        {{ selectedRequest.status }}
                      </span>
                    </div>
                  </div>
                </div>
  
                <!-- Dates -->
                <div class="date-section mb-3">
                  <div class="date-grid">
                    <div class="date-item">
                      <i class="bi bi-calendar-event"></i>
                      <div>
                        <small>Start Date</small>
                        <div>{{ formatDate(selectedRequest.startDate) }}</div>
                      </div>
                    </div>
                    <div class="date-item">
                      <i class="bi bi-calendar-check"></i>
                      <div>
                        <small>End Date</small>
                        <div>{{ formatDate(selectedRequest.endDate) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <!-- Reason -->
                <div class="reason-section mb-3">
                  <h6>Reason</h6>
                  <p>{{ selectedRequest.reason }}</p>
                </div>
  
                <!-- Review Comments -->
                <div class="comments-section mb-3" v-if="selectedRequest.comments">
                  <h6>Review Comments</h6>
                  <p>{{ selectedRequest.comments }}</p>
                </div>
  
                <!-- Documents -->
                <div 
                  class="documents-section mb-3" 
                  v-if="selectedRequest.documents?.length"
                >
                  <h6>Attached Documents</h6>
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
  
                <!-- Timeline -->
                <div class="timeline-section">
                  <h6>Request Timeline</h6>
                  <div class="request-timeline">
                    <div 
                      v-for="event in selectedRequest.timeline" 
                      :key="event.id"
                      class="timeline-event"
                    >
                      <div class="event-time">{{ formatDate(event.timestamp) }}</div>
                      <div class="event-details">
                        <div class="event-description">{{ event.description }}</div>
                        <small class="text-muted">{{ event.by }}</small>
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
import { formatDate, calculateDateDifference } from '@/utils/dateHelpers'

export default {
  name: 'LeaveStatus',

  setup() {
    // Initialize store and refs for managing component state
    const store = useStore()
    const detailsModal = ref(null)
    const selectedRequest = ref(null)

    // Track the available leave balance for different types
    const leaveBalance = ref({
      casual: 10,   // Starting balance for casual leave
      medical: 15,  // Starting balance for medical leave
      other: 5      // Starting balance for other leave types
    })

    // Track statistics for different leave request statuses
    const stats = ref({
      pending: 0,
      approved: 0,
      rejected: 0
    })

    // Store the complete leave history
    const leaveHistory = ref([])
    
    // Track the selected year for filtering
    const selectedYear = ref(new Date().getFullYear())

    // Compute the list of available years from the leave history
    const availableYears = computed(() => {
      // Extract unique years from leave history and sort in descending order
      const years = [...new Set(leaveHistory.value.map(request => 
        new Date(request.startDate).getFullYear()
      ))]
      return years.sort((a, b) => b - a)
    })

    // Filter leave history based on selected year
    const yearlyLeaveHistory = computed(() => {
      return leaveHistory.value.filter(request => 
        new Date(request.startDate).getFullYear() === selectedYear.value
      ).sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    })

    // Load initial data when component mounts
    onMounted(async () => {
      await Promise.all([
        loadLeaveBalance(),
        loadLeaveHistory()
      ])
      updateStats()
    })

    // Fetch current leave balance from the server
    const loadLeaveBalance = async () => {
      try {
        const response = await store.dispatch('fetchLeaveBalance')
        leaveBalance.value = response
      } catch (error) {
        store.commit('addNotification', {
          type: 'error',
          message: 'Failed to load leave balance'
        })
      }
    }

    // Fetch leave history from the server
    const loadLeaveHistory = async () => {
      try {
        const response = await store.dispatch('fetchLeaveHistory')
        leaveHistory.value = response
      } catch (error) {
        store.commit('addNotification', {
          type: 'error',
          message: 'Failed to load leave history'
        })
      }
    }

    // Calculate and update leave request statistics
    const updateStats = () => {
      stats.value = {
        pending: leaveHistory.value.filter(r => r.status === 'pending').length,
        approved: leaveHistory.value.filter(r => r.status === 'approved').length,
        rejected: leaveHistory.value.filter(r => r.status === 'rejected').length
      }
    }

    // Show detailed view of a leave request
    const viewDetails = (request) => {
      selectedRequest.value = request
      const modal = new Modal(detailsModal.value)
      modal.show()
    }

    // Handle cancellation of a pending leave request
    const cancelRequest = async (request) => {
      if (!confirm('Are you sure you want to cancel this leave request?')) {
        return
      }

      try {
        await store.dispatch('cancelLeaveRequest', request.id)
        
        // Update local state after successful cancellation
        const index = leaveHistory.value.findIndex(r => r.id === request.id)
        if (index !== -1) {
          leaveHistory.value[index].status = 'cancelled'
        }
        
        updateStats()
        
        store.commit('addNotification', {
          type: 'success',
          message: 'Leave request cancelled successfully'
        })
      } catch (error) {
        store.commit('addNotification', {
          type: 'error',
          message: 'Failed to cancel leave request'
        })
      }
    }

    // Generate styling for the circular progress indicators
    const getProgressStyle = (current, total) => {
      const percentage = (current / total) * 100
      return {
        background: `conic-gradient(
          var(--bs-primary) ${percentage}%,
          #e9ecef ${percentage}%
        )`
      }
    }

    // Generate appropriate status classes for visual styling
    const getStatusClass = (status) => {
      return {
        'timeline-pending': status === 'pending',
        'timeline-approved': status === 'approved',
        'timeline-rejected': status === 'rejected'
      }
    }

    // Get appropriate icon for different status types
    const getStatusIcon = (status) => {
      const icons = {
        pending: 'bi-hourglass-split',
        approved: 'bi-check-circle',
        rejected: 'bi-x-circle'
      }
      return icons[status] || 'bi-circle'
    }

    // Generate badge classes for status indicators
    const getStatusBadgeClass = (status) => {
      const classes = {
        pending: 'bg-warning',
        approved: 'bg-success',
        rejected: 'bg-danger',
        cancelled: 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    }

    // Format a date range for display
    const formatDateRange = (start, end) => {
      return `${formatDate(start)} - ${formatDate(end)}`
    }

    // Handle downloading of leave history
    const downloadHistory = () => {
      // Implementation for exporting leave history to Excel/PDF
      console.log('Downloading leave history...')
    }

    return {
      leaveBalance,
      stats,
      selectedYear,
      availableYears,
      yearlyLeaveHistory,
      selectedRequest,
      detailsModal,
      getProgressStyle,
      getStatusClass,
      getStatusIcon,
      getStatusBadgeClass,
      viewDetails,
      cancelRequest,
      formatDate,
      formatDateRange,
      downloadHistory
    }
  }
}
</script>
  
  <style scoped>
  // Style section will continue in the next message...
  </style>