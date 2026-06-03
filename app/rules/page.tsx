'use client';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Trophy, Users, Zap, Gavel } from 'lucide-react';
import Link from 'next/link';

export default function RulesAndConduct() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="scanline"></div>
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-neon-blue hover:text-white transition-colors mb-8 font-orbitron text-xs font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Base
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 sm:p-12 rounded-3xl border-white/5 hud-border"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-neon-purple/20 rounded-xl flex items-center justify-center border border-neon-purple/50">
              <Trophy className="w-6 h-6 text-neon-purple" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-orbitron font-black uppercase tracking-tighter">Player <span className="text-neon-purple">Rules & Conduct</span></h1>
          </div>

          <div className="space-y-10 text-gray-400 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
                <Zap className="w-5 h-5 text-neon-orange" /> Fair Play Policy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-neon-blue font-bold mb-3 uppercase text-sm">Anti-Cheating</h3>
                  <p className="text-xs leading-relaxed">The use of mods, hacks, scripts, or any third-party software that provides an unfair advantage is strictly prohibited. Detection leads to permanent ban.</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-neon-blue font-bold mb-3 uppercase text-sm">Account Integrity</h3>
                  <p className="text-xs leading-relaxed">Account sharing, smurfing, or deliberate losing (match-fixing) to manipulate rewards is forbidden.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
                <Users className="text-neon-green w-5 h-5" /> Code of Conduct
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-neon-green rounded-full mt-2 shrink-0 shadow-[0_0_8px_#39FF14]"></div>
                  <p>Maintain respect towards all players. Harassment, hate speech, or abuse will not be tolerated.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-neon-green rounded-full mt-2 shrink-0 shadow-[0_0_8px_#39FF14]"></div>
                  <p>Intentional disconnection or griefing during a match will result in a forfeit and potential account suspension.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-neon-green rounded-full mt-2 shrink-0 shadow-[0_0_8px_#39FF14]"></div>
                  <p>Abusing support staff or platform administrators will lead to immediate account termination.</p>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
                <Gavel className="text-neon-blue w-5 h-5" /> Dispute Resolution
              </h2>
              <p className="mb-4">In case of a match dispute, both players must provide video or screenshot evidence within 30 minutes of the match completion.</p>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Administrative Authority:</p>
                <p className="text-[10px] mt-1 italic">The Mech Arena Challenge administrators have the final say in all match disputes. No appeals will be entertained after a decision is finalized.</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
