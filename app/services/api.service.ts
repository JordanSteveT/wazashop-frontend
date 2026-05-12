import { useApi } from "~/composables/useApi"

export const authService = {
  requestOtp: (phone: string) => useApi().post("/auth/request-otp", { phone }),
  verifyOtp: (phone: string, otp: string) => useApi().post("/auth/verify-otp", { phone, otp }),
}

export const productService = {
  getAll: () => useApi().get("/products").then((res) => res.data),
  getById: (id: string) => useApi().get(`/products/${id}`).then((res) => res.data),
  create: (formData: FormData) =>
    useApi().post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: Record<string, unknown>) => useApi().put(`/products/${id}`, data),
  delete: (id: string) => useApi().delete(`/products/${id}`),
}

export const categoryService = {
  getGlobal: () => useApi().get("/categories/global").then((res) => res.data),
  getMine: () => useApi().get("/categories/mine").then((res) => res.data),
  createMerchant: (name: string) => useApi().post("/categories/mine", { name }),
  deleteMerchant: (id: string) => useApi().delete(`/categories/mine/${id}`),
}

export const aiService = {
  generateDescription: (data: {
    title: string
    price: string | number
    category?: string
    attributes?: Record<string, unknown>
  }) => useApi().post("/ai/generate-description", data).then((res) => res.data),
}

export const userService = {
  getMe: () => useApi().get("/users/me").then((res) => res.data),
  update: (data: FormData | Record<string, unknown>) => useApi().put("/users/me", data).then((res) => res.data),
}

export const shopService = {
  getMine: () => useApi().get("/shops/mine").then((res) => res.data),
  create: (name: string) => useApi().post("/shops", { name }),
  update: (data: FormData | Record<string, unknown>) => {
    if (data instanceof FormData) {
      return useApi().put("/shops/mine", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    }

    return useApi().put("/shops/mine", data)
  },
}

export const flashSaleService = {
  getAll: () => useApi().get("/flash-sales").then((res) => res.data),
  create: (data: { name: string; discountPct: number; durationHours?: number }) =>
    useApi().post("/flash-sales", data).then((res) => res.data),
  verify: (code: string) => useApi().get(`/flash-sales/${code}/verify`).then((res) => res.data),
}

export const publicShopService = {
  getBySlug: (slug: string) => useApi().get(`/public/shops/${slug}`).then((res) => res.data),
  getProducts: (slug: string) => useApi().get(`/public/shops/${slug}/products`).then((res) => res.data),
  getProductById: (id: string) => useApi().get(`/public/products/${id}`).then((res) => res.data),
  negotiate: (productId: string, offeredPrice: number) =>
    useApi().post("/public/negotiate", { productId, offeredPrice }).then((res) => res.data),
}
