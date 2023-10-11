import axios from 'axios'
import router from '@/router'
import store from '@/store'

//  Establishaxios An actual example
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

//  Adding a request interceptor
api.interceptors.request.use((config) => {
  //  In the request header, addtoken
  const token = store.state.auth.token
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  return config
})

//  Adding a response interceptor
api.interceptors.response.use((response) => {
  return response.data
}, (error) => {
  if (!error.response) {
    //  Request timeout
    return Promise.reject(error)
  }
  else if (error.response.status === 403) {
    //  Clearing login status information
    store.dispatch('auth/clearToken')

    // token Validation failure， Jump to login page
    router.push('/login')
  }

  return Promise.reject(error)
})

export default api
