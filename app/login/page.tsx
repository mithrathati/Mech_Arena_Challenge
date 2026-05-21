'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Sword, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session?.user?.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          router.push('/dashboard');
        }
      } else {
        alert("Login failed: " + (result?.error || "Check your email/password"));
      }
    } catch (err) {
      alert("An unexpected error occurred during login.");
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] mb-6">
            <Sword className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-orbitron font-black tracking-tighter uppercase mb-2">
            USER<span className="text-neon-blue">LOGIN</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Access Required</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5 hud-border relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl text-sm font-medium outline-none focus:border-neon-blue transition-all" 
                  onChange={e => setEmail(e.target.value)} 
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
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-neon-blue text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)] disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Login Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Don't have an account? <a href="/register" className="text-neon-purple hover:text-neon-blue transition-colors">Register Here</a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Neural Link Secure</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
