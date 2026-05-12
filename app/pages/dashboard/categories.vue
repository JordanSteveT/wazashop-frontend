<script setup lang="ts">
import { Globe, Loader2, Plus, ShieldCheck, Tag, Trash2 } from "lucide-vue-next"
import { categoryService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const loading = ref(true)
const creating = ref(false)
const globalCats = ref<any[]>([])
const merchantCats = ref<any[]>([])
const newCatName = ref("")

const fetchData = async () => {
  try {
    const [globals, merchants] = await Promise.all([
      categoryService.getGlobal(),
      categoryService.getMine(),
    ])
    globalCats.value = globals
    merchantCats.value = merchants
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCreateCategory = async (event: Event) => {
  event.preventDefault()
  if (!newCatName.value.trim()) {
    return
  }

  creating.value = true
  try {
    await categoryService.createMerchant(newCatName.value)
    newCatName.value = ""
    await fetchData()
  } catch (error) {
    console.error(error)
  } finally {
    creating.value = false
  }
}

const handleDeleteCategory = async (id: string) => {
  if (!window.confirm("Voulez-vous vraiment supprimer cette categorie ?")) {
    return
  }

  try {
    await categoryService.deleteMerchant(id)
    await fetchData()
  } catch (error) {
    console.error(error)
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
    class="mx-auto max-w-4xl space-y-12 pb-20"
  >
    <div>
      <h1 class="flex items-center gap-3 text-3xl font-black tracking-tight text-gray-900">
        <div class="rounded-2xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-600/20">
          <Tag :size="24" />
        </div>
        Gestion des Categories
      </h1>
      <p class="mt-2 font-medium text-gray-500">
        Organisez vos produits pour faciliter la navigation de vos clients.
      </p>
    </div>

    <section class="rounded-[40px] border border-gray-100 bg-white p-10 shadow-sm">
      <div class="mb-8 flex items-center gap-3">
        <div class="rounded-xl bg-blue-500 p-2 text-white shadow-lg shadow-blue-500/20">
          <Globe :size="20" />
        </div>
        <h2 class="text-xl font-black text-gray-900">
          Categories Globales
        </h2>
      </div>
      <p class="mb-8 text-sm font-medium italic text-gray-500">
        Ces categories sont definies par la plateforme pour classer vos produits par type et activer les formulaires intelligents.
      </p>
      <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div
          v-for="cat in globalCats"
          :key="cat.id"
          class="group flex flex-col items-center justify-center gap-3 rounded-[32px] border-2 border-transparent bg-gray-50 p-6 transition-all hover:border-blue-100 hover:bg-blue-50/30"
        >
          <div class="text-3xl transition-transform group-hover:scale-125">
            {{ cat.icon || "BOX" }}
          </div>
          <span class="text-center text-xs font-black uppercase tracking-wider text-gray-700">
            {{ cat.name }}
          </span>
        </div>
      </div>
    </section>

    <section class="rounded-[40px] border border-gray-100 bg-white p-10 shadow-sm">
      <div class="mb-8 flex items-center gap-3">
        <div class="rounded-xl bg-emerald-500 p-2 text-white shadow-lg shadow-emerald-500/20">
          <ShieldCheck :size="20" />
        </div>
        <h2 class="text-xl font-black text-gray-900">
          Mes Collections Privees
        </h2>
      </div>

      <form
        class="mb-10 flex gap-3"
        @submit="handleCreateCategory"
      >
        <input
          v-model="newCatName"
          type="text"
          placeholder="Ex: Nouvelle Collection, Promo du weekend..."
          class="flex-1 rounded-2xl border-2 border-gray-100 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
        <button
          type="submit"
          :disabled="creating || !newCatName.trim()"
          class="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Loader2
            v-if="creating"
            class="animate-spin"
            :size="20"
          />
          <Plus
            v-else
            :size="20"
          />
          Ajouter
        </button>
      </form>

      <div class="space-y-4">
        <div
          v-if="merchantCats.length === 0"
          class="rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center"
        >
          <Tag
            class="mx-auto mb-4 text-gray-200"
            :size="48"
          />
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
            Aucune collection creee
          </p>
        </div>

        <template v-else>
          <div
            v-for="cat in merchantCats"
            :key="cat.id"
            class="group flex items-center justify-between rounded-2xl border-2 border-gray-50 bg-white p-5 transition-all hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
                <Tag :size="20" />
              </div>
              <span class="text-lg font-black tracking-tight text-gray-700">
                {{ cat.name }}
              </span>
            </div>
            <button
              type="button"
              class="rounded-xl p-3 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              @click="handleDeleteCategory(cat.id)"
            >
              <Trash2 :size="20" />
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
