import axios from 'axios'
import { LocalStorage } from 'quasar'
const BASEURL = 'api'
const service = axios.create({
  baseURL: BASEURL
  // timeout: 6000
})
// 請求攔截器
service.interceptors.request.use(
  (config) => {
    const token = LocalStorage.getItem('accessToken')
    if (token && token !== ''){
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
// 響應攔截器
service.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return error
  }
)
export default service