<script setup lang="ts">
import {
  CheckCircle,
  Clock,
  Eye,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  MessageCircle,
  Monitor,
  Palette,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-vue-next"
import { shopService } from "~/services/api.service"
import { editorThemes } from "~/utils/themes"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const loading = ref(true)
const saving = ref(false)
const activeTab = ref<"identity" | "design" | "trust">("identity")
const previewDevice = ref<"mobile" | "desktop">("mobile")
const shopName = ref("")
const description = ref("")
const whatsapp = ref("")
const address = ref("")
const theme = ref("serieux")
const layout = ref<"grid" | "list">("grid")
const showStories = ref(true)
const showWhatsappButton = ref(true)
const showMaps = ref(true)
const hours = ref("08:00 - 18:00")
const logoPreview = ref<string | null>(null)
const bannerPreview = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const bannerFile = ref<File | null>(null)
const logoInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)

const currentTheme = computed(() => editorThemes[theme.value as keyof typeof editorThemes] || editorThemes.serieux)

const fetchShop = async () => {
  try {
    const data = await shopService.getMine()
    if (!data) {
      return
    }

    shopName.value = data.name || ""
    description.value = data.description || ""
    whatsapp.value = data.whatsappBusiness || ""
    address.value = data.address || ""
    logoPreview.value = data.logoUrl || null
    bannerPreview.value = data.bannerUrl || null

    const prefs = data.preferences || {}
    theme.value = prefs.theme || "serieux"
    layout.value = prefs.layout || "grid"
    showStories.value = prefs.showStories !== false
    showWhatsappButton.value = prefs.showWhatsappButton !== false
    showMaps.value = prefs.showMaps !== false
    hours.value = prefs.hours || "08:00 - 18:00"
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleLogoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const handleBannerChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  bannerFile.value = file
  bannerPreview.value = URL.createObjectURL(file)
}

const handleSave = async () => {
  saving.value = true

  try {
    const formData = new FormData()
    formData.append("name", shopName.value)
    formData.append("description", description.value)
    formData.append("whatsappBusiness", whatsapp.value)
    formData.append("address", address.value)
    formData.append(
      "preferences",
      JSON.stringify({
        theme: theme.value,
        layout: layout.value,
        showStories: showStories.value,
        showWhatsappButton: showWhatsappButton.value,
        showMaps: showMaps.value,
        hours: hours.value,
      }),
    )

    if (logoFile.value) {
      formData.append("logo", logoFile.value)
    }

    if (bannerFile.value) {
      formData.append("banner", bannerFile.value)
    }

    await shopService.update(formData)
    window.alert("Vitrine mise a jour avec succes !")
  } catch (error) {
    console.error(error)
    window.alert("Erreur lors de la sauvegarde.")
  } finally {
    saving.value = false
  }
}

onMounted(fetchShop)
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
    class="mx-auto min-h-screen max-w-[1600px] pb-20"
  >
    <div class="flex h-full flex-col gap-12 lg:flex-row">
      <div class="flex-1 space-y-10">
        <div class="flex items-center justify-between gap-6">
          <div>
            <h1 class="flex items-center gap-3 text-4xl font-black tracking-tighter text-gray-900">
              <Store
                :size="36"
                class="text-emerald-600"
              />
              Editeur de Vitrine
            </h1>
            <p class="mt-1 font-medium text-gray-500">
              Personnalisez votre boutique pour vendre plus au Cameroun.
            </p>
          </div>
          <button
            type="button"
            :disabled="saving"
            class="flex items-center gap-3 rounded-[24px] bg-emerald-600 px-10 py-5 font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            @click="handleSave"
          >
            <Loader2
              v-if="saving"
              class="animate-spin"
              :size="24"
            />
            <CheckCircle
              v-else
              :size="24"
            />
            {{ saving ? "Sauvegarde..." : "Publier ma vitrine" }}
          </button>
        </div>

        <div class="flex w-fit gap-4 rounded-[32px] bg-gray-100 p-2">
          <button
            type="button"
            class="flex items-center gap-2 rounded-[24px] px-8 py-4 text-sm font-black transition-all"
            :class="activeTab === 'identity' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            @click="activeTab = 'identity'"
          >
            <Store :size="18" />
            Identite
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-[24px] px-8 py-4 text-sm font-black transition-all"
            :class="activeTab === 'design' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            @click="activeTab = 'design'"
          >
            <Palette :size="18" />
            Design
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-[24px] px-8 py-4 text-sm font-black transition-all"
            :class="activeTab === 'trust' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            @click="activeTab = 'trust'"
          >
            <ShieldCheck :size="18" />
            Confiance
          </button>
        </div>

        <div class="rounded-[48px] border border-gray-100 bg-white p-12 shadow-sm">
          <div
            v-if="activeTab === 'identity'"
            class="space-y-8"
          >
            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div class="space-y-4">
                <label class="ml-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  Logo de la boutique (Carre)
                </label>
                <div
                  class="relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-[40px] border-4 border-dashed border-gray-100 bg-gray-50 transition-all hover:border-emerald-500 hover:bg-emerald-50/30"
                  @click="logoInput?.click()"
                >
                  <img
                    v-if="logoPreview"
                    :src="logoPreview"
                    class="h-full w-full object-cover"
                  >
                  <div
                    v-else
                    class="text-center"
                  >
                    <ImageIcon
                      class="mx-auto mb-2 text-gray-300"
                      :size="32"
                    />
                    <span class="text-[10px] font-black text-gray-400">UPLOAD</span>
                  </div>
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleLogoChange"
                  >
                </div>
              </div>

              <div class="space-y-4">
                <label class="ml-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  Photo de couverture
                </label>
                <div
                  class="relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[40px] border-4 border-dashed border-gray-100 bg-gray-50 transition-all hover:border-emerald-500 hover:bg-emerald-50/30"
                  @click="bannerInput?.click()"
                >
                  <img
                    v-if="bannerPreview"
                    :src="bannerPreview"
                    class="h-full w-full object-cover"
                  >
                  <div
                    v-else
                    class="text-center"
                  >
                    <ImageIcon
                      class="mx-auto mb-2 text-gray-300"
                      :size="32"
                    />
                    <span class="text-[10px] font-black text-gray-400">CHOISIR UNE PHOTO</span>
                  </div>
                  <input
                    ref="bannerInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleBannerChange"
                  >
                </div>
              </div>
            </div>

            <div class="space-y-6 pt-6">
              <div class="space-y-2">
                <label class="ml-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  Nom commercial
                </label>
                <input
                  v-model="shopName"
                  type="text"
                  class="w-full rounded-[24px] bg-gray-50 px-8 py-5 text-lg font-bold text-gray-800 outline-none transition-all focus:ring-4 focus:ring-emerald-500/10"
                >
              </div>
              <div class="space-y-2">
                <label class="ml-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  Accroche (Bio)
                </label>
                <textarea
                  v-model="description"
                  rows="3"
                  placeholder="Ex: Le specialiste de la chaussure originale a Douala"
                  class="w-full resize-none rounded-[24px] bg-gray-50 px-8 py-5 text-lg font-medium text-gray-800 outline-none transition-all focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </div>

          <div
            v-else-if="activeTab === 'design'"
            class="space-y-12"
          >
            <div class="space-y-6">
              <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
                <Sparkles
                  :size="20"
                  class="text-amber-500"
                />
                Choisissez votre ambiance
              </h3>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <button
                  v-for="(themeConfig, themeId) in editorThemes"
                  :key="themeId"
                  type="button"
                  class="group relative overflow-hidden rounded-[32px] border-4 p-6 text-left transition-all"
                  :class="theme === themeId ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-50 bg-gray-50 hover:border-gray-100'"
                  @click="theme = themeId"
                >
                  <div
                    class="mb-4 h-12 w-full rounded-2xl shadow-sm"
                    :class="themeConfig.primary"
                  />
                  <span class="text-xs font-black uppercase tracking-widest">
                    {{ themeConfig.name }}
                  </span>
                  <CheckCircle
                    v-if="theme === themeId"
                    class="absolute right-4 top-4 text-emerald-500"
                    :size="20"
                  />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-12 pt-6 md:grid-cols-2">
              <div class="space-y-6">
                <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
                  <LayoutGrid
                    :size="20"
                    class="text-blue-500"
                  />
                  Affichage du catalogue
                </h3>
                <div class="flex gap-4">
                  <button
                    type="button"
                    class="flex flex-1 flex-col items-center gap-3 rounded-[32px] border-2 p-6 transition-all"
                    :class="layout === 'grid' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-50 bg-white text-gray-400'"
                    @click="layout = 'grid'"
                  >
                    <LayoutGrid :size="32" />
                    <span class="text-[10px] font-black uppercase tracking-widest">Grille (E-commerce)</span>
                  </button>
                  <button
                    type="button"
                    class="flex flex-1 flex-col items-center gap-3 rounded-[32px] border-2 p-6 transition-all"
                    :class="layout === 'list' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-50 bg-white text-gray-400'"
                    @click="layout = 'list'"
                  >
                    <List :size="32" />
                    <span class="text-[10px] font-black uppercase tracking-widest">Liste (Style Instagram)</span>
                  </button>
                </div>
              </div>

              <div class="space-y-6">
                <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
                  <Eye
                    :size="20"
                    class="text-orange-500"
                  />
                  Options de visibilite
                </h3>
                <label class="group flex cursor-pointer items-center justify-between rounded-[32px] bg-gray-50 p-6">
                  <div class="flex items-center gap-4">
                    <div class="rounded-2xl bg-white p-3 text-orange-500 shadow-sm transition-transform group-hover:scale-110">
                      <Smartphone :size="20" />
                    </div>
                    <span class="font-black text-gray-700">Stories WhatsApp</span>
                  </div>
                  <input
                    v-model="showStories"
                    type="checkbox"
                    class="h-6 w-6 rounded-lg accent-emerald-600"
                  >
                </label>
              </div>
            </div>
          </div>

          <div
            v-else
            class="grid grid-cols-1 gap-12 md:grid-cols-2"
          >
            <div class="space-y-8">
              <div class="space-y-4">
                <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
                  <MessageCircle
                    :size="20"
                    class="text-emerald-500"
                  />
                  Communication
                </h3>
                <label class="flex cursor-pointer items-center justify-between rounded-[32px] bg-gray-50 p-6">
                  <span class="font-black text-gray-700">Bouton WhatsApp Flottant</span>
                  <input
                    v-model="showWhatsappButton"
                    type="checkbox"
                    class="h-6 w-6 rounded-lg accent-emerald-600"
                  >
                </label>
                <div class="space-y-2">
                  <label class="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Horaires d'ouverture
                  </label>
                  <input
                    v-model="hours"
                    type="text"
                    placeholder="Ex: Lun - Sam | 08:00 - 19:00"
                    class="w-full rounded-[24px] bg-gray-50 px-8 py-5 font-bold text-gray-800 outline-none"
                  >
                </div>
              </div>
            </div>

            <div class="space-y-8">
              <div class="space-y-4">
                <h3 class="flex items-center gap-2 text-lg font-black text-gray-900">
                  <MapPin
                    :size="20"
                    class="text-red-500"
                  />
                  Localisation & Paiement
                </h3>
                <label class="flex cursor-pointer items-center justify-between rounded-[32px] bg-gray-50 p-6">
                  <span class="font-black text-gray-700">Afficher la carte Google Maps</span>
                  <input
                    v-model="showMaps"
                    type="checkbox"
                    class="h-6 w-6 rounded-lg accent-emerald-600"
                  >
                </label>
                <div class="space-y-4 rounded-[32px] bg-gray-50 p-6">
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Methodes de paiement acceptees
                  </span>
                  <div class="flex gap-4">
                    <div class="flex flex-1 items-center justify-center rounded-2xl border-2 border-emerald-50 bg-white p-4">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/MTN_Logo.svg/1200px-MTN_Logo.svg.png"
                        class="h-6 grayscale opacity-50"
                      >
                    </div>
                    <div class="flex flex-1 items-center justify-center rounded-2xl border-2 border-orange-50 bg-white p-4">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1200px-Orange_logo.svg.png"
                        class="h-6 grayscale opacity-50"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="sticky top-12 flex h-fit flex-col items-center rounded-[60px] border-2 border-dashed border-gray-200 bg-gray-100 p-8 transition-all duration-500"
        :class="previewDevice === 'desktop' ? 'w-full max-w-7xl lg:w-auto' : 'w-full lg:w-[480px]'"
      >
        <div class="mb-10 flex w-full items-center justify-between px-4">
          <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            <Eye :size="16" />
            Apercu en direct
          </div>

          <div class="flex gap-2 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
            <button
              type="button"
              class="rounded-xl p-2 transition-all"
              :class="previewDevice === 'mobile' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'"
              @click="previewDevice = 'mobile'"
            >
              <Smartphone :size="20" />
            </button>
            <button
              type="button"
              class="rounded-xl p-2 transition-all"
              :class="previewDevice === 'desktop' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'"
              @click="previewDevice = 'desktop'"
            >
              <Monitor :size="20" />
            </button>
          </div>
        </div>

        <div
          v-if="previewDevice === 'mobile'"
          class="relative flex h-[700px] w-[340px] flex-col overflow-hidden rounded-[56px] border-[12px] border-gray-900 bg-white shadow-2xl ring-1 ring-gray-100"
        >
          <div class="flex h-10 shrink-0 items-center justify-between bg-white px-8">
            <span class="text-[10px] font-bold text-gray-900">09:41</span>
            <div class="flex gap-1">
              <div class="h-2 w-4 rounded-sm bg-gray-200" />
              <div class="h-2 w-2 rounded-sm bg-gray-200" />
            </div>
          </div>

          <div class="scrollbar-hide flex-1 overflow-y-auto bg-white">
            <div
              class="relative h-36 w-full overflow-hidden"
              :class="currentTheme.primary"
            >
              <img
                v-if="bannerPreview"
                :src="bannerPreview"
                class="h-full w-full object-cover opacity-60"
              >
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center opacity-20"
              >
                <ImageIcon
                  :size="64"
                  class="text-white"
                />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div class="relative z-10 -mt-10 flex flex-col items-center px-6">
              <div class="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[32px] border-4 border-white bg-white p-1 shadow-2xl">
                <img
                  v-if="logoPreview"
                  :src="logoPreview"
                  class="h-full w-full rounded-[24px] object-cover"
                >
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center rounded-[24px]"
                  :class="currentTheme.primary"
                >
                  <Store
                    :size="32"
                    class="text-white"
                  />
                </div>
              </div>

              <div class="w-full px-2 text-center">
                <h4 class="break-words text-xl font-black leading-tight tracking-tight text-gray-900">
                  {{ shopName || "Ma Boutique" }}
                </h4>
                <div
                  class="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  :class="currentTheme.accent"
                >
                  <Phone
                    :size="10"
                    fill="currentColor"
                  />
                  <span>{{ whatsapp || "WhatsApp Business" }}</span>
                </div>
              </div>
            </div>

            <div class="mt-8 flex gap-2 px-6">
              <div class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-[10px] font-black uppercase tracking-widest text-white">
                <MessageCircle :size="14" />
                Contacter
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                <Eye :size="16" />
              </div>
            </div>

            <div
              v-if="showStories"
              class="mt-8"
            >
              <div class="mb-4 flex items-center justify-between px-6">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nouveautes</span>
                <div class="mx-4 h-px flex-1 bg-gray-50" />
              </div>
              <div class="scrollbar-hide flex gap-4 overflow-x-auto px-6 pb-2">
                <div
                  v-for="index in 5"
                  :key="index"
                  class="h-16 w-16 shrink-0 rounded-full border-2 p-0.5"
                  :class="currentTheme.border"
                >
                  <div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-50">
                    <ImageIcon
                      :size="18"
                      class="text-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 space-y-4 px-6">
              <div class="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
                <p class="text-center text-xs font-medium italic leading-relaxed text-gray-500">
                  "{{ description || "Bienvenue dans notre boutique officielle. Qualite et service garantis !" }}"
                </p>
              </div>

              <div class="flex flex-col gap-2 px-2">
                <div class="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                  <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 text-red-500">
                    <MapPin :size="12" />
                  </div>
                  <span>{{ address || "Douala, Cameroun" }}</span>
                </div>
                <div class="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                  <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 text-blue-500">
                    <Clock :size="12" />
                  </div>
                  <span>{{ hours || "08:00 - 18:00" }}</span>
                </div>
              </div>
            </div>

            <div class="mt-10 px-6 pb-20">
              <div class="mb-6 flex items-center gap-3">
                <div
                  class="h-8 w-1.5 rounded-full"
                  :class="currentTheme.primary"
                />
                <h5 class="text-sm font-black uppercase tracking-widest text-gray-900">
                  Le Catalogue
                </h5>
              </div>

              <div
                v-if="layout === 'grid'"
                class="grid grid-cols-2 gap-4"
              >
                <div
                  v-for="index in 4"
                  :key="index"
                  class="group flex flex-col overflow-hidden rounded-[24px] border border-gray-50 bg-white shadow-sm"
                >
                  <div class="flex h-32 items-center justify-center bg-gray-50">
                    <ImageIcon
                      :size="20"
                      class="text-gray-200"
                    />
                  </div>
                  <div class="p-3">
                    <div class="mb-2 h-2 w-16 rounded-full bg-gray-100" />
                    <div class="h-3 w-10 rounded-full bg-gray-900" />
                  </div>
                </div>
              </div>

              <div
                v-else
                class="space-y-4"
              >
                <div
                  v-for="index in 2"
                  :key="index"
                  class="flex gap-4 rounded-[24px] border border-gray-50 bg-white p-4 shadow-sm"
                >
                  <div class="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-50">
                    <ImageIcon
                      :size="20"
                      class="text-gray-200"
                    />
                  </div>
                  <div class="flex flex-1 flex-col justify-center gap-2">
                    <div class="h-2 w-24 rounded-full bg-gray-100" />
                    <div class="h-3 w-12 rounded-full bg-gray-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="showWhatsappButton"
            class="absolute bottom-8 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 ring-4 ring-white animate-bounce"
          >
            <MessageCircle :size="28" />
          </div>
        </div>

        <div
          v-else
          class="flex h-[700px] w-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
        >
          <div class="flex h-8 shrink-0 items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4">
            <div class="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div class="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <div class="scrollbar-hide flex-1 overflow-y-auto">
            <header
              class="relative h-64 overflow-hidden"
              :class="currentTheme.primary"
            >
              <img
                v-if="bannerPreview"
                :src="bannerPreview"
                class="h-full w-full object-cover opacity-60"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div class="absolute bottom-10 inset-x-12 flex items-center gap-8">
                <div class="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[40px] border-4 border-white bg-white p-1 shadow-2xl">
                  <img
                    v-if="logoPreview"
                    :src="logoPreview"
                    class="h-full w-full rounded-[32px] object-cover"
                  >
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center rounded-[32px]"
                    :class="currentTheme.primary"
                  >
                    <Store
                      :size="40"
                      class="text-white"
                    />
                  </div>
                </div>

                <div class="flex-1">
                  <h2 class="mb-2 text-5xl font-black tracking-tighter text-white">
                    {{ shopName || "Ma Boutique" }}
                  </h2>
                  <div class="flex items-center gap-6">
                    <div
                      class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                      :class="currentTheme.accent"
                    >
                      <Phone
                        :size="14"
                        fill="currentColor"
                      />
                      {{ whatsapp || "Numero WhatsApp" }}
                    </div>
                    <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/60">
                      <MapPin :size="14" />
                      {{ address || "Localisation" }}
                    </div>
                  </div>
                </div>

                <button class="rounded-2xl bg-white px-8 py-4 font-black text-gray-900 shadow-xl transition-all hover:scale-105">
                  Contactez-nous
                </button>
              </div>
            </header>

            <div class="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-12 py-16 lg:grid-cols-4">
              <aside class="space-y-8 lg:col-span-1">
                <div class="space-y-4 rounded-[32px] bg-gray-50 p-8">
                  <h3 class="text-xs font-black uppercase tracking-widest text-gray-400">
                    A propos
                  </h3>
                  <p class="text-sm font-medium italic leading-relaxed text-gray-600">
                    "{{ description || "Bienvenue dans notre boutique officielle. Qualite et service garantis !" }}"
                  </p>
                </div>

                <div class="space-y-4">
                  <h3 class="px-4 text-xs font-black uppercase tracking-widest text-gray-400">
                    Informations
                  </h3>
                  <div class="space-y-2">
                    <div class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <Clock
                        :size="18"
                        class="text-blue-500"
                      />
                      <span class="text-xs font-bold text-gray-600">{{ hours }}</span>
                    </div>
                    <div
                      v-if="showMaps"
                      class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <MapPin
                        :size="18"
                        class="text-red-500"
                      />
                      <span class="text-xs font-bold text-gray-600">Google Maps Actif</span>
                    </div>
                  </div>
                </div>
              </aside>

              <main class="space-y-12 lg:col-span-3">
                <section v-if="showStories">
                  <h3 class="mb-6 flex items-center gap-3 text-xl font-black text-gray-900">
                    <Sparkles
                      :size="24"
                      class="text-amber-500"
                    />
                    Nouveautes de la semaine
                  </h3>
                  <div class="flex gap-6 overflow-hidden">
                    <div
                      v-for="index in 4"
                      :key="index"
                      class="h-24 w-24 shrink-0 rounded-[32px] border-4 p-1"
                      :class="currentTheme.border"
                    >
                      <div class="flex h-full w-full items-center justify-center rounded-[24px] bg-gray-50">
                        <ImageIcon
                          :size="32"
                          class="text-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div class="mb-8 flex items-center justify-between">
                    <h3 class="text-2xl font-black text-gray-900">
                      Notre Catalogue
                    </h3>
                    <div class="flex gap-2">
                      <div
                        class="rounded-lg p-2"
                        :class="layout === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'"
                      >
                        <LayoutGrid :size="20" />
                      </div>
                      <div
                        class="rounded-lg p-2"
                        :class="layout === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'"
                      >
                        <List :size="20" />
                      </div>
                    </div>
                  </div>

                  <div
                    class="grid gap-6"
                    :class="layout === 'grid' ? 'grid-cols-3' : 'grid-cols-1'"
                  >
                    <div
                      v-for="index in 6"
                      :key="index"
                      class="flex flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl"
                      :class="layout === 'list' ? 'h-40 flex-row' : ''"
                    >
                      <div
                        class="flex shrink-0 items-center justify-center bg-gray-50"
                        :class="layout === 'list' ? 'w-40' : 'h-48'"
                      >
                        <ImageIcon
                          :size="32"
                          class="text-gray-200"
                        />
                      </div>
                      <div class="flex flex-col justify-center gap-3 p-6">
                        <div class="h-3 w-32 rounded-full bg-gray-100" />
                        <div class="h-4 w-16 rounded-full bg-gray-900" />
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            </div>
          </div>

          <div
            v-if="showWhatsappButton"
            class="absolute bottom-12 right-12 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl ring-4 ring-white animate-bounce"
          >
            <MessageCircle :size="32" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
