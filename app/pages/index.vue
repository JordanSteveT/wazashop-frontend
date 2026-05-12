<script setup lang="ts">
import { ArrowRight, Loader2, MessageSquare, ShieldCheck, Zap } from "lucide-vue-next"
import { authService } from "~/services/api.service"

definePageMeta({
  middleware: "guest" as never,
})

const router = useRouter()

const step = ref<"PHONE" | "OTP">("PHONE")
const phone = ref("")
const otp = ref("")
const loading = ref(false)
const error = ref("")

const handleRequestOtp = async (event: Event) => {
  event.preventDefault()
  if (!phone.value) {
    return
  }

  loading.value = true
  error.value = ""

  try {
    await authService.requestOtp(phone.value)
    step.value = "OTP"
  } catch (err: any) {
    error.value = err.response?.data?.error || "Impossible d'envoyer le code."
  } finally {
    loading.value = false
  }
}

const handleVerifyOtp = async (event: Event) => {
  event.preventDefault()
  if (otp.value.length !== 6) {
    return
  }

  loading.value = true
  error.value = ""

  try {
    const res = await authService.verifyOtp(phone.value, otp.value)
    localStorage.setItem("wazashop_token", res.data.token)
    await router.push("/dashboard")
  } catch (err: any) {
    error.value = err.response?.data?.error || "Code invalide"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfdfd] p-6 font-sans">
    <div class="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-100 opacity-40 blur-[100px]" />
    <div class="absolute -right-20 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-100 opacity-40 blur-[120px]" />

    <div class="relative w-full max-w-md">
      <div class="mb-12 text-center">
        <div class="mx-auto mb-6 flex h-20 w-20 rotate-3 items-center justify-center rounded-[28px] bg-emerald-600 shadow-2xl shadow-emerald-600/30 transition-transform duration-500 hover:rotate-0">
          <Zap
            class="text-white"
            :size="40"
            fill="white"
          />
        </div>
        <h1 class="mb-2 text-4xl font-black tracking-tighter text-gray-900">
          WazaShop
        </h1>
        <div class="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-600">
          <span>SaaS</span>
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          <span>WhatsApp Commerce</span>
        </div>
      </div>

      <div class="rounded-[40px] border border-gray-100 bg-white p-10 shadow-[0_30px_100px_rgba(0,0,0,0.06)]">
        <div class="mb-8">
          <h2 class="text-2xl font-black leading-tight text-gray-900">
            {{ step === "PHONE" ? "Bienvenue !" : "Verification" }}
          </h2>
          <p class="mt-2 font-medium text-gray-500">
            {{ step === "PHONE"
              ? "Connectez votre boutique a WhatsApp pour commencer a vendre."
              : "Entrez le code envoye sur votre WhatsApp." }}
          </p>
        </div>

        <div
          v-if="error"
          class="animate-shake mb-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600"
        >
          {{ error }}
        </div>

        <form
          v-if="step === 'PHONE'"
          class="space-y-6"
          @submit="handleRequestOtp"
        >
          <div class="space-y-2">
            <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Numero WhatsApp
            </label>
            <div class="flex items-center gap-3 rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3 transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
              <div class="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-600 shadow-sm">
                CM +237
              </div>
              <input
                v-model="phone"
                type="tel"
                placeholder="6XX XXX XXX"
                class="w-full bg-transparent text-lg font-bold text-gray-800 outline-none placeholder:text-gray-300"
              >
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !phone"
            class="flex w-full items-center justify-center gap-3 rounded-[24px] bg-emerald-600 px-6 py-5 text-lg font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
          >
            <Loader2
              v-if="loading"
              class="animate-spin"
              :size="24"
            />
            <MessageSquare
              v-else
              :size="20"
            />
            {{ loading ? "Envoi du code..." : "Recevoir le code OTP" }}
          </button>
        </form>

        <form
          v-else
          class="space-y-6"
          @submit="handleVerifyOtp"
        >
          <div class="space-y-2">
            <label class="ml-1 block text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              Code de verification
            </label>
            <input
              v-model="otp"
              type="text"
              maxlength="6"
              placeholder="0 0 0 0 0 0"
              class="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-5 text-center text-3xl font-black tracking-[0.5em] text-emerald-600 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              @input="otp = otp.replace(/\\D/g, '')"
            >
          </div>

          <button
            type="submit"
            :disabled="loading || otp.length !== 6"
            class="flex w-full items-center justify-center gap-3 rounded-[24px] bg-emerald-600 px-6 py-5 text-lg font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
          >
            <Loader2
              v-if="loading"
              class="animate-spin"
              :size="24"
            />
            <ShieldCheck
              v-else
              :size="20"
            />
            {{ loading ? "Verification..." : "Verifier le code" }}
          </button>

          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 text-xs font-bold text-gray-400 transition-colors hover:text-emerald-600"
            @click="step = 'PHONE'"
          >
            <ArrowRight
              class="rotate-180"
              :size="14"
            />
            Changer de numero
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
