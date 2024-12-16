<template>
    <div class="app-wrapper">
      <!-- Navigation bar - shown only if user is logged in -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary" v-if="isLoggedIn">
        <div class="container-fluid">
          <router-link class="navbar-brand" to="/">
            <img src="@/assets/logo.png" alt="EduBridge" height="30" class="me-2">
            EduBridge
          </router-link>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Left side navigation items -->
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
              </li>
              
              <!-- Teacher specific links -->
              <li class="nav-item" v-if="userRole === 'teacher'">
                <router-link class="nav-link" to="/attendance">Attendance</router-link>
              </li>
              
              <!-- Common links for all logged-in users -->
              <li class="nav-item">
                <router-link class="nav-link" to="/leave">Leave</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/documents">Documents</router-link>
              </li>
            </ul>
  
            <!-- Right side navigation items -->
            <ul class="navbar-nav">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" 
                   role="button" data-bs-toggle="dropdown">
                  {{ userName }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  
      <!-- Main content area -->
      <div class="container-fluid main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App',
    
    data() {
      return {
        isLoggedIn: false,
        userRole: '',
        userName: ''
      }
    },
  
    created() {
      // Check authentication status on app creation
      this.checkAuth()
    },
  
    methods: {
      checkAuth() {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (userData) {
          this.isLoggedIn = true
          this.userRole = userData.role
          this.userName = userData.name
        }
      },
  
      logout() {
        localStorage.removeItem('user')
        this.isLoggedIn = false
        this.userRole = ''
        this.userName = ''
        this.$router.push('/login')
      }
    },
  
    watch: {
      // Watch for route changes to check auth status
      '$route'(to) {
        // Update authentication check on route change
        this.checkAuth()
        
        // Redirect to login if trying to access protected route while logged out
        if (!this.isLoggedIn && to.meta.requiresAuth) {
          this.$router.push('/login')
        }
      }
    }
  }
  </script>
  
  <style>
  .app-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
  }
  
  .navbar {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .main-content {
    flex: 1;
    padding: 20px;
  }
  
  /* Transition animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>