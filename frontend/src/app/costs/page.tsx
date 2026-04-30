'use client';

import { useQuery } from '@tanstack/react-query';
import { costsApi } from '@/lib/api';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function CostsPage() {
  const { data: costs, isLoading } = useQuery({
    queryKey: ['costs'],
    queryFn: () => costsApi.getSummary().then(res => res.data),
  });

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
            <Activity className="h-5 w-5" />
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/agents">
            <DollarSign className="h-5 w-5" />
            Agents
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/calls">
            <Activity className="h-5 w-5" />
            Calls
          </a>
          <a className="nav-active flex items-center gap-3 px-4 py-3 text-sm" href="/costs">
            <DollarSign className="h-5 w-5" />
            Costs
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen flex flex-col">
        <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50 bg-surface-lowest/40 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-white/40">
              Cost Analytics
            </span>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Main Cost Card */}
          <div className="glass rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-widest">
                  Live Tracking
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Total Monthly Cost</div>
              <div className="text-6xl font-bold text-white text-glow">
                ${costs?.total_cost?.toFixed(2) || '0.00'}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <TrendingDown className="h-4 w-4" />
                  <span>-4.2% vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="p-2 rounded-lg bg-white/5 text-cyan-glow w-fit">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">LLM Cost</div>
                <div className="text-2xl font-mono text-white mt-1">${costs?.llm_cost?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full">
                <div className="bg-cyan-glow h-full w-[45%] rounded-full"></div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="p-2 rounded-lg bg-white/5 text-cyan-glow w-fit">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Twilio Cost</div>
                <div className="text-2xl font-mono text-white mt-1">${costs?.twilio_cost?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full">
                <div className="bg-purple-500 h-full w-[30%] rounded-full"></div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="p-2 rounded-lg bg-white/5 text-cyan-glow w-fit">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Transcription</div>
                <div className="text-2xl font-mono text-white mt-1">${costs?.transcription_cost?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full">
                <div className="bg-yellow-500 h-full w-[15%] rounded-full"></div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="p-2 rounded-lg bg-white/5 text-cyan-glow w-fit">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">LiveKit</div>
                <div className="text-2xl font-mono text-white mt-1">${costs?.livekit_cost?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full">
                <div className="bg-green-500 h-full w-[10%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Total Calls</div>
              <div className="text-3xl font-mono text-white mt-1">{costs?.total_calls || 0}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Total Duration</div>
              <div className="text-3xl font-mono text-white mt-1">{Math.round((costs?.total_duration || 0) / 60)}m</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Avg Cost/Call</div>
              <div className="text-3xl font-mono text-cyan-glow mt-1">${costs?.avg_cost_per_call?.toFixed(4) || '0.00'}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Avg Duration</div>
              <div className="text-3xl font-mono text-white mt-1">{Math.round(costs?.avg_duration || 0)}s</div>
            </div>
          </div>

          {/* Tool Costs */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Tool Costs</h3>
            <div className="text-center text-white/40 py-8">
              <div className="text-4xl font-mono text-white/20">${costs?.tool_cost?.toFixed(2) || '0.00'}</div>
              <div className="text-xs uppercase tracking-wider mt-2">Total Tool Usage</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
