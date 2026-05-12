<script setup lang="ts">
import {
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-vue-next"
import { publicShopService } from "~/services/api.service"
import { publicShopThemes } from "~/utils/themes"
import { normalizeWhatsappNumber } from "~/utils/whatsapp"

const route = useRoute()

const shop = ref<any | null>(null)
const products = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref("")

const fetchData = async () => {
  try {
    const slug = route.params.slug as string
    const [shopData, productsData] = await Promise.all([
      publicShopService.getBySlug(slug),
      publicShopService.getProducts(slug),
    ])
    shop.value = shopData
    products.value = productsData
  } catch (error) {
    console.error("Error fetching shop data:", error)
  } finally {
    loading.value = false
  }
}

const prefs = computed(() => shop.value?.preferences || {})
const currentTheme = computed(() => {
  const key = prefs.value.theme as keyof typeof publicShopThemes
  return publicShopThemes[key] || publicShopThemes.serieux
})
const layout = computed(() => prefs.value.layout || "grid")

const filteredProducts = computed(() =>
  products.value.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

const whatsappLink = computed(() => `https://wa.me/${normalizeWhatsappNumber(shop.value?.whatsappBusiness)}`)

onMounted(fetchData)
</script>

<template>
  <div
    v-if="loading"
    class="flex h-screen flex-col items-center justify-center gap-4 bg-white"
  >
    <div class="relative h-16 w-16">
      <div class="absolute inset-0 rounded-full border-4 border-gray-100" />
      <div class="absolute inset-0 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
    <p class="text-xs font-black uppercase tracking-widest text-gray-400">
      WazaShop
    </p>
  </div>

  <div
    v-else-if="!shop"
    class="flex h-screen items-center justify-center text-2xl font-black"
  >
    Boutique non trouvee.
  </div>

  <div
    v-else
    class="min-h-screen bg-white pb-20"
  >
    <div
      class="relative h-64 w-full overflow-hidden md:h-80"
      :class="currentTheme.primary"
    >
      <img
        v-if="shop.bannerUrl"
        :src="shop.bannerUrl"
        class="h-full w-full object-cover opacity-60"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-6 pb-8 md:flex-row md:items-end md:px-20 md:pb-12">
        <div class="h-24 w-24 shrink-0 overflow-hidden rounded-[32px] border-4 border-white bg-white p-1 shadow-2xl md:h-32 md:w-32 md:rounded-[40px]">
          <img
            v-if="shop.logoUrl"
            :src="shop.logoUrl"
            class="h-full w-full rounded-[24px] object-cover md:rounded-[32px]"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center rounded-[24px] md:rounded-[32px]"
            :class="currentTheme.primary"
          >
            <Store
              :size="40"
              class="text-white"
            />
          </div>
        </div>

        <div class="flex-1 space-y-2 text-center md:text-left">
          <h1 class="text-3xl font-black tracking-tighter text-white drop-shadow-lg md:text-5xl">
            {{ shop.name }}
          </h1>
          <div class="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <div
              class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest md:text-xs"
              :class="currentTheme.accent"
            >
              <Phone
                :size="12"
                fill="currentColor"
              />
              {{ shop.whatsappBusiness }}
            </div>
            <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/70 md:text-xs">
              <MapPin :size="12" />
              {{ shop.address || "Cameroun" }}
            </div>
          </div>
        </div>

        <div class="hidden gap-4 md:flex">
          <a
            :href="whatsappLink"
            target="_blank"
            class="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-black text-gray-900 shadow-xl transition-all hover:scale-105"
          >
            <MessageCircle :size="20" />
            Discuter
          </a>
        </div>
      </div>
    </div>

    <div class="mx-auto mt-12 max-w-7xl space-y-12 px-6 md:px-20">
      <div class="flex flex-col items-start justify-between gap-8 md:flex-row">
        <div class="max-w-2xl space-y-4">
          <h2
            class="text-xs font-black uppercase tracking-[0.3em]"
            :class="currentTheme.text"
          >
            A propos de nous
          </h2>
          <p class="text-lg font-medium italic leading-relaxed text-gray-500 md:text-xl">
            "{{ shop.description || "Bienvenue dans notre boutique officielle. Nous vous proposons le meilleur rapport qualite-prix du marche." }}"
          </p>
          <div class="flex items-center gap-3 text-xs font-bold text-gray-400">
            <Clock
              :size="16"
              class="text-blue-500"
            />
            Ouvert : {{ prefs.hours || "08:00 - 19:00" }}
          </div>
        </div>

        <div class="relative w-full md:w-80">
          <Search
            class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            :size="20"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-4 pl-14 pr-6 font-bold outline-none transition-all shadow-sm focus:border-emerald-500 focus:bg-white"
          >
        </div>
      </div>

      <section
        v-if="prefs.showStories !== false"
        class="space-y-6"
      >
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-3 text-xl font-black text-gray-900">
            <Sparkles
              :size="24"
              class="text-amber-500"
            />
            Les Arrivages du jour
          </h3>
          <div class="mx-8 hidden h-px flex-1 bg-gray-100 md:block" />
        </div>
        <div class="scrollbar-hide flex gap-6 overflow-x-auto px-2 pb-4">
          <div
            v-for="index in 6"
            :key="index"
            class="h-20 w-20 shrink-0 cursor-pointer rounded-[32px] border-4 p-1 shadow-lg transition-all hover:scale-105 md:h-28 md:w-28 md:rounded-[40px]"
            :class="currentTheme.border"
          >
            <div class="h-full w-full overflow-hidden rounded-[24px] bg-gray-50 md:rounded-[32px]">
              <img
                :src="`https://picsum.photos/seed/${index + 10}/200`"
                class="h-full w-full object-cover opacity-80"
              >
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-8">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-black text-gray-900">
            Notre Catalogue
          </h3>
          <div class="flex gap-4 text-gray-300">
            <LayoutGrid
              :size="24"
              :class="layout === 'grid' ? 'text-gray-900' : ''"
            />
            <List
              :size="24"
              :class="layout === 'list' ? 'text-gray-900' : ''"
            />
          </div>
        </div>

        <div
          v-if="filteredProducts.length === 0"
          class="space-y-4 rounded-[48px] bg-gray-50 py-20 text-center"
        >
          <Search
            :size="48"
            class="mx-auto text-gray-200"
          />
          <p class="text-sm font-black uppercase tracking-widest text-gray-400">
            Aucun produit ne correspond a votre recherche.
          </p>
        </div>

        <div
          v-else
          class="grid gap-8"
          :class="layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'"
        >
          <NuxtLink
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/shop/${route.params.slug}/p/${product.id}`"
            class="group flex flex-col overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            :class="layout === 'list' ? 'h-48 flex-row md:h-64' : ''"
          >
            <div
              class="relative shrink-0 overflow-hidden bg-gray-50"
              :class="layout === 'list' ? 'w-48 md:w-64' : 'h-64'"
            >
              <img
                v-if="product.media_urls?.[0]"
                :src="product.media_urls[0]"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Store
                  :size="40"
                  class="text-gray-200"
                />
              </div>
              <div class="absolute right-4 top-4 rounded-2xl bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md">
                <span class="font-black text-gray-900 md:text-base">
                  {{ product.price_public.toLocaleString() }}
                  <span class="text-[10px] text-gray-400">FCFA</span>
                </span>
              </div>
            </div>

            <div class="flex flex-1 flex-col justify-between p-6">
              <div>
                <h4 class="line-clamp-2 font-black leading-tight text-gray-900 md:text-lg">
                  {{ product.title }}
                </h4>
                <p
                  v-if="layout === 'list'"
                  class="mt-2 line-clamp-3 text-sm text-gray-400"
                >
                  {{ product.description }}
                </p>
              </div>
              <div class="mt-4 flex items-center justify-between">
                <div
                  class="text-[10px] font-black uppercase tracking-widest"
                  :class="currentTheme.text"
                >
                  Voir details
                </div>
                <div
                  class="rounded-2xl p-3 text-white shadow-lg"
                  :class="currentTheme.button"
                >
                  <ChevronRight :size="18" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-8 border-t border-gray-100 pt-20 md:grid-cols-3">
        <div class="flex items-center gap-5 rounded-[32px] bg-blue-50/50 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <ShieldCheck :size="28" />
          </div>
          <div>
            <h5 class="text-sm font-black text-gray-900">
              Vendeur Verifie
            </h5>
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Identite confirmee par Waza
            </p>
          </div>
        </div>
        <div class="flex items-center gap-5 rounded-[32px] bg-emerald-50/50 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <MessageCircle :size="28" />
          </div>
          <div>
            <h5 class="text-sm font-black text-gray-900">
              Reponse Rapide
            </h5>
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Moins de 10 min sur WhatsApp
            </p>
          </div>
        </div>
        <div class="flex items-center gap-5 rounded-[32px] bg-orange-50/50 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
            <MapPin :size="28" />
          </div>
          <div>
            <h5 class="text-sm font-black text-gray-900">
              Paiement Securise
            </h5>
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Paiement Mobile Money ou Cash
            </p>
          </div>
        </div>
      </section>
    </div>

    <a
      :href="whatsappLink"
      target="_blank"
      class="fixed bottom-8 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl ring-4 ring-white animate-bounce md:hidden"
    >
      <MessageCircle :size="32" />
    </a>
  </div>
</template>
