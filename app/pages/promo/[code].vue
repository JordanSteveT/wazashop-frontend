<script setup lang="ts">
import { AlertTriangle, Clock, Loader2, ShoppingBag, Zap } from "lucide-vue-next"
import { flashSaleService } from "~/services/api.service"

const route = useRoute()
const router = useRouter()

const sale = ref<any | null>(null)
const loading = ref(true)
const error = ref("")

const verifyPromo = async () => {
  try {
    sale.value = await flashSaleService.verify(route.params.code as string)
  } catch (caughtError) {
    console.error(caughtError)
    error.value = "Ce lien n'est plus valide ou a expire."
  } finally {
    loading.value = false
  }
}

const activatePromo = async () => {
  if (!sale.value) {
    return
  }

  localStorage.setItem(
    "wazashop_active_promo",
    JSON.stringify({
      code: sale.value.code,
      discount: sale.value.discount_pct,
      shopId: sale.value.shop_id,
    }),
  )

  window.alert("Promotion activee ! Vous allez etre redirige vers la boutique.")
  await router.push("/dashboard")
}

onMounted(verifyPromo)
</script>

<template>
  <div
    v-if="loading"
    class="flex h-screen items-center justify-center bg-gray-50"
  >
    <Loader2 class="h-12 w-12 animate-spin text-emerald-600" />
  </div>

  <div
    v-else-if="error || sale?.isExpired"
    class="flex min-h-screen items-center justify-center bg-gray-50 p-6"
  >
    <div class="w-full max-w-md rounded-[40px] border border-gray-100 bg-white p-12 text-center shadow-xl">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle :size="40" />
      </div>
      <h1 class="mb-4 text-2xl font-black text-gray-900">
        Oups ! Lien expire
      </h1>
      <p class="mb-8 font-medium text-gray-500">
        Cette offre n'est plus disponible. Mais ne vous inquietez pas, il y a plein d'autres articles a decouvrir !
      </p>
      <button
        type="button"
        class="w-full rounded-2xl bg-gray-900 py-4 font-black text-white"
        @click="router.push('/')"
      >
        Retour a l'accueil
      </button>
    </div>
  </div>

  <div
    v-else
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfdfd] p-6"
  >
    <div class="absolute -left-20 top-0 h-96 w-96 rounded-full bg-amber-100 opacity-40 blur-[100px]" />
    <div class="absolute -right-20 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-100 opacity-40 blur-[120px]" />

    <div class="relative w-full max-w-lg">
      <div class="rounded-[48px] border border-gray-100 bg-white p-12 text-center shadow-[0_30px_100px_rgba(0,0,0,0.1)]">
        <div class="mx-auto mb-8 flex h-24 w-24 rotate-6 items-center justify-center rounded-[32px] bg-amber-500 shadow-2xl shadow-amber-500/30">
          <Zap
            :size="48"
            class="text-white"
            fill="white"
          />
        </div>

        <h2 class="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
          Offre Exclusive
        </h2>
        <h1 class="mb-4 text-4xl font-black tracking-tighter text-gray-900">
          {{ sale?.name }}
        </h1>

        <div class="mb-10 flex items-center justify-center gap-4">
          <div class="rounded-full bg-emerald-600 px-6 py-2 text-2xl font-black text-white">
            -{{ sale?.discount_pct }}%
          </div>
          <div class="flex items-center gap-2 font-bold text-gray-400">
            <Clock :size="18" />
            <span>Offre limitee</span>
          </div>
        </div>

        <div class="mb-10 space-y-4 rounded-3xl bg-gray-50 p-8 text-left">
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <ShoppingBag :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Boutique
              </p>
              <p class="font-black text-gray-900">
                {{ sale?.shop?.name || "Boutique Waza" }}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-3 rounded-[32px] bg-emerald-600 py-6 text-xl font-black text-white shadow-2xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
          @click="activatePromo"
        >
          En profiter maintenant
        </button>

        <p class="mt-8 text-xs font-bold italic text-gray-400">
          * La reduction sera appliquee automatiquement lors de votre commande WhatsApp.
        </p>
      </div>
    </div>
  </div>
</template>
