"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Store, 
  MapPin, 
  Phone, 
  Loader2, 
  CheckCircle, 
  Image as ImageIcon, 
  Palette, 
  ShieldCheck, 
  Smartphone, 
  Eye,
  MessageCircle,
  Clock,
  CreditCard,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
  Monitor
} from "lucide-react";
import { shopService } from "@/services/api.service";

const THEMES = {
  serieux: { 
    name: "Sérieux", 
    primary: "bg-blue-900", 
    border: "border-blue-600", 
    text: "text-white",
    accent: "text-blue-400"
  },
  vibrant: { 
    name: "Vibrant", 
    primary: "bg-orange-500", 
    border: "border-yellow-400", 
    text: "text-white",
    accent: "text-yellow-200"
  },
  luxe: { 
    name: "Luxe", 
    primary: "bg-black", 
    border: "border-amber-600", 
    text: "text-amber-500",
    accent: "text-amber-200"
  },
  nature: { 
    name: "Nature", 
    primary: "bg-emerald-800", 
    border: "border-emerald-600", 
    text: "text-amber-50",
    accent: "text-emerald-200"
  }
};

export default function VitrineEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"identity" | "design" | "trust">("identity");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  
  // Data State
  const [shop, setShop] = useState<any>(null);
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  
  // Design State
  const [theme, setTheme] = useState("serieux");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showStories, setShowStories] = useState(true);
  
  // Trust State
  const [showWhatsappButton, setShowWhatsappButton] = useState(true);
  const [showMaps, setShowMaps] = useState(true);
  const [hours, setHours] = useState("08:00 - 18:00");
  
  // Upload Previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const fileInputLogo = useRef<HTMLInputElement>(null);
  const fileInputBanner = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await shopService.getMine();
        if (data) {
          setShop(data);
          setShopName(data.name);
          setDescription(data.description || "");
          setWhatsapp(data.whatsappBusiness || "");
          setAddress(data.address || "");
          setLogoPreview(data.logoUrl);
          setBannerPreview(data.bannerUrl);
          
          const prefs = data.preferences || {};
          setTheme(prefs.theme || "serieux");
          setLayout(prefs.layout || "grid");
          setShowStories(prefs.showStories !== false);
          setShowWhatsappButton(prefs.showWhatsappButton !== false);
          setShowMaps(prefs.showMaps !== false);
          setHours(prefs.hours || "08:00 - 18:00");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", shopName);
      formData.append("description", description);
      formData.append("whatsappBusiness", whatsapp);
      formData.append("address", address);
      
      const preferences = {
        theme,
        layout,
        showStories,
        showWhatsappButton,
        showMaps,
        hours
      };
      formData.append("preferences", JSON.stringify(preferences));
      
      if (logoFile) formData.append("logo", logoFile);
      if (bannerFile) formData.append("banner", bannerFile);

      await shopService.update(formData);
      alert("Vitrine mise à jour avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;

  const currentTheme = THEMES[theme as keyof typeof THEMES] || THEMES.serieux;

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen pb-20">
      <div className="flex flex-col lg:flex-row gap-12 h-full">
        
        {/* Editor Pane */}
        <div className="flex-1 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                <Store size={36} className="text-emerald-600" />
                Éditeur de Vitrine
              </h1>
              <p className="text-gray-500 font-medium mt-1">Personnalisez votre boutique pour vendre plus au Cameroun.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-black shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
              {saving ? "Sauvegarde..." : "Publier ma vitrine"}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 p-2 bg-gray-100 rounded-[32px] w-fit">
            <button 
              onClick={() => setActiveTab("identity")}
              className={`px-8 py-4 rounded-[24px] font-black text-sm transition-all flex items-center gap-2 ${activeTab === "identity" ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Store size={18} /> Identité
            </button>
            <button 
              onClick={() => setActiveTab("design")}
              className={`px-8 py-4 rounded-[24px] font-black text-sm transition-all flex items-center gap-2 ${activeTab === "design" ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Palette size={18} /> Design
            </button>
            <button 
              onClick={() => setActiveTab("trust")}
              className={`px-8 py-4 rounded-[24px] font-black text-sm transition-all flex items-center gap-2 ${activeTab === "trust" ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <ShieldCheck size={18} /> Confiance
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "identity" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Logo de la boutique (Carré)</label>
                    <div 
                      onClick={() => fileInputLogo.current?.click()}
                      className="h-40 w-40 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group overflow-hidden relative"
                    >
                      {logoPreview ? (
                        <img src={logoPreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto text-gray-300 group-hover:text-emerald-500 mb-2" size={32} />
                          <span className="text-[10px] font-black text-gray-400">UPLOAD</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputLogo} onChange={handleLogoChange} className="hidden" accept="image/*" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Photo de couverture</label>
                    <div 
                      onClick={() => fileInputBanner.current?.click()}
                      className="h-40 w-full bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group overflow-hidden relative"
                    >
                      {bannerPreview ? (
                        <img src={bannerPreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto text-gray-300 group-hover:text-emerald-500 mb-2" size={32} />
                          <span className="text-[10px] font-black text-gray-400">CHOISIR UNE PHOTO</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputBanner} onChange={handleBannerChange} className="hidden" accept="image/*" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Nom commercial</label>
                    <input 
                      type="text" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-[24px] px-8 py-5 text-lg font-bold text-gray-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Accroche (Bio)</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border-none rounded-[24px] px-8 py-5 text-lg font-medium text-gray-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                      placeholder="Ex: Le spécialiste de la chaussure originale à Douala"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "design" && (
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} /> Choisissez votre ambiance
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(THEMES).map(([id, t]) => (
                      <button 
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`p-6 rounded-[32px] border-4 text-left transition-all relative overflow-hidden group ${theme === id ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-50 hover:border-gray-100 bg-gray-50'}`}
                      >
                        <div className={`w-full h-12 ${t.primary} rounded-2xl mb-4 shadow-sm`}></div>
                        <span className="font-black text-xs uppercase tracking-widest">{t.name}</span>
                        {theme === id && <CheckCircle className="absolute top-4 right-4 text-emerald-500" size={20} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <LayoutGrid size={20} className="text-blue-500" /> Affichage du catalogue
                    </h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setLayout("grid")}
                        className={`flex-1 p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all ${layout === "grid" ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-50 text-gray-400 bg-white'}`}
                      >
                        <LayoutGrid size={32} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Grille (E-commerce)</span>
                      </button>
                      <button 
                        onClick={() => setLayout("list")}
                        className={`flex-1 p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all ${layout === "list" ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-50 text-gray-400 bg-white'}`}
                      >
                        <List size={32} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Liste (Style Instagram)</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Eye size={20} className="text-orange-500" /> Options de visibilité
                    </h3>
                    <label className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                          <Smartphone size={20} />
                        </div>
                        <span className="font-black text-gray-700">Stories WhatsApp</span>
                      </div>
                      <input type="checkbox" checked={showStories} onChange={e => setShowStories(e.target.checked)} className="w-6 h-6 accent-emerald-600 rounded-lg" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "trust" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <MessageCircle size={20} className="text-emerald-500" /> Communication
                    </h3>
                    <label className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] cursor-pointer">
                      <span className="font-black text-gray-700">Bouton WhatsApp Flottant</span>
                      <input type="checkbox" checked={showWhatsappButton} onChange={e => setShowWhatsappButton(e.target.checked)} className="w-6 h-6 accent-emerald-600 rounded-lg" />
                    </label>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Horaires d'ouverture</label>
                      <input 
                        type="text" 
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-[24px] px-8 py-5 font-bold text-gray-800 outline-none"
                        placeholder="Ex: Lun - Sam | 08:00 - 19:00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <MapPin size={20} className="text-red-500" /> Localisation & Paiement
                    </h3>
                    <label className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] cursor-pointer">
                      <span className="font-black text-gray-700">Afficher la carte Google Maps</span>
                      <input type="checkbox" checked={showMaps} onChange={e => setShowMaps(e.target.checked)} className="w-6 h-6 accent-emerald-600 rounded-lg" />
                    </label>
                    <div className="bg-gray-50 p-6 rounded-[32px] space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Méthodes de paiement acceptées</span>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white p-4 rounded-2xl flex items-center justify-center border-2 border-emerald-50">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/MTN_Logo.svg/1200px-MTN_Logo.svg.png" className="h-6 grayscale opacity-50" />
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl flex items-center justify-center border-2 border-orange-50">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1200px-Orange_logo.svg.png" className="h-6 grayscale opacity-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className={`bg-gray-100 rounded-[60px] p-8 border-2 border-dashed border-gray-200 flex flex-col items-center sticky top-12 h-fit transition-all duration-500 ${previewDevice === 'desktop' ? 'w-full max-w-7xl lg:w-auto' : 'w-full lg:w-[480px]'}`}>
          <div className="flex items-center justify-between w-full mb-10 px-4">
            <div className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-[0.4em]">
              <Eye size={16} /> Aperçu en direct
            </div>
            
            <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Smartphone size={20} />
              </button>
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Monitor size={20} />
              </button>
            </div>
          </div>

          {previewDevice === "mobile" ? (
            <div className="relative w-[340px] h-[700px] bg-white rounded-[56px] border-[12px] border-gray-900 shadow-2xl overflow-hidden ring-1 ring-gray-100 flex flex-col">
              {/* Virtual Status Bar */}
              <div className="h-10 bg-white flex justify-between items-center px-8 shrink-0">
                <span className="text-[10px] font-bold text-gray-900">09:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-2 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
              
              {/* Virtual Shop Content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
                {/* Cover Photo */}
                <div className={`h-36 w-full ${currentTheme.primary} relative overflow-hidden`}>
                  {bannerPreview ? (
                    <img src={bannerPreview} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <ImageIcon size={64} className="text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Profile Section (Overlapping) */}
                <div className="px-6 -mt-10 relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-[32px] bg-white shadow-2xl flex items-center justify-center p-1 border-4 border-white overflow-hidden mb-4">
                    {logoPreview ? (
                      <img src={logoPreview} className="w-full h-full object-cover rounded-[24px]" />
                    ) : (
                      <div className={`w-full h-full rounded-[24px] ${currentTheme.primary} flex items-center justify-center`}>
                        <Store className="text-white" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center w-full px-2">
                    <h4 className="text-xl font-black text-gray-900 leading-tight tracking-tight break-words">{shopName || "Ma Boutique"}</h4>
                    <div className={`mt-1 flex items-center justify-center gap-1.5 ${currentTheme.accent} font-black text-[10px] uppercase tracking-wider`}>
                      <Phone size={10} fill="currentColor" />
                      <span>{whatsapp || "WhatsApp Business"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Social Proof Style) */}
                <div className="px-6 mt-8 flex gap-2">
                  <div className="flex-1 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest gap-2">
                    <MessageCircle size={14} /> Contacter
                  </div>
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                    <Eye size={16} />
                  </div>
                </div>

                {/* Stories Section */}
                {showStories && (
                  <div className="mt-8">
                    <div className="px-6 flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nouveautés</span>
                      <div className="h-px flex-1 bg-gray-50 mx-4"></div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-16 h-16 rounded-full border-2 ${currentTheme.border} p-0.5 shrink-0`}>
                          <div className="w-full h-full rounded-full bg-gray-50 border-2 border-white overflow-hidden flex items-center justify-center">
                            <ImageIcon size={18} className="text-gray-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio & Details */}
                <div className="px-6 mt-8 space-y-4">
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic text-center">
                      "{description || "Bienvenue dans notre boutique officielle. Qualité et service garantis !"}"
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 px-2">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                      <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-red-500">
                        <MapPin size={12} />
                      </div>
                      <span>{address || "Douala, Cameroun"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                      <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-blue-500">
                        <Clock size={12} />
                      </div>
                      <span>{hours || "08:00 - 18:00"}</span>
                    </div>
                  </div>
                </div>

                {/* Catalogue Section */}
                <div className="px-6 mt-10 pb-20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`h-8 w-1.5 ${currentTheme.primary} rounded-full`}></div>
                    <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest">Le Catalogue</h5>
                  </div>
                  
                  {layout === "grid" ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white rounded-[24px] border border-gray-50 shadow-sm overflow-hidden flex flex-col group">
                          <div className="h-32 bg-gray-50 flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-200" />
                          </div>
                          <div className="p-3">
                            <div className="h-2 w-16 bg-gray-100 rounded-full mb-2"></div>
                            <div className="h-3 w-10 bg-gray-900 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[1,2].map(i => (
                        <div key={i} className="bg-white rounded-[24px] border border-gray-50 shadow-sm overflow-hidden p-4 flex gap-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-200" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center gap-2">
                            <div className="h-2 w-24 bg-gray-100 rounded-full"></div>
                            <div className="h-3 w-12 bg-gray-900 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Floating WhatsApp Button */}
              {showWhatsappButton && (
                <div className="absolute bottom-8 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center text-white ring-4 ring-white z-50 animate-bounce">
                  <MessageCircle size={28} />
                </div>
              )}
            </div>
          ) : (
            /* DESKTOP PREVIEW */
            <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[700px] animate-in zoom-in duration-500">
              <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Desktop Header */}
                <header className={`${currentTheme.primary} h-64 relative overflow-hidden`}>
                   {bannerPreview && <img src={bannerPreview} className="w-full h-full object-cover opacity-60" />}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                   <div className="absolute bottom-10 inset-x-12 flex items-center gap-8">
                     <div className="w-32 h-32 rounded-[40px] bg-white shadow-2xl border-4 border-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                        {logoPreview ? (
                          <img src={logoPreview} className="w-full h-full object-cover rounded-[32px]" />
                        ) : (
                          <div className={`w-full h-full rounded-[32px] ${currentTheme.primary} flex items-center justify-center`}>
                            <Store className="text-white" size={40} />
                          </div>
                        )}
                     </div>
                     <div className="flex-1">
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{shopName || "Ma Boutique"}</h2>
                        <div className="flex items-center gap-6">
                           <div className={`flex items-center gap-2 ${currentTheme.accent} font-bold text-sm uppercase tracking-widest`}>
                              <Phone size={14} fill="currentColor" /> {whatsapp || "Numéro WhatsApp"}
                           </div>
                           <div className="flex items-center gap-2 text-white/60 font-bold text-sm uppercase tracking-widest">
                              <MapPin size={14} /> {address || "Localisation"}
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Contactez-nous</button>
                     </div>
                   </div>
                </header>

                <div className="max-w-6xl mx-auto px-12 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
                  {/* Desktop Sidebar info */}
                  <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 p-8 rounded-[32px] space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">À propos</h3>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                        "{description || "Bienvenue dans notre boutique officielle. Qualité et service garantis !"}"
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">Informations</h3>
                       <div className="space-y-2">
                          <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                             <Clock size={18} className="text-blue-500" />
                             <span className="text-xs font-bold text-gray-600">{hours}</span>
                          </div>
                          {showMaps && (
                            <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                               <MapPin size={18} className="text-red-500" />
                               <span className="text-xs font-bold text-gray-600">Google Maps Actif</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </aside>

                  {/* Desktop Main Content */}
                  <main className="lg:col-span-3 space-y-12">
                    {showStories && (
                      <section>
                         <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                           <Sparkles className="text-amber-500" size={24} /> Nouveautés de la semaine
                         </h3>
                         <div className="flex gap-6 overflow-hidden">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`w-24 h-24 rounded-[32px] border-4 ${currentTheme.border} p-1 shrink-0`}>
                                <div className="w-full h-full rounded-[24px] bg-gray-50 flex items-center justify-center">
                                   <ImageIcon size={32} className="text-gray-200" />
                                </div>
                              </div>
                            ))}
                         </div>
                      </section>
                    )}

                    <section>
                       <div className="flex items-center justify-between mb-8">
                         <h3 className="text-2xl font-black text-gray-900">Notre Catalogue</h3>
                         <div className="flex gap-2">
                           <div className={`p-2 rounded-lg ${layout === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}><LayoutGrid size={20} /></div>
                           <div className={`p-2 rounded-lg ${layout === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}><List size={20} /></div>
                         </div>
                       </div>
                       
                       <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                          {[1,2,3,4,5,6].map(i => (
                            <div key={i} className={`bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all ${layout === 'list' ? 'flex-row h-40' : ''}`}>
                              <div className={`${layout === 'list' ? 'w-40' : 'h-48'} bg-gray-50 flex items-center justify-center shrink-0`}>
                                <ImageIcon size={32} className="text-gray-200" />
                              </div>
                              <div className="p-6 flex flex-col justify-center gap-3">
                                <div className="h-3 w-32 bg-gray-100 rounded-full"></div>
                                <div className="h-4 w-16 bg-gray-900 rounded-full"></div>
                              </div>
                            </div>
                          ))}
                       </div>
                    </section>
                  </main>
                </div>
              </div>

              {/* Floating WhatsApp for Desktop */}
              {showWhatsappButton && (
                <div className="absolute bottom-12 right-12 w-16 h-16 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white ring-4 ring-white z-50 animate-bounce">
                  <MessageCircle size={32} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
