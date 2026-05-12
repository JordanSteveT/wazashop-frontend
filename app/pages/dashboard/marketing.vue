<script setup lang="ts">
import { Download, Image as ImageIcon, Loader2, Megaphone } from "lucide-vue-next"
import { toPng } from "html-to-image"
import QrcodeVue from "qrcode.vue"
import { productService, shopService } from "~/services/api.service"
import { marketingThemeStyles } from "~/utils/themes"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const loading = ref(true)
const generating = ref(false)
const products = ref<any[]>([])
const shop = ref<any | null>(null)
const selectedProduct = ref<any | null>(null)
const selectedTemplate = ref<"minimaliste" | "promo" | "luxe">("minimaliste")
const flyerRef = ref<HTMLElement | null>(null)
const templates = ["minimaliste", "promo", "luxe"] as const

const qrCodeValue = computed(() =>
  selectedProduct.value
    ? `https://wazashop.com/shop/${(shop.value?.name || "boutique").replace(/\\s+/g, "-").toLowerCase()}/p/${selectedProduct.value.id}`
    : "https://wazashop.com",
)

const activeTheme = computed(() => {
  const key = shop.value?.preferences?.theme as keyof typeof marketingThemeStyles
  return marketingThemeStyles[key] || marketingThemeStyles.serieux
})

const fetchData = async () => {
  try {
    const [productsData, shopData] = await Promise.all([
      productService.getAll(),
      shopService.getMine(),
    ])
    products.value = productsData
    selectedProduct.value = productsData[0] || null
    shop.value = shopData
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDownload = async () => {
  if (!flyerRef.value) {
    return
  }

  generating.value = true
  try {
    const dataUrl = await toPng(flyerRef.value, {
      cacheBust: true,
      pixelRatio: 1,
    })
    const link = document.createElement("a")
    const fileName = (selectedProduct.value?.title || "produit").replace(/\\s+/g, "-").toLowerCase()
    link.download = `statut-${fileName}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error("Erreur lors de la generation du statut", error)
    window.alert("Une erreur est survenue lors de la creation de l'image.")
  } finally {
    generating.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div
    v-if="loading"
    class="flex h-screen items-center justify-center"
  >
    <Loader2 class="h-10 w-10 animate-spin text-emerald-600" />
  </div>

  <div
    v-else
    class="mx-auto flex max-w-7xl flex-col gap-12 pb-24 lg:flex-row"
  >
    <div class="flex w-full flex-col space-y-8 lg:w-[450px]">
      <div>
        <h1 class="flex items-center gap-3 text-3xl font-black tracking-tight text-gray-900">
          <div class="rounded-2xl bg-amber-500 p-2 text-white shadow-lg shadow-amber-500/20">
            <Megaphone :size="24" />
          </div>
          Booster de Ventes
        </h1>
        <p class="mt-2 font-medium text-gray-500">
          Creez des visuels WhatsApp en 1 clic.
        </p>
      </div>

      <div class="space-y-6 rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm">
        <h2 class="text-lg font-black text-gray-900">
          1. Selectionnez un produit
        </h2>
        <div
          v-if="products.length === 0"
          class="rounded-3xl bg-gray-50 p-8 text-center text-sm font-bold text-gray-500"
        >
          Catalogue vide.
        </div>
        <div
          v-else
          class="scrollbar-hide grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto p-2"
        >
          <button
            v-for="product in products"
            :key="product.id"
            type="button"
            class="relative cursor-pointer overflow-hidden rounded-[24px] border-2 transition-all"
            :class="selectedProduct?.id === product.id ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' : 'border-gray-50 bg-white hover:border-gray-200'"
            @click="selectedProduct = product"
          >
            <div class="h-28 bg-gray-50">
              <img
                v-if="product.media_urls?.length"
                :src="product.media_urls[0]"
                :alt="product.title"
                class="h-full w-full object-cover"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <ImageIcon
                  :size="24"
                  class="text-gray-200"
                />
              </div>
            </div>
            <div class="truncate p-3 text-center text-[10px] font-black uppercase tracking-tight">
              {{ product.title }}
            </div>
          </button>
        </div>
      </div>

      <div class="space-y-6 rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm">
        <h2 class="text-lg font-black text-gray-900">
          2. Choisissez un style
        </h2>
        <div class="grid grid-cols-1 gap-4">
          <button
            v-for="template in templates"
            :key="template"
            type="button"
            class="flex items-center justify-between rounded-2xl border-2 p-5 text-left transition-all"
            :class="selectedTemplate === template ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/5' : 'border-gray-50 bg-white text-gray-700 hover:border-gray-200'"
            @click="selectedTemplate = template"
          >
            <div class="text-xs font-black uppercase tracking-widest">
              {{ template }}
            </div>
            <div
              class="h-6 w-6 rounded-full border-2"
              :class="selectedTemplate === template ? 'border-emerald-600 bg-emerald-500 shadow-sm' : 'border-gray-200'"
            />
          </button>
        </div>
      </div>

      <button
        type="button"
        :disabled="generating || !selectedProduct"
        class="flex w-full items-center justify-center gap-3 rounded-3xl bg-emerald-600 py-6 text-lg font-black text-white shadow-2xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
        @click="handleDownload"
      >
        <Loader2
          v-if="generating"
          class="animate-spin"
          :size="24"
        />
        <Download
          v-else
          :size="24"
        />
        {{ generating ? "Generation..." : "Telecharger pour WhatsApp" }}
      </button>
    </div>

    <div class="flex flex-1 flex-col items-center justify-start rounded-[60px] border-2 border-dashed border-gray-200 bg-gray-50 p-12">
      <h3 class="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
        Apercu en temps reel
      </h3>

      <div
        class="relative overflow-hidden border-[12px] border-white shadow-2xl ring-1 ring-gray-100"
        style="width: 360px; height: 640px; border-radius: 3rem;"
      >
        <div
          class="origin-top-left scale-[0.3333]"
          style="width: 1080px; height: 1920px;"
        >
          <div
            ref="flyerRef"
            class="relative flex h-[1920px] w-[1080px] flex-col overflow-hidden bg-white font-sans"
          >
            <div
              v-if="selectedTemplate === 'minimaliste' && selectedProduct"
              class="flex h-full w-full flex-col"
              :class="activeTheme.bg"
            >
              <div class="z-10 flex w-full items-center gap-8 p-16">
                <img
                  v-if="shop?.logoUrl"
                  :src="shop.logoUrl"
                  class="h-32 w-32 rounded-[40px] border-4 border-white object-cover shadow-2xl"
                >
                <div
                  v-else
                  class="flex h-32 w-32 items-center justify-center rounded-[40px] bg-white text-5xl font-black text-emerald-600 shadow-xl"
                >
                  {{ shop?.name?.charAt(0) || "W" }}
                </div>
                <div
                  class="text-6xl font-black tracking-tight"
                  :class="activeTheme.text"
                >
                  {{ shop?.name || "Ma Boutique" }}
                </div>
              </div>

              <div class="relative mt-8 flex w-full flex-1 flex-col items-center rounded-t-[120px] bg-white shadow-[0_-40px_100px_rgba(0,0,0,0.15)]">
                <div class="flex h-[1000px] w-full items-center justify-center p-20">
                  <img
                    v-if="selectedProduct.media_urls?.length"
                    :src="selectedProduct.media_urls[0]"
                    class="h-full w-full object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.1)]"
                  >
                  <ImageIcon
                    v-else
                    class="h-80 w-80 text-gray-100"
                  />
                </div>

                <div class="-mt-10 flex w-full flex-col items-center px-20 text-center">
                  <h2 class="text-8xl font-black leading-[0.9] tracking-tighter text-gray-900 uppercase">
                    {{ selectedProduct.title }}
                  </h2>
                  <div
                    class="mt-12 inline-block rounded-[40px] px-16 py-6 text-7xl font-black shadow-2xl"
                    :class="activeTheme.primary"
                  >
                    {{ selectedProduct.price_public.toLocaleString() }}
                    <span class="text-3xl">FCFA</span>
                  </div>
                </div>

                <div class="absolute inset-x-0 bottom-0 flex h-[400px] items-center justify-between border-t-2 border-gray-100 bg-gray-50 px-20">
                  <div class="flex-1 pr-16">
                    <h3 class="mb-6 text-5xl font-black tracking-tight text-gray-900 uppercase">
                      Commandez <br>via WhatsApp
                    </h3>
                    <p class="text-3xl font-bold leading-tight text-gray-400">
                      Scannez ce code QR pour <br>voir les details du produit.
                    </p>
                  </div>
                  <div class="rounded-[60px] border-4 border-white bg-white p-8 shadow-2xl">
                    <QrcodeVue
                      :value="qrCodeValue"
                      :size="240"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="selectedTemplate === 'promo' && selectedProduct"
              class="relative flex h-full w-full flex-col overflow-hidden bg-red-600"
            >
              <div class="absolute -right-[10%] -top-[10%] h-[1000px] w-[1000px] rounded-full bg-red-500 opacity-60 blur-[150px]" />
              <div class="absolute -bottom-[10%] -left-[10%] h-[1200px] w-[1200px] rounded-full bg-red-700 opacity-60 blur-[150px]" />

              <div class="relative z-10 mt-16 flex w-full items-center justify-center p-20">
                <div class="-rotate-2 transform rounded-[40px] bg-white px-16 py-8 text-7xl font-black tracking-tighter text-red-600 uppercase shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
                  Vente Flash
                </div>
              </div>

              <div class="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-16">
                <div class="flex h-[850px] w-[850px] items-center justify-center rounded-[100px] border-[16px] border-white/20 bg-white p-20 shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
                  <img
                    v-if="selectedProduct.media_urls?.length"
                    :src="selectedProduct.media_urls[0]"
                    class="h-full w-full object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.2)]"
                  >
                  <ImageIcon
                    v-else
                    class="h-80 w-80 text-gray-100"
                  />
                </div>

                <h2 class="mt-20 px-10 text-center text-8xl font-black leading-[0.85] tracking-tighter text-white uppercase italic drop-shadow-2xl">
                  {{ selectedProduct.title }}
                </h2>

                <div class="mt-20 flex items-center gap-10">
                  <div class="text-6xl font-black italic text-red-300 line-through">
                    {{ (selectedProduct.price_public * 1.2).toLocaleString() }} F
                  </div>
                  <div class="-rotate-3 rounded-[40px] border-4 border-yellow-300 bg-yellow-400 px-16 py-8 text-8xl font-black text-black shadow-2xl">
                    {{ selectedProduct.price_public.toLocaleString() }} F
                  </div>
                </div>
              </div>

              <div class="relative z-10 mt-20 flex h-[400px] items-center border-t-4 border-white/10 bg-black/40 px-20 backdrop-blur-2xl">
                <div class="rounded-[60px] border-4 border-white bg-white p-6 shadow-2xl">
                  <QrcodeVue
                    :value="qrCodeValue"
                    :size="240"
                  />
                </div>
                <div class="flex-1 pl-16 text-white">
                  <h3 class="mb-4 text-6xl font-black text-yellow-400 uppercase italic">
                    Offre Flash !
                  </h3>
                  <p class="text-3xl font-bold leading-tight">
                    Scannez maintenant avant la <br>fin du compte a rebours.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="selectedTemplate === 'luxe' && selectedProduct"
              class="relative flex h-full w-full flex-col border-[32px] border-[#C5A028] bg-[#080808] box-border"
            >
              <div class="z-10 flex w-full flex-col items-center pt-32">
                <div class="text-[60px] font-light uppercase tracking-[0.4em] text-[#C5A028]">
                  {{ shop?.name || "PREMIUM SHOP" }}
                </div>
                <div class="mt-12 h-[2px] w-60 bg-[#C5A028] opacity-50" />
              </div>

              <div class="relative z-10 mt-16 flex w-full flex-1 flex-col items-center justify-center">
                <div class="relative flex h-[950px] w-full items-center justify-center px-24">
                  <img
                    v-if="selectedProduct.media_urls?.length"
                    :src="selectedProduct.media_urls[0]"
                    class="h-full w-full scale-110 object-contain drop-shadow-[0_60px_100px_rgba(197,160,40,0.15)]"
                  >
                  <ImageIcon
                    v-else
                    class="h-80 w-80 text-[#1a1a1a]"
                  />
                  <div class="absolute right-24 -top-10 text-[160px] font-black italic tracking-tighter text-white/[0.03]">
                    EXCLU
                  </div>
                </div>

                <div class="mt-12 w-full px-24 text-center">
                  <h2 class="mb-8 text-[72px] font-extralight uppercase leading-tight tracking-[0.2em] text-white">
                    {{ selectedProduct.title }}
                  </h2>
                  <div class="text-7xl font-bold tracking-[0.1em] text-[#C5A028]">
                    {{ selectedProduct.price_public.toLocaleString() }}
                    <span class="text-3xl">XAF</span>
                  </div>
                </div>
              </div>

              <div class="relative z-10 flex h-[400px] items-center justify-center gap-20 pb-20">
                <div class="text-right">
                  <div class="text-[40px] font-light uppercase leading-relaxed tracking-[0.3em] text-gray-500">
                    Elegance <br>& Qualite
                  </div>
                </div>
                <div class="rounded-[40px] bg-white p-8 shadow-[0_0_100px_rgba(197,160,40,0.2)]">
                  <QrcodeVue
                    :value="qrCodeValue"
                    :size="200"
                    fg-color="#080808"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
