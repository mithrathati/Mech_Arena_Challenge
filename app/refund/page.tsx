'use client';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, RefreshCcw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicy() {
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
            <div className="w-12 h-12 bg-neon-orange/20 rounded-xl flex items-center justify-center border border-neon-orange/50">
              <RefreshCcw className="w-6 h-6 text-neon-orange" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-orbitron font-black uppercase tracking-tighter">Refund <span className="text-neon-orange">& Cancellation</span></h1>
          </div>

          <div className="space-y-8 text-gray-400 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">1. Deposit Refunds</h2>
              <p>Deposits made to the platform are final. Once a deposit is confirmed and added to your wallet, it cannot be refunded back to the original payment method except in cases of verified technical failure.</p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs italic">Technical failures must be reported within 24 hours of the transaction with valid UTR/Transaction ID proof.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">2. Match Cancellations</h2>
              <p>Challenges may be cancelled under the following conditions:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>The opponent rejects the challenge.</li>
                <li>The challenge expires before being accepted.</li>
                <li>Administrator intervention due to technical issues.</li>
              </ul>
              <p>In all valid cancellation cases, the challenge amount will be instantly credited back to your platform wallet.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">3. Payment Errors</h2>
              <div className="flex gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-xs text-red-200 leading-relaxed font-bold">
                  The platform is NOT responsible for funds lost due to incorrect UPI IDs, bank account numbers, or IFSC codes provided by the user during withdrawal. Users must verify all payment information before submitting a withdrawal request.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">4. Disqualification</h2>
              <p>If a user is banned or disqualified for cheating or misconduct, all pending match amounts and wallet balances may be forfeited at the discretion of the platform administrators.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
