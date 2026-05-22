'use client';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Trophy, 
  Users, 
  MessageSquare, 
  History, 
  Shield, 
  Zap, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  Camera, 
  Check, 
  X,
  User,
  Activity,
  Award,
  Sword,
  Search,
  Filter,
  Copy,
  ExternalLink
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  balance: number;
  currency: string;
  squadPower: number;
  winStreak: number;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
}

interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  amount: number;
  status: string;
  challenger: { username: string; squadPower: number; mechArenaId: string };
  challenged: { username: string; squadPower: number; mechArenaId: string };
  challengerProof?: string;
  challengedProof?: string;
}

interface UserInfo {
  id: string;
  username: string;
  mechArenaId: string;
  squadPower: number;
  isActive: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ 
    id: '', 
    username: '', 
    balance: 0, 
    currency: 'USD', 
    squadPower: 0, 
    winStreak: 0 
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [challengeAmount, setChallengeAmount] = useState('');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSquadPowerModal, setShowSquadPowerModal] = useState(false);
  const [newSquadPower, setNewSquadPower] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Bank Details State
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchData = async () => {
    if (status === 'authenticated') {
      try {
        const [profileRes, usersRes, challengesRes, transactionsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/users'),
          fetch('/api/challenges'),
          fetch('/api/user/transactions')
        ]);
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);

          // Set bank details if available
          if (profileData.bankName) setBankName(profileData.bankName);
          if (profileData.accountHolder) setAccountHolder(profileData.accountHolder);
          if (profileData.accountNumber) setAccountNumber(profileData.accountNumber);
          if (profileData.ifscCode) setIfscCode(profileData.ifscCode);
        }

        if (usersRes.ok) setUsers(await usersRes.json());
        if (challengesRes.ok) setChallenges(await challengesRes.json());
        if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [status]);

  const handleCreateChallenge = async () => {
    if (!selectedUser) return;
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengedId: selectedUser.id, amount: challengeAmount }),
    });
    if (res.ok) {
      setSelectedUser(null);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        const res = await fetch(`/api/challenges/${activeChat}/messages`);
        const data = await res.json();
        setMessages(data);
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    await fetch(`/api/challenges/${activeChat}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: chatMessage }),
    });
    setChatMessage('');
  };

  const handleChallengeAction = async (id: string, action: string, screenshotUrl?: string) => {
    const res = await fetch(`/api/challenges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, screenshotUrl }),
    });
    if (res.ok) {
      fetchData();
      setUploadingFor(null);
    } else {
      const data = await res.json();
      alert(data.error || "Action failed");
    }
  };

  const handleUpdateSquadPower = async () => {
    const powerValue = parseInt(newSquadPower);
    if (isNaN(powerValue)) return alert("Enter a valid numeric squad power");
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squadPower: powerValue }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setProfile(data); // Update profile immediately with returned data
        setShowSquadPowerModal(false);
      } else {
        alert(data.error || "Update failed");
      }
    } catch (error) {
      alert("Failed to update squad power. Please try again.");
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      return data.url;
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleTransaction = async (type: 'DEPOSIT' | 'WITHDRAWAL') => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) return alert("Enter valid amount");
    
    if (type === 'WITHDRAWAL') {
      if (!bankName || !accountHolder || !accountNumber || !ifscCode) {
        return alert("All bank details are mandatory for withdrawal.");
      }
    }

    if (type === 'DEPOSIT') {
      if (!transactionId || !proofUrl) {
        return alert("UTR Number and Payment Screenshot are mandatory for deposit.");
      }
    }
    
    const res = await fetch('/api/user/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type, 
        amount: transactionAmount, 
        transactionId: type === 'DEPOSIT' ? transactionId : undefined,
        proofUrl: type === 'DEPOSIT' ? proofUrl : undefined,
        bankName: type === 'WITHDRAWAL' ? bankName : undefined,
        accountHolder: type === 'WITHDRAWAL' ? accountHolder : undefined,
        accountNumber: type === 'WITHDRAWAL' ? accountNumber : undefined,
        ifscCode: type === 'WITHDRAWAL' ? ifscCode : undefined,
      }),
    });

    if (res.ok) {
      setShowDeposit(false);
      setShowWithdraw(false);
      setTransactionAmount('');
      setTransactionId('');
      setProofUrl('');
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-neon-blue/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-neon-blue rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="font-orbitron text-neon-blue animate-pulse tracking-widest uppercase text-xs">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-neon-blue/30 overflow-x-hidden relative">
      {/* HUD Scanline Effect */}
      <div className="scanline"></div>
      
      {/* Background Grid */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20"></div>

      {/* Sticky Glass Navbar */}
      <nav className="sticky top-0 z-40 bg-[#050816]/80 backdrop-blur-md border-b border-white/5 py-3 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Sword className="w-6 h-6 text-black" />
          </div>
          <h1 className="font-orbitron font-black text-xl tracking-tighter hidden sm:block">
            MECH<span className="text-neon-blue">ARENA</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-[0_0_8px_#39FF14]"></div>
            <span className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">
              {users.length} Players Online
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-neon-blue" />
                <span className="font-orbitron font-bold text-neon-blue">
                  {profile.currency} {(profile.balance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg border border-white/10 hover:border-red-500/50 transition-all text-gray-400 hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Challenges */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Profile Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-neon-blue/10 transition-colors"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-2 border-neon-blue/50 p-1 rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center bg-[url('/pilot_bg.jpg')] bg-cover">
                    <User className="w-16 h-16 text-neon-blue/20" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-neon-blue text-black font-black px-2 py-0.5 rounded text-[10px] font-orbitron">
                  RANK S
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-3xl font-orbitron font-black tracking-tight uppercase">
                  PLAYER: <span className="text-neon-blue">{session.user?.name}</span>
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-md border border-white/10 group/sp">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Squad Power: <span className="text-white">{profile.squadPower ?? 0}</span></span>
                    <button 
                      onClick={() => {
                        setNewSquadPower((profile.squadPower ?? 0).toString());
                        setShowSquadPowerModal(true);
                      }}
                      className="ml-1 opacity-0 group-hover/sp:opacity-100 transition-opacity p-0.5 hover:text-neon-blue"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-md border border-white/10">
                    <Activity className="w-4 h-4 text-neon-green" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Win Streak: <span className="text-white">{profile.winStreak || 0}</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-md border border-white/10">
                    <Shield className="w-4 h-4 text-neon-blue" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Status: <span className="text-neon-green">Active</span></span>
                  </div>
                </div>
              </div>

              <div className="hidden xl:block">
                <div className="text-center p-4 border-l border-white/10">
                  <p className="text-[10px] font-orbitron text-gray-500 uppercase tracking-widest mb-1">Win Rate</p>
                  <p className="text-4xl font-black text-neon-purple drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">74%</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Active Matches Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron font-bold text-lg flex items-center gap-3">
                <Zap className="w-5 h-5 text-neon-orange animate-pulse" />
                ACTIVE CHALLENGES
              </h2>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{challenges.length} TOTAL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {challenges.length > 0 ? challenges.map((ch: any) => (
                  <motion.div 
                    layout
                    key={ch.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-panel rounded-xl p-5 border-l-4 border-l-neon-blue hover:neon-border-blue transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Challenge From</p>
                        <h3 className="font-orbitron font-bold text-neon-blue group-hover:text-white transition-colors">
                          {ch.challengerId === (session?.user as any).id ? ch.challenged.username : ch.challenger.username}
                        </h3>
                        <p className="text-[9px] text-neon-purple/80 font-black uppercase tracking-[0.1em] mt-0.5">
                          Player ID: {ch.challengerId === (session?.user as any).id ? ch.challenged.mechArenaId : ch.challenger.mechArenaId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bet Amount</p>
                        <p className="font-orbitron font-bold text-neon-green">{profile.currency} {(ch.amount ?? 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <span className={`text-[10px] uppercase font-black px-2 py-1 rounded bg-white/5 border border-white/10 ${
                        ch.status === 'PENDING' ? 'text-neon-orange border-neon-orange/30' :
                        ch.status === 'ACCEPTED' ? 'text-neon-green border-neon-green/30' :
                        'text-gray-500'
                      }`}>
                        {ch.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {ch.status === 'PENDING' && ch.challengedId === (session?.user as any).id && (
                        <>
                          <button onClick={() => handleChallengeAction(ch.id, 'ACCEPT')} className="flex-1 bg-neon-green/10 border border-neon-green/50 text-neon-green py-2 rounded-lg font-bold text-xs uppercase hover:bg-neon-green hover:text-black transition-all">Accept</button>
                          <button onClick={() => handleChallengeAction(ch.id, 'REJECT')} className="flex-1 bg-red-500/10 border border-red-500/50 text-red-500 py-2 rounded-lg font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                        </>
                      )}
                      {(ch.status === 'ACCEPTED' || ch.status === 'COMPLETED') && (
                        <>
                          <button onClick={() => setActiveChat(ch.id)} className="flex-1 bg-neon-purple/10 border border-neon-purple/50 text-neon-purple py-2 rounded-lg font-bold text-xs uppercase hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Chat
                          </button>
                          {((ch.challengerId === (session?.user as any).id && !ch.challengerProof) || 
                            (ch.challengedId === (session?.user as any).id && !ch.challengedProof)) && (
                            <button onClick={() => setUploadingFor(ch.id)} className="flex-1 bg-neon-blue/10 border border-neon-blue/50 text-neon-blue py-2 rounded-lg font-bold text-xs uppercase hover:bg-neon-blue hover:text-black transition-all flex items-center justify-center gap-2">
                              <Camera className="w-4 h-4" /> Upload Proof
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <div className="md:col-span-2 py-12 flex flex-col items-center justify-center glass-panel rounded-2xl border-dashed border-white/5">
                    <Shield className="w-12 h-12 text-gray-800 mb-4" />
                    <p className="text-gray-600 font-orbitron text-sm uppercase tracking-widest">No Active Engagements</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Available Players Section */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-orbitron font-bold text-lg flex items-center gap-3">
                <Users className="w-5 h-5 text-neon-blue" />
                AVAILABLE PLAYERS
              </h2>
              
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl focus-within:border-neon-blue transition-colors group">
                <Search className="w-4 h-4 text-gray-500 group-focus-within:text-neon-blue" />
                <input 
                  type="text" 
                  placeholder="Search Players..." 
                  className="bg-transparent border-none outline-none text-xs w-48 font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {users
                .filter((u:any) => u.id !== (session?.user as any).id && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  className="glass-panel rounded-xl p-5 group hover:neon-border-blue transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-neon-blue/5 rounded-full blur-xl -mr-8 -mt-8"></div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center border border-white/10 group-hover:border-neon-blue/50 transition-colors overflow-hidden">
                      <User className="w-6 h-6 text-gray-600 group-hover:text-neon-blue transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">{user.username}</h3>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-neon-green shadow-[0_0_8px_#39FF14]' : 'bg-gray-600'}`}></div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">SQUAD POWER: {user.squadPower || 4200}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-neon-blue font-black uppercase tracking-tighter">ID: {user.mechArenaId}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(user.mechArenaId);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors group/copy"
                          title="Copy ID"
                        >
                          <Copy className="w-3 h-3 text-gray-600 group-hover/copy:text-neon-blue" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <p className="text-[8px] text-gray-500 uppercase font-bold">Wins</p>
                      <p className="text-xs font-bold text-neon-green">142</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <p className="text-[8px] text-gray-500 uppercase font-bold">Rank</p>
                      <p className="text-xs font-bold text-neon-purple">Elite</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="w-full py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg font-orbitron font-bold text-[10px] uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all active:scale-95"
                  >
                    Send Challenge
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Wallet & History */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Wallet Section */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <h2 className="font-orbitron font-bold text-lg flex items-center gap-3 mb-6">
              <Wallet className="w-5 h-5 text-neon-purple" />
              WALLET
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-orbitron font-black text-white">{(profile.balance ?? 0).toFixed(2)}</span>
                  <span className="text-xs font-bold text-neon-purple uppercase tracking-widest">{profile.currency}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl hover:bg-neon-green/10 hover:border-neon-green transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-neon-green" />
                  </div>
                  <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-neon-green">Deposit</span>
                </button>
                <button 
                  onClick={() => setShowWithdraw(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl hover:bg-neon-blue/10 hover:border-neon-blue transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-neon-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-5 h-5 text-neon-blue" />
                  </div>
                  <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-neon-blue">Withdraw</span>
                </button>
              </div>

              <div className="p-4 bg-neon-blue/5 border border-neon-blue/10 rounded-xl">
                <p className="text-[10px] text-neon-blue uppercase font-bold mb-1 tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Secure Wallet
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">All your funds are stored securely.</p>
              </div>
            </div>
          </motion.section>

          {/* Transaction History Section */}
          <section className="space-y-6">
            <h2 className="font-orbitron font-bold text-lg flex items-center gap-3">
              <History className="w-5 h-5 text-gray-400" />
              HISTORY
            </h2>
            
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-500 uppercase text-[9px] font-bold sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="p-4">Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length > 0 ? transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold ${
                              t.type === 'DEPOSIT' || t.type === 'WIN_CREDIT' ? 'text-neon-green' : 'text-neon-orange'
                            }`}>
                              {t.type}
                            </span>
                            <span className="text-[8px] text-gray-600 uppercase">{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-orbitron font-bold text-xs">{profile.currency} {(t.amount ?? 0).toFixed(2)}</span>
                            {t.type === 'WITHDRAWAL' && t.netAmount && (
                              <span className="text-[8px] text-neon-green font-bold italic">Net: {(t.netAmount ?? 0).toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black border ${
                            t.status === 'APPROVED' ? 'bg-neon-green/5 text-neon-green border-neon-green/30' :
                            t.status === 'PENDING' ? 'bg-neon-orange/5 text-neon-orange border-neon-orange/30' :
                            'bg-red-500/5 text-red-500 border-red-500/30'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-600 italic text-xs">No transactions yet...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {/* Deposit Modal */}
        {showDeposit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-neon-green/30 p-8 rounded-3xl max-w-md w-full hud-border"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-orbitron font-black text-neon-green uppercase tracking-tighter">Deposit Money</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Add funds to your wallet</p>
                </div>
                <button onClick={() => setShowDeposit(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-2xl mb-8 flex justify-center border-4 border-neon-green/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                <img src="/upi_qr.jpeg" alt="UPI QR" className="max-w-[180px] h-auto grayscale brightness-110" />
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">Amount to Deposit *</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="number" 
                      placeholder="Enter amount" 
                      className="w-full bg-black/50 border border-white/10 p-3 pl-10 rounded-xl font-orbitron font-bold text-neon-green outline-none focus:border-neon-green transition-colors"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">Transaction ID (UTR) *</label>
                  <input 
                    type="text" 
                    placeholder="Enter 12-digit UTR" 
                    className="w-full bg-black/50 border border-white/10 p-3 rounded-xl font-bold text-sm outline-none focus:border-neon-green transition-colors"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">Upload Screenshot *</label>
                  <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/5 hover:border-neon-green/50 rounded-2xl cursor-pointer bg-white/5 transition-all group">
                    <Camera className="w-6 h-6 text-gray-600 group-hover:text-neon-green mb-2" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Screenshot</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setProofUrl(url);
                        }
                      }}
                    />
                  </label>
                  {isUploading && <p className="text-[10px] text-neon-blue animate-pulse text-center font-bold">Uploading...</p>}
                  {proofUrl && <p className="text-[10px] text-neon-green text-center font-bold">✓ Screenshot Uploaded</p>}
                </div>

                <button 
                  onClick={() => handleTransaction('DEPOSIT')} 
                  className="w-full bg-neon-green text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                >
                  Submit Deposit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Withdrawal Modal */}
        {showWithdraw && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-neon-blue/30 p-8 rounded-3xl max-w-md w-full hud-border"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-orbitron font-black text-neon-blue uppercase tracking-tighter">Withdraw Money</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Transfer funds to your bank</p>
                </div>
                <button onClick={() => setShowWithdraw(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">Amount to Withdraw *</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount" 
                    className="w-full bg-black/50 border border-white/10 p-3 rounded-xl font-orbitron font-bold text-neon-blue outline-none focus:border-neon-blue transition-colors text-xl"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </div>
                
                {transactionAmount && parseFloat(transactionAmount) > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-neon-blue/5 border border-neon-blue/20 p-4 rounded-xl space-y-2 overflow-hidden"
                  >
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-500 uppercase tracking-widest">Requested:</span>
                      <span className="text-white font-orbitron">{profile.currency} {parseFloat(transactionAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-500 uppercase tracking-widest">Fee (5%):</span>
                      <span className="text-neon-orange font-orbitron">- {profile.currency} {(parseFloat(transactionAmount) * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2">
                      <span className="text-gray-300 uppercase tracking-tighter">You Receive:</span>
                      <span className="text-neon-green font-orbitron drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">{profile.currency} {(parseFloat(transactionAmount) * 0.95).toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}
                
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <p className="text-[10px] font-orbitron text-gray-500 uppercase tracking-widest font-bold">Bank Account Details *</p>
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      type="text" 
                      placeholder="Account Holder Name *" 
                      className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-neon-blue transition-colors"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Account Number *" 
                      className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-neon-blue transition-colors"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Bank Name *" 
                        className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-neon-blue transition-colors"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="IFSC Code *" 
                        className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-neon-blue transition-colors"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 px-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Current Balance</span>
                  <span className="text-xs font-bold text-white font-orbitron">{profile.currency} {(profile.balance ?? 0).toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => handleTransaction('WITHDRAWAL')} 
                  className="w-full bg-neon-blue text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                >
                  Submit Withdrawal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Challenge Modal */}
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-neon-purple/30 p-8 rounded-3xl max-w-sm w-full hud-border"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-neon-purple/20 rounded-2xl flex items-center justify-center border border-neon-purple/50 mb-4 animate-pulse">
                  <Zap className="w-8 h-8 text-neon-purple" />
                </div>
                <h3 className="text-2xl font-orbitron font-black text-white uppercase tracking-tighter">Send Challenge</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">To: <span className="text-neon-purple">{selectedUser.username}</span></p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">Select Bet Amount</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[100, 200, 300, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setChallengeAmount(amt.toString())}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 group/btn ${
                          challengeAmount === amt.toString() 
                            ? 'bg-neon-purple/20 border-neon-purple shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                            : 'bg-white/5 border-white/10 hover:border-neon-purple/50'
                        }`}
                      >
                        <span className={`font-orbitron font-black text-lg ${challengeAmount === amt.toString() ? 'text-white' : 'text-gray-400'}`}>
                          {amt}
                        </span>
                        <span className="text-[8px] font-bold text-neon-green uppercase tracking-widest group-hover/btn:text-white transition-colors">
                          Win: {(amt * 2 * 0.95).toFixed(0)}
                        </span>
                      </button>
                    ))}
                    
                    {/* Custom Input Option */}
                    <div className="relative col-span-2 mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">{profile.currency}</span>
                      <input 
                        type="number" 
                        placeholder="Enter custom amount"
                        className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-2xl font-orbitron font-bold text-sm outline-none focus:border-neon-purple transition-colors"
                        value={[100, 200, 300, 500, 1000].includes(Number(challengeAmount)) ? '' : challengeAmount}
                        onChange={(e) => setChallengeAmount(e.target.value)}
                      />
                      {challengeAmount && ![100, 200, 300, 500, 1000].includes(Number(challengeAmount)) && (
                        <p className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neon-green uppercase tracking-widest">
                          Win: {(Number(challengeAmount) * 2 * 0.95).toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-600 text-center italic">Funds will be held securely until the match ends.</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleCreateChallenge} 
                    className="flex-1 bg-neon-purple text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  >
                    Send
                  </button>
                  <button 
                    onClick={() => setSelectedUser(null)} 
                    className="flex-1 bg-white/5 border border-white/10 text-gray-400 py-4 rounded-xl font-orbitron font-bold uppercase tracking-tighter hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Chat Modal */}
        {activeChat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="glass-panel border-neon-blue/30 rounded-3xl max-w-lg w-full h-[600px] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-[0_0_8px_#39FF14]"></div>
                  <h3 className="font-orbitron font-bold text-sm tracking-widest uppercase">Match Chat</h3>
                </div>
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.length > 0 ? messages.map((msg: any) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === (session?.user as any).id ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl relative ${
                      msg.senderId === (session?.user as any).id 
                        ? 'bg-neon-blue/10 border border-neon-blue/30 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-widest">{msg.sender.username} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-700">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                    <p className="font-orbitron text-[10px] uppercase tracking-[0.2em]">Start a conversation...</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#050816] border-t border-white/5">
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 focus-within:border-neon-blue transition-colors">
                  <input 
                    type="text" 
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none p-3 outline-none text-sm font-medium"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="bg-neon-blue text-black px-5 rounded-xl font-orbitron font-black text-xs uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Upload Proof Modal */}
        {uploadingFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-neon-blue/30 p-8 rounded-3xl max-w-sm w-full"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center border border-neon-blue/50 mb-4">
                  <Camera className="w-8 h-8 text-neon-blue" />
                </div>
                <h3 className="text-2xl font-orbitron font-black text-white uppercase tracking-tighter">Upload Proof</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Upload Match Result Screenshot</p>
              </div>
              
              <div className="space-y-6">
                <label className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 hover:border-neon-blue/50 rounded-3xl cursor-pointer bg-white/5 transition-all group">
                  <Camera className="w-8 h-8 text-gray-700 group-hover:text-neon-blue mb-3 transition-colors" />
                  <span className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-[0.2em]">Select Screenshot</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) setProofUrl(url);
                      }
                    }}
                  />
                </label>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-blue animate-[progress_1s_ease-in-out_infinite] w-full"></div>
                    </div>
                    <p className="text-[8px] text-neon-blue text-center font-black uppercase tracking-widest">Uploading...</p>
                  </div>
                )}
                
                {proofUrl && (
                  <div className="flex items-center justify-center gap-2 text-neon-green">
                    <Check className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Screenshot Uploaded</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button 
                    disabled={!proofUrl || isUploading}
                    onClick={() => {
                      handleChallengeAction(uploadingFor, 'UPLOAD_PROOF', proofUrl);
                      setProofUrl('');
                    }} 
                    className="flex-1 bg-neon-blue disabled:bg-white/5 disabled:text-gray-700 text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:shadow-none"
                  >
                    Submit Proof
                  </button>
                  <button 
                    onClick={() => { setUploadingFor(null); setProofUrl(''); }} 
                    className="flex-1 bg-white/5 border border-white/10 text-gray-500 py-4 rounded-xl font-orbitron font-bold uppercase tracking-tighter hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Squad Power Update Modal */}
        {showSquadPowerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-neon-blue/30 p-8 rounded-3xl max-w-sm w-full hud-border"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-orbitron font-black text-neon-blue uppercase tracking-tighter">Update Squad Power</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Refine your combat rating</p>
                </div>
                <button onClick={() => setShowSquadPowerModal(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">New Squad Power</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="number" 
                      placeholder="e.g. 4200" 
                      className="w-full bg-black/50 border border-white/10 p-3 pl-10 rounded-xl font-orbitron font-bold text-neon-blue outline-none focus:border-neon-blue transition-colors"
                      value={newSquadPower}
                      onChange={(e) => setNewSquadPower(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUpdateSquadPower} 
                  className="w-full bg-neon-blue text-black py-4 rounded-xl font-orbitron font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                >
                  Update Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
