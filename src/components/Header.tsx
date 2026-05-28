import React, { useState } from "react";
import {
  ShoppingCart,
  LogOut,
  Search,
  MapPin,
  Receipt,
  Utensils,
  LayoutDashboard,
  Package,
  Users,
  Contact2,
  CheckCircle2,
  X,
  Share2
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { getStoreStatus } from "../utils";

export function Header() {
  const {
    view,
    setView,
    searchQuery,
    setSearchQuery,
    cart,
    setIsCartOpen,
    user,
    setUser,
    isAdmin,
  } = useAppContext();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div
            className={`flex items-center gap-3 cursor-pointer group transition-all duration-300 ${isSearchExpanded ? "hidden sm:flex" : "flex"}`}
            onClick={() => setView("customer")}
          >
            {/* Logo Image */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden transform group-hover:scale-105 transition-transform shadow-md border-2 border-white/60">
              <img
                src="/favicon.png"
                alt="La Casa Burguer Logo"
                className="w-full h-full object-fill bg-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-xl tracking-wide text-yellow-400 uppercase leading-none">
                La Casa Burguer
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 ${getStoreStatus().isOpen ? 'text-green-400' : 'text-red-400'}`}>
                <span className={`w-2 h-2 rounded-full ${getStoreStatus().isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {getStoreStatus().isOpen ? 'Aberto agora' : 'Fechado'}
              </span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {view === "customer" ? (
              <>
                {isSearchExpanded ? (
                  <div className="flex-1 max-w-md flex items-center bg-neutral-800 rounded-full px-4 h-12 border border-neutral-700 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Buscar por nome ou descrição..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-white px-3 focus:outline-none placeholder:text-neutral-500"
                    />
                    <button
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery("");
                      }}
                    >
                      <X className="w-5 h-5 text-neutral-400 hover:text-white transition-colors flex-shrink-0" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 hidden sm:flex">
                      {user && isAdmin && (
                        <>
                          <button
                            onClick={() => setView("admin")}
                            className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            Área do Admin
                          </button>
                        </>
                      )}
                      {!user && (
                        <button
                          onClick={() => setView("login")}
                          className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          Entrar
                        </button>
                      )}
                      {user && (
                        <button
                          onClick={async () => {
                            let url = import.meta.env.VITE_SUPABASE_URL || "";
                            if (typeof url === "string") {
                              if (url.startsWith('"') && url.endsWith('"'))
                                url = url.replace(/^"|"$/g, "");
                              url = url.trim();
                            }
                            // we must check if supabase is configured
                            if (
                              url &&
                              url !== "" && !url.includes("placeholder.supabase.co")
                            ) {
                              try {
                                const { supabase } =
                                  await import("../lib/supabase");
                                await supabase.auth.signOut();
                              } catch (err) {
                                console.warn("Header signout failed:", err);
                              }
                            }
                            setUser(null);
                            setView("customer");
                          }}
                          className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                        >
                          Sair
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className="relative w-11 h-11 flex items-center justify-center bg-white/20 hover:bg-white rounded-full transition-colors group border-transparent"
                      >
                        <Search className="w-5 h-5 text-white group-hover:text-[#0ea5e9]" />
                      </button>
                      <button
                        onClick={async () => {
                          const url = 'https://la-casa-burger.netlify.app/';
                          if (navigator.share) {
                            try {
                              await navigator.share({ title: 'La Casa Burguer', url });
                            } catch (err: any) {
                              if (err.name !== 'AbortError') {
                                console.error('Error sharing:', err);
                              }
                            }
                          } else {
                            navigator.clipboard.writeText(url);
                            alert('Link copiado para a área de transferência!');
                          }
                        }}
                        className="relative w-11 h-11 flex items-center justify-center bg-white/20 hover:bg-white rounded-full transition-colors group border-transparent"
                      >
                        <Share2 className="w-5 h-5 text-white group-hover:text-[#0ea5e9]" />
                      </button>
                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative w-11 h-11 flex items-center justify-center bg-white/20 hover:bg-white rounded-full transition-colors group border-transparent sm:flex hidden"
                      >
                        <ShoppingCart className="w-5 h-5 text-white group-hover:text-[#0ea5e9]" />
                        {cart.reduce((acc, item) => acc + item.quantity, 0) >
                          0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                          </span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : view === "admin" || view === "login" ? (
              <button
                onClick={() => setView("customer")}
                className="flex items-center gap-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Voltar à Loja
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
