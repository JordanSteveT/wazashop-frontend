export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) {
    return
  }

  const token = localStorage.getItem("wazashop_token")
  if (token) {
    return navigateTo("/dashboard")
  }
})
