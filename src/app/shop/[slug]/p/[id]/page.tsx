"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Store, 
  MapPin, 
  Phone, 
  Loader2, 
  MessageCircle, 
  Clock, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Info,
  ChevronRight,
  TrendingUp,
  Gift,
  Truck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { publicShopService } from "@/services/api.service";
import Link from "next/link";

const THEMES = {
  serieux: { primary: "bg-blue-900", text: "text-blue-900", accent: "bg-blue-50", button: "bg-blue-900 hover:bg-blue-800" },
  vibrant: { primary: "bg-orange-500", text: "text-orange-500", accent: "bg-orange-50", button: "bg-orange-500 hover:bg-orange-600" },
  luxe: { primary: "bg-black", text: "text-black", accent: "bg-gray-50", button: "bg-black hover:bg-gray-900" },
  nature: { primary: "bg-emerald-800", text: "text-emerald-800", accent: "bg-emerald-50", button: "bg-emerald-800 hover:bg-emerald-900" }
};

const CAMEROON_ZONES = [
  { name: "Douala - Akwa", fee: 1000 },
  { name: "Douala - Bonamoussadi", fee: 1500 },
  { name: "Douala - Logpom/Lendi", fee: 2000 },
  { name: "Yaoundé - Bastos", fee: 1500 },
  { name: "Yaoundé - Mvan", fee: 2000 },
  { name: "Autre ville (Expédition)", fee: 3500 },
];

export default function ProductDetailPage() {
  const { slug, id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  // Negotiation State
  const [offeredPrice, setOfferedPrice] = useState<string>("");
  const [negotiationResult, setNegotiationResult] = useState<any>(null);
  const [negotiating, setNegotiating] = useState(false);
  
  // Delivery State
  const [selectedZone, setSelectedZone] = useState<any>(null);
  
  // Gift State
  const [isGift, setIsGift] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await publicShopService.getProductById(id as string);
        setProduct(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleNegotiate = async () => {
    if (!offeredPrice || isNaN(Number(offeredPrice))) return;
    setNegotiating(true);
    try {
      const result = await publicShopService.negotiate(id as string, Number(offeredPrice));
      setNegotiationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setNegotiating(false);
    }
  };

  const finalPrice = negotiationResult?.accepted ? Number(offeredPrice) : product?.price_public;
  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  const totalWithDelivery = (finalPrice || 0) + deliveryFee;

  const generateWhatsAppLink = () => {
    const baseUrl = "https://wa.me/" + product.shop.whatsappBusiness.replace(/\\+/g, '');
    let message = `Bonjour ${product.shop.name}, je souhaite commander cet article vu sur WazaShop :\n\n`;
    message += `🛒 *Article :* ${product.title}\n`;
    message += `💰 *Prix :* ${finalPrice.toLocaleString()} FCFA\n`;
    
    if (selectedZone) {
      message += `📍 *Livraison :* ${selectedZone.name} (+${deliveryFee} FCFA)\n`;
      message += `💵 *Total :* ${totalWithDelivery.toLocaleString()} FCFA\n`;
    }

    if (isGift) {
      message += `🎁 *C'EST UN CADEAU !*\n`;
      message += `📱 Numéro destinataire : ${recipientPhone}\n`;
    }

    message += `\n🔗 Lien : ${window.location.href}`;
    
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center font-black">Produit non trouvé.</div>;

  const currentTheme = THEMES[product.shop.preferences?.theme as keyof typeof THEMES] || THEMES.serieux;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Navbar mobile */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
         <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <ChevronLeft size={24} />
         </button>
         <h3 className="font-black text-sm uppercase tracking-widest truncate max-w-[200px]">{product.shop.name}</h3>
         <Link href={`/shop/${slug}`} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <Store size={24} className={currentTheme.text} />
         </Link>
      </div>

      <div className="max-w-7xl mx-auto md:pt-12 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Gallery */}
        <div className="space-y-6">
           <div className="bg-white md:rounded-[48px] overflow-hidden shadow-sm aspect-square relative group">
              {product.media_urls && product.media_urls[activeImage] ? (
                <img src={product.media_urls[activeImage]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                   <ShoppingBag size={80} />
                </div>
              )}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-[24px] shadow-xl">
                 <span className="font-black text-xl text-gray-900">{product.price_public.toLocaleString()} <span className="text-xs text-gray-400">FCFA</span></span>
              </div>
           </div>

           <div className="flex gap-4 px-6 md:px-0 overflow-x-auto scrollbar-hide">
              {product.media_urls?.map((url: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-[24px] border-4 transition-all overflow-hidden shrink-0 ${activeImage === i ? 'border-emerald-600 scale-105 shadow-lg' : 'border-white opacity-60'}`}
                >
                   <img src={url} className="w-full h-full object-cover" />
                </button>
              ))}
           </div>
        </div>

        {/* Right: Persuasion Panel */}
        <div className="px-6 md:px-0 space-y-10">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                 <Zap size={14} fill="currentColor" /> Nouveau stock disponible
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{product.title}</h1>
              <p className="text-gray-500 font-medium leading-relaxed">{product.description}</p>
           </div>

           {/* Negotiation Engine */}
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                   <TrendingUp className="text-emerald-500" size={20} /> Proposez votre prix
                 </h3>
                 <Info size={16} className="text-gray-300" />
              </div>
              <div className="flex gap-3">
                 <input 
                   type="number" 
                   value={offeredPrice}
                   onChange={(e) => setOfferedPrice(e.target.value)}
                   placeholder="Votre offre (FCFA)"
                   className="flex-1 bg-gray-50 border-2 border-transparent rounded-[24px] px-6 py-4 font-black focus:bg-white focus:border-emerald-500 transition-all outline-none"
                 />
                 <button 
                  onClick={handleNegotiate}
                  disabled={negotiating || !offeredPrice}
                  className="bg-gray-900 text-white px-8 rounded-[24px] font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                >
                   {negotiating ? <Loader2 className="animate-spin" /> : "Vérifier"}
                 </button>
              </div>

              {negotiationResult && (
                <div className={`p-5 rounded-[24px] flex items-center gap-4 animate-in fade-in slide-in-from-top-2 ${negotiationResult.accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                   {negotiationResult.accepted ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                   <div className="flex-1">
                      <p className="font-black text-sm">{negotiationResult.message}</p>
                      {negotiationResult.accepted && <p className="text-xs font-bold opacity-80">Vous économisez {negotiationResult.saving.toLocaleString()} FCFA !</p>}
                   </div>
                </div>
              )}
           </div>

           {/* Delivery & Zones */}
           <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                 <Truck className="text-blue-500" size={20} /> Livraison locale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {CAMEROON_ZONES.map((zone, i) => (
                   <button 
                    key={i}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-5 rounded-[24px] border-2 text-left transition-all ${selectedZone?.name === zone.name ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10' : 'border-white bg-white hover:border-gray-100 shadow-sm'}`}
                   >
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{zone.name}</div>
                      <div className="font-black text-gray-900">+{zone.fee.toLocaleString()} FCFA</div>
                   </button>
                 ))}
              </div>
           </div>

           {/* Special Options */}
           <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm group-hover:scale-110 transition-all">
                       <Gift size={20} />
                    </div>
                    <span className="font-black text-gray-900">Offrir ce cadeau</span>
                 </div>
                 <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} className="w-6 h-6 accent-amber-600 rounded-lg" />
              </label>
              {isGift && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                   <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-2">Numéro WhatsApp du destinataire</p>
                   <input 
                    type="text" 
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Ex: +237 ..."
                    className="w-full bg-white border-2 border-amber-200 rounded-2xl px-6 py-4 font-bold text-gray-800 outline-none focus:border-amber-500 transition-all"
                   />
                </div>
              )}
           </div>

           {/* Trust Badges */}
           <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-gray-100 rounded-full flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-600" />
                 <span className="text-[10px] font-black uppercase text-gray-500">Vendeur Vérifié</span>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-full flex items-center gap-2">
                 <MessageCircle size={14} className="text-blue-600" />
                 <span className="text-[10px] font-black uppercase text-gray-500">Réponse -10 min</span>
              </div>
           </div>
        </div>
      </div>

      {/* STICKY BUY BUTTON */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 md:px-20 flex items-center justify-between gap-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <div className="hidden md:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total à payer</p>
            <h4 className="text-2xl font-black text-gray-900">{totalWithDelivery.toLocaleString()} <span className="text-xs text-gray-400">FCFA</span></h4>
         </div>
         <div className="flex-1 flex gap-4">
            <a 
              href={generateWhatsAppLink()}
              target="_blank"
              className={`flex-1 ${currentTheme.button} text-white py-5 rounded-[28px] font-black text-lg md:text-xl shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all`}
            >
               <MessageCircle size={28} />
               Commander sur WhatsApp
            </a>
         </div>
      </div>
    </div>
  );
}
