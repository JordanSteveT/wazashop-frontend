<script setup lang="ts">
import { ArrowRight, Loader2, Sparkles, Store } from "lucide-vue-next"
import { shopService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const router = useRouter()

const name = ref("")
const loading = ref(false)
const error = ref("")

const handleCreateShop = async (event: Event) => {
  event.preventDefault()
  if (!name.value.trim()) {
    return
  }

  loading.value = true
  error.value = ""

  try {
    await shopService.create(name.value)
    await router.push("/dashboard")
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfdfd] p-6">
    <div class="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-100 opacity-40 blur-[100px]" />
    <div class="absolute -right-20 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-100 opacity-40 blur-[120px]" />

    <div class="relative w-full max-w-xl">
      <div class="rounded-[48px] border border-gray-100 bg-white p-12 shadow-[0_30px_100px_rgba(0,0,0,0.06)]">
        <div class="mb-10 text-center">
          <div class="mx-auto mb-6 flex h-20 w-20 rotate-6 items-center justify-center rounded-[28px] bg-emerald-600 shadow-2xl shadow-emerald-600/30 transition-transform hover:rotate-0">
            <Store
              class="text-white"
              :size="40"
            />
          </div>
          <h1 class="text-4xl font-black tracking-tighter text-gray-900">
            Lancez votre boutique
          </h1>
          <p class="mt-3 text-lg font-medium leading-relaxed text-gray-500">
            Donnez un nom unique a votre commerce pour que vos clients vous reconnaissent.
          </p>
        </div>

        <div
          v-if="error"
          class="animate-shake mb-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600"
        >
          {{ error }}
        </div>

        <form
          class="space-y-8"
          @submit="handleCreateShop"
        >
          <div class="space-y-3">
            <label class="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Nom commercial
            </label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Ex: Waza Mode, Chez Marie..."
              class="w-full rounded-3xl border-2 border-gray-50 bg-gray-50 px-8 py-6 text-2xl font-black text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-8 focus:ring-emerald-500/5"
            >
          </div>

          <div class="flex items-start gap-4 rounded-3xl border-2 border-emerald-50 bg-emerald-50/50 p-6">
            <div class="rounded-xl bg-emerald-500 p-2 text-white">
              <Sparkles :size="18" />
            </div>
            <p class="text-xs font-bold leading-relaxed text-emerald-800">
              Ce nom apparaitra sur votre catalogue en ligne et vos statuts WhatsApp generes par l'IA.
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading || !name.trim()"
            class="flex w-full items-center justify-center gap-4 rounded-[32px] bg-emerald-600 px-8 py-6 text-xl font-black text-white shadow-2xl shadow-emerald-600/30 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
          >
            <Loader2
              v-if="loading"
              class="animate-spin"
              :size="28"
            />
            <ArrowRight
              v-else
              :size="28"
            />
            {{ loading ? "Creation..." : "C'est parti !" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
