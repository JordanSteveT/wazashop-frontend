import api from '../lib/api';

// --- AUTH ---
export const authService = {
  requestOtp: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
};

// --- PRODUCTS ---
export const productService = {
  getAll: () => api.get('/products').then(res => res.data),
  getById: (id: string) => api.get(`/products/${id}`).then(res => res.data),
  create: (formData: FormData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// --- CATEGORIES ---
export const categoryService = {
  getGlobal: () => api.get('/categories/global').then(res => res.data),
  getMine: () => api.get('/categories/mine').then(res => res.data),
  createMerchant: (name: string) => api.post('/categories/mine', { name }),
  deleteMerchant: (id: string) => api.delete(`/categories/mine/${id}`),
};

// --- AI ---
export const aiService = {
  generateDescription: (data: { title: string, price: any, category?: string, attributes?: any }) => 
    api.post('/ai/generate-description', data).then(res => res.data),
};

// --- USER ---
export const userService = {
  getMe: () => api.get('/users/me').then(res => res.data),
  update: (data: any) => api.put('/users/me', data),
};

// --- SHOP ---
export const shopService = {
  getMine: () => api.get('/shops/mine').then(res => res.data),
  create: (name: string) => api.post('/shops', { name }),
  update: (data: any) => {
    if (data instanceof FormData) {
      return api.put('/shops/mine', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put('/shops/mine', data);
  },
};

// --- FLASH SALES ---
export const flashSaleService = {
  getAll: () => api.get('/flash-sales').then(res => res.data),
  create: (data: { name: string, discountPct: number, durationHours?: number }) => 
    api.post('/flash-sales', data).then(res => res.data),
  verify: (code: string) => api.get(`/flash-sales/${code}/verify`).then(res => res.data),
};

// --- PUBLIC SHOP (CLIENT SIDE) ---
export const publicShopService = {
  getBySlug: (slug: string) => api.get(`/public/shops/${slug}`).then(res => res.data),
  getProducts: (slug: string) => api.get(`/public/shops/${slug}/products`).then(res => res.data),
  getProductById: (id: string) => api.get(`/public/products/${id}`).then(res => res.data),
  negotiate: (productId: string, offeredPrice: number) => 
    api.post('/public/negotiate', { productId, offeredPrice }).then(res => res.data),
};
