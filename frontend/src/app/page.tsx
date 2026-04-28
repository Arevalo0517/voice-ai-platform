'use client';

import { useQuery } from '@tanstack/react-query';
import { agentsApi, callsApi, costsApi } from '@/lib/api';
import { Phone, Users, DollarSign, Activity, ArrowRight, Plus } from 'lucide-react';

export default function Dashboard() {
  // Fetch data
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.list().then(res => res.data),
  });

  const { data: callsData } = useQuery({
    queryKey: ['calls'],
    queryFn: () => callsApi.list({ page: 1, page_size: 5 }).then(res => res.data),
  });

  const { data: costs } = useQuery({
    queryKey: ['costs'],
    queryFn: () => costsApi.getSummary().then(res => res.data),
  });

  const activeAgents = agents?.filter(a => a.is_active).length || 0;
  const totalCalls = callsData?.total || 0;
  const recentCalls = callsData?.items || [];
  const totalCost = costs?.total_cost || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Voice AI Platform</h1>
                <p className="text-sm text-gray-500">Manage your AI voice agents</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition">
              <Plus className="h-4 w-4" />
              New Agent
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-3">
            <a href="#" className="text-primary-600 font-medium border-b-2 border-primary-600 pb-3">Dashboard</a>
            <a href="/agents" className="text-gray-600 hover:text-gray-900">Agents</a>
            <a href="/calls" className="text-gray-600 hover:text-gray-900">Calls</a>
            <a href="/transcripts" className="text-gray-600 hover:text-gray-900">Transcripts</a>
            <a href="/costs" className="text-gray-600 hover:text-gray-900">Costs</a>
            <a href="/tools" className="text-gray-600 hover:text-gray-900">Tools</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Agents"
            value={activeAgents}
            icon={<Users className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Total Calls"
            value={totalCalls}
            icon={<Phone className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Total Cost"
            value={`$${totalCost.toFixed(4)}`}
            icon={<DollarSign className="h-5 w-5" />}
            color="yellow"
          />
          <StatCard
            title="Avg Duration"
            value={costs?.avg_duration ? `${Math.round(costs.avg_duration)}s` : '0s'}
            icon={<Activity className="h-5 w-5" />}
            color="purple"
          />
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cost Breakdown Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
            <div className="space-y-4">
              <CostRow label="Twilio" value={costs?.twilio_cost || 0} total={totalCost} />
              <CostRow label="LiveKit" value={costs?.livekit_cost || 0} total={totalCost} />
              <CostRow label="LLM" value={costs?.llm_cost || 0} total={totalCost} />
              <CostRow label="Transcription" value={costs?.transcription_cost || 0} total={totalCost} />
              <CostRow label="Tools" value={costs?.tool_cost || 0} total={totalCost} />
            </div>
          </div>

          {/* Recent Calls Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
              <a href="/calls" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
                View all <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-3">
              {recentCalls.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No calls yet</p>
              ) : (
                recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{call.from_number}</p>
                      <p className="text-sm text-gray-500">to {call.to_number}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={call.status} />
                      <p className="text-sm text-gray-500 mt-1">{call.duration}s</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Agents</h2>
            <a href="/agents" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
              Manage agents <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents?.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No agents created yet</p>
                <button className="mt-3 text-primary-600 hover:text-primary-700 font-medium">
                  Create your first agent
                </button>
              </div>
            ) : (
              agents?.slice(0, 6).map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4 hover:border-primary-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{agent.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{agent.llm_model}</span>
                    {agent.phone_number && (
                      <span className="text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {agent.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Cost Row Component
function CostRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">${value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    ringing: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    no_answer: 'bg-gray-100 text-gray-700',
    busy: 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || styles.failed}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
