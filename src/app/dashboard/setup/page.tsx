"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { shopService } from "@/services/api.service";

export default function SetupShop() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      await shopService.create(name);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-40"></div>

      <div className="w-full max-w-xl relative">
        <div className="bg-white rounded-[48px] p-12 shadow-[0_30px_100px_rgba(0,0,0,0.06)] border border-gray-100">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-[28px] mx-auto flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-6 rotate-6 transition-transform hover:rotate-0">
              <Store className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Lancez votre boutique</h1>
            <p className="mt-3 text-gray-500 font-medium text-lg leading-relaxed">
              Donnez un nom unique à votre commerce pour que vos clients vous reconnaissent.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl bg-red-50 p-6 text-sm text-red-600 border border-red-100 font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateShop} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nom commercial</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full rounded-3xl border-2 border-gray-50 bg-gray-50 px-8 py-6 text-2xl font-black text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none" 
                placeholder="Ex: Waza Mode, Chez Marie..." 
              />
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-50 flex items-start gap-4">
              <div className="p-2 bg-emerald-500 rounded-xl text-white">
                <Sparkles size={18} />
              </div>
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                Ce nom apparaîtra sur votre catalogue en ligne et vos statuts WhatsApp générés par l'IA.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="w-full rounded-[32px] bg-emerald-600 px-8 py-6 font-black text-white shadow-2xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-4 text-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <ArrowRight size={28} />}
              {loading ? "Création..." : "C'est parti !"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
