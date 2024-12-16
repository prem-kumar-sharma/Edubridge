<template>
    <div class="attendance-marking">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h2>Mark Attendance</h2>
        <div class="d-flex gap-2">
          <div class="current-date">
            {{ formattedCurrentDate }}
          </div>
          <div class="current-time">
            {{ currentTime }}
          </div>
        </div>
      </div>
  
      <!-- Class Selection Form -->
      <div class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="loadStudents" class="row align-items-end">
            <!-- Class Selection -->
            <div class="col-md-4 mb-3">
              <label class="form-label">Select Class</label>
              <select 
                v-model="selectedClass" 
                class="form-select"
                required
              >
                <option value="">Choose a class</option>
                <option 
                  v-for="class in classes" 
                  :key="class.id" 
                  :value="class.id"
                >
                  {{ class.name }}
                </option>
              </select>
            </div>
  
            <!-- Subject Selection -->
            <div class="col-md-4 mb-3">
              <label class="form-label">Select Subject</label>
              <select 
                v-model="selectedSubject"
                class="form-select"
                required
              >
                <option value="">Choose a subject</option>
                <option 
                  v-for="subject in subjects" 
                  :key="subject.id" 
                  :value="subject.id"
                >
                  {{ subject.name }}
                </option>
              </select>
            </div>
  
            <!-- Load Students Button -->
            <div class="col-md-4 mb-3">
              <button 
                type="submit" 
                class="btn btn-primary w-100"
                :disabled="isLoading"
              >
                <span 
                  class="spinner-border spinner-border-sm me-2" 
                  v-if="isLoading"
                ></span>
                Load Students
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Attendance Marking Section -->
      <div class="card" v-if="students.length">
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Mark Attendance</h5>
            <div class="attendance-summary">
              Present: {{ presentCount }} | Absent: {{ absentCount }} | Total: {{ students.length }}
            </div>
          </div>
        </div>
        
        <div class="card-body">
          <form @submit.prevent="submitAttendance">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in students" :key="student.id">
                    <td>{{ student.rollNo }}</td>
                    <td>{{ student.name }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <input 
                          type="radio" 
                          class="btn-check"
                          :name="`attendance-${student.id}`"
                          :id="`present-${student.id}`"
                          value="present"
                          v-model="attendance[student.id]"
                        >
                        <label 
                          class="btn btn-outline-success"
                          :for="`present-${student.id}`"
                        >
                          Present
                        </label>
  
                        <input 
                          type="radio" 
                          class="btn-check"
                          :name="`attendance-${student.id}`"
                          :id="`absent-${student.id}`"
                          value="absent"
                          v-model="attendance[student.id]"
                        >
                        <label 
                          class="btn btn-outline-danger"
                          :for="`absent-${student.id}`"
                        >
                          Absent
                        </label>
  
                        <input 
                          type="radio" 
                          class="btn-check"
                          :name="`attendance-${student.id}`"
                          :id="`late-${student.id}`"
                          value="late"
                          v-model="attendance[student.id]"
                        >
                        <label 
                          class="btn btn-outline-warning"
                          :for="`late-${student.id}`"
                        >
                          Late
                        </label>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="form-control form-control-sm"
                        v-model="remarks[student.id]"
                        placeholder="Add remarks (optional)"
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <!-- Quick Actions -->
            <div class="d-flex gap-2 mb-3">
              <button 
                type="button" 
                class="btn btn-outline-success"
                @click="markAllPresent"
              >
                Mark All Present
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                @click="resetAttendance"
              >
                Reset All
              </button>
            </div>
  
            <!-- Submit Button -->
            <div class="d-grid">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isSubmitting || !hasChanges"
              >
                <span 
                  class="spinner-border spinner-border-sm me-2" 
                  v-if="isSubmitting"
                ></span>
                {{ isSubmitting ? 'Submitting...' : 'Submit Attendance' }}
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
              <h5 class="modal-title">Success</h5>
              <button 
                type="button" 
                class="btn-close" 
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              Attendance has been marked successfully!
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
                @click="markAnotherClass"
              >
                Mark Another Class
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { Modal } from 'bootstrap'
  import axios from 'axios'
  import { useStore } from 'vuex'
  import { formatDate, formatTime } from '@/utils/dateHelpers'
  
  export default {
    name: 'AttendanceMarking',
    
    setup() {
      const store = useStore()
      const successModal = ref(null)
  
      // Form data
      const selectedClass = ref('')
      const selectedSubject = ref('')
      const students = ref([])
      const attendance = ref({})
      const remarks = ref({})
      const isLoading = ref(false)
      const isSubmitting = ref(false)
  
      // Time tracking
      const currentTime = ref(formatTime(new Date()))
      const formattedCurrentDate = computed(() => formatDate(new Date()))
  
      // Computed properties
      const presentCount = computed(() => 
        Object.values(attendance.value).filter(status => status === 'present').length
      )
  
      const absentCount = computed(() => 
        Object.values(attendance.value).filter(status => status === 'absent').length
      )
  
      const hasChanges = computed(() => 
        Object.keys(attendance.value).length > 0
      )
  
      // Methods
      const loadStudents = async () => {
        if (!selectedClass.value || !selectedSubject.value) return
        
        try {
          isLoading.value = true
          const response = await axios.get(`/api/class/${selectedClass.value}/students`)
          students.value = response.data
          
          // Initialize attendance object
          students.value.forEach(student => {
            attendance.value[student.id] = ''
            remarks.value[student.id] = ''
          })
        } catch (error) {
          store.commit('addNotification', {
            type: 'error',
            message: 'Failed to load students'
          })
        } finally {
          isLoading.value = false
        }
      }
  
      const submitAttendance = async () => {
        try {
          isSubmitting.value = true
          
          // Prepare attendance data
          const attendanceData = Object.entries(attendance.value).map(([studentId, status]) => ({
            studentId,
            status,
            remarks: remarks.value[studentId],
            classId: selectedClass.value,
            subjectId: selectedSubject.value,
            date: new Date().toISOString()
          }))
  
          await axios.post('/api/attendance/mark', attendanceData)
          
          // Show success modal
          const modal = new Modal(successModal.value)
          modal.show()
          
          // Update store
          store.dispatch('fetchAttendanceRecords')
        } catch (error) {
          store.commit('addNotification', {
            type: 'error',
            message: 'Failed to submit attendance'
          })
        } finally {
          isSubmitting.value = false
        }
      }
  
      const markAllPresent = () => {
        students.value.forEach(student => {
          attendance.value[student.id] = 'present'
        })
      }
  
      const resetAttendance = () => {
        students.value.forEach(student => {
          attendance.value[student.id] = ''
          remarks.value[student.id] = ''
        })
      }
  
      const markAnotherClass = () => {
        // Reset form
        selectedClass.value = ''
        selectedSubject.value = ''
        students.value = []
        attendance.value = {}
        remarks.value = {}
        
        // Hide modal
        const modal = Modal.getInstance(successModal.value)
        modal.hide()
      }
  
      // Time update interval
      onMounted(() => {
        const timeInterval = setInterval(() => {
          currentTime.value = formatTime(new Date())
        }, 1000)
  
        // Cleanup interval on component unmount
        return () => clearInterval(timeInterval)
      })
  
      return {
        selectedClass,
        selectedSubject,
        students,
        attendance,
        remarks,
        isLoading,
        isSubmitting,
        currentTime,
        formattedCurrentDate,
        presentCount,
        absentCount,
        hasChanges,
        successModal,
        loadStudents,
        submitAttendance,
        markAllPresent,
        resetAttendance,
        markAnotherClass
      }
    }
  }
  </script>
  
  <style scoped>
  .attendance-marking {
    padding: 20px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .current-date,
  .current-time {
    font-size: 1.1rem;
    font-weight: 500;
    color: #6c757d;
  }
  
  .attendance-summary {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .table th {
    background-color: #f8f9fa;
  }
  
  .btn-check:checked + .btn-outline-success {
    background-color: #198754;
    color: white;
  }
  
  .btn-check:checked + .btn-outline-danger {
    background-color: #dc3545;
    color: white;
  }
  
  .btn-check:checked + .btn-outline-warning {
    background-color: #ffc107;
    color: black;
  }
  
  @media (max-width: 768px) {
    .btn-group {
      display: flex;
      flex-direction: column;
    }
    
    .btn-group .btn {
      width: 100%;
      margin: 2px 0;
    }
  }
  </style>