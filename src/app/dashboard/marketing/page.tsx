"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Download, Megaphone, Image as ImageIcon, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { productService, shopService } from "@/services/api.service";

interface Product {
  id: string;
  title: string;
  price_public: number;
  media_urls: string[];
}

interface Shop {
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  preferences?: any;
}

export default function MarketingBooster() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"minimaliste" | "promo" | "luxe">("minimaliste");
  
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, shopData] = await Promise.all([
          productService.getAll(),
          shopService.getMine()
        ]);
        setProducts(productsData);
        if (productsData.length > 0) setSelectedProduct(productsData[0]);
        setShop(shopData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    setGenerating(true);
    
    try {
      const dataUrl = await toPng(flyerRef.current, { 
        cacheBust: true,
        pixelRatio: 1,
      });
      
      const link = document.createElement('a');
      const fileName = (selectedProduct?.title || 'produit').replace(/\s+/g, '-').toLowerCase();
      link.download = `statut-${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erreur lors de la génération du statut', err);
      alert("Une erreur est survenue lors de la création de l'image.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;
  }

  const qrCodeValue = selectedProduct ? `https://wazashop.com/shop/${(shop?.name || 'boutique').replace(/\s+/g, '-').toLowerCase()}/p/${selectedProduct.id}` : "https://wazashop.com";

  const themeStyles = {
    "sérieux": { bg: "bg-blue-900", text: "text-white", primary: "bg-blue-600" },
    "vibrant": { bg: "bg-orange-500", text: "text-white", primary: "bg-yellow-400 text-black" },
    "luxe": { bg: "bg-black", text: "text-yellow-500", primary: "bg-yellow-600" },
    "nature": { bg: "bg-emerald-800", text: "text-amber-50", primary: "bg-emerald-600" },
  };
  const activeTheme = themeStyles[(shop?.preferences?.theme as keyof typeof themeStyles)] || themeStyles["sérieux"];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 pb-24">
      {/* Left Pane: Configuration */}
      <div className="w-full lg:w-[450px] flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
              <Megaphone size={24} />
            </div>
            Booster de Ventes
          </h1>
          <p className="text-gray-500 font-medium mt-2">Créez des visuels WhatsApp en 1 clic.</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-black text-gray-900">1. Sélectionnez un produit</h2>
          {products.length === 0 ? (
            <div className="text-sm text-gray-500 p-8 bg-gray-50 rounded-3xl text-center font-bold">Catalogue vide.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
              {products.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProduct(p)}
                  className={`cursor-pointer border-2 rounded-[24px] overflow-hidden transition-all relative ${selectedProduct?.id === p.id ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                >
                  <div className="h-28 bg-gray-50">
                    {p.media_urls && p.media_urls.length > 0 ? <img src={p.media_urls[0]} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-200" size={24}/></div>}
                  </div>
                  <div className="p-3 text-[10px] font-black text-center uppercase tracking-tight truncate">{p.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-black text-gray-900">2. Choisissez un style</h2>
          <div className="grid grid-cols-1 gap-4">
            {(["minimaliste", "promo", "luxe"] as const).map(t => (
              <button 
                key={t}
                onClick={() => setSelectedTemplate(t)}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${selectedTemplate === t ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/5' : 'border-gray-50 text-gray-700 hover:border-gray-200 bg-white'}`}
              >
                <div className="font-black uppercase tracking-widest text-xs">{t}</div>
                <div className={`w-6 h-6 rounded-full border-2 ${selectedTemplate === t ? 'bg-emerald-500 border-emerald-600 shadow-sm' : 'border-gray-200'}`}></div>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleDownload} 
          disabled={generating || !selectedProduct}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-emerald-600/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50 active:scale-95 text-lg"
        >
          {generating ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
          {generating ? "Génération..." : "Télécharger pour WhatsApp"}
        </button>
      </div>

      {/* Right Pane: Live Preview */}
      <div className="flex-1 flex flex-col items-center justify-start bg-gray-50 rounded-[60px] p-12 border-2 border-dashed border-gray-200">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Aperçu en temps réel</h3>
        
        <div className="relative overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-gray-100" style={{ width: '360px', height: '640px', borderRadius: '3rem' }}>
          <div className="origin-top-left scale-[0.3333]" style={{ width: '1080px', height: '1920px' }}>
            
            <div ref={flyerRef} className="w-[1080px] h-[1920px] bg-white relative flex flex-col overflow-hidden font-sans">
              
              {/* Template: Minimaliste */}
              {selectedTemplate === 'minimaliste' && selectedProduct && (
                <div className={`w-full h-full flex flex-col ${activeTheme.bg}`}>
                  <div className="w-full p-16 flex items-center gap-8 z-10">
                    {shop?.logoUrl ? (
                      <img src={shop.logoUrl} className="w-32 h-32 rounded-[40px] border-4 border-white object-cover shadow-2xl" />
                    ) : (
                      <div className="w-32 h-32 rounded-[40px] bg-white flex items-center justify-center text-emerald-600 font-black text-5xl shadow-xl">{shop?.name?.charAt(0) || "W"}</div>
                    )}
                    <div className={`text-6xl font-black tracking-tight ${activeTheme.text}`}>{shop?.name || "Ma Boutique"}</div>
                  </div>

                  <div className="flex-1 w-full bg-white rounded-t-[120px] mt-8 flex flex-col items-center relative shadow-[0_-40px_100px_rgba(0,0,0,0.15)]">
                    <div className="w-full h-[1000px] p-20 flex items-center justify-center">
                      {selectedProduct.media_urls && selectedProduct.media_urls.length > 0 ? (
                        <img src={selectedProduct.media_urls[0]} className="w-full h-full object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.1)]" />
                      ) : (
                        <ImageIcon className="text-gray-100 w-80 h-80" />
                      )}
                    </div>
                    
                    <div className="px-20 w-full text-center flex flex-col items-center -mt-10">
                      <h2 className="text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter uppercase">{selectedProduct.title}</h2>
                      <div className={`mt-12 px-16 py-6 rounded-[40px] text-7xl font-black inline-block shadow-2xl ${activeTheme.primary}`}>
                        {(selectedProduct.price_public || 0).toLocaleString()} <span className="text-3xl">FCFA</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gray-50 flex items-center justify-between px-20 border-t-2 border-gray-100">
                      <div className="flex-1 pr-16">
                        <h3 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Commandez <br/>via WhatsApp</h3>
                        <p className="text-3xl text-gray-400 font-bold leading-tight">Scannez ce code QR pour <br/>voir les détails du produit.</p>
                      </div>
                      <div className="bg-white p-8 rounded-[60px] shadow-2xl border-4 border-white">
                        <QRCode value={qrCodeValue} size={240} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Template: Promo */}
              {selectedTemplate === 'promo' && selectedProduct && (
                <div className="w-full h-full flex flex-col bg-red-600 relative overflow-hidden">
                  <div className="absolute -top-[10%] -right-[10%] w-[1000px] h-[1000px] bg-red-500 rounded-full blur-[150px] opacity-60"></div>
                  <div className="absolute -bottom-[10%] -left-[10%] w-[1200px] h-[1200px] bg-red-700 rounded-full blur-[150px] opacity-60"></div>
                  
                  <div className="w-full p-20 flex items-center justify-center relative z-10 mt-16">
                    <div className="bg-white text-red-600 px-16 py-8 rounded-[40px] text-7xl font-black shadow-[0_30px_60px_rgba(0,0,0,0.3)] tracking-tighter uppercase transform -rotate-2">
                      🔥 Vente Flash 🔥
                    </div>
                  </div>

                  <div className="flex-1 w-full px-16 flex flex-col items-center justify-center relative z-10">
                    <div className="w-[850px] h-[850px] bg-white rounded-[100px] flex items-center justify-center p-20 shadow-[0_50px_100px_rgba(0,0,0,0.4)] border-[16px] border-white/20">
                      {selectedProduct.media_urls && selectedProduct.media_urls.length > 0 ? (
                        <img src={selectedProduct.media_urls[0]} className="w-full h-full object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.2)]" />
                      ) : (
                        <ImageIcon className="text-gray-100 w-80 h-80" />
                      )}
                    </div>
                    
                    <h2 className="text-8xl font-black text-white text-center mt-20 drop-shadow-2xl leading-[0.85] px-10 uppercase tracking-tighter italic">{selectedProduct.title}</h2>
                    
                    <div className="mt-20 flex items-center gap-10">
                      <div className="text-red-300 line-through text-6xl font-black italic">{((selectedProduct.price_public || 0) * 1.2).toLocaleString()} F</div>
                      <div className="bg-yellow-400 text-black px-16 py-8 rounded-[40px] text-8xl font-black shadow-2xl -rotate-3 border-4 border-yellow-300">
                        {(selectedProduct.price_public || 0).toLocaleString()} F
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px] bg-black/40 backdrop-blur-2xl flex items-center px-20 relative z-10 mt-20 border-t-4 border-white/10">
                    <div className="bg-white p-6 rounded-[60px] shadow-2xl border-4 border-white">
                      <QRCode value={qrCodeValue} size={240} />
                    </div>
                    <div className="flex-1 pl-16 text-white">
                      <h3 className="text-6xl font-black text-yellow-400 mb-4 uppercase italic">Offre Flash !</h3>
                      <p className="text-3xl text-white font-bold leading-tight">Scannez maintenant avant la <br/>fin du compte à rebours.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Template: Luxe */}
              {selectedTemplate === 'luxe' && selectedProduct && (
                <div className="w-full h-full flex flex-col bg-[#080808] relative border-[32px] border-[#C5A028] box-border">
                  <div className="w-full pt-32 flex flex-col items-center z-10">
                    <div className="text-[60px] font-light text-[#C5A028] uppercase tracking-[0.4em]">{shop?.name || "PREMIUM SHOP"}</div>
                    <div className="w-60 h-[2px] bg-[#C5A028] mt-12 opacity-50"></div>
                  </div>

                  <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 mt-16">
                    <div className="w-full h-[950px] px-24 flex items-center justify-center relative">
                      {selectedProduct.media_urls && selectedProduct.media_urls.length > 0 ? (
                        <img src={selectedProduct.media_urls[0]} className="w-full h-full object-contain filter drop-shadow-[0_60px_100px_rgba(197,160,40,0.15)] scale-110" />
                      ) : (
                        <ImageIcon className="text-[#1a1a1a] w-80 h-80" />
                      )}
                      <div className="absolute -top-10 right-24 text-[160px] text-white/[0.03] font-black italic tracking-tighter">EXCLU</div>
                    </div>
                    
                    <div className="w-full px-24 text-center mt-12">
                      <h2 className="text-[72px] font-extralight text-white uppercase tracking-[0.2em] leading-tight mb-8">{selectedProduct.title}</h2>
                      <div className="text-7xl font-serif text-[#C5A028] tracking-[0.1em] font-bold">
                        {(selectedProduct.price_public || 0).toLocaleString()} <span className="text-3xl">XAF</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px] flex items-center justify-center gap-20 relative z-10 pb-20">
                    <div className="text-right">
                      <div className="text-[40px] text-gray-500 font-light tracking-[0.3em] uppercase leading-relaxed">Élégance <br/>& Qualité</div>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-[0_0_100px_rgba(197,160,40,0.2)]">
                      <QRCode value={qrCodeValue} size={200} fgColor="#080808" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
