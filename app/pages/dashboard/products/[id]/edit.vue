<script setup lang="ts">
import { ArrowLeft, Loader2, Sparkles, UploadCloud, Wand2, X } from "lucide-vue-next"
import { aiService, categoryService, productService } from "~/services/api.service"

definePageMeta({
  layout: "dashboard",
  middleware: "auth" as never,
})

const router = useRouter()
const route = useRoute()
const productId = computed(() => route.params.id as string)

const loading = ref(false)
const fetchingData = ref(true)
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
const existingMedia = ref<string[]>([])

const selectedGlobalCat = computed(() =>
  globalCats.value.find((cat) => cat.id === selectedGlobalCatId.value),
)

const fetchData = async () => {
  try {
    const [globals, merchants, product] = await Promise.all([
      categoryService.getGlobal(),
      categoryService.getMine(),
      productService.getById(productId.value),
    ])

    globalCats.value = globals
    merchantCats.value = merchants
    title.value = product.title || ""
    description.value = product.description || ""
    pricePublic.value = String(product.price_public || "")
    priceFloor.value = String(product.price_floor || "")
    stock.value = String(product.stock || "")
    selectedGlobalCatId.value = product.global_category_id || ""
    selectedMerchantCatId.value = product.merchant_category_id || ""
    dynamicAttributes.value = product.attributes || {}
    existingMedia.value = product.media_urls || []
  } catch (caughtError) {
    console.error("Erreur lors du chargement des donnees", caughtError)
    error.value = "Impossible de charger le produit."
  } finally {
    fetchingData.value = false
  }
}

const handleAttributeChange = (name: string, value: string) => {
  dynamicAttributes.value = {
    ...dynamicAttributes.value,
    [name]: value,
  }
}

const removeExistingFile = (url: string) => {
  existingMedia.value = existingMedia.value.filter((media) => media !== url)
}

const generateAiDescription = async () => {
  if (!title.value || !pricePublic.value) {
    window.alert("Veuillez renseigner au moins le titre et le prix.")
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

  try {
    await productService.update(productId.value, {
      title: title.value,
      description: description.value,
      price_public: Number.parseInt(pricePublic.value, 10),
      price_floor: Number.parseInt(priceFloor.value, 10),
      stock: Number.parseInt(stock.value, 10),
      global_category_id: selectedGlobalCatId.value,
      merchant_category_id: selectedMerchantCatId.value,
      attributes: dynamicAttributes.value,
      media_urls: existingMedia.value,
    })
    await router.push("/dashboard")
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div
    v-if="fetchingData"
    class="flex h-screen items-center justify-center bg-gray-50/50"
  >
    <Loader2 class="h-12 w-12 animate-spin text-emerald-600" />
  </div>

  <div
    v-else
    class="mx-auto max-w-4xl pb-20"
  >
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

    <div class="rounded-[40px] border border-gray-100 bg-white p-10 shadow-sm">
      <div class="mb-10">
        <h1 class="text-3xl font-black tracking-tight text-gray-900">
          Modifier le produit
        </h1>
        <p class="mt-1 font-medium text-gray-500">
          Mettez a jour les informations de votre article.
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
            Photos du produit
          </label>
          <div class="flex flex-wrap gap-4">
            <div
              v-for="(url, index) in existingMedia"
              :key="url"
              class="group relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-md"
            >
              <img
                :src="url"
                class="h-full w-full object-cover"
                alt="Product"
              >
              <button
                type="button"
                class="absolute right-2 top-2 rounded-xl bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                @click="removeExistingFile(url)"
              >
                <X :size="16" />
              </button>
            </div>

            <div
              v-if="existingMedia.length === 0"
              class="flex w-full flex-col items-center justify-center py-10 text-gray-300"
            >
              <UploadCloud :size="48" />
              <p class="mt-2 text-xs font-bold uppercase">
                Aucune image
              </p>
            </div>
          </div>
          <p class="mt-4 text-[10px] font-bold uppercase tracking-tight text-gray-400">
            * Pour changer les images, supprimez l'article et recreez-le.
          </p>
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
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Categorie Globale *
            </label>
            <select
              v-model="selectedGlobalCatId"
              required
              class="w-full appearance-none rounded-2xl border-2 border-gray-100 bg-white px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">
                Selectionner...
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
              Collection Boutique
            </label>
            <select
              v-model="selectedMerchantCatId"
              class="w-full appearance-none rounded-2xl border-2 border-gray-100 bg-white px-6 py-4 font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">
                Aucune...
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
              class="w-full resize-none rounded-2xl border-2 border-gray-100 px-6 py-4 font-medium text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Prix public (FCFA) *
            </label>
            <input
              v-model="pricePublic"
              type="number"
              required
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 font-mono text-xl font-black text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Prix plancher (FCFA) *
            </label>
            <input
              v-model="priceFloor"
              type="number"
              required
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 font-mono text-xl font-black text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-black text-gray-700">
              Stock disponible *
            </label>
            <input
              v-model="stock"
              type="number"
              required
              class="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 text-xl font-bold text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
          </div>
        </div>

        <div class="flex justify-end border-t border-gray-50 pt-10">
          <button
            type="submit"
            :disabled="loading"
            class="rounded-2xl bg-emerald-600 px-12 py-5 text-lg font-black text-white shadow-2xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {{ loading ? "Enregistrement..." : "Appliquer les modifications" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
