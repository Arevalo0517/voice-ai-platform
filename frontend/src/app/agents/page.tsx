'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi, type Agent } from '@/lib/api';
import { Phone, Users, Settings, Plus, Pencil, Trash2, Search, Eye, X } from 'lucide-react';
import { useState } from 'react';
import AgentForm from '@/components/AgentForm';

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.list().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Agent>) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) => agentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setEditingAgent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agentsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });

  const filteredAgents = agents?.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get('phone_number') as string;
    createMutation.mutate({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      system_prompt: formData.get('system_prompt') as string,
      voice: formData.get('voice') as string || 'alloy',
      llm_model: formData.get('llm_model') as string || 'gpt-4-turbo',
      phone_number: phoneNumber || undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAgent) return;
    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get('phone_number') as string;
    updateMutation.mutate({
      id: editingAgent.id,
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        system_prompt: formData.get('system_prompt') as string,
        voice: formData.get('voice') as string || 'alloy',
        llm_model: formData.get('llm_model') as string || 'gpt-4-turbo',
        phone_number: phoneNumber || undefined,
      },
    });
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

        <div className="px-6 mb-8">
          <button onClick={() => setShowForm(true)} className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.4)] hover:scale-[0.98] transition-transform">
            <Plus className="h-4 w-4" />
            New Agent
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/">
            <Phone className="h-5 w-5" />
            Dashboard
          </a>
          <a className="nav-active flex items-center gap-3 px-4 py-3 text-sm" href="/agents">
            <Users className="h-5 w-5" />
            Agents
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/calls">
            <Phone className="h-5 w-5" />
            Calls
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 transition-all text-sm hover:bg-white/5" href="/costs">
            <Settings className="h-5 w-5" />
            Costs
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen flex flex-col">
        <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50 bg-surface-lowest/40 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-white/40">
              Agents
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                className="bg-white/5 border-none rounded-full pl-10 pr-4 py-1.5 text-xs text-white placeholder-white/20 focus:ring-1 focus:ring-cyan-glow w-64 transition-all"
                placeholder="Search agents..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Total Agents</div>
              <div className="text-3xl font-mono text-white text-glow mt-1">{agents?.length || 0}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Active</div>
              <div className="text-3xl font-mono text-green-400 text-glow mt-1">{agents?.filter(a => a.is_active).length || 0}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-white/40 text-xs uppercase tracking-wider">Inactive</div>
              <div className="text-3xl font-mono text-white/60 mt-1">{agents?.filter(a => !a.is_active).length || 0}</div>
            </div>
          </div>

          {/* Agents List */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b border-white/5">
              <h3 className="text-xl font-semibold text-white">All Agents</h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-white/40">Loading...</div>
            ) : filteredAgents.length === 0 ? (
              <div className="p-12 text-center text-white/40">
                {searchTerm ? 'No agents match your search' : 'No agents yet. Create your first agent!'}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="px-8 py-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-glow/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-cyan-glow" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{agent.name}</div>
                        <div className="text-xs text-white/40 mt-1">
                          {agent.description || 'No description'}
                        </div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] text-white/30">Voice: {agent.voice}</span>
                          <span className="text-[10px] text-white/30">Model: {agent.llm_model}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        agent.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button 
                        onClick={() => setViewingAgent(agent)}
                        className="p-2 text-white/20 hover:text-cyan-glow transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingAgent(agent)}
                        className="p-2 text-white/20 hover:text-yellow-400 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(agent.id)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Agent Modal */}
      {showForm && (
        <AgentForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isEditing={false}
        />
      )}

      {/* View Agent Modal */}
      {viewingAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-lg border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Agent Details</h2>
              <button onClick={() => setViewingAgent(null)} className="p-2 text-white/40 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Name</label>
                <div className="text-white">{viewingAgent.name}</div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="text-white font-mono">{viewingAgent.phone_number || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  viewingAgent.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40'
                }`}>
                  {viewingAgent.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Description</label>
                <div className="text-white/60 text-sm">{viewingAgent.description || 'No description'}</div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Voice</label>
                <div className="text-white">{viewingAgent.voice}</div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">LLM Model</label>
                <div className="text-white">{viewingAgent.llm_model}</div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">System Prompt</label>
                <div className="bg-white/5 rounded-xl p-4 text-sm text-white/60 max-h-40 overflow-y-auto">
                  {viewingAgent.system_prompt}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <AgentForm
          agent={editingAgent}
          onSubmit={(data) => updateMutation.mutate({ id: editingAgent.id, data })}
          onCancel={() => setEditingAgent(null)}
          isEditing={true}
        />
      )}
    </div>
  );
}
