<template>
    <div class="attendance-report">
      <!-- Page Header with Export Options -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Attendance Report</h2>
        <div class="btn-group">
          <button 
            class="btn btn-outline-primary"
            @click="exportPDF"
            :disabled="!hasData"
          >
            <i class="bi bi-file-pdf"></i> Export PDF
          </button>
          <button 
            class="btn btn-outline-success"
            @click="exportExcel"
            :disabled="!hasData"
          >
            <i class="bi bi-file-excel"></i> Export Excel
          </button>
        </div>
      </div>
  
      <!-- Filters Section -->
      <div class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="generateReport" class="row g-3">
            <!-- Date Range Selection -->
            <div class="col-md-4">
              <label class="form-label">Date Range</label>
              <select v-model="dateRange" class="form-select">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
  
            <!-- Custom Date Range -->
            <div class="col-md-4" v-if="dateRange === 'custom'">
              <label class="form-label">Start Date</label>
              <input 
                type="date" 
                class="form-control"
                v-model="startDate"
                :max="endDate"
              >
            </div>
            <div class="col-md-4" v-if="dateRange === 'custom'">
              <label class="form-label">End Date</label>
              <input 
                type="date" 
                class="form-control"
                v-model="endDate"
                :min="startDate"
              >
            </div>
  
            <!-- Class Selection -->
            <div class="col-md-4">
              <label class="form-label">Class</label>
              <select v-model="selectedClass" class="form-select">
                <option value="">All Classes</option>
                <option 
                  v-for="class in classes" 
                  :key="class.id" 
                  :value="class.id"
                >
                  {{ class.name }}
                </option>
              </select>
            </div>
  
            <!-- Generate Report Button -->
            <div class="col-12">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <span 
                  class="spinner-border spinner-border-sm me-2"
                  v-if="isLoading"
                ></span>
                Generate Report
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Statistics Cards -->
      <div class="row mb-4" v-if="hasData">
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Total Students</h6>
              <h3 class="card-title">{{ statistics.totalStudents }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Average Attendance</h6>
              <h3 class="card-title">{{ statistics.averageAttendance }}%</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Present Today</h6>
              <h3 class="card-title">{{ statistics.presentToday }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Absent Today</h6>
              <h3 class="card-title">{{ statistics.absentToday }}</h3>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Attendance Chart -->
      <div class="card mb-4" v-if="hasData">
        <div class="card-body">
          <canvas ref="attendanceChart"></canvas>
        </div>
      </div>
  
      <!-- Detailed Report Table -->
      <div class="card" v-if="hasData">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Total Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Attendance %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in reportData" :key="student.id">
                  <td>{{ student.rollNo }}</td>
                  <td>{{ student.name }}</td>
                  <td>{{ student.totalClasses }}</td>
                  <td>{{ student.present }}</td>
                  <td>{{ student.absent }}</td>
                  <td>{{ student.late }}</td>
                  <td>
                    <div class="attendance-percentage">
                      <div 
                        class="progress"
                        style="height: 20px;"
                      >
                        <div 
                          class="progress-bar"
                          :class="getProgressBarClass(student.percentage)"
                          :style="{ width: `${student.percentage}%` }"
                        >
                          {{ student.percentage }}%
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="viewDetails(student.id)"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- No Data Message -->
      <div 
        class="alert alert-info text-center"
        v-if="!hasData && !isLoading"
      >
        Please select filters and generate the report to view attendance data.
      </div>
  
      <!-- Student Details Modal -->
      <div 
        class="modal fade" 
        id="studentDetailsModal" 
        tabindex="-1"
        ref="studentModal"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Student Attendance Details</h5>
              <button 
                type="button" 
                class="btn-close" 
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedStudent">
                <!-- Student Information -->
                <div class="student-info mb-4">
                  <h6>{{ selectedStudent.name }}</h6>
                  <p class="text-muted">Roll No: {{ selectedStudent.rollNo }}</p>
                </div>
  
                <!-- Calendar View -->
                <div class="calendar-view mb-4">
                  <!-- Calendar implementation goes here -->
                </div>
  
                <!-- Attendance History -->
                <div class="attendance-history">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="record in selectedStudent.history" :key="record.date">
                        <td>{{ formatDate(record.date) }}</td>
                        <td>
                          <span 
                            class="badge"
                            :class="getStatusBadgeClass(record.status)"
                          >
                            {{ record.status }}
                          </span>
                        </td>
                        <td>{{ record.remarks || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
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
  import Chart from 'chart.js/auto'
  import { useStore } from 'vuex'
  import { formatDate } from '@/utils/dateHelpers'
  import { exportToPDF, exportToExcel } from '@/utils/exportHelpers'
  
  export default {
    name: 'AttendanceReport',
  
    setup() {
      const store = useStore()
      const attendanceChart = ref(null)
      const studentModal = ref(null)
      const chartInstance = ref(null)
  
      // Form data and state
      const dateRange = ref('month')
      const startDate = ref('')
      const endDate = ref('')
      const selectedClass = ref('')
      const isLoading = ref(false)
      const reportData = ref([])
      const selectedStudent = ref(null)
  
      // Computed properties
      const hasData = computed(() => reportData.value.length > 0)
  
      const statistics = computed(() => {
        if (!hasData.value) return {
          totalStudents: 0,
          averageAttendance: 0,
          presentToday: 0,
          absentToday: 0
        }
  
        // Calculate statistics from reportData
        const total = reportData.value.length
        const avgAttendance = reportData.value.reduce((acc, curr) => 
          acc + curr.percentage, 0) / total
  
        return {
          totalStudents: total,
          averageAttendance: avgAttendance.toFixed(1),
          presentToday: reportData.value.filter(s => s.todayStatus === 'present').length,
          absentToday: reportData.value.filter(s => s.todayStatus === 'absent').length
        }
      })
  
      // Methods
      const generateReport = async () => {
        try {
          isLoading.value = true
          const response = await store.dispatch('fetchAttendanceReport', {
            dateRange: dateRange.value,
            startDate: startDate.value,
            endDate: endDate.value,
            classId: selectedClass.value
          })
  
          reportData.value = response
          updateChart()
        } catch (error) {
          store.commit('addNotification', {
            type: 'error',
            message: 'Failed to generate report'
          })
        } finally {
          isLoading.value = false
        }
      }
  
      const updateChart = () => {
        if (chartInstance.value) {
          chartInstance.value.destroy()
        }
  
        const ctx = attendanceChart.value.getContext('2d')
        chartInstance.value = new Chart(ctx, {
          type: 'line',
          data: {
            labels: getDates(),
            datasets: [{
              label: 'Attendance Rate',
              data: getAttendanceData(),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Daily Attendance Trend'
              }
            }
          }
        })
      }
  
      const viewDetails = async (studentId) => {
        try {
          const response = await store.dispatch('fetchStudentAttendanceDetails', studentId)
          selectedStudent.value = response
          const modal = new Modal(studentModal.value)
          modal.show()
        } catch (error) {
          store.commit('addNotification', {
            type: 'error',
            message: 'Failed to load student details'
          })
        }
      }
  
      const exportPDF = () => {
        exportToPDF(reportData.value, 'Attendance_Report')
      }
  
      const exportExcel = () => {
        exportToExcel(reportData.value, 'Attendance_Report')
      }
  
      // Utility methods
      const getProgressBarClass = (percentage) => {
        if (percentage >= 90) return 'bg-success'
        if (percentage >= 75) return 'bg-info'
        if (percentage >= 60) return 'bg-warning'
        return 'bg-danger'
      }
  
      const getStatusBadgeClass = (status) => {
        const classes = {
          present: 'bg-success',
          absent: 'bg-danger',
          late: 'bg-warning'
        }
        return classes[status] || 'bg-secondary'
      }
  
      return {
        dateRange,
        startDate,
        endDate,
        selectedClass,
        isLoading,
        reportData,
        statistics,
        hasData,
        selectedStudent,
        attendanceChart,
        studentModal,
        generateReport,
        viewDetails,
        exportPDF,
        exportExcel,
        getProgressBarClass,
        getStatusBadgeClass,
        formatDate
      }
    }
  }
  </script>
  
  <style scoped>
  .attendance-report {
    padding: 20px;
  }
  
  .stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
  }
  
  .attendance-percentage {
    width: 150px;
  }
  
  .progress {
    background-color: #e9ecef;
    border-radius: 10px;
  }
  
  .progress-bar {
    border-radius: 10px;
    transition: width 0.6s ease;
  }
  
  .calendar-view {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
  }
  
  @media (max-width: 768px) {
    .btn-group {
      display: flex;
      flex-direction: column;
    }
    
    .attendance-percentage {
      width: 100px;
    }
  }
  </style>