<script setup lang="ts">
import {
  AlertTriangle,
  Edit2,
  Filter,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-vue-next"
import { categoryService, productService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const router = useRouter()

const products = ref<any[]>([])
const globalCats = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref("")
const selectedGlobalCat = ref("all")

const fetchData = async () => {
  try {
    const [productsData, categoriesData] = await Promise.all([
      productService.getAll(),
      categoryService.getGlobal(),
    ])
    products.value = productsData
    globalCats.value = categoriesData
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
    return
  }

  try {
    await productService.delete(id)
    products.value = products.value.filter((product) => product.id !== id)
  } catch (error) {
    console.error(error)
  }
}

const filteredProducts = computed(() =>
  products.value.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesCategory =
      selectedGlobalCat.value === "all" || product.global_category_id === selectedGlobalCat.value

    return matchesSearch && matchesCategory
  }),
)

const getStockStatus = (stock: number) => {
  if (stock <= 0) {
    return { label: "Rupture", color: "bg-red-100 text-red-700 border-red-200" }
  }

  if (stock <= 5) {
    return { label: "Stock faible", color: "bg-orange-100 text-orange-700 border-orange-200" }
  }

  return { label: "En stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
}

onMounted(fetchData)
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-gray-900">
          Mon Catalogue
        </h1>
        <p class="font-medium text-gray-500">
          Gerez vos articles et optimisez vos stocks.
        </p>
      </div>

      <button
        class="flex items-center justify-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 hover:bg-emerald-700"
        type="button"
        @click="router.push('/dashboard/products/new')"
      >
        <Plus :size="20" />
        <span>Ajouter un produit</span>
      </button>
    </div>

    <div class="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
      <div class="relative flex-1">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          :size="20"
        />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher un produit..."
          class="w-full rounded-2xl border-none bg-gray-50 py-3 pl-12 pr-4 font-medium text-gray-700 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
        >
      </div>

      <div class="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        <Filter
          class="mr-2 shrink-0 text-gray-400"
          :size="20"
        />
        <button
          type="button"
          class="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all"
          :class="selectedGlobalCat === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          @click="selectedGlobalCat = 'all'"
        >
          Tous
        </button>
        <button
          v-for="cat in globalCats"
          :key="cat.id"
          type="button"
          class="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all"
          :class="selectedGlobalCat === cat.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          @click="selectedGlobalCat = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="index in 4"
        :key="index"
        class="h-80 rounded-3xl border border-gray-100 bg-white animate-pulse"
      />
    </div>

    <div
      v-else-if="filteredProducts.length === 0"
      class="flex flex-col items-center rounded-[40px] border-2 border-dashed border-gray-200 bg-white p-20 text-center"
    >
      <div class="mb-6 rounded-full bg-emerald-50 p-6">
        <Package class="h-12 w-12 text-emerald-600" />
      </div>
      <h3 class="mb-2 text-2xl font-black text-gray-900">
        Aucun produit trouve
      </h3>
      <p class="mb-8 max-w-sm font-medium text-gray-500">
        {{ searchTerm || selectedGlobalCat !== "all"
          ? "Ajustez vos filtres pour trouver ce que vous cherchez."
          : "Commencez par ajouter votre premier produit pour lancer votre boutique !" }}
      </p>
      <button
        v-if="!searchTerm && selectedGlobalCat === 'all'"
        type="button"
        class="rounded-2xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105"
        @click="router.push('/dashboard/products/new')"
      >
        + Ajouter mon premier produit
      </button>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="group flex flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/5"
      >
        <div class="relative h-56 overflow-hidden bg-gray-50">
          <img
            v-if="product.media_urls?.length"
            :src="product.media_urls[0]"
            :alt="product.title"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-gray-50"
          >
            <ImageIcon class="h-12 w-12 text-gray-200" />
          </div>

          <div
            v-if="product.globalCategory"
            class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-700 shadow-sm backdrop-blur-sm"
          >
            {{ product.globalCategory.name }}
          </div>

          <div class="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              class="rounded-2xl bg-white p-3 text-gray-700 shadow-xl transition-all hover:bg-emerald-600 hover:text-white"
              @click="router.push(`/dashboard/products/${product.id}/edit`)"
            >
              <Edit2 :size="18" />
            </button>
            <button
              type="button"
              class="rounded-2xl bg-white p-3 text-gray-700 shadow-xl transition-all hover:bg-red-600 hover:text-white"
              @click="handleDelete(product.id)"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </div>

        <div class="flex flex-1 flex-col p-6">
          <div class="flex-1">
            <h3 class="mb-2 line-clamp-2 text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-emerald-600">
              {{ product.title }}
            </h3>

            <div class="mb-4 flex items-center gap-2">
              <div
                class="rounded-full border px-3 py-1 text-[10px] font-bold"
                :class="getStockStatus(product.stock).color"
              >
                {{ getStockStatus(product.stock).label }}: {{ product.stock }}
              </div>
              <AlertTriangle
                v-if="product.stock <= 5 && product.stock > 0"
                :size="14"
                class="text-orange-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-gray-50 pt-4">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Prix</span>
              <span class="text-xl font-black text-gray-900">
                {{ product.price_public.toLocaleString() }}
                <span class="text-xs">F</span>
              </span>
            </div>

            <div
              v-if="product.merchantCategory"
              class="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-gray-400"
            >
              <Tag :size="12" />
              <span class="max-w-[80px] truncate text-[10px] font-bold">
                {{ product.merchantCategory.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
