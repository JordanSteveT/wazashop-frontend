"use client";

import { useEffect, useState } from "react";
import { User, Camera, Loader2, CheckCircle2, Mail, Info, Save } from "lucide-react";
import { userService } from "@/services/api.service";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getMe();
        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.email) setEmail(data.email);
        if (data.bio) setBio(data.bio);
        if (data.avatar_url) setCurrentAvatarUrl(data.avatar_url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("bio", bio);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const data = await userService.update(formData);
      if (data.avatar_url) setCurrentAvatarUrl(data.avatar_url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
            <User size={24} />
          </div>
          Mon Profil
        </h1>
        <p className="text-gray-500 font-medium mt-2">Gérez vos informations personnelles et votre identité visuelle.</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-10">
          {error && (
            <div className="mb-8 rounded-2xl bg-red-50 p-6 text-sm text-red-600 font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column: Avatar */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="h-48 w-48 rounded-[48px] overflow-hidden bg-emerald-50 border-8 border-white shadow-2xl relative">
                  {(avatarPreview || currentAvatarUrl) ? (
                    <img 
                      src={avatarPreview || currentAvatarUrl!} 
                      alt="Avatar" 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-600">
                      <User size={64} />
                    </div>
                  )}
                  
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/80 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                    <Camera size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Changer</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Photo de profil</p>
                <p className="text-[10px] text-gray-400 font-medium italic">Format carré conseillé</p>
              </div>
            </div>

            {/* Right Column: Fields */}
            <div className="flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Prénom</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-bold transition-all" 
                    placeholder="Jean" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Nom</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-6 py-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-bold transition-all" 
                    placeholder="Dupont" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-14 py-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-bold transition-all" 
                    placeholder="jean.dupont@email.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Biographie / À propos</label>
                <div className="relative">
                  <Info className="absolute left-6 top-6 text-gray-300" size={20} />
                  <textarea 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-14 py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-800 font-medium transition-all min-h-[140px] resize-none" 
                    placeholder="Dites-en plus sur vous et votre expertise..." 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 mt-10 border-t border-gray-50 flex items-center justify-between">
            {success && (
              <div className="flex items-center gap-3 text-emerald-600 font-black text-sm animate-bounce">
                <CheckCircle2 size={24} />
                Profil mis à jour !
              </div>
            )}
            <div className="flex-1"></div>
            <button 
              type="submit" 
              disabled={saving} 
              className="w-full md:w-auto bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              <span>{saving ? "Enregistrement..." : "Sauvegarder"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
