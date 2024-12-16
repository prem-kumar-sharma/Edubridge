<template>
    <div class="auth-container">
      <div class="card register-card">
        <!-- Registration Header -->
        <div class="card-header text-center bg-primary text-white">
          <img src="@/assets/logo.png" alt="EduBridge" height="40" class="mb-2">
          <h3 class="mb-0">Create New Account</h3>
        </div>
  
        <div class="card-body">
          <form @submit.prevent="handleRegistration" class="registration-form">
            <!-- Personal Information Section -->
            <div class="section-title mb-3">
              <h5>Personal Information</h5>
            </div>
  
            <div class="row">
              <!-- First Name -->
              <div class="col-md-6 mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  id="firstName"
                  v-model="formData.firstName"
                  :class="{ 'is-invalid': errors.firstName }"
                  required
                >
                <div class="invalid-feedback">{{ errors.firstName }}</div>
              </div>
  
              <!-- Last Name -->
              <div class="col-md-6 mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  id="lastName"
                  v-model="formData.lastName"
                  :class="{ 'is-invalid': errors.lastName }"
                  required
                >
                <div class="invalid-feedback">{{ errors.lastName }}</div>
              </div>
            </div>
  
            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email Address</label>
              <input 
                type="email" 
                class="form-control"
                id="email"
                v-model="formData.email"
                :class="{ 'is-invalid': errors.email }"
                required
              >
              <div class="invalid-feedback">{{ errors.email }}</div>
              <small class="text-muted">This will be used for account recovery</small>
            </div>
  
            <!-- Role Selection -->
            <div class="mb-3">
              <label class="form-label">Register As</label>
              <select 
                v-model="formData.role"
                class="form-select"
                :class="{ 'is-invalid': errors.role }"
                required
              >
                <option value="">Select Role</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="clerk">Clerk</option>
              </select>
              <div class="invalid-feedback">{{ errors.role }}</div>
            </div>
  
            <!-- Account Information Section -->
            <div class="section-title mb-3 mt-4">
              <h5>Account Information</h5>
            </div>
  
            <!-- Username -->
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input 
                type="text" 
                class="form-control"
                id="username"
                v-model="formData.username"
                :class="{ 'is-invalid': errors.username }"
                @input="checkUsername"
                required
              >
              <div class="invalid-feedback">{{ errors.username }}</div>
              <small class="text-muted">Username must be unique and at least 5 characters</small>
            </div>
  
            <!-- Password -->
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <div class="input-group">
                <input 
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  :class="{ 'is-invalid': errors.password }"
                  required
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="togglePassword"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
                <div class="invalid-feedback">{{ errors.password }}</div>
              </div>
              <small class="text-muted">
                Password must be at least 8 characters and include numbers and special characters
              </small>
            </div>
  
            <!-- Confirm Password -->
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input 
                type="password" 
                class="form-control"
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :class="{ 'is-invalid': errors.confirmPassword }"
                required
              >
              <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
            </div>
  
            <!-- Terms and Conditions -->
            <div class="mb-3 form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="terms"
                v-model="formData.acceptTerms"
                :class="{ 'is-invalid': errors.acceptTerms }"
              >
              <label class="form-check-label" for="terms">
                I agree to the Terms and Conditions
              </label>
              <div class="invalid-feedback">{{ errors.acceptTerms }}</div>
            </div>
  
            <!-- Submit Button -->
            <div class="d-grid gap-2">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <span 
                  class="spinner-border spinner-border-sm me-2" 
                  v-if="isLoading"
                ></span>
                {{ isLoading ? 'Creating Account...' : 'Register' }}
              </button>
            </div>
  
            <!-- Error Alert -->
            <div 
              class="alert alert-danger mt-3" 
              v-if="error"
            >
              {{ error }}
            </div>
          </form>
  
          <!-- Login Link -->
          <div class="text-center mt-3">
            <p class="mb-0">
              Already have an account? 
              <router-link to="/login">Login here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    name: 'Register',
    
    data() {
      return {
        formData: {
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
          acceptTerms: false
        },
        errors: {
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
          acceptTerms: ''
        },
        isLoading: false,
        error: '',
        showPassword: false
      }
    },
  
    methods: {
      togglePassword() {
        this.showPassword = !this.showPassword
      },
  
      async checkUsername() {
        if (this.formData.username.length < 5) {
          this.errors.username = 'Username must be at least 5 characters'
          return
        }
  
        try {
          const response = await axios.get(`/check-username/${this.formData.username}`)
          if (response.data.exists) {
            this.errors.username = 'Username already taken'
          } else {
            this.errors.username = ''
          }
        } catch (err) {
          console.error('Error checking username:', err)
        }
      },
  
      validateForm() {
        let isValid = true
        this.errors = {
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
          acceptTerms: ''
        }
  
        // Validate first name
        if (!this.formData.firstName.trim()) {
          this.errors.firstName = 'First name is required'
          isValid = false
        }
  
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.formData.email)) {
          this.errors.email = 'Please enter a valid email address'
          isValid = false
        }
  
        // Validate password strength
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        if (!passwordRegex.test(this.formData.password)) {
          this.errors.password = 'Password must meet complexity requirements'
          isValid = false
        }
  
        // Validate password confirmation
        if (this.formData.password !== this.formData.confirmPassword) {
          this.errors.confirmPassword = 'Passwords do not match'
          isValid = false
        }
  
        // Validate terms acceptance
        if (!this.formData.acceptTerms) {
          this.errors.acceptTerms = 'You must accept the terms and conditions'
          isValid = false
        }
  
        return isValid
      },
  
      async handleRegistration() {
        if (!this.validateForm()) return
  
        this.isLoading = true
        this.error = ''
  
        try {
          const response = await axios.post('/register', {
            firstName: this.formData.firstName,
            lastName: this.formData.lastName,
            email: this.formData.email,
            username: this.formData.username,
            password: this.formData.password,
            role: this.formData.role
          })
  
          // Show success and redirect to login
          this.$router.push({
            path: '/login',
            query: { 
              registered: 'true',
              username: this.formData.username
            }
          })
        } catch (err) {
          this.error = err.response?.data?.message || 'Registration failed. Please try again.'
        } finally {
          this.isLoading = false
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0396FF 0%, #ABDCFF 100%);
    padding: 20px;
  }
  
  .register-card {
    width: 100%;
    max-width: 600px;
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    border-radius: 10px 10px 0 0;
    padding: 2rem 1rem;
  }
  
  .section-title {
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
  }
  
  .registration-form {
    padding: 1rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 576px) {
    .register-card {
      margin: 10px;
    }
  }
  </style>