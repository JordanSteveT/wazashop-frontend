"use client";

import { useEffect, useState } from "react";
import { Plus, Package, Image as ImageIcon, Search, Filter, Edit2, Trash2, Tag, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { productService, categoryService } from "@/services/api.service";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGlobalCat, setSelectedGlobalCat] = useState("all");
  const [globalCats, setGlobalCats] = useState<any[]>([]);
  
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getGlobal()
      ]);
      setProducts(productsData);
      setGlobalCats(categoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedGlobalCat === "all" || p.global_category_id === selectedGlobalCat;
    return matchesSearch && matchesCat;
  });

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Rupture", color: "bg-red-100 text-red-700 border-red-200" };
    if (stock <= 5) return { label: "Stock faible", color: "bg-orange-100 text-orange-700 border-orange-200" };
    return { label: "En stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Catalogue</h1>
          <p className="text-gray-500 font-medium">Gérez vos articles et optimisez vos stocks.</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/products/new")}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-700 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="text-gray-400 mr-2 shrink-0" size={20} />
          <button 
            onClick={() => setSelectedGlobalCat("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedGlobalCat === "all" ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Tous
          </button>
          {globalCats.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedGlobalCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedGlobalCat === cat.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-200 p-20 text-center flex flex-col items-center">
          <div className="bg-emerald-50 p-6 rounded-full mb-6">
            <Package className="h-12 w-12 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500 mb-8 max-w-sm font-medium">
            {searchTerm || selectedGlobalCat !== "all" ? "Ajustez vos filtres pour trouver ce que vous cherchez." : "Commencez par ajouter votre premier produit pour lancer votre boutique !"}
          </p>
          {!searchTerm && selectedGlobalCat === "all" && (
            <button 
              onClick={() => router.push("/dashboard/products/new")}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all"
            >
              + Ajouter mon premier produit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const status = getStockStatus(product.stock);
            return (
              <div key={product.id} className="group bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col">
                {/* Image Section */}
                <div className="h-56 bg-gray-50 relative overflow-hidden">
                  {product.media_urls && product.media_urls.length > 0 ? (
                    <img src={product.media_urls[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <ImageIcon className="h-12 w-12 text-gray-200" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {product.globalCategory && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-700 shadow-sm">
                      {product.globalCategory.name}
                    </div>
                  )}

                  {/* Quick Actions Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                      className="p-3 bg-white text-gray-700 rounded-2xl shadow-xl hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 bg-white text-gray-700 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight mb-2 group-hover:text-emerald-600 transition-colors">{product.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                        {status.label}: {product.stock}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && <AlertTriangle size={14} className="text-orange-500" />}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix</span>
                      <span className="text-xl font-black text-gray-900">{product.price_public.toLocaleString()} <span className="text-xs">F</span></span>
                    </div>
                    {product.merchantCategory && (
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                        <Tag size={12} />
                        <span className="text-[10px] font-bold truncate max-w-[80px]">{product.merchantCategory.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
