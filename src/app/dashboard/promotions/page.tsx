"use client";

import { useEffect, useState } from "react";
import { flashSaleService } from "@/services/api.service";
import { 
  Zap, 
  Plus, 
  Timer, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Share2, 
  TrendingDown,
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function PromotionsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [discountPct, setDiscountPct] = useState(15);
  const [durationHours, setDurationHours] = useState(24);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const data = await flashSaleService.getAll();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await flashSaleService.create({ name, discountPct, durationHours });
      setShowModal(false);
      setName("");
      fetchSales();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/promo/${code}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
              <Zap size={24} fill="white" />
            </div>
            Ventes Flash
          </h1>
          <p className="text-gray-500 font-medium mt-2">Créez des liens promotionnels temporaires pour booster vos ventes WhatsApp.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={24} />
          Nouvelle Promo
        </button>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-emerald-500 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Share2 size={20} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Partages WhatsApp</p>
          </div>
          <p className="text-3xl font-black text-gray-900">124</p>
          <p className="text-xs text-emerald-600 font-bold mt-2">+12% cette semaine</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-amber-500 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <TrendingDown size={20} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Réduction Moyenne</p>
          </div>
          <p className="text-3xl font-black text-gray-900">18%</p>
          <p className="text-xs text-amber-600 font-bold mt-2">Optimal pour conversion</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Timer size={20} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Temps Moyen</p>
          </div>
          <p className="text-3xl font-black text-gray-900">24h</p>
          <p className="text-xs text-blue-600 font-bold mt-2">Urgence max</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Vos Liens Actifs</h2>
          <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {sales.filter(s => s.isActive).length} En cours
          </span>
        </div>
        
        {sales.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Zap size={40} />
            </div>
            <p className="text-gray-400 font-bold">Aucune promotion créée pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sales.map((sale) => (
              <div key={sale.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                    <span className="text-lg font-black leading-none">-{sale.discount_pct}%</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{sale.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer size={14} />
                        <span className={new Date(sale.expiresAt) < new Date() ? "text-red-500" : "text-amber-500"}>
                          {new Date(sale.expiresAt) < new Date() ? "Expiré" : `Expire le ${new Date(sale.expiresAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 px-4 py-3 rounded-xl font-mono text-sm text-gray-600 select-all">
                    .../promo/{sale.code}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(sale.code)}
                    className={`p-4 rounded-xl transition-all flex items-center gap-2 ${copySuccess === sale.code ? 'bg-emerald-500 text-white scale-110' : 'bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                  >
                    {copySuccess === sale.code ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    <span className="text-xs font-black uppercase tracking-widest">{copySuccess === sale.code ? "Copié !" : "Copier"}</span>
                  </button>
                  <a 
                    href={`/promo/${sale.code}`} 
                    target="_blank"
                    className="p-4 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-6">
          <div className="w-full max-w-lg rounded-[48px] bg-white p-12 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="relative">
              <h2 className="text-3xl font-black text-gray-900 mb-8">Nouvelle Vente Flash</h2>
              
              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de la campagne</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-bold transition-all" 
                    placeholder="Ex: Promo Weekend, Braderie Été..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Réduction (%)</label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      max="99"
                      value={discountPct} 
                      onChange={e => setDiscountPct(parseInt(e.target.value))} 
                      className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-bold transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Durée (Heures)</label>
                    <select 
                      value={durationHours} 
                      onChange={e => setDurationHours(parseInt(e.target.value))}
                      className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-bold transition-all appearance-none"
                    >
                      <option value={12}>12 Heures</option>
                      <option value={24}>24 Heures</option>
                      <option value={48}>48 Heures</option>
                      <option value={168}>1 Semaine</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-50 text-gray-400 px-8 py-5 rounded-2xl font-black hover:bg-gray-100 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating}
                    className="flex-[2] bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {creating ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="white" />}
                    Générer le lien
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
