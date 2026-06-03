'use client';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock, Eye, Database } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
            <div className="w-12 h-12 bg-neon-green/20 rounded-xl flex items-center justify-center border border-neon-green/50">
              <Eye className="w-6 h-6 text-neon-green" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-orbitron font-black uppercase tracking-tighter">Privacy <span className="text-neon-green">Protocol</span></h1>
          </div>

          <div className="space-y-8 text-gray-400 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
                <Database className="w-5 h-5 text-neon-blue" /> Data Collection
              </h2>
              <p>We collect essential information to provide a secure gaming experience:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong className="text-white">Account Info:</strong> Username, Email, Mech Arena Player ID.</li>
                <li><strong className="text-white">Financial Data:</strong> Bank details and UPI IDs (for withdrawal processing only).</li>
                <li><strong className="text-white">Game Stats:</strong> Squad power, win/loss history, and match screenshots for verification.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
                <Shield className="w-5 h-5 text-neon-green" /> Data Security
              </h2>
              <p>Your data is stored in encrypted databases. Financial information is used solely for the purpose of processing rewards and is never shared with third parties for marketing purposes.</p>
              <div className="bg-neon-green/5 border border-neon-green/20 p-4 rounded-xl">
                <p className="text-xs text-neon-green font-bold flex items-center gap-2">
                  <Lock className="w-3 h-3" /> SECURITY STATUS: ENCRYPTED
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">User Rights</h2>
              <p>Users have the right to request a copy of their data or request account deletion. Please contact support to initiate these processes. Note that some data may be retained for legal and administrative reasons (e.g., transaction history).</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
