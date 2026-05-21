'use client';
import { motion } from 'framer-motion';
import { Sword, Zap, Shield, Trophy, Users, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-neon-blue/30 overflow-x-hidden relative">
      {/* HUD Effects */}
      <div className="scanline"></div>
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20"></div>

      {/* Floating Particles/Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-[#050816]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Sword className="w-6 h-6 text-black" />
          </div>
          <h1 className="font-orbitron font-black text-xl tracking-tighter">
            MECH<span className="text-neon-blue">ARENA</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-orbitron font-bold uppercase tracking-widest hover:text-neon-blue transition-colors px-4 py-2">
            Login
          </Link>
          <Link href="/register" className="bg-neon-blue text-black px-6 py-2 rounded-lg font-orbitron font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-orbitron font-bold text-neon-blue uppercase tracking-[0.3em] mb-6">
              Mech Arena Betting Platform
            </span>
            <h1 className="text-5xl lg:text-8xl font-orbitron font-black tracking-tighter uppercase mb-8 leading-tight">
              PLAY & WIN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">REAL MONEY</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg lg:text-xl font-medium mb-12 leading-relaxed">
              Challenge real players in Mech Arena, place your bets, and win money. 
              The most secure and transparent betting hub for Mech Arena fans.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register" className="w-full sm:w-auto bg-neon-blue text-black px-10 py-5 rounded-2xl font-orbitron font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center justify-center gap-3">
                Join Now <ArrowRight className="w-6 h-6" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-orbitron font-black uppercase tracking-tighter hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Play className="w-5 h-5 text-neon-purple" /> Start Playing
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative HUD Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-20 pointer-events-none hidden xl:block">
          <div className="w-64 h-64 border border-neon-blue/30 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border border-neon-purple/30 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -10 }}
            className="glass-panel p-8 rounded-3xl border-white/5 hud-border"
          >
            <div className="w-14 h-14 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/30 mb-6">
              <Zap className="w-7 h-7 text-neon-blue" />
            </div>
            <h3 className="text-xl font-orbitron font-bold mb-4 uppercase">Instant Matching</h3>
            <p className="text-gray-500 leading-relaxed">
              Our neural-link matchmaking system connects you with worthy opponents 
              in seconds. No waiting, just combat.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="glass-panel p-8 rounded-3xl border-white/5 hud-border"
          >
            <div className="w-14 h-14 bg-neon-purple/10 rounded-2xl flex items-center justify-center border border-neon-purple/30 mb-6">
              <Shield className="w-7 h-7 text-neon-purple" />
            </div>
            <h3 className="text-xl font-orbitron font-bold mb-4 uppercase">Escrow Protocol</h3>
            <p className="text-gray-500 leading-relaxed">
              Every wager is locked in a secure, decentralized escrow. Your credits 
              are safe until the battle data is verified.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="glass-panel p-8 rounded-3xl border-white/5 hud-border"
          >
            <div className="w-14 h-14 bg-neon-green/10 rounded-2xl flex items-center justify-center border border-neon-green/30 mb-6">
              <Trophy className="w-7 h-7 text-neon-green" />
            </div>
            <h3 className="text-xl font-orbitron font-bold mb-4 uppercase">Elite Rewards</h3>
            <p className="text-gray-500 leading-relaxed">
              Climb the ranks from Rookie to Legendary Pilot. Earn exclusive 
              badges and dominate the global leaderboards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-orbitron font-black text-neon-blue mb-2">10K+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Pilots</p>
          </div>
          <div>
            <p className="text-4xl font-orbitron font-black text-neon-purple mb-2">$500K+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payouts Sent</p>
          </div>
          <div>
            <p className="text-4xl font-orbitron font-black text-neon-green mb-2">250K+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Battles Fought</p>
          </div>
          <div>
            <p className="text-4xl font-orbitron font-black text-neon-orange mb-2">99.9%</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime Signal</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-gray-400" />
            </div>
            <h1 className="font-orbitron font-bold text-lg tracking-tighter">
              MECH<span className="text-neon-blue">ARENA</span>
            </h1>
          </div>
          <div className="flex gap-8 text-xs font-bold text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-neon-blue transition-colors">Terms</a>
            <a href="#" className="hover:text-neon-blue transition-colors">Privacy</a>
            <a href="#" className="hover:text-neon-blue transition-colors">Support</a>
            <a href="#" className="hover:text-neon-blue transition-colors">API</a>
          </div>
          <p className="text-xs text-gray-700 font-bold uppercase tracking-widest">
            © 2026 MECH ARENA HUB. ALL SYSTEMS GO.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
