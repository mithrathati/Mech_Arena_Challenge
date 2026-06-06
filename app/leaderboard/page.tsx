'use client';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Wallet, User, Medal } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  username: string;
  mechArenaId: string;
  balance: number;
  currency: string;
  totalWins: number;
  totalMatches: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="scanline"></div>
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-neon-blue hover:text-white transition-colors mb-8 font-orbitron text-xs font-bold uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Base
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-10 rounded-3xl border-white/5 hud-border"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-yellow/20 rounded-xl flex items-center justify-center border border-neon-yellow/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <Trophy className="w-6 h-6 text-neon-yellow" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-orbitron font-black uppercase tracking-tighter">Global <span className="text-neon-yellow">Leaderboard</span></h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Top Pilots by Wallet Balance</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-orbitron text-[10px] uppercase tracking-widest text-gray-500">Syncing Data...</p>
              </div>
            ) : entries.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="pb-4 pl-4">Rank</th>
                      <th className="pb-4">Pilot</th>
                      <th className="pb-4 text-right pr-4">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {entries.map((user, index) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="py-5 pl-4">
                          <div className="flex items-center gap-3">
                            <span className={`font-orbitron font-black text-lg ${
                              index === 0 ? 'text-neon-yellow' : 
                              index === 1 ? 'text-gray-300' : 
                              index === 2 ? 'text-neon-orange' : 'text-gray-500'
                            }`}>
                              #{index + 1}
                            </span>
                            {index < 3 && <Medal className={`w-4 h-4 ${
                              index === 0 ? 'text-neon-yellow' : 
                              index === 1 ? 'text-gray-300' : 'text-neon-orange'
                            }`} />}
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-neon-blue/50 transition-colors">
                              <User className="w-4 h-4 text-gray-600 group-hover:text-neon-blue" />
                            </div>
                            <div>
                              <p className="font-bold text-sm group-hover:text-white transition-colors">{user.username}</p>
                              <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">ID: {user.mechArenaId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right pr-4">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-3.5 h-3.5 text-neon-green" />
                              <span className="font-orbitron font-black text-neon-green text-sm">
                                {user.currency} {user.balance.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">Wins: {user.totalWins}</p>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center glass-panel rounded-2xl border-dashed border-white/5">
                <p className="text-gray-600 font-orbitron text-sm uppercase tracking-widest">No Pilots Registered</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
