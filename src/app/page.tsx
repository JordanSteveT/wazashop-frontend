"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { authService } from "@/services/api.service";
import { Loader2, ShieldCheck, Zap, ArrowRight, MessageSquare } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setError("");

    try {
      await authService.requestOtp(phone);
      setStep("OTP");
    } catch (err: any) {
      setError(err.response?.data?.error || "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await authService.verifyOtp(phone, otp);
      localStorage.setItem("wazashop_token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfdfd] p-6 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-40"></div>

      <div className="w-full max-w-md relative">
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-[28px] mx-auto flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Zap className="text-white" size={40} fill="white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">WazaShop</h1>
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
            <span>SaaS</span>
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
            <span>WhatsApp Commerce</span>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.06)] border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {step === "PHONE" ? "Bienvenue !" : "Vérification"}
            </h2>
            <p className="mt-2 text-gray-500 font-medium">
              {step === "PHONE" 
                ? "Connectez votre boutique à WhatsApp pour commencer à vendre." 
                : "Entrez le code envoyé sur votre WhatsApp."}
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl bg-red-50 p-4 text-xs text-red-600 font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro WhatsApp</label>
                <div className="relative group">
                  <PhoneInput
                    defaultCountry="CM"
                    international
                    countryCallingCodeEditable={false}
                    value={phone}
                    onChange={(value) => setPhone(value || "")}
                    className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 text-gray-800 font-bold focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full rounded-[24px] bg-emerald-600 px-6 py-5 font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-3 text-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <MessageSquare size={20} />}
                {loading ? "Envoi du code..." : "Recevoir le code OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Code de vérification</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-5 text-center text-3xl font-black tracking-[0.5em] text-emerald-600 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-[24px] bg-emerald-600 px-6 py-5 font-black text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-3 text-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={20} />}
                {loading ? "Vérification..." : "Vérifier le code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("PHONE")}
                className="w-full text-xs text-gray-400 font-bold hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                Changer de numéro
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Placeholder for trusted partners/badges if any */}
        </div>
      </div>
    </div>
  );
}
