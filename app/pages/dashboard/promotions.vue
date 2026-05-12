<script setup lang="ts">
import {
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Share2,
  Timer,
  TrendingDown,
  Zap,
} from "lucide-vue-next"
import { flashSaleService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const sales = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const copySuccess = ref<string | null>(null)
const name = ref("")
const discountPct = ref(15)
const durationHours = ref(24)
const creating = ref(false)

const fetchSales = async () => {
  try {
    sales.value = await flashSaleService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCreate = async (event: Event) => {
  event.preventDefault()
  creating.value = true

  try {
    await flashSaleService.create({
      name: name.value,
      discountPct: discountPct.value,
      durationHours: durationHours.value,
    })
    showModal.value = false
    name.value = ""
    await fetchSales()
  } catch (error) {
    console.error(error)
  } finally {
    creating.value = false
  }
}

const copyToClipboard = async (code: string) => {
  const url = `${window.location.origin}/promo/${code}`
  await navigator.clipboard.writeText(url)
  copySuccess.value = code
  setTimeout(() => {
    copySuccess.value = null
  }, 2000)
}

onMounted(fetchSales)
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
    class="space-y-12 pb-20"
  >
    <div class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div>
        <h1 class="flex items-center gap-3 text-3xl font-black tracking-tight text-gray-900">
          <div class="rounded-2xl bg-amber-500 p-2 text-white shadow-lg shadow-amber-500/20">
            <Zap
              :size="24"
              fill="white"
            />
          </div>
          Ventes Flash
        </h1>
        <p class="mt-2 font-medium text-gray-500">
          Creez des liens promotionnels temporaires pour booster vos ventes WhatsApp.
        </p>
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
        @click="showModal = true"
      >
        <Plus :size="24" />
        Nouvelle Promo
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="group rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition-colors hover:border-emerald-500">
        <div class="mb-4 flex items-center gap-4">
          <div class="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Share2 :size="20" />
          </div>
          <p class="text-xs font-black uppercase tracking-widest text-gray-400">
            Partages WhatsApp
          </p>
        </div>
        <p class="text-3xl font-black text-gray-900">
          124
        </p>
        <p class="mt-2 text-xs font-bold text-emerald-600">
          +12% cette semaine
        </p>
      </div>

      <div class="group rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition-colors hover:border-amber-500">
        <div class="mb-4 flex items-center gap-4">
          <div class="rounded-xl bg-amber-50 p-3 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
            <TrendingDown :size="20" />
          </div>
          <p class="text-xs font-black uppercase tracking-widest text-gray-400">
            Reduction Moyenne
          </p>
        </div>
        <p class="text-3xl font-black text-gray-900">
          18%
        </p>
        <p class="mt-2 text-xs font-bold text-amber-600">
          Optimal pour conversion
        </p>
      </div>

      <div class="group rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition-colors hover:border-blue-500">
        <div class="mb-4 flex items-center gap-4">
          <div class="rounded-xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Timer :size="20" />
          </div>
          <p class="text-xs font-black uppercase tracking-widest text-gray-400">
            Temps Moyen
          </p>
        </div>
        <p class="text-3xl font-black text-gray-900">
          24h
        </p>
        <p class="mt-2 text-xs font-bold text-blue-600">
          Urgence max
        </p>
      </div>
    </div>

    <div class="overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-50 p-10">
        <h2 class="text-xl font-black tracking-tight text-gray-900">
          Vos Liens Actifs
        </h2>
        <span class="rounded-full bg-emerald-50 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          {{ sales.filter((sale) => sale.isActive).length }} En cours
        </span>
      </div>

      <div
        v-if="sales.length === 0"
        class="p-20 text-center"
      >
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
          <Zap :size="40" />
        </div>
        <p class="font-bold text-gray-400">
          Aucune promotion creee pour le moment.
        </p>
      </div>

      <div
        v-else
        class="divide-y divide-gray-50"
      >
        <div
          v-for="sale in sales"
          :key="sale.id"
          class="group flex flex-col justify-between gap-8 p-10 transition-colors hover:bg-gray-50 md:flex-row md:items-center"
        >
          <div class="flex items-start gap-6">
            <div class="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <span class="text-lg font-black leading-none">-{{ sale.discount_pct }}%</span>
            </div>
            <div>
              <h3 class="text-lg font-black text-gray-900">
                {{ sale.name }}
              </h3>
              <div class="mt-2 flex items-center gap-4 text-xs font-bold text-gray-400">
                <div class="flex items-center gap-1">
                  <Calendar :size="14" />
                  <span>{{ new Date(sale.createdAt).toLocaleDateString() }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Timer :size="14" />
                  <span :class="new Date(sale.expiresAt) < new Date() ? 'text-red-500' : 'text-amber-500'">
                    {{ new Date(sale.expiresAt) < new Date()
                      ? "Expire"
                      : `Expire le ${new Date(sale.expiresAt).toLocaleDateString()}` }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-gray-100 px-4 py-3 font-mono text-sm text-gray-600 select-all">
              .../promo/{{ sale.code }}
            </div>

            <button
              type="button"
              class="flex items-center gap-2 rounded-xl p-4 transition-all"
              :class="copySuccess === sale.code ? 'scale-110 bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'"
              @click="copyToClipboard(sale.code)"
            >
              <CheckCircle2
                v-if="copySuccess === sale.code"
                :size="20"
              />
              <Copy
                v-else
                :size="20"
              />
              <span class="text-xs font-black uppercase tracking-widest">
                {{ copySuccess === sale.code ? "Copie !" : "Copier" }}
              </span>
            </button>

            <NuxtLink
              :to="`/promo/${sale.code}`"
              target="_blank"
              class="rounded-xl bg-gray-50 p-4 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
            >
              <ExternalLink :size="20" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-6 backdrop-blur-md"
    >
      <div class="relative w-full max-w-lg overflow-hidden rounded-[48px] bg-white p-12 shadow-2xl">
        <div class="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-amber-50 opacity-50" />

        <div class="relative">
          <h2 class="mb-8 text-3xl font-black text-gray-900">
            Nouvelle Vente Flash
          </h2>

          <form
            class="space-y-8"
            @submit="handleCreate"
          >
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Nom de la campagne
              </label>
              <input
                v-model="name"
                type="text"
                required
                placeholder="Ex: Promo Weekend, Braderie Ete..."
                class="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Reduction (%)
                </label>
                <input
                  v-model="discountPct"
                  type="number"
                  min="1"
                  max="99"
                  required
                  class="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
              </div>

              <div class="space-y-2">
                <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Duree (Heures)
                </label>
                <select
                  v-model="durationHours"
                  class="w-full appearance-none rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option :value="12">
                    12 Heures
                  </option>
                  <option :value="24">
                    24 Heures
                  </option>
                  <option :value="48">
                    48 Heures
                  </option>
                  <option :value="168">
                    1 Semaine
                  </option>
                </select>
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                class="flex-1 rounded-2xl bg-gray-50 px-8 py-5 font-black text-gray-400 transition-all hover:bg-gray-100"
                @click="showModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="creating"
                class="flex flex-[2] items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 py-5 font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Loader2
                  v-if="creating"
                  class="animate-spin"
                  :size="24"
                />
                <Zap
                  v-else
                  :size="24"
                  fill="white"
                />
                Generer le lien
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
