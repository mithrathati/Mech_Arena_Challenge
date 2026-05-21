'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [selectedWinners, setSelectedWinners] = useState<Record<string, string>>({});
  const [viewingHistoryUser, setViewingHistoryUser] = useState<any>(null);
  const [userHistoryData, setUserHistoryData] = useState<any[]>([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uRes, cRes, tRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/challenges'),
        fetch('/api/admin/transactions')
      ]);
      
      const uData = await uRes.json();
      const cData = await cRes.json();
      const tData = await tRes.json();
      
      if (!uRes.ok) {
        setError(uData.error || "Access Denied");
        setLoading(false);
        return;
      }

      setUsers(Array.isArray(uData) ? uData : []);
      setChallenges(Array.isArray(cData) ? cData : []);
      setTransactions(Array.isArray(tData) ? tData : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to connect to server");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && session.user?.role === 'ADMIN') {
      fetchAllData();
    }
  }, [session]);

  const handleVerifyChallenge = async (challengeId: string, action: string) => {
    const winnerId = action === 'APPROVE' ? selectedWinners[challengeId] : undefined;
    
    if (action === 'APPROVE' && !winnerId) {
      alert("Please select a winner first!");
      return;
    }

    const res = await fetch('/api/admin/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, action, winnerId }),
    });
    if (res.ok) {
      alert("Processed successfully!");
      fetchAllData();
    }
  };

  const handleVerifyTransaction = async (transactionId: string, action: string) => {
    const res = await fetch('/api/admin/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, action }),
    });
    if (res.ok) {
      alert("Transaction processed!");
      fetchAllData();
    }
  };

  const handleUpdateBalance = async (userId: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, balance: newBalance, type: adjustmentType }),
    });

    if (res.ok) {
      alert("Balance updated successfully!");
      setEditingUser(null);
      fetchAllData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update balance");
    }
  };

  const fetchUserHistory = async (userId: string) => {
    const res = await fetch(`/api/admin/transactions?userId=${userId}`);
    const data = await res.json();
    setUserHistoryData(data);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10 flex items-center justify-center font-bold text-xl uppercase tracking-widest animate-pulse">Loading Admin Data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-blue-500 uppercase tracking-tighter">Command Center</h1>
            {error && <p className="text-red-500 font-bold mt-2">⚠️ Error: {error}</p>}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchAllData} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm font-bold">Refresh Data</button>
            <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-sm font-bold">Logout</button>
            <div className="bg-blue-600 px-4 py-1 rounded text-xs font-bold">ADMIN MODE</div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12">
          {/* Challenge Verification Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-blue-500/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>
                Match Verification
              </h2>
              <p className="text-slate-400 text-sm">Review screenshots and approve payouts.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.length > 0 ? challenges.map((ch: any) => (
                <div key={ch.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Match ID</p>
                      <p className="font-mono text-[10px] text-slate-400">{ch.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Pot Amount</p>
                      <p className="font-mono font-bold text-green-400 text-lg">
                        {ch.challenger.currency} {(ch.amount * 2).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Challenger: {ch.challenger.username}</p>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 relative group">
                        {ch.challengerProof ? (
                          <>
                            <img src={ch.challengerProof} alt="Challenger Proof" className="w-full h-full object-contain" />
                            <a href={ch.challengerProof} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold">
                              View Full
                            </a>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 italic">No proof yet</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Challenged: {ch.challenged.username}</p>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 relative group">
                        {ch.challengedProof ? (
                          <>
                            <img src={ch.challengedProof} alt="Challenged Proof" className="w-full h-full object-contain" />
                            <a href={ch.challengedProof} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold">
                              View Full
                            </a>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 italic">No proof yet</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold text-center">Select Winner to Credit</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSelectedWinners({...selectedWinners, [ch.id]: ch.challengerId})}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          selectedWinners[ch.id] === ch.challengerId 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {ch.challenger.username}
                      </button>
                      <button 
                        onClick={() => setSelectedWinners({...selectedWinners, [ch.id]: ch.challengedId})}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          selectedWinners[ch.id] === ch.challengedId 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {ch.challenged.username}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleVerifyChallenge(ch.id, 'APPROVE')}
                      className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Approve Win
                    </button>
                    <button 
                      onClick={() => handleVerifyChallenge(ch.id, 'REJECT')}
                      className="flex-1 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Reject Proof
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 text-slate-600 italic">
                  No pending match verifications...
                </div>
              )}
            </div>
          </section>

          {/* Pending Transactions Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-green-500/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Pending Transactions
              </h2>
              <p className="text-slate-400 text-sm">Approve deposits and verify withdrawals.</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Details</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {transactions.length > 0 ? transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <p className="font-bold">{t.user?.username}</p>
                          <p className="text-xs text-slate-500">{t.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            t.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-400">
                          {t.currency} {t.amount.toFixed(2)}
                          {t.type === 'WITHDRAWAL' && t.netAmount && (
                            <div className="text-[10px] text-green-500 mt-1">
                              To Pay: {t.currency} {t.netAmount.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs">
                          {t.type === 'DEPOSIT' ? (
                            <>
                              {t.transactionId && <p>UTR: {t.transactionId}</p>}
                              {t.proofUrl && <a href={t.proofUrl} target="_blank" className="text-blue-500 hover:underline">View Screenshot</a>}
                            </>
                          ) : (
                            <div className="bg-slate-800/50 p-2 rounded border border-slate-700 space-y-1">
                              <p className="font-bold text-blue-400">Bank Transfer Info:</p>
                              <p><span className="text-slate-500">Name:</span> {t.accountHolder}</p>
                              <p><span className="text-slate-500">Bank:</span> {t.bankName}</p>
                              <p><span className="text-slate-500">A/C:</span> {t.accountNumber}</p>
                              <p><span className="text-slate-500">IFSC:</span> {t.ifscCode}</p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleVerifyTransaction(t.id, 'APPROVE')} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-xs font-bold">Approve</button>
                          <button onClick={() => handleVerifyTransaction(t.id, 'REJECT')} className="bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-600 italic">No pending transactions...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* User Management */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold">User Management</h2>
              <p className="text-slate-400 text-sm">Manage accounts, balances, and permissions.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="p-4">Pilot / Mech ID</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Currency</th>
                    <th className="p-4">Balance</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Array.isArray(users) && users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.mechArenaId}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-0.5 rounded ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono">{user.currency}</td>
                      <td className="p-4 font-bold text-green-400">
                        {user.balance.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { 
                              setViewingHistoryUser(user); 
                              fetchUserHistory(user.id);
                            }}
                            className="bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1 rounded text-sm font-medium transition-all"
                          >
                            History
                          </button>
                          <button 
                            onClick={() => { setEditingUser(user); setNewBalance(user.balance.toString()); setAdjustmentType('DEPOSIT'); }}
                            className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-sm font-medium transition-all"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Modal for Viewing History */}
        {viewingHistoryUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-400">{viewingHistoryUser.username}'s History</h3>
                  <p className="text-slate-500 text-xs">Full transaction and credit history.</p>
                </div>
                <button onClick={() => setViewingHistoryUser(null)} className="text-slate-500 hover:text-white text-xl">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/50 text-slate-500 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Flow</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {userHistoryData.length > 0 ? userHistoryData.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <span className={`font-bold ${
                            t.type === 'DEPOSIT' || t.type === 'WIN_CREDIT' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          {t.currency} {t.amount.toFixed(2)}
                          {t.type === 'WITHDRAWAL' && t.netAmount && (
                            <div className="text-[9px] text-green-500">
                              (Net: {t.netAmount.toFixed(2)})
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[10px]">
                          {t.previousBalance !== null && t.newBalance !== null ? (
                            <div className="flex flex-col">
                              <span className="text-slate-500">{t.previousBalance.toFixed(2)}</span>
                              <span className="text-blue-400">→ {t.newBalance.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">No snapshot</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                            t.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                            t.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-600 italic">No history found...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing Balance */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Edit {editingUser.username}</h3>
              <p className="text-slate-400 text-sm mb-6">Enter the new balance for this user.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Current Balance</label>
                  <div className="text-2xl font-mono">${editingUser.balance.toFixed(2)}</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Adjustment Type</label>
                    <select 
                      value={adjustmentType}
                      onChange={(e: any) => setAdjustmentType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="DEPOSIT">Deposit (+)</option>
                      <option value="WITHDRAWAL">Withdraw (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Amount ({editingUser.currency})</label>
                    <input 
                      type="number" 
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => handleUpdateBalance(editingUser.id)}
                    className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}