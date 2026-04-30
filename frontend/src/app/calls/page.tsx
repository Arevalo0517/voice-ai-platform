'use client';

import { useQuery } from '@tanstack/react-query';
import { callsApi } from '@/lib/api';
import { Phone, Users, Activity, Search } from 'lucide-react';

export default function CallsPage() {
  const { data: callsData, isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: () => callsApi.list({ page: 1, page_size: 50 }).then(res => res.data),
  });

  const calls = callsData?.items || [];
  const total = callsData?.total || 0;

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400',
    ringing: 'bg-yellow-500/10 text-yellow-400',
    in_progress: 'bg-cyan-glow/10 text-cyan-glow',
    failed: 'bg-red-500/10 text-red-400',
    no_answer: 'bg-gray-500/10 text-gray-400',
    busy: 'bg-orange-500/10 text-orange-400',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-surface-lowest text-on-surface font-body">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-lowest/80 backdrop-blur-[20px] border-r border-white/10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-60 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter text-cyan-glow drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]">
            VoiceAI
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
            Orchestrator v2.0
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-8">
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/">
            <Phone className="h-5 w-5" />
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/agents">
            <Users className="h-5 w-5" />
            Agents
          </a>
          <a className="nav-active flex items-center gap-3 px-4 py-3 text-sm" href="/calls">
            <Phone className="h-5 w-5" />
            Calls
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/costs">
            <Activity className="h-5 w-5" />
            Costs
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen flex flex-col">
        <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50 bg-surface-lowest/40 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-white/40">
              Call History
            </span>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Total Calls</div>
              <div className="text-3xl font-mono text-white text-glow mt-1">{total}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Completed</div>
              <div className="text-3xl font-mono text-green-400 mt-1">{calls.filter(c => c.status === 'completed').length}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Failed</div>
              <div className="text-3xl font-mono text-red-400 mt-1">{calls.filter(c => c.status === 'failed').length}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Avg Duration</div>
              <div className="text-3xl font-mono text-cyan-glow mt-1">
                {calls.length > 0 ? formatDuration(Math.round(calls.reduce((acc, c) => acc + c.duration, 0) / calls.length)) : '0:00'}
              </div>
            </div>
          </div>

          {/* Calls Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b border-white/5">
              <h3 className="text-xl font-semibold text-white">All Calls</h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-white/40">Loading...</div>
            ) : calls.length === 0 ? (
              <div className="p-12 text-center text-white/40">
                No calls yet. Start a call to see activity here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="px-8 py-4 font-semibold">From</th>
                      <th className="px-8 py-4 font-semibold">To</th>
                      <th className="px-8 py-4 font-semibold">Direction</th>
                      <th className="px-8 py-4 font-semibold">Duration</th>
                      <th className="px-8 py-4 font-semibold">Status</th>
                      <th className="px-8 py-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {calls.map((call) => (
                      <tr key={call.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5 font-mono text-white">{call.from_number}</td>
                        <td className="px-8 py-5 font-mono text-white/60">{call.to_number}</td>
                        <td className="px-8 py-5">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            call.direction === 'inbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {call.direction}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-mono text-white/60">{formatDuration(call.duration)}</td>
                        <td className="px-8 py-5">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${statusColors[call.status]}`}>
                            {call.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-white/40 text-xs">
                          {new Date(call.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
