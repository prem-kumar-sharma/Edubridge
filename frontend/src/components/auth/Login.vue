<template>
    <div class="auth-container">
      <div class="card login-card">
        <!-- Card Header with Logo -->
        <div class="card-header text-center bg-primary text-white">
          <img src="@/assets/logo.png" alt="EduBridge" height="40" class="mb-2">
          <h3 class="mb-0">Welcome to EduBridge</h3>
        </div>
  
        <!-- Login Form -->
        <div class="card-body">
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Role Selection -->
            <div class="mb-3">
              <label class="form-label">Login As</label>
              <select 
                v-model="role" 
                class="form-select"
                @change="clearErrors"
                required
              >
                <option value="">Select Role</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
                <option value="clerk">Clerk</option>
              </select>
              <small class="text-muted">
                Select your role to access appropriate features
              </small>
            </div>
  
            <!-- Username Field -->
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input 
                type="text" 
                class="form-control" 
                id="username" 
                v-model="username"
                @input="clearErrors"
                :class="{ 'is-invalid': errors.username }"
                required
              >
              <div class="invalid-feedback">{{ errors.username }}</div>
            </div>
  
            <!-- Password Field -->
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <div class="input-group">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="password" 
                  v-model="password"
                  @input="clearErrors"
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
            </div>
  
            <!-- Remember Me Checkbox -->
            <div class="mb-3 form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="remember" 
                v-model="rememberMe"
              >
              <label class="form-check-label" for="remember">
                Remember me
              </label>
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
                {{ isLoading ? 'Logging in...' : 'Login' }}
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
  
          <!-- Registration Link -->
          <div class="text-center mt-3">
            <p class="mb-0">
              Don't have an account? 
              <router-link to="/register">Register here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    name: 'Login',
    
    data() {
      return {
        username: '',
        password: '',
        role: '',
        rememberMe: false,
        showPassword: false,
        isLoading: false,
        error: '',
        errors: {
          username: '',
          password: ''
        }
      }
    },
  
    methods: {
      clearErrors() {
        this.error = ''
        this.errors = {
          username: '',
          password: ''
        }
      },
  
      togglePassword() {
        this.showPassword = !this.showPassword
      },
  
      validateForm() {
        let isValid = true
        this.clearErrors()
  
        if (!this.username.trim()) {
          this.errors.username = 'Username is required'
          isValid = false
        }
  
        if (!this.password) {
          this.errors.password = 'Password is required'
          isValid = false
        }
  
        if (!this.role) {
          this.error = 'Please select your role'
          isValid = false
        }
  
        return isValid
      },
  
      async handleLogin() {
        if (!this.validateForm()) return
  
        this.isLoading = true
        this.error = ''
  
        try {
          const response = await axios.post('/login', {
            username: this.username,
            password: this.password,
            role: this.role
          })
  
          // Store user data
          const userData = {
            ...response.data.user,
            token: response.data.token
          }
          
          if (this.rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData))
          } else {
            sessionStorage.setItem('user', JSON.stringify(userData))
          }
  
          // Update store
          this.$store.commit('setUser', userData)
  
          // Redirect based on role
          this.$router.push(`/${this.role}/dashboard`)
          
        } catch (err) {
          this.error = err.response?.data?.message || 'Login failed. Please try again.'
        } finally {
          this.isLoading = false
        }
      }
    },
  
    // Clear sensitive data when component is destroyed
    beforeUnmount() {
      this.username = ''
      this.password = ''
      this.role = ''
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
  
  .login-card {
    width: 100%;
    max-width: 400px;
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    border-radius: 10px 10px 0 0;
    padding: 2rem 1rem;
  }
  
  .login-form {
    padding: 1rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 576px) {
    .login-card {
      margin: 10px;
    }
  }
  </style>