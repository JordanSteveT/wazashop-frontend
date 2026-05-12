"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, UploadCloud, X, Loader2, Sparkles, Wand2 } from "lucide-react";
import { productService, categoryService, aiService } from "@/services/api.service";

interface CategoryField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: string[];
}

interface GlobalCategory {
  id: string;
  name: string;
  fields_config: CategoryField[];
}

interface MerchantCategory {
  id: string;
  name: string;
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState("");
  
  const [globalCats, setGlobalCats] = useState<GlobalCategory[]>([]);
  const [merchantCats, setMerchantCats] = useState<MerchantCategory[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePublic, setPricePublic] = useState("");
  const [priceFloor, setPriceFloor] = useState("");
  const [stock, setStock] = useState("");
  const [selectedGlobalCatId, setSelectedGlobalCatId] = useState("");
  const [selectedMerchantCatId, setSelectedMerchantCatId] = useState("");
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({});
  const [existingMedia, setExistingMedia] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [globals, merchants, product] = await Promise.all([
          categoryService.getGlobal(),
          categoryService.getMine(),
          productService.getById(productId)
        ]);

        setGlobalCats(globals);
        setMerchantCats(merchants);
        
        if (product) {
          setTitle(product.title);
          setDescription(product.description || "");
          setPricePublic(product.price_public.toString());
          setPriceFloor(product.price_floor.toString());
          setStock(product.stock.toString());
          setSelectedGlobalCatId(product.global_category_id || "");
          setSelectedMerchantCatId(product.merchant_category_id || "");
          setDynamicAttributes(product.attributes || {});
          setExistingMedia(product.media_urls || []);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
        setError("Impossible de charger le produit.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [productId]);

  const selectedGlobalCat = globalCats.find(c => c.id === selectedGlobalCatId);

  const handleAttributeChange = (name: string, value: any) => {
    setDynamicAttributes(prev => ({ ...prev, [name]: value }));
  };

  const removeExistingFile = (url: string) => {
    setExistingMedia(existingMedia.filter(m => m !== url));
  };

  const generateAiDescription = async () => {
    if (!title || !pricePublic) {
      alert("Veuillez renseigner au moins le titre et le prix.");
      return;
    }

    setGeneratingAi(true);
    try {
      const data = await aiService.generateDescription({
        title,
        price: pricePublic,
        category: selectedGlobalCat?.name,
        attributes: dynamicAttributes
      });
      setDescription(data.description);
    } catch (err: any) {
      alert("Erreur IA : " + err.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const updateData = {
      title,
      description,
      price_public: parseInt(pricePublic, 10),
      price_floor: parseInt(priceFloor, 10),
      stock: parseInt(stock, 10),
      global_category_id: selectedGlobalCatId,
      merchant_category_id: selectedMerchantCatId,
      attributes: dynamicAttributes,
      media_urls: existingMedia
    };

    try {
      await productService.update(productId, updateData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <div className="flex h-screen items-center justify-center bg-gray-50/50"><Loader2 className="animate-spin text-emerald-600 h-12 w-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 mb-6 font-bold group"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </div>
        <span>Retour au catalogue</span>
      </button>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Modifier le produit</h1>
          <p className="text-gray-500 font-medium mt-1">Mettez à jour les informations de votre article.</p>
        </div>

        {error && <div className="mb-8 rounded-2xl bg-red-50 p-6 text-sm text-red-600 border border-red-100 font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Media Section */}
          <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
            <label className="block text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">Photos du produit</label>
            <div className="flex flex-wrap gap-4">
              {existingMedia.map((url, idx) => (
                <div key={idx} className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md group">
                  <img src={url} className="w-full h-full object-cover" alt="Product" />
                  <button type="button" onClick={() => removeExistingFile(url)} className="absolute top-2 right-2 bg-red-500 text-white rounded-xl p-1.5 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {existingMedia.length === 0 && (
                <div className="w-full py-10 flex flex-col items-center justify-center text-gray-300">
                  <UploadCloud size={48} />
                  <p className="text-xs font-bold mt-2 uppercase">Aucune image</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-tight">* Pour changer les images, supprimez l'article et recréez-le (amélioration à venir).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-gray-700 mb-2">Titre du produit *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-bold transition-all" />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Catégorie Globale *</label>
              <select 
                required 
                value={selectedGlobalCatId} 
                onChange={e => setSelectedGlobalCatId(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-bold transition-all appearance-none bg-white"
              >
                <option value="">Sélectionner...</option>
                {globalCats.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Collection Boutique</label>
              <select 
                value={selectedMerchantCatId} 
                onChange={e => setSelectedMerchantCatId(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-bold transition-all appearance-none bg-white"
              >
                <option value="">Aucune...</option>
                {merchantCats.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {selectedGlobalCat && selectedGlobalCat.fields_config.length > 0 && (
              <div className="md:col-span-2 bg-emerald-50/30 p-8 rounded-[32px] border-2 border-emerald-50 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Caractéristiques {selectedGlobalCat.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedGlobalCat.fields_config.map(field => (
                    <div key={field.name}>
                      <label className="block text-[10px] font-black text-emerald-600 mb-2 uppercase tracking-widest">{field.label}</label>
                      <input 
                        type={field.type} 
                        placeholder={field.placeholder}
                        value={dynamicAttributes[field.name] || ""}
                        onChange={e => handleAttributeChange(field.name, e.target.value)}
                        className="w-full rounded-xl border-2 border-emerald-100 px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-bold transition-all bg-white/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-black text-gray-700">Description marketing</label>
                <button 
                  type="button"
                  onClick={generateAiDescription}
                  disabled={generatingAi}
                  className="flex items-center gap-2 text-[10px] font-black bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 active:scale-95 uppercase tracking-widest"
                >
                  {generatingAi ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  Générer avec IA ✨
                </button>
              </div>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-medium transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Prix public (FCFA) *</label>
              <input type="number" required value={pricePublic} onChange={e => setPricePublic(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-mono text-xl font-black transition-all" />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Stock disponible *</label>
              <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-bold text-xl transition-all" />
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 flex justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Appliquer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
