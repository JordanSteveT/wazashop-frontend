"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Tag, ShieldCheck, Globe } from "lucide-react";
import { categoryService } from "@/services/api.service";

interface GlobalCategory {
  id: string;
  name: string;
  icon: string;
}

interface MerchantCategory {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [globalCats, setGlobalCats] = useState<GlobalCategory[]>([]);
  const [merchantCats, setMerchantCats] = useState<MerchantCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [globals, merchants] = await Promise.all([
        categoryService.getGlobal(),
        categoryService.getMine()
      ]);
      setGlobalCats(globals);
      setMerchantCats(merchants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreating(true);
    try {
      await categoryService.createMerchant(newCatName);
      setNewCatName("");
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;

    try {
      await categoryService.deleteMerchant(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
            <Tag size={24} />
          </div>
          Gestion des Catégories
        </h1>
        <p className="text-gray-500 font-medium mt-2">Organisez vos produits pour faciliter la navigation de vos clients.</p>
      </div>

      {/* Global Categories Section */}
      <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Globe size={20} />
          </div>
          <h2 className="text-xl font-black text-gray-900">Catégories Globales</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8 font-medium italic">Ces catégories sont définies par la plateforme pour classer vos produits par type et activer les formulaires intelligents.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {globalCats.map(cat => (
            <div key={cat.id} className="p-6 bg-gray-50 rounded-[32px] border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 group">
              <div className="text-3xl group-hover:scale-125 transition-transform">📦</div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-wider">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Merchant Categories Section */}
      <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-xl font-black text-gray-900">Mes Collections Privées</h2>
        </div>

        <form onSubmit={handleCreateCategory} className="flex gap-3 mb-10">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ex: Nouvelle Collection, Promo du weekend..."
            className="flex-1 rounded-2xl border-2 border-gray-100 px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-800 font-bold transition-all"
          />
          <button 
            type="submit" 
            disabled={creating || !newCatName.trim()}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {creating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Ajouter
          </button>
        </form>

        <div className="space-y-4">
          {merchantCats.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
              <Tag className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucune collection créée</p>
            </div>
          ) : (
            merchantCats.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-5 bg-white border-2 border-gray-50 rounded-2xl hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Tag size={20} />
                  </div>
                  <span className="font-black text-gray-700 tracking-tight text-lg">{cat.name}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
