<script setup lang="ts">
import { ArrowLeft, Loader2, Sparkles, UploadCloud, Wand2, X } from "lucide-vue-next"
import { aiService, categoryService, productService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

type UploadItem = { file: File; preview: string }

const router = useRouter()

const loading = ref(false)
const fetchingCats = ref(true)
const generatingAi = ref(false)
const error = ref("")
const globalCats = ref<any[]>([])
const merchantCats = ref<any[]>([])
const title = ref("")
const description = ref("")
const pricePublic = ref("")
const priceFloor = ref("")
const stock = ref("")
const selectedGlobalCatId = ref("")
const selectedMerchantCatId = ref("")
const dynamicAttributes = ref<Record<string, string>>({})
const files = ref<UploadItem[]>([])

const selectedGlobalCat = computed(() =>
  globalCats.value.find((cat) => cat.id === selectedGlobalCatId.value),
)

const fetchCategories = async () => {
  try {
    const [globals, merchants] = await Promise.all([
      categoryService.getGlobal(),
      categoryService.getMine(),
    ])
    globalCats.value = globals
    merchantCats.value = merchants
  } catch (error) {
    console.error("Erreur lors du chargement des categories", error)
  } finally {
    fetchingCats.value = false
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || []).slice(0, 5)
  files.value = selectedFiles.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }))
}

const removeFile = (index: number) => {
  const file = files.value[index]
  if (file) {
    URL.revokeObjectURL(file.preview)
  }
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index)
}

const handleAttributeChange = (name: string, value: string) => {
  dynamicAttributes.value = {
    ...dynamicAttributes.value,
    [name]: value,
  }
}

const generateAiDescription = async () => {
  if (!title.value.trim()) {
    window.alert("Veuillez saisir un titre pour le produit.")
    return
  }

  if (!pricePublic.value) {
    window.alert("Veuillez saisir un prix de vente.")
    return
  }

  generatingAi.value = true
  try {
    const data = await aiService.generateDescription({
      title: title.value,
      price: pricePublic.value,
      category: selectedGlobalCat.value?.name,
      attributes: dynamicAttributes.value,
    })
    description.value = data.description
  } catch (err: any) {
    window.alert(`Erreur IA : ${err.message}`)
  } finally {
    generatingAi.value = false
  }
}

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  loading.value = true
  error.value = ""

  const formData = new FormData()
  formData.append("title", title.value)
  formData.append("description", description.value)
  formData.append("price_public", pricePublic.value)
  formData.append("price_floor", priceFloor.value)
  formData.append("stock", stock.value)
  formData.append("global_category_id", selectedGlobalCatId.value)

  if (selectedMerchantCatId.value) {
    formData.append("merchant_category_id", selectedMerchantCatId.value)
  }

  formData.append("attributes", JSON.stringify(dynamicAttributes.value))
  files.value.forEach((item) => {
    formData.append("media", item.file)
  })

  try {
    await productService.create(formData)
    await router.push("/dashboard")
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <button
      type="button"
      class="group mb-6 flex items-center space-x-2 font-bold text-gray-500 hover:text-gray-900"
      @click="router.back()"
    >
      <div class="rounded-xl bg-white p-2 shadow-sm transition-colors group-hover:bg-gray-100">
        <ArrowLeft :size="20" />
      </div>
      <span>Retour au catalogue</span>
    </button>

    <div class="rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
      <div class="mb-10">
        <h1 class="text-3xl font-black tracking-tight text-gray-900">
          Ajouter un produit
        </h1>
        <p class="mt-1 font-medium text-gray-500">
          Renseignez les informations pour classer et vendre votre article.
        </p>
      </div>

      <div
        v-if="error"
        class="mb-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600"
      >
        {{ error }}
      </div>

      <form
        class="space-y-10"
        @submit="handleSubmit"
      >
        <div class="rounded-[32px] border border-gray-100 bg-gray-50 p-8">
          <label class="mb-6 block text-xs font-black uppercase tracking-widest text-gray-400">
            Photos (max 5)
          </label>
          <div class="flex flex-wrap gap-4">
            <div
              v-for="(file, index) in files"
              :key="file.preview"
              class="group relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-md"
            >
              <img
                :src="file.preview"
                class="h-full w-full object-cover"
                alt="Preview"
              >
              <button
                type="button"
                class="absolute right-2 top-2 rounded-xl bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                @click="removeFile(index)"
              >
                <X :size="16" />
              </button>
            </div>

            <label
              v-if="files.length < 5"
              class="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <UploadCloud :size="32" />
              <span class="mt-2 text-[10px] font-black uppercase tracking-tighter">Ajouter</span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileChange"
              >
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-2 block text-sm font-black text-gray-700">
              Titre du produit *
            </label>
            <input
              v-model="title"
              type="text"
              required
              placeholder="Ex: Chaussures Nike Air Force 1"
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Type de produit (Global) *
            </label>
            <select
              v-model="selectedGlobalCatId"
              required
              class="w-full appearance-none rounded-2xl border-2 border-gray-100 bg-white px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              @change="dynamicAttributes = {}"
            >
              <option value="">
                Selectionner un type...
              </option>
              <option
                v-for="cat in globalCats"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Collection (Votre boutique)
            </label>
            <select
              v-model="selectedMerchantCatId"
              class="w-full appearance-none rounded-2xl border-2 border-gray-100 bg-white px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">
                Aucune collection...
              </option>
              <option
                v-for="cat in merchantCats"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div
            v-if="selectedGlobalCat?.fields_config?.length"
            class="space-y-6 rounded-[32px] border-2 border-emerald-50 bg-emerald-50/30 p-8 md:col-span-2"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-emerald-500 p-2 text-white">
                <Sparkles :size="18" />
              </div>
              <h3 class="text-sm font-black uppercase tracking-widest text-emerald-800">
                Caracteristiques {{ selectedGlobalCat.name }}
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                v-for="field in selectedGlobalCat.fields_config"
                :key="field.name"
              >
                <label class="mb-2 block text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  {{ field.label }}
                </label>
                <input
                  :type="field.type"
                  :placeholder="field.placeholder"
                  :value="dynamicAttributes[field.name] || ''"
                  class="w-full rounded-xl border-2 border-emerald-100 bg-white/50 px-5 py-3 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  @input="handleAttributeChange(field.name, ($event.target as HTMLInputElement).value)"
                >
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <div class="mb-2 flex items-center justify-between">
              <label class="block text-sm font-black text-gray-700">
                Description marketing
              </label>
              <button
                type="button"
                :disabled="generatingAi"
                class="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50"
                @click="generateAiDescription"
              >
                <Loader2
                  v-if="generatingAi"
                  class="animate-spin"
                  :size="14"
                />
                <Wand2
                  v-else
                  :size="14"
                />
                Generer avec IA
              </button>
            </div>
            <textarea
              v-model="description"
              rows="5"
              placeholder="Decrivez votre produit ici ou utilisez l'IA pour generer un texte de vente captivant..."
              class="w-full resize-none rounded-2xl border-2 border-gray-100 px-6 py-4 font-medium text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Prix de vente (FCFA) *
            </label>
            <input
              v-model="pricePublic"
              type="number"
              required
              placeholder="Entrez le prix"
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 font-mono text-xl font-black text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Prix plancher (Invisible) *
            </label>
            <input
              v-model="priceFloor"
              type="number"
              required
              placeholder="Prix minimum"
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 font-mono text-xl font-black text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Quantite en stock
            </label>
            <input
              v-model="stock"
              type="number"
              placeholder="Ex: 10"
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 text-xl font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>
        </div>

        <div class="flex justify-end border-t border-gray-50 pt-10">
          <button
            type="submit"
            :disabled="loading || fetchingCats || generatingAi"
            class="rounded-2xl bg-emerald-600 px-12 py-5 text-lg font-black text-white shadow-2xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {{ loading ? "Creation en cours..." : "Enregistrer le produit" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
