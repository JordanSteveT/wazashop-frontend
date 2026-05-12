"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Store, Package, LogOut, Loader2, User, Megaphone, Tag, LayoutDashboard, ChevronRight, Zap } from "lucide-react";
import { shopService, userService } from "@/services/api.service";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wazashop_token");
    if (!token) {
      router.push("/");
      return;
    }

    const checkData = async () => {
      try {
        const [shopData, userData] = await Promise.all([
          shopService.getMine().catch(() => null),
          userService.getMe().catch(() => null)
        ]);

        if (!shopData && !pathname.includes("/setup")) {
          router.push("/dashboard/setup");
        }
        
        if (userData) {
          if ((!userData.firstName || !userData.lastName) && !pathname.includes("/setup") && !pathname.includes("/profile")) {
            const lastDismissedStr = localStorage.getItem("wazashop_profile_modal_dismissed_at");
            const lastDismissed = lastDismissedStr ? parseInt(lastDismissedStr, 10) : 0;
            const oneHourMs = 60 * 60 * 1000;
            
            if (Date.now() - lastDismissed > oneHourMs) {
              setShowProfileModal(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkData();
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("wazashop_token");
    router.push("/");
  };

  const navItems = [
    { name: "Catalogue", icon: Package, path: "/dashboard", active: pathname === "/dashboard" || pathname.includes("/products") },
    { name: "Promotions", icon: Zap, path: "/dashboard/promotions", active: pathname.includes("/promotions") },
    { name: "Catégories", icon: Tag, path: "/dashboard/categories", active: pathname.includes("/categories") },
    { name: "Ma Boutique", icon: Store, path: "/dashboard/settings", active: pathname.includes("/settings") },
    { name: "Mon Profil", icon: User, path: "/dashboard/profile", active: pathname.includes("/profile") },
  ];

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fdfdfd]"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>;
  }

  if (pathname.includes("/setup")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white hidden lg:flex flex-col border-r border-gray-100 relative z-20 shadow-2xl shadow-gray-200/50">
        <div className="p-10 pb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">WazaShop</h1>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Menu Principal</p>
          </div>
          
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.path} 
              className={`group flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all duration-300 ${item.active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 translate-x-2' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className={item.active ? "text-white" : "text-gray-400 group-hover:text-emerald-600 transition-colors"} />
                <span>{item.name}</span>
              </div>
              {item.active && <ChevronRight size={16} />}
            </a>
          ))}

          <div className="pt-10 px-4 mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Outils Marketing</p>
          </div>
          
          <a 
            href="/dashboard/marketing" 
            className={`group flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden ${pathname.includes('/marketing') ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 translate-x-2' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-4">
              <Megaphone size={22} className={pathname.includes('/marketing') ? "text-white" : "text-amber-500"} />
              <span>Booster de Ventes</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${pathname.includes('/marketing') ? 'bg-white/20' : 'bg-amber-100 text-amber-600'}`}>New</span>
          </a>
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-4 px-4 py-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-black transition-all group"
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>

      {/* Profile Reminder Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-6">
          <div className="w-full max-w-md rounded-[48px] bg-white p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16"></div>
            <div className="relative text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 rotate-6">
                <User size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">Profil incomplet</h2>
              <p className="mt-4 text-gray-500 font-medium text-lg leading-relaxed">
                Prenez une minute pour ajouter votre nom. Un profil complet inspire <span className="text-emerald-600 font-black">10x plus confiance</span> à vos clients WhatsApp.
              </p>
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  router.push("/dashboard/profile");
                }}
                className="w-full rounded-3xl bg-emerald-600 px-8 py-5 font-black text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 text-lg"
              >
                Compléter mon profil
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem("wazashop_profile_modal_dismissed_at", Date.now().toString());
                  setShowProfileModal(false);
                }}
                className="w-full rounded-3xl bg-gray-50 px-8 py-5 font-black text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
              >
                Peut-être plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
