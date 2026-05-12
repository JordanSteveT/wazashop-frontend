<script setup lang="ts">
import {
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Package,
  Store,
  Tag,
  User,
  Zap,
} from "lucide-vue-next"
import { shopService, userService } from "~/services/api.service"

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const showProfileModal = ref(false)

const isSetupRoute = computed(() => route.path.includes("/setup"))

const navItems = computed(() => [
  {
    name: "Catalogue",
    icon: Package,
    path: "/dashboard",
    active: route.path === "/dashboard" || route.path.includes("/products"),
  },
  {
    name: "Promotions",
    icon: Zap,
    path: "/dashboard/promotions",
    active: route.path.includes("/promotions"),
  },
  {
    name: "Categories",
    icon: Tag,
    path: "/dashboard/categories",
    active: route.path.includes("/categories"),
  },
  {
    name: "Ma Boutique",
    icon: Store,
    path: "/dashboard/settings",
    active: route.path.includes("/settings"),
  },
  {
    name: "Mon Profil",
    icon: User,
    path: "/dashboard/profile",
    active: route.path.includes("/profile"),
  },
])

const runDashboardGuard = async () => {
  loading.value = true

  const token = localStorage.getItem("wazashop_token")
  if (!token) {
    await navigateTo("/")
    loading.value = false
    return
  }

  try {
    const [shopData, userData] = await Promise.all([
      shopService.getMine().catch(() => null),
      userService.getMe().catch(() => null),
    ])

    if (!shopData && !route.path.includes("/setup")) {
      await navigateTo("/dashboard/setup")
      return
    }

    if (
      userData &&
      (!userData.firstName || !userData.lastName) &&
      !route.path.includes("/setup") &&
      !route.path.includes("/profile")
    ) {
      const lastDismissedStr = localStorage.getItem("wazashop_profile_modal_dismissed_at")
      const lastDismissed = lastDismissedStr ? Number.parseInt(lastDismissedStr, 10) : 0
      const oneHourMs = 60 * 60 * 1000

      showProfileModal.value = Date.now() - lastDismissed > oneHourMs
    } else {
      showProfileModal.value = false
    }
  } catch (error) {
    console.error(error)
    await navigateTo("/")
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  localStorage.removeItem("wazashop_token")
  await navigateTo("/")
}

const goToProfile = async () => {
  showProfileModal.value = false
  await navigateTo("/dashboard/profile")
}

const dismissProfileReminder = () => {
  localStorage.setItem("wazashop_profile_modal_dismissed_at", Date.now().toString())
  showProfileModal.value = false
}

onMounted(runDashboardGuard)
watch(() => route.path, runDashboardGuard)
</script>

<template>
  <div
    v-if="loading"
    class="flex min-h-screen items-center justify-center bg-[#fdfdfd]"
  >
    <Loader2 class="h-10 w-10 animate-spin text-emerald-600" />
  </div>

  <slot v-else-if="isSetupRoute" />

  <div
    v-else
    class="flex min-h-screen bg-[#f8f9fa] text-gray-900 font-sans"
  >
    <aside class="relative z-20 hidden w-72 flex-col border-r border-gray-100 bg-white shadow-2xl shadow-gray-200/50 lg:flex">
      <div class="p-10 pb-12">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <LayoutDashboard :size="20" />
          </div>
          <h1 class="text-2xl font-black tracking-tighter text-gray-900">
            WazaShop
          </h1>
        </div>
      </div>

      <nav class="flex-1 space-y-2 px-6">
        <div class="mb-4 px-4">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Menu Principal
          </p>
        </div>

        <NuxtLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="group flex items-center justify-between rounded-2xl px-4 py-4 font-bold transition-all duration-300"
          :class="item.active ? 'translate-x-2 bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
        >
          <div class="flex items-center gap-4">
            <component
              :is="item.icon"
              :size="22"
              :class="item.active ? 'text-white' : 'text-gray-400 transition-colors group-hover:text-emerald-600'"
            />
            <span>{{ item.name }}</span>
          </div>
          <ChevronRight
            v-if="item.active"
            :size="16"
          />
        </NuxtLink>

        <div class="mb-4 px-4 pt-10">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Outils Marketing
          </p>
        </div>

        <NuxtLink
          to="/dashboard/marketing"
          class="group relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-4 font-bold transition-all duration-300"
          :class="route.path.includes('/marketing') ? 'translate-x-2 bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
        >
          <div class="flex items-center gap-4">
            <Megaphone
              :size="22"
              :class="route.path.includes('/marketing') ? 'text-white' : 'text-amber-500'"
            />
            <span>Booster de Ventes</span>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest"
            :class="route.path.includes('/marketing') ? 'bg-white/20' : 'bg-amber-100 text-amber-600'"
          >
            New
          </span>
        </NuxtLink>
      </nav>

      <div class="border-t border-gray-50 p-6">
        <button
          class="group flex w-full items-center gap-4 rounded-2xl px-4 py-4 font-black text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
          type="button"
          @click="handleLogout"
        >
          <LogOut
            :size="22"
            class="transition-transform group-hover:rotate-12"
          />
          <span>Deconnexion</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-[1600px] p-6 md:p-12">
        <slot />
      </div>
    </main>

    <div
      v-if="showProfileModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-6 backdrop-blur-md"
    >
      <div class="relative w-full max-w-md overflow-hidden rounded-[48px] bg-white p-12 shadow-2xl">
        <div class="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-emerald-50" />

        <div class="relative text-center">
          <div class="mx-auto mb-8 flex h-24 w-24 rotate-6 items-center justify-center rounded-[32px] bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30">
            <User :size="48" />
          </div>
          <h2 class="text-3xl font-black leading-tight text-gray-900">
            Profil incomplet
          </h2>
          <p class="mt-4 text-lg font-medium leading-relaxed text-gray-500">
            Prenez une minute pour ajouter votre nom. Un profil complet inspire
            <span class="font-black text-emerald-600"> 10x plus confiance </span>
            a vos clients WhatsApp.
          </p>
        </div>

        <div class="mt-10 flex flex-col gap-4">
          <button
            class="w-full rounded-3xl bg-emerald-600 px-8 py-5 text-lg font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95"
            type="button"
            @click="goToProfile"
          >
            Completer mon profil
          </button>
          <button
            class="w-full rounded-3xl bg-gray-50 px-8 py-5 font-black text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
            type="button"
            @click="dismissProfileReminder"
          >
            Peut-etre plus tard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
