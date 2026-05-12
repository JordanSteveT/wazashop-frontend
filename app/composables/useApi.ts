import axios from "axios"
import type { AxiosInstance } from "axios"

let apiInstance: AxiosInstance | null = null

export const useApi = () => {
  const config = useRuntimeConfig()

  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: config.public.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    })

    apiInstance.interceptors.request.use(
      (requestConfig) => {
        if (import.meta.client) {
          const token = localStorage.getItem("wazashop_token")
          if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`
          }
        }

        return requestConfig
      },
      (error) => Promise.reject(error),
    )

    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (import.meta.client && error.response?.status === 401) {
          localStorage.removeItem("wazashop_token")
          window.location.href = "/"
        }

        return Promise.reject(error)
      },
    )
  }

  return apiInstance
}
