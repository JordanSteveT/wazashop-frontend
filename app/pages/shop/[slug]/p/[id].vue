<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Gift,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-vue-next"
import { publicShopService } from "~/services/api.service"
import { CAMEROON_ZONES } from "~/utils/cameroon"
import { productDetailThemes } from "~/utils/themes"
import { normalizeWhatsappNumber } from "~/utils/whatsapp"

const route = useRoute()
const router = useRouter()

const product = ref<any | null>(null)
const loading = ref(true)
const activeImage = ref(0)
const offeredPrice = ref("")
const negotiationResult = ref<any | null>(null)
const negotiating = ref(false)
const selectedZone = ref<{ name: string; fee: number } | null>(null)
const isGift = ref(false)
const recipientPhone = ref("")

const currentTheme = computed(() => {
  const key = product.value?.shop?.preferences?.theme as keyof typeof productDetailThemes
  return productDetailThemes[key] || productDetailThemes.serieux
})

const finalPrice = computed(() =>
  negotiationResult.value?.accepted ? Number(offeredPrice.value) : product.value?.price_public || 0,
)
const deliveryFee = computed(() => selectedZone.value?.fee || 0)
const totalWithDelivery = computed(() => finalPrice.value + deliveryFee.value)

const fetchProduct = async () => {
  try {
    product.value = await publicShopService.getProductById(route.params.id as string)
  } catch (error) {
    console.error("Error:", error)
  } finally {
    loading.value = false
  }
}

const handleNegotiate = async () => {
  if (!offeredPrice.value || Number.isNaN(Number(offeredPrice.value))) {
    return
  }

  negotiating.value = true
  try {
    negotiationResult.value = await publicShopService.negotiate(
      route.params.id as string,
      Number(offeredPrice.value),
    )
  } catch (error) {
    console.error(error)
  } finally {
    negotiating.value = false
  }
}

const whatsappOrderLink = computed(() => {
  if (!product.value) {
    return "#"
  }

  const baseUrl = `https://wa.me/${normalizeWhatsappNumber(product.value.shop.whatsappBusiness)}`
  let message = `Bonjour ${product.value.shop.name}, je souhaite commander cet article vu sur WazaShop :\n\n`
  message += `Article : ${product.value.title}\n`
  message += `Prix : ${finalPrice.value.toLocaleString()} FCFA\n`

  if (selectedZone.value) {
    message += `Livraison : ${selectedZone.value.name} (+${deliveryFee.value} FCFA)\n`
    message += `Total : ${totalWithDelivery.value.toLocaleString()} FCFA\n`
  }

  if (isGift.value) {
    message += `C'EST UN CADEAU !\n`
    message += `Numero destinataire : ${recipientPhone.value}\n`
  }

  message += `\nLien : ${window.location.href}`

  return `${baseUrl}?text=${encodeURIComponent(message)}`
})

onMounted(fetchProduct)
</script>

<template>
  <div
    v-if="loading"
    class="flex h-screen items-center justify-center"
  >
    <Loader2 class="h-10 w-10 animate-spin text-emerald-600" />
  </div>

  <div
    v-else-if="!product"
    class="flex h-screen items-center justify-center font-black"
  >
    Produit non trouve.
  </div>

  <div
    v-else
    class="min-h-screen bg-gray-50 pb-32"
  >
    <div class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
      <button
        type="button"
        class="rounded-xl p-2 transition-all hover:bg-gray-50"
        @click="router.back()"
      >
        <ChevronLeft :size="24" />
      </button>
      <h3 class="max-w-[200px] truncate text-sm font-black uppercase tracking-widest">
        {{ product.shop.name }}
      </h3>
      <NuxtLink
        :to="`/shop/${route.params.slug}`"
        class="rounded-xl p-2 transition-all hover:bg-gray-50"
      >
        <Store
          :size="24"
          :class="currentTheme.text"
        />
      </NuxtLink>
    </div>

    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:px-12 md:pt-12 lg:grid-cols-2">
      <div class="space-y-6">
        <div class="group relative aspect-square overflow-hidden bg-white shadow-sm md:rounded-[48px]">
          <img
            v-if="product.media_urls?.[activeImage]"
            :src="product.media_urls[activeImage]"
            class="h-full w-full object-cover"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300"
          >
            <ShoppingBag :size="80" />
          </div>
          <div class="absolute left-6 top-6 rounded-[24px] bg-white/90 px-6 py-3 shadow-xl backdrop-blur-md">
            <span class="text-xl font-black text-gray-900">
              {{ product.price_public.toLocaleString() }}
              <span class="text-xs text-gray-400">FCFA</span>
            </span>
          </div>
        </div>

        <div class="scrollbar-hide flex gap-4 overflow-x-auto px-6 md:px-0">
          <button
            v-for="(url, index) in product.media_urls"
            :key="url"
            type="button"
            class="h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border-4 transition-all md:h-24 md:w-24"
            :class="activeImage === index ? 'scale-105 border-emerald-600 shadow-lg' : 'border-white opacity-60'"
            @click="activeImage = Number(index)"
          >
            <img
              :src="url"
              class="h-full w-full object-cover"
            >
          </button>
        </div>
      </div>

      <div class="space-y-10 px-6 md:px-0">
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <Zap
              :size="14"
              fill="currentColor"
            />
            Nouveau stock disponible
          </div>
          <h1 class="text-3xl font-black leading-tight text-gray-900 md:text-4xl">
            {{ product.title }}
          </h1>
          <p class="font-medium leading-relaxed text-gray-500">
            {{ product.description }}
          </p>
        </div>

        <div class="space-y-6 rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
              <TrendingUp
                :size="20"
                class="text-emerald-500"
              />
              Proposez votre prix
            </h3>
            <Info
              :size="16"
              class="text-gray-300"
            />
          </div>

          <div class="flex gap-3">
            <input
              v-model="offeredPrice"
              type="number"
              placeholder="Votre offre (FCFA)"
              class="flex-1 rounded-[24px] border-2 border-transparent bg-gray-50 px-6 py-4 font-black outline-none transition-all focus:border-emerald-500 focus:bg-white"
            >
            <button
              type="button"
              :disabled="negotiating || !offeredPrice"
              class="rounded-[24px] bg-gray-900 px-8 font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
              @click="handleNegotiate"
            >
              <Loader2
                v-if="negotiating"
                class="animate-spin"
              />
              <span v-else>Verifier</span>
            </button>
          </div>

          <div
            v-if="negotiationResult"
            class="flex items-center gap-4 rounded-[24px] p-5"
            :class="negotiationResult.accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
          >
            <CheckCircle2
              v-if="negotiationResult.accepted"
              :size="24"
            />
            <AlertCircle
              v-else
              :size="24"
            />
            <div class="flex-1">
              <p class="text-sm font-black">
                {{ negotiationResult.message }}
              </p>
              <p
                v-if="negotiationResult.accepted"
                class="text-xs font-bold opacity-80"
              >
                Vous economisez {{ negotiationResult.saving.toLocaleString() }} FCFA !
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
            <Truck
              :size="20"
              class="text-blue-500"
            />
            Livraison locale
          </h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              v-for="zone in CAMEROON_ZONES"
              :key="zone.name"
              type="button"
              class="rounded-[24px] border-2 p-5 text-left transition-all"
              :class="selectedZone?.name === zone.name ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10' : 'border-white bg-white shadow-sm hover:border-gray-100'"
              @click="selectedZone = zone"
            >
              <div class="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                {{ zone.name }}
              </div>
              <div class="font-black text-gray-900">
                +{{ zone.fee.toLocaleString() }} FCFA
              </div>
            </button>
          </div>
        </div>

        <div class="space-y-4 rounded-[32px] border border-amber-100 bg-amber-50 p-6">
          <label class="group flex cursor-pointer items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="rounded-2xl bg-white p-3 text-amber-600 shadow-sm transition-all group-hover:scale-110">
                <Gift :size="20" />
              </div>
              <span class="font-black text-gray-900">Offrir ce cadeau</span>
            </div>
            <input
              v-model="isGift"
              type="checkbox"
              class="h-6 w-6 rounded-lg accent-amber-600"
            >
          </label>
          <div
            v-if="isGift"
            class="space-y-2"
          >
            <p class="ml-2 text-[10px] font-black uppercase tracking-widest text-amber-700">
              Numero WhatsApp du destinataire
            </p>
            <input
              v-model="recipientPhone"
              type="text"
              placeholder="Ex: +237 ..."
              class="w-full rounded-2xl border-2 border-amber-200 bg-white px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-amber-500"
            >
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <ShieldCheck
              :size="14"
              class="text-emerald-600"
            />
            <span class="text-[10px] font-black uppercase text-gray-500">Vendeur Verifie</span>
          </div>
          <div class="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <MessageCircle
              :size="14"
              class="text-blue-600"
            />
            <span class="text-[10px] font-black uppercase text-gray-500">Reponse -10 min</span>
          </div>
          <div class="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <Clock
              :size="14"
              class="text-amber-600"
            />
            <span class="text-[10px] font-black uppercase text-gray-500">Traitement rapide</span>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-6 border-t border-gray-100 bg-white/80 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl md:px-20">
      <div class="hidden md:block">
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Total a payer
        </p>
        <h4 class="text-2xl font-black text-gray-900">
          {{ totalWithDelivery.toLocaleString() }}
          <span class="text-xs text-gray-400">FCFA</span>
        </h4>
      </div>
      <div class="flex flex-1 gap-4">
        <a
          :href="whatsappOrderLink"
          target="_blank"
          class="flex flex-1 items-center justify-center gap-4 rounded-[28px] py-5 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 md:text-xl"
          :class="currentTheme.button"
        >
          <MessageCircle :size="28" />
          Commander sur WhatsApp
        </a>
      </div>
    </div>
  </div>
</template>
