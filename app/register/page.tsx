'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Zap, Globe, DollarSign, ArrowRight, Sword, Shield } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', mechArenaId: '', email: '', password: '', 
    currency: 'USD', country: '', squadPower: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Registration successful!");
        router.push('/login');
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Registration failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* HUD Effects */}
      <div className="scanline"></div>
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10 my-12"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] mb-6">
            <Sword className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-orbitron font-black tracking-tighter uppercase mb-2">
            USER<span className="text-neon-blue">REGISTER</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Create Your Account</p>
        </div>

        <div className="glass-panel p-8 lg:p-10 rounded-3xl border-white/5 hud-border relative">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  placeholder="Enter username" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Mech Arena Player ID</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  placeholder="e.g. 882931" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setFormData({...formData, mechArenaId: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  type="email"
                  placeholder="pilot@example.com" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  type="password"
                  placeholder="••••••••" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Squad Power</label>
              <div className="relative group">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  type="number"
                  placeholder="e.g. 4200" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setFormData({...formData, squadPower: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Country</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  placeholder="e.g. USA" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setFormData({...formData, country: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Currency</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <select 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all appearance-none text-white" 
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                </select>
              </div>
            </div>

            <button 
              disabled={loading}
              className="md:col-span-2 w-full bg-neon-blue text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)] disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Already have an account? <a href="/login" className="text-neon-purple hover:text-neon-blue transition-colors">Login Here</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
