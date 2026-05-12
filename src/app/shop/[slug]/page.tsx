"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Store, 
  MapPin, 
  Phone, 
  Loader2, 
  MessageCircle, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronRight,
  Sparkles,
  Search,
  ShoppingCart,
  ShieldCheck
} from "lucide-react";
import { publicShopService } from "@/services/api.service";
import Link from "next/link";

const THEMES = {
  serieux: { 
    primary: "bg-blue-900", 
    text: "text-blue-900", 
    border: "border-blue-600", 
    accent: "text-blue-400",
    button: "bg-blue-900 hover:bg-blue-800"
  },
  vibrant: { 
    primary: "bg-orange-500", 
    text: "text-orange-500", 
    border: "border-yellow-400", 
    accent: "text-yellow-600",
    button: "bg-orange-500 hover:bg-orange-600"
  },
  luxe: { 
    primary: "bg-black", 
    text: "text-black", 
    border: "border-amber-600", 
    accent: "text-amber-500",
    button: "bg-black hover:bg-gray-900 text-amber-500"
  },
  nature: { 
    primary: "bg-emerald-800", 
    text: "text-emerald-800", 
    border: "border-emerald-600", 
    accent: "text-emerald-200",
    button: "bg-emerald-800 hover:bg-emerald-900"
  }
};

export default function ShopPublicPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopData, productsData] = await Promise.all([
          publicShopService.getBySlug(slug as string),
          publicShopService.getProducts(slug as string)
        ]);
        setShop(shopData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">WazaShop</p>
    </div>
  );

  if (!shop) return <div className="h-screen flex items-center justify-center font-black text-2xl">Boutique non trouvée.</div>;

  const prefs = shop.preferences || {};
  const currentTheme = THEMES[prefs.theme as keyof typeof THEMES] || THEMES.serieux;
  const layout = prefs.layout || "grid";

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Dynamic Header */}
      <div className={`relative h-64 md:h-80 w-full ${currentTheme.primary} overflow-hidden`}>
        {shop.bannerUrl && <img src={shop.bannerUrl} className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 inset-x-0 px-6 pb-8 md:px-20 md:pb-12 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-white p-1 shadow-2xl border-4 border-white overflow-hidden shrink-0">
             {shop.logoUrl ? (
               <img src={shop.logoUrl} className="w-full h-full object-cover rounded-[24px] md:rounded-[32px]" />
             ) : (
               <div className={`w-full h-full rounded-[24px] md:rounded-[32px] ${currentTheme.primary} flex items-center justify-center`}>
                  <Store className="text-white" size={40} />
               </div>
             )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
             <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">{shop.name}</h1>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className={`flex items-center gap-1.5 ${currentTheme.accent} font-black text-[10px] md:text-xs uppercase tracking-widest`}>
                   <Phone size={12} fill="currentColor" /> {shop.whatsappBusiness}
                </div>
                <div className="flex items-center gap-1.5 text-white/70 font-black text-[10px] md:text-xs uppercase tracking-widest">
                   <MapPin size={12} /> {shop.address || "Cameroun"}
                </div>
             </div>
          </div>
          <div className="hidden md:flex gap-4">
             <a 
              href={`https://wa.me/${shop.whatsappBusiness?.replace(/\\+/g, '')}`} 
              target="_blank"
              className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
               <MessageCircle size={20} />
               Discuter
             </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mt-12 space-y-12">
        
        {/* Bio & Search */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
           <div className="max-w-2xl space-y-4">
              <h2 className={`text-xs font-black uppercase tracking-[0.3em] ${currentTheme.text}`}>À propos de nous</h2>
              <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed italic">
                "{shop.description || "Bienvenue dans notre boutique officielle. Nous vous proposons le meilleur rapport qualité-prix du marché."}"
              </p>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                 <Clock size={16} className="text-blue-500" /> Ouvert : {prefs.hours || "08:00 - 19:00"}
              </div>
           </div>
           
           <div className="w-full md:w-80 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-14 pr-6 py-4 focus:bg-white focus:border-emerald-500 outline-none font-bold transition-all shadow-sm"
              />
           </div>
        </div>

        {/* Stories (Arrivages) */}
        {prefs.showStories !== false && (
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                   <Sparkles className="text-amber-500" size={24} /> Les Arrivages du jour
                </h3>
                <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block"></div>
             </div>
             <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`w-20 h-20 md:w-28 md:h-28 rounded-[32px] md:rounded-[40px] border-4 ${currentTheme.border} p-1 shrink-0 cursor-pointer hover:scale-105 transition-all shadow-lg`}>
                     <div className="w-full h-full rounded-[24px] md:rounded-[32px] bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i + 10}/200`} className="w-full h-full object-cover opacity-80" />
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Product Catalogue */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900">Notre Catalogue</h3>
              <div className="flex gap-4 text-gray-300">
                 <LayoutGrid size={24} className={layout === 'grid' ? 'text-gray-900' : ''} />
                 <List size={24} className={layout === 'list' ? 'text-gray-900' : ''} />
              </div>
           </div>

           {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-gray-50 rounded-[48px]">
                 <Search size={48} className="mx-auto text-gray-200" />
                 <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Aucun produit ne correspond à votre recherche.</p>
              </div>
           ) : (
             <div className={`grid gap-8 ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/shop/${slug}/p/${product.id}`} 
                    key={product.id}
                    className={`bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col group ${layout === 'list' ? 'flex-row h-48 md:h-64' : ''}`}
                  >
                    <div className={`relative ${layout === 'list' ? 'w-48 md:w-64' : 'h-64'} bg-gray-50 overflow-hidden shrink-0`}>
                       {product.media_urls && product.media_urls[0] ? (
                         <img src={product.media_urls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center"><Store size={40} className="text-gray-200" /></div>
                       )}
                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                          <span className="font-black text-gray-900 text-sm md:text-base">{product.price_public.toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span></span>
                       </div>
                    </div>
                    
                    <div className="p-6 flex flex-col justify-between flex-1">
                       <div>
                          <h4 className="font-black text-gray-900 md:text-lg leading-tight line-clamp-2">{product.title}</h4>
                          {layout === 'list' && <p className="text-sm text-gray-400 mt-2 line-clamp-3">{product.description}</p>}
                       </div>
                       <div className="flex items-center justify-between mt-4">
                          <div className={`text-[10px] font-black uppercase tracking-widest ${currentTheme.text}`}>Voir détails</div>
                          <div className={`p-3 rounded-2xl ${currentTheme.button} text-white shadow-lg`}>
                             <ChevronRight size={18} />
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
             </div>
           )}
        </section>

        {/* Badges de Confiance / Footer */}
        <section className="pt-20 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-5 p-6 bg-blue-50/50 rounded-[32px]">
               <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                  <ShieldCheck size={28} />
               </div>
               <div>
                  <h5 className="font-black text-gray-900 text-sm">Vendeur Vérifié</h5>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identité confirmée par Waza</p>
               </div>
            </div>
            <div className="flex items-center gap-5 p-6 bg-emerald-50/50 rounded-[32px]">
               <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
                  <MessageCircle size={28} />
               </div>
               <div>
                  <h5 className="font-black text-gray-900 text-sm">Réponse Rapide</h5>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Moins de 10 min sur WhatsApp</p>
               </div>
            </div>
            <div className="flex items-center gap-5 p-6 bg-orange-50/50 rounded-[32px]">
               <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600">
                  <MapPin size={28} />
               </div>
               <div>
                  <h5 className="font-black text-gray-900 text-sm">Paiement Sécurisé</h5>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paiement Mobile Money ou Cash</p>
               </div>
            </div>
        </section>
      </div>

      {/* Floating WhatsApp for Mobile */}
      <a 
        href={`https://wa.me/${shop.whatsappBusiness?.replace(/\\+/g, '')}`} 
        target="_blank"
        className="md:hidden fixed bottom-8 right-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce ring-4 ring-white"
      >
         <MessageCircle size={32} />
      </a>
    </div>
  );
}
