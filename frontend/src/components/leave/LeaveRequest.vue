<template>
    <div class="leave-request">
      <!-- Component Header -->
      <div class="page-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h2>Request Leave</h2>
          <!-- Leave Balance Information -->
          <div class="leave-balance">
            <div class="card">
              <div class="card-body">
                <h6 class="mb-2">Available Leave Balance</h6>
                <div class="d-flex gap-3">
                  <div class="balance-item">
                    <span class="label">Casual</span>
                    <span class="value">{{ leaveBalance.casual }} days</span>
                  </div>
                  <div class="balance-item">
                    <span class="label">Medical</span>
                    <span class="value">{{ leaveBalance.medical }} days</span>
                  </div>
                  <div class="balance-item">
                    <span class="label">Other</span>
                    <span class="value">{{ leaveBalance.other }} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Leave Request Form -->
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="submitLeaveRequest" class="leave-form">
            <!-- Leave Type Selection -->
            <div class="mb-3">
              <label class="form-label">Leave Type</label>
              <select 
                v-model="leaveForm.type"
                class="form-select"
                :class="{ 'is-invalid': errors.type }"
                required
              >
                <option value="">Select Leave Type</option>
                <option value="casual">Casual Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="other">Other Leave</option>
              </select>
              <div class="invalid-feedback">{{ errors.type }}</div>
            </div>
  
            <!-- Date Range Selection -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">From Date</label>
                <input 
                  type="date"
                  class="form-control"
                  v-model="leaveForm.startDate"
                  :min="minDate"
                  :class="{ 'is-invalid': errors.startDate }"
                  required
                >
                <div class="invalid-feedback">{{ errors.startDate }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">To Date</label>
                <input 
                  type="date"
                  class="form-control"
                  v-model="leaveForm.endDate"
                  :min="leaveForm.startDate || minDate"
                  :class="{ 'is-invalid': errors.endDate }"
                  required
                >
                <div class="invalid-feedback">{{ errors.endDate }}</div>
              </div>
            </div>
  
            <!-- Duration Display -->
            <div class="mb-3">
              <div class="duration-display alert alert-info">
                Leave Duration: {{ calculateDuration }} days
              </div>
            </div>
  
            <!-- Reason for Leave -->
            <div class="mb-3">
              <label class="form-label">Reason for Leave</label>
              <textarea 
                class="form-control"
                v-model="leaveForm.reason"
                rows="3"
                :class="{ 'is-invalid': errors.reason }"
                required
              ></textarea>
              <div class="invalid-feedback">{{ errors.reason }}</div>
              <small class="text-muted">
                Please provide a detailed reason for your leave request.
              </small>
            </div>
  
            <!-- Supporting Documents Upload -->
            <div class="mb-3">
              <label class="form-label">
                Supporting Documents 
                <span class="text-muted">(Optional)</span>
              </label>
              <div class="input-group">
                <input 
                  type="file"
                  class="form-control"
                  @change="handleFileUpload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :class="{ 'is-invalid': errors.document }"
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="clearFile"
                >
                  Clear
                </button>
              </div>
              <div class="invalid-feedback">{{ errors.document }}</div>
              <small class="text-muted">
                Supported formats: PDF, JPG, PNG (Max size: 5MB)
              </small>
            </div>
  
            <!-- Emergency Contact -->
            <div class="mb-3">
              <label class="form-label">Emergency Contact</label>
              <input 
                type="tel"
                class="form-control"
                v-model="leaveForm.emergencyContact"
                placeholder="Enter emergency contact number"
                :class="{ 'is-invalid': errors.emergencyContact }"
              >
              <div class="invalid-feedback">{{ errors.emergencyContact }}</div>
            </div>
  
            <!-- Submit Button -->
            <div class="d-grid gap-2">
              <button 
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting || !isFormValid"
              >
                <span 
                  class="spinner-border spinner-border-sm me-2"
                  v-if="isSubmitting"
                ></span>
                {{ isSubmitting ? 'Submitting Request...' : 'Submit Leave Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Success Modal -->
      <div 
        class="modal fade" 
        id="successModal" 
        tabindex="-1"
        ref="successModal"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">Leave Request Submitted</h5>
              <button 
                type="button" 
                class="btn-close" 
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <p>Your leave request has been submitted successfully!</p>
              <div class="leave-summary">
                <p><strong>Leave Type:</strong> {{ leaveForm.type }}</p>
                <p><strong>Duration:</strong> {{ calculateDuration }} days</p>
                <p><strong>Status:</strong> Pending Approval</p>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="submitAnother"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  import { Modal } from 'bootstrap'
  import { useStore } from 'vuex'
  import { formatDate, calculateDateDifference } from '@/utils/dateHelpers'
  
  export default {
    name: 'LeaveRequest',
  
    setup() {
      const store = useStore()
      const successModal = ref(null)
  
      // Form data and state
      const leaveForm = ref({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContact: '',
        document: null
      })
  
      const errors = ref({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        document: '',
        emergencyContact: ''
      })
  
      const isSubmitting = ref(false)
      const leaveBalance = ref({
        casual: 10,
        medical: 15,
        other: 5
      })
  
      // Computed properties
      const minDate = computed(() => {
        return formatDate(new Date())
      })
  
      const calculateDuration = computed(() => {
        if (!leaveForm.value.startDate || !leaveForm.value.endDate) return 0
        return calculateDateDifference(
          leaveForm.value.startDate,
          leaveForm.value.endDate
        )
      })
  
      const isFormValid = computed(() => {
        return (
          leaveForm.value.type &&
          leaveForm.value.startDate &&
          leaveForm.value.endDate &&
          leaveForm.value.reason &&
          calculateDuration.value > 0
        )
      })
  
      // Methods
      const validateForm = () => {
        let isValid = true
        errors.value = {}
  
        // Validate leave type
        if (!leaveForm.value.type) {
          errors.value.type = 'Please select leave type'
          isValid = false
        }
  
        // Validate dates
        if (!leaveForm.value.startDate) {
          errors.value.startDate = 'Start date is required'
          isValid = false
        }
  
        if (!leaveForm.value.endDate) {
          errors.value.endDate = 'End date is required'
          isValid = false
        }
  
        // Validate reason
        if (!leaveForm.value.reason.trim()) {
          errors.value.reason = 'Please provide a reason for leave'
          isValid = false
        }
  
        // Validate file size if uploaded
        if (leaveForm.value.document && leaveForm.value.document.size > 5242880) {
          errors.value.document = 'File size should not exceed 5MB'
          isValid = false
        }
  
        // Validate emergency contact
        if (leaveForm.value.emergencyContact && !validatePhone(leaveForm.value.emergencyContact)) {
          errors.value.emergencyContact = 'Please enter a valid phone number'
          isValid = false
        }
  
        return isValid
      }
  
      const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
          if (file.size > 5242880) {
            errors.value.document = 'File size should not exceed 5MB'
            return
          }
          leaveForm.value.document = file
          errors.value.document = ''
        }
      }
  
      const clearFile = () => {
        leaveForm.value.document = null
        errors.value.document = ''
      }
  
      const submitLeaveRequest = async () => {
        if (!validateForm()) return
  
        try {
          isSubmitting.value = true
          
          // Create form data for file upload
          const formData = new FormData()
          formData.append('type', leaveForm.value.type)
          formData.append('startDate', leaveForm.value.startDate)
          formData.append('endDate', leaveForm.value.endDate)
          formData.append('reason', leaveForm.value.reason)
          formData.append('emergencyContact', leaveForm.value.emergencyContact)
          
          if (leaveForm.value.document) {
            formData.append('document', leaveForm.value.document)
          }
  
          await store.dispatch('submitLeaveRequest', formData)
          
          // Show success modal
          const modal = new Modal(successModal.value)
          modal.show()
          
          // Update store
          store.dispatch('fetchLeaveRequests')
        } catch (error) {
          store.commit('addNotification', {
            type: 'error',
            message: 'Failed to submit leave request'
          })
        } finally {
          isSubmitting.value = false
        }
      }
  
      const submitAnother = () => {
        // Reset form
        leaveForm.value = {
          type: '',
          startDate: '',
          endDate: '',
          reason: '',
          emergencyContact: '',
          document: null
        }
        errors.value = {}
        
        // Hide modal
        const modal = Modal.getInstance(successModal.value)
        modal.hide()
      }
  
      // Utility functions
      const validatePhone = (phone) => {
        const phoneRegex = /^\+?[\d\s-]{10,}$/
        return phoneRegex.test(phone)
      }
  
      return {
        leaveForm,
        errors,
        isSubmitting,
        leaveBalance,
        minDate,
        calculateDuration,
        isFormValid,
        successModal,
        handleFileUpload,
        clearFile,
        submitLeaveRequest,
        submitAnother
      }
    }
  }
  </script>
  
  <style scoped>
  .leave-request {
    padding: 20px;
  }
  
  .leave-balance .card {
    background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .balance-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .balance-item .label {
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .balance-item .value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
  }
  
  .duration-display {
    text-align: center;
    font-weight: 500;
  }
  
  .leave-summary {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-top: 15px;
  }
  
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .leave-balance {
      width: 100%;
    }
  }
  </style>