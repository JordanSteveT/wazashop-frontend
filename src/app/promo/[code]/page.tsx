"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { flashSaleService } from "@/services/api.service";
import { Zap, ShoppingBag, Clock, AlertTriangle, Loader2 } from "lucide-react";

export default function PromoPage() {
  const { code } = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPromo = async () => {
      try {
        const data = await flashSaleService.verify(code as string);
        setSale(data);
      } catch (err: any) {
        setError("Ce lien n'est plus valide ou a expiré.");
      } finally {
        setLoading(false);
      }
    };
    verifyPromo();
  }, [code]);

  const activatePromo = () => {
    // On stocke la promo dans le localStorage pour l'appliquer au panier plus tard
    localStorage.setItem("wazashop_active_promo", JSON.stringify({
      code: sale.code,
      discount: sale.discount_pct,
      shopId: sale.shop_id
    }));
    // Rediriger vers la boutique (simulation ici, à adapter avec le vrai slug)
    // window.location.href = `http://localhost:3000/shop/${sale.shop.slug}`;
    alert("Promotion activée ! Vous allez être redirigé vers la boutique.");
    router.push("/dashboard"); // Pour la démo on revient au dashboard
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-emerald-600 h-12 w-12" /></div>;

  if (error || (sale && sale.isExpired)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-4">Oups ! Lien expiré</h1>
          <p className="text-gray-500 font-medium mb-8">Cette offre n'est plus disponible. Mais ne vous inquiétez pas, il y a plein d'autres articles à découvrir !</p>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-amber-100 rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-40"></div>

      <div className="max-w-lg w-full relative">
        <div className="bg-white rounded-[48px] p-12 shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-gray-100 text-center">
          <div className="w-24 h-24 bg-amber-500 rounded-[32px] mx-auto flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-8 rotate-6">
            <Zap size={48} className="text-white" fill="white" />
          </div>

          <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Offre Exclusive</h2>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">{sale.name}</h1>
          
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="bg-emerald-600 text-white px-6 py-2 rounded-full font-black text-2xl">
              -{sale.discount_pct}%
            </div>
            <div className="flex items-center gap-2 text-gray-400 font-bold">
              <Clock size={18} />
              <span>Offre limitée</span>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl mb-10 text-left space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Boutique</p>
                <p className="font-black text-gray-900">{sale.shop?.name || "Boutique Waza"}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={activatePromo}
            className="w-full bg-emerald-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            En profiter maintenant
          </button>
          
          <p className="mt-8 text-gray-400 text-xs font-bold italic">
            * La réduction sera appliquée automatiquement lors de votre commande WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
