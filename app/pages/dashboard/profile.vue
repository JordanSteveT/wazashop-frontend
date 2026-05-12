<script setup lang="ts">
import {
  Camera,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Save,
  User,
} from "lucide-vue-next"
import { userService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const loading = ref(true)
const saving = ref(false)
const error = ref("")
const success = ref(false)
const firstName = ref("")
const lastName = ref("")
const email = ref("")
const bio = ref("")
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const currentAvatarUrl = ref<string | null>(null)

const fetchUser = async () => {
  try {
    const data = await userService.getMe()
    firstName.value = data.firstName || ""
    lastName.value = data.lastName || ""
    email.value = data.email || ""
    bio.value = data.bio || ""
    currentAvatarUrl.value = data.avatar_url || null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  saving.value = true
  error.value = ""
  success.value = false

  const formData = new FormData()
  formData.append("firstName", firstName.value)
  formData.append("lastName", lastName.value)
  formData.append("email", email.value)
  formData.append("bio", bio.value)

  if (avatarFile.value) {
    formData.append("avatar", avatarFile.value)
  }

  try {
    const data = await userService.update(formData)
    currentAvatarUrl.value = data.avatar_url || currentAvatarUrl.value
    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message
  } finally {
    saving.value = false
  }
}

onMounted(fetchUser)
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
    class="mx-auto max-w-4xl space-y-12 pb-20"
  >
    <div>
      <h1 class="flex items-center gap-3 text-3xl font-black tracking-tight text-gray-900">
        <div class="rounded-2xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-600/20">
          <User :size="24" />
        </div>
        Mon Profil
      </h1>
      <p class="mt-2 font-medium text-gray-500">
        Gerez vos informations personnelles et votre identite visuelle.
      </p>
    </div>

    <div class="overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-sm">
      <form
        class="p-10"
        @submit="handleSubmit"
      >
        <div
          v-if="error"
          class="animate-shake mb-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600"
        >
          {{ error }}
        </div>

        <div class="flex flex-col gap-12 lg:flex-row">
          <div class="flex flex-col items-center space-y-6">
            <div class="group relative">
              <div class="relative h-48 w-48 overflow-hidden rounded-[48px] border-8 border-white bg-emerald-50 shadow-2xl">
                <img
                  v-if="avatarPreview || currentAvatarUrl"
                  :src="avatarPreview || currentAvatarUrl || ''"
                  alt="Avatar"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                >
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-emerald-600"
                >
                  <User :size="64" />
                </div>

                <label class="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-emerald-600/80 text-white opacity-0 transition-all backdrop-blur-sm group-hover:opacity-100">
                  <Camera
                    class="mb-2"
                    :size="32"
                  />
                  <span class="text-[10px] font-black uppercase tracking-widest">Changer</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange"
                  >
                </label>
              </div>

              <div class="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 :size="20" />
              </div>
            </div>

            <div class="text-center">
              <p class="mb-1 text-xs font-black uppercase tracking-widest text-gray-400">
                Photo de profil
              </p>
              <p class="text-[10px] font-medium italic text-gray-400">
                Format carre conseille
              </p>
            </div>
          </div>

          <div class="flex-1 space-y-8">
            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label class="ml-1 mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Prenom
                </label>
                <input
                  v-model="firstName"
                  type="text"
                  placeholder="Jean"
                  class="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
              </div>

              <div>
                <label class="ml-1 mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Nom
                </label>
                <input
                  v-model="lastName"
                  type="text"
                  placeholder="Dupont"
                  class="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
              </div>
            </div>

            <div>
              <label class="ml-1 mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Adresse Email
              </label>
              <div class="relative">
                <Mail
                  class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"
                  :size="20"
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="jean.dupont@email.com"
                  class="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 py-4 pl-14 pr-6 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
              </div>
            </div>

            <div>
              <label class="ml-1 mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Biographie / A propos
              </label>
              <div class="relative">
                <Info
                  class="absolute left-6 top-6 text-gray-300"
                  :size="20"
                />
                <textarea
                  v-model="bio"
                  placeholder="Dites-en plus sur vous et votre expertise..."
                  class="min-h-[140px] w-full resize-none rounded-2xl border-2 border-gray-50 bg-gray-50 px-14 py-5 font-medium text-gray-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 flex items-center justify-between border-t border-gray-50 pt-10">
          <div
            v-if="success"
            class="flex items-center gap-3 text-sm font-black text-emerald-600"
          >
            <CheckCircle2 :size="24" />
            Profil mis a jour !
          </div>
          <div
            v-else
            class="flex-1"
          />

          <button
            type="submit"
            :disabled="saving"
            class="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-12 py-5 text-lg font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 md:w-auto"
          >
            <Loader2
              v-if="saving"
              class="animate-spin"
              :size="24"
            />
            <Save
              v-else
              :size="24"
            />
            <span>{{ saving ? "Enregistrement..." : "Sauvegarder" }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
