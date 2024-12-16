import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// Set default axios config
axios.defaults.baseURL = 'http://localhost:5000'

// Create Vue application
const app = createApp(App)

// Use router and store
app.use(router)
app.use(store)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
    console.error('Global error:', err)
    // You could add error reporting service here
}

// Mount the application
app.mount('#app')