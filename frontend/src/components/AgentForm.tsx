'use client';

import { useState, useEffect } from 'react';
import { LLM_PROVIDERS, VOICE_OPTIONS, type Agent } from '@/lib/api';
import { X, ChevronDown, ChevronUp, Save, Plus, Trash2 } from 'lucide-react';

interface AgentFormProps {
  agent?: Partial<Agent>;
  onSubmit: (data: Partial<Agent>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function AgentForm({ agent, onSubmit, onCancel, isEditing }: AgentFormProps) {
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: agent?.name || '',
    description: agent?.description || '',
    system_prompt: agent?.system_prompt || '',
    llm_provider: agent?.llm_provider || 'openai',
    llm_model: agent?.llm_model || 'gpt-4-turbo',
    temperature: agent?.temperature ?? 0.8,
    max_output_tokens: agent?.max_output_tokens || undefined,
    voice: agent?.voice || 'alloy',
    turn_detection: agent?.turn_detection || 'semantic',
    interrupt_min_words: agent?.interrupt_min_words ?? 0,
    min_endpointing_delay: agent?.min_endpointing_delay || '0.3s',
    max_endpointing_delay: agent?.max_endpointing_delay || '3s',
    vad_enabled: agent?.vad_enabled ?? true,
    vad_model: agent?.vad_model || 'silero',
    idle_timeout: agent?.idle_timeout || '5m',
    max_duration: agent?.max_duration || '30m',
    waiting_for_user_timeout: agent?.waiting_for_user_timeout || '30s',
    audio_sample_rate: agent?.audio_sample_rate ?? 16000,
    audio_channels: agent?.audio_channels ?? 1,
    tools: agent?.tools || [],
    webhooks: agent?.webhooks || [],
    phone_number: agent?.phone_number || '',
    is_active: agent?.is_active ?? true,
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['llm', 'voice']));
  const [newTool, setNewTool] = useState({ name: '', description: '' });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (field: keyof Agent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTool = () => {
    if (newTool.name) {
      updateField('tools', [...(formData.tools || []), { name: newTool.name, description: newTool.description }]);
      setNewTool({ name: '', description: '' });
    }
  };

  const removeTool = (index: number) => {
    updateField('tools', (formData.tools || []).filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentProvider = formData.llm_provider || 'openai';
  const availableModels = LLM_PROVIDERS[currentProvider as keyof typeof LLM_PROVIDERS]?.models || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Agent' : 'Create New Agent'}</h2>
          <button onClick={onCancel} className="p-2 text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1">Name *</label>
              <input
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Phone Number (E.164)</label>
              <input
                value={formData.phone_number}
                onChange={e => updateField('phone_number', e.target.value)}
                placeholder="+19893345446"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Description</label>
            <input
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">System Prompt *</label>
            <textarea
              value={formData.system_prompt}
              onChange={e => updateField('system_prompt', e.target.value)}
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono"
            />
          </div>

          {/* LLM Configuration */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('llm')}
              className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <span className="font-semibold">🧠 LLM Configuration</span>
              {expandedSections.has('llm') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('llm') && (
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Provider</label>
                    <select
                      value={formData.llm_provider}
                      onChange={e => updateField('llm_provider', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Model</label>
                    <select
                      value={formData.llm_model}
                      onChange={e => updateField('llm_model', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Temperature: {formData.temperature}</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={e => updateField('temperature', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Max Output Tokens</label>
                    <input
                      type="number"
                      value={formData.max_output_tokens || ''}
                      onChange={e => updateField('max_output_tokens', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="No limit"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Configuration */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('voice')}
              className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <span className="font-semibold">🎤 Voice Configuration</span>
              {expandedSections.has('voice') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('voice') && (
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Voice</label>
                  <select
                    value={formData.voice}
                    onChange={e => updateField('voice', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    {VOICE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Turn Detection */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('turn')}
              className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <span className="font-semibold">🔊 Turn Detection</span>
              {expandedSections.has('turn') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('turn') && (
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Mode</label>
                    <select
                      value={formData.turn_detection}
                      onChange={e => updateField('turn_detection', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="semantic">Semantic (AI-based)</option>
                      <option value="timed">Timed</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Interrupt Min Words</label>
                    <input
                      type="number"
                      value={formData.interrupt_min_words}
                      onChange={e => updateField('interrupt_min_words', parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Min Endpointing Delay</label>
                    <input
                      value={formData.min_endpointing_delay}
                      onChange={e => updateField('min_endpointing_delay', e.target.value)}
                      placeholder="0.3s"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Max Endpointing Delay</label>
                    <input
                      value={formData.max_endpointing_delay}
                      onChange={e => updateField('max_endpointing_delay', e.target.value)}
                      placeholder="3s"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VAD Settings */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('vad')}
              className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <span className="font-semibold">🎙️ Voice Activity Detection</span>
              {expandedSections.has('vad') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('vad') && (
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="vad_enabled"
                    checked={formData.vad_enabled}
                    onChange={e => updateField('vad_enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="vad_enabled" className="text-sm text-white">Enable VAD</label>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">VAD Model</label>
                  <select
                    value={formData.vad_model}
                    onChange={e => updateField('vad_model', e.target.value)}
                    disabled={!formData.vad_enabled}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                  >
                    <option value="silero">Silero (Recommended)</option>
                    <option value="onnx">ONNX</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Timeouts */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('timeouts')}
              className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <span className="font-semibold">⏱️ Timeouts</span>
              {expandedSections.has('timeouts') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('timeouts') && (
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Idle Timeout</label>
                    <input
                      value={formData.idle_timeout}
                      onChange={e => updateField('idle_timeout', e.target.value)}
                      placeholder="5m"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Max Duration</label>
                    <input
                      value={formData.max_duration}
                      onChange={e => updateField('max_duration', e.target.value)}
                      placeholder="30m"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Wait for User</label>
                    <input
                      value={formData.waiting_for_user_timeout}
                      onChange={e => updateField('waiting_for_user_timeout', e.target.value)}
                      placeholder="30s"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tools */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('tools')}
              className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <span className="font-semibold">🔧 Tools ({formData.tools?.length || 0})</span>
              {expandedSections.has('tools') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('tools') && (
              <div className="p-3 space-y-3">
                {(formData.tools || []).map((tool: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <div className="flex-1">
                      <div className="text-sm text-white">{tool.name}</div>
                      {tool.description && <div className="text-xs text-white/40">{tool.description}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={newTool.name}
                    onChange={e => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tool name"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <input
                    value={newTool.description}
                    onChange={e => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTool}
                    className="px-3 py-2 bg-cyan-glow/20 text-cyan-glow rounded-lg hover:bg-cyan-glow/30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => updateField('is_active', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm text-white">Agent is active</label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-cyan-glow text-black font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
