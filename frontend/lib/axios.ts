import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001', // ✅ Your NestJS server
})

// ✅ Interceptor for including token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('✅ Token added to request:', token)
      } else {
        console.log('❌ No token found or config.headers missing')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
