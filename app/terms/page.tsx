'use client';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditions() {
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
            <div className="w-12 h-12 bg-neon-blue/20 rounded-xl flex items-center justify-center border border-neon-blue/50">
              <Shield className="w-6 h-6 text-neon-blue" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-orbitron font-black uppercase tracking-tighter">Terms & <span className="text-neon-blue">Conditions</span></h1>
          </div>

          <div className="space-y-8 text-gray-400 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">1. Introduction</h2>
              <p>Welcome to Mech Arena Challenge. These Terms and Conditions govern your use of our platform. By accessing or using our services, you agree to be bound by these terms. If you do not agree, please refrain from using the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">2. User Eligibility</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-neon-blue">Age Requirement:</strong> Users must be at least 18 years of age.</li>
                <li><strong className="text-neon-blue">Geographical Restriction:</strong> Only residents of India are eligible to participate in challenges and win rewards.</li>
                <li><strong className="text-neon-blue">Verification:</strong> Users may be required to provide valid ID proof for reward distribution.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">3. Skill-Based Competition</h2>
              <p>Mech Arena Challenge is a skill-based gaming platform. Success in matches depends entirely on player performance, strategy, and skill. This platform does <strong className="text-white">NOT</strong> host gambling, betting, lotteries, or any games of chance. Winning is determined solely by in-game metrics and match results.</p>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">4. User Responsibilities</h2>
              <p>Users are responsible for maintaining the confidentiality of their account details and for all activities that occur under their account. You must provide accurate and truthful information during registration and payment processing.</p>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">5. Administrative Decisions</h2>
              <p>All administrative decisions regarding match results, disputes, rewards, and account standing are final. The platform reserves the right to suspend or ban users found to be in violation of our Fair Play or Conduct policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">6. Contact Information</h2>
              <p>For any queries or support, please contact us at: <strong className="text-neon-blue">devilmech934@gmail.com</strong></p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
