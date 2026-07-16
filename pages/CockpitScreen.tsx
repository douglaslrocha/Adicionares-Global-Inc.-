
import React, { useState } from 'react';
import { useGlobalContext, BlockType, CinemaBlock, HolotecaCard, Participant } from '../context/AdicionaresContext';

interface CockpitScreenProps {
  onNavigate?: (screen: any) => void;
}

const CockpitScreen: React.FC<CockpitScreenProps> = ({ onNavigate }) => {
  const {
    cinemaBlocks, setCinemaBlocks,
    holotecaCards, setHolotecaCards,
    participants, setParticipants,
    addCinemaBlock, updateCinemaBlock, toggleCinemaBlockVisibility, removeCinemaBlock,
    addHolotecaCard, updateHolotecaCard, deleteHolotecaCard
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cinema' | 'holoteca' | 'participants' | 'sales'>('cinema');

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // --- Handlers: Cinema (Re-implemented with Context) ---
  const onDragStart = (index: number) => setDraggedIndex(index);
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newBlocks = [...cinemaBlocks];
    const draggedItem = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setCinemaBlocks(newBlocks);
  };

  // --- Handlers: Holoteca ---
  const updateCardField = (id: string, field: keyof HolotecaCard, value: any) => {
    updateHolotecaCard(id, { [field]: value });
  };

  const deleteCard = (id: string) => {
    if (editingCardId === id) setEditingCardId(null);
    deleteHolotecaCard(id);
  };

  const addNewCard = () => {
    addHolotecaCard();
    // Logic to select the newly created card would require the ID returned or accessing the last item.
    // For simplicity, we just add it. user can click to edit.
  };

  // --- Handlers: Egrégora ---
  const updateParticipantStatus = (id: string, status: Participant['status']) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const updateParticipantRole = (id: string, role: Participant['role']) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, role } : p));
  };

  const currentEditingCard = holotecaCards.find(c => c.id === editingCardId) || null;

  return (
    <div className="min-h-screen bg-[#020202] text-gray-100 font-body flex overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col shrink-0 relative z-[200]">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-glow-blue">
              <span className="material-symbols-outlined text-white text-2xl">terminal</span>
            </div>
            <h1 className="font-display font-black text-sm uppercase tracking-[0.2em]">Cockpit OS</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: 'dashboard', label: 'Painel Mestre' },
            { id: 'cinema', icon: 'movie_edit', label: 'Cinema Architect' },
            { id: 'holoteca', icon: 'layers', label: 'Holoteca Architect' },
            { id: 'participants', icon: 'group', label: 'Egrégora' },
            { id: 'sales', icon: 'payments', label: 'Monetização' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-glow-blue' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
              <span className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'filled' : ''}`}>{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={() => onNavigate && onNavigate('feed')} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all">
            <span className="material-symbols-outlined">power_settings_new</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050505] p-8 lg:p-12 relative flex flex-col">
        <header className="flex justify-between items-center mb-12 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tighter italic">
            {activeTab === 'dashboard' && 'Inteligência de Campo'}
            {activeTab === 'cinema' && 'Cinema Architect'}
            {activeTab === 'holoteca' && 'Holoteca Architect'}
            {activeTab === 'participants' && 'Gestão de Egrégora'}
            {activeTab === 'sales' && 'Engenharia de Vendas'}
          </h2>
          <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-xl flex items-center gap-3">
            <span className="text-[10px] font-black uppercase text-blue-500 shadow-glow-blue">Root OS</span>
          </div>
        </header>

        {/* --- ABA CINEMA ARCHITECT (REALISMO 100%) --- */}
        {activeTab === 'cinema' && (
          <div className="flex-1 flex gap-8 animate-fade-in-up relative z-10 overflow-hidden h-full">
            {/* EDITOR DE ESTRUTURA */}
            <div className="flex-1 bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-glass flex flex-col overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Estrutura Verbetográfica</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Drag & Drop Ativo</p>
                </div>
                <select
                  onChange={(e) => addCinemaBlock(e.target.value as BlockType)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow-blue appearance-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>+ ADICIONAR SEÇÃO</option>
                  <option value="header">Título & ID</option>
                  <option value="definition">Definologia</option>
                  <option value="video">Vídeo Exposição</option>
                  <option value="reflection_axes">Vetores de Síntese</option>
                  <option value="axiom">Axioma Universal</option>
                  <option value="confrontology">Confrontologia</option>
                  <option value="detalhologia">Detalhologia</option>
                  <option value="fatulogia_dual">Fatuologia Dual</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
                {cinemaBlocks.map((block, idx) => (
                  <div key={block.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={(e) => onDragOver(e, idx)} className={`group relative bg-white/2 border rounded-[2.5rem] p-8 transition-all flex items-start gap-8 ${draggedIndex === idx ? 'opacity-30 scale-95' : 'hover:bg-white/[0.04]'} ${!block.isVisible ? 'grayscale opacity-30' : ''}`} style={{ borderColor: draggedIndex === idx ? '#3b82f6' : 'rgba(255,255,255,0.05)' }}>
                    <div className="cursor-grab p-2 -ml-4 text-gray-700 group-hover:text-gray-400"><span className="material-symbols-outlined">drag_indicator</span></div>

                    <div className="flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full">{block.type}</span>
                          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{block.title}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleCinemaBlockVisibility(block.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${block.isVisible ? 'text-blue-500 bg-blue-500/10' : 'text-gray-600 bg-white/5'}`}><span className="material-symbols-outlined">{block.isVisible ? 'visibility' : 'visibility_off'}</span></button>
                          <button onClick={() => removeCinemaBlock(block.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {block.type === 'header' && (
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={(block.content as { title: string }).title} onChange={(e) => updateCinemaBlock(block.id, { ...(block.content as { title: string, id: string }), title: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none" placeholder="Título" />
                            <input type="text" value={(block.content as { id: string }).id} onChange={(e) => updateCinemaBlock(block.id, { ...(block.content as { title: string, id: string }), id: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-blue-400 focus:outline-none" placeholder="ID (VER-000)" />
                          </div>
                        )}
                        {(block.type === 'definition' || block.type === 'axiom') && (
                          <textarea value={block.content as string} onChange={(e) => updateCinemaBlock(block.id, e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium text-gray-300 focus:outline-none resize-none" />
                        )}
                        {block.type === 'video' && (
                          <div className="grid grid-cols-3 gap-4">
                            <input type="text" value={(block.content as { url: string }).url} onChange={(e) => updateCinemaBlock(block.id, { ...(block.content as { url: string, label: string }), url: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none" placeholder="YouTube ID" />
                            <input type="text" value={(block.content as { label: string }).label} onChange={(e) => updateCinemaBlock(block.id, { ...(block.content as { url: string, label: string }), label: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-blue-500 uppercase focus:outline-none" placeholder="LABEL" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MIRROR PREVIEW FIEL */}
            <div className="w-[500px] bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-glass flex flex-col overflow-hidden relative">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-blue-600/[0.03]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500 animate-spin-slow">autorenew</span>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Mirroring</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-[#fcfcfc] dark:bg-[#050505] transition-all">
                <div className="space-y-16 transform scale-[0.8] origin-top w-[550px] mx-auto text-gray-900 dark:text-white font-body">
                  {cinemaBlocks.filter(b => b.isVisible).map((block) => (
                    <div key={`mirror-${block.id}`} className="animate-fade-in-up">
                      {block.type === 'header' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4"><span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full">VERBETE_NÚCLEO</span></div>
                          <h2 className="text-6xl font-display font-black leading-[0.9] uppercase italic tracking-tighter dark:text-white">{block.content.title}</h2>
                        </div>
                      )}
                      {block.type === 'definition' && (
                        <div className="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                          <p className="text-2xl font-medium text-gray-600 dark:text-gray-300 italic leading-snug mt-4">"{block.content}"</p>
                        </div>
                      )}
                      {block.type === 'axiom' && (
                        <div className="p-10 bg-onyx text-white dark:bg-white dark:text-onyx rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
                          <p className="text-3xl font-black leading-snug italic tracking-tighter">"{block.content}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 border-t border-white/5 bg-blue-600/5">
                <button className="w-full py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.4em] rounded-[1.5rem] shadow-glow-blue hover:scale-[1.02] active:scale-95 transition-all">PUBLICAR VERBETE</button>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA HOLOTECA ARCHITECT (FINALIZADA) --- */}
        {activeTab === 'holoteca' && (
          <div className="animate-fade-in-up space-y-12 relative z-10 flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 flex gap-8 overflow-hidden">
              {/* LISTA E EDITOR */}
              <div className="flex-1 bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-glass flex flex-col overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Vitrine de Estudo</h3>
                  <button onClick={addNewCard} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow-blue flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Criar Registro
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                  {holotecaCards.map((card) => (
                    <div key={card.id} className={`group relative bg-white/2 border rounded-[2rem] p-5 transition-all flex items-center gap-6 cursor-pointer ${editingCardId === card.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`} onClick={() => setEditingCardId(card.id)}>
                      <img src={card.thumbnail} className="w-16 h-16 rounded-2xl object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-bold text-gray-200">{card.title}</h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${card.status === 'Publicado' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{card.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                          <span>{card.specialty}</span>
                          <span>•</span>
                          <span className="text-blue-500">{card.level}</span>
                          <span>•</span>
                          <span>{card.duration}</span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* FORMULÁRIO DE EDIÇÃO INLINE */}
                {editingCardId && currentEditingCard && (
                  <div className="p-8 border-t border-white/5 bg-white/[0.01] animate-fade-in-up">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Título do Card</label>
                        <input type="text" value={currentEditingCard.title} onChange={(e) => updateCardField(currentEditingCard.id, 'title', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:border-blue-500/50 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Especialidade</label>
                        <input type="text" value={currentEditingCard.specialty} onChange={(e) => updateCardField(currentEditingCard.id, 'specialty', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-blue-500 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Nível</label>
                        <select value={currentEditingCard.level} onChange={(e) => updateCardField(currentEditingCard.id, 'level', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none appearance-none">
                          <option value="Platina">Platina</option>
                          <option value="Prata">Prata</option>
                          <option value="Aço">Aço</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Duração</label>
                        <input type="text" value={currentEditingCard.duration} onChange={(e) => updateCardField(currentEditingCard.id, 'duration', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none" />
                      </div>

                      {/* --- NEW FIELDS --- */}
                      <div className="space-y-2 col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Subtítulo</label>
                        <input type="text" value={currentEditingCard.subtitle || ''} onChange={(e) => updateCardField(currentEditingCard.id, 'subtitle', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">YouTube Video ID</label>
                        <input type="text" value={currentEditingCard.videoUrl || ''} onChange={(e) => updateCardField(currentEditingCard.id, 'videoUrl', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-gray-400 focus:outline-none" placeholder="Ex: j0Xk73QySuc" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Thumbnail URL</label>
                        <input type="text" value={currentEditingCard.thumbnail} onChange={(e) => updateCardField(currentEditingCard.id, 'thumbnail', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-gray-400 focus:outline-none" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Tags (Separadas por vírgula)</label>
                        <input
                          type="text"
                          value={currentEditingCard.tags ? currentEditingCard.tags.join(', ') : ''}
                          onChange={(e) => updateCardField(currentEditingCard.id, 'tags', e.target.value.split(',').map(s => s.trim()))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-blue-500 focus:outline-none"
                          placeholder="Tag1, Tag2, Tag3"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Conteúdo Rico (HTML)</label>
                        <textarea
                          value={currentEditingCard.richText || ''}
                          onChange={(e) => updateCardField(currentEditingCard.id, 'richText', e.target.value)}
                          rows={6}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-gray-300 focus:outline-none resize-none"
                          placeholder="<p>Seu conteúdo aqui...</p>"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PREVIEW HOLOTECA */}
              <div className="w-[420px] bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-glass flex flex-col overflow-hidden relative">
                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Vitrine Preview</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-12 bg-black/40">
                  {currentEditingCard ? (
                    <div className="w-full max-w-[280px] aspect-[3/4] bg-black rounded-[2.5rem] border-2 shadow-2xl overflow-hidden flex flex-col transition-all duration-700" style={{ borderColor: currentEditingCard.level === 'Platina' ? '#E5E4E2' : currentEditingCard.level === 'Prata' ? '#C0C0C0' : '#919191' }}>
                      <div className="h-1/2 relative overflow-hidden">
                        <img src={currentEditingCard.thumbnail} className="w-full h-full object-cover opacity-60" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute top-4 left-4 text-black font-black text-[8px] px-3 py-1 rounded-full uppercase tracking-widest" style={{ backgroundColor: currentEditingCard.level === 'Platina' ? '#E5E4E2' : currentEditingCard.level === 'Prata' ? '#C0C0C0' : '#919191' }}>
                          {currentEditingCard.specialty}
                        </div>
                      </div>
                      <div className="p-8 flex flex-col justify-between flex-1">
                        <div className="space-y-4">
                          <h4 className="text-xl font-display font-black text-white leading-tight uppercase italic">{currentEditingCard.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {currentEditingCard.duration}
                          </div>
                        </div>
                        <button className="w-full py-4 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white mt-8 hover:bg-white/5 transition-all">Analisar Registro</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest">Selecione um card</p></div>
                  )}
                </div>
                <div className="p-8 border-t border-white/5 bg-blue-600/5">
                  <button className="w-full py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-glow-blue">Sincronizar Holoteca</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA EGRÉGORA (FINALIZADA) --- */}
        {activeTab === 'participants' && (
          <div className="animate-fade-in-up space-y-12 relative z-10 flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-glass flex flex-col overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Membros da Egrégora</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Controle de Acessos</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Participante</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Cargo</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
                            <div>
                              <p className="font-bold text-sm text-gray-100">{p.name}</p>
                              <p className="text-[10px] text-gray-500">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <select value={p.role} onChange={(e) => updateParticipantRole(p.id, e.target.value as any)} className="bg-transparent border-none p-0 text-[10px] text-blue-500 font-black uppercase focus:outline-none">
                            <option value="Membro">Membro</option>
                            <option value="Moderador">Moderador</option>
                            <option value="Epicon">Epicon</option>
                          </select>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.status === 'Ativo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{p.status}</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateParticipantStatus(p.id, p.status === 'Ativo' ? 'Suspenso' : 'Ativo')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">lock</span></button>
                            <button onClick={() => updateParticipantStatus(p.id, 'Banido')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">gavel</span></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA SALES (RESTAURAÇÃO) --- */}
        {activeTab === 'sales' && (
          <div className="animate-fade-in-up space-y-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-[#0A0A0A] p-10 rounded-[3.5rem] border border-white/5 shadow-glass">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-10">Faturamento Mensal</h3>
                <div className="h-72 flex items-end justify-between px-6 pb-8 group/chart">
                  {[40, 65, 45, 95, 70, 100, 85, 90, 60, 110, 95, 120].map((h, i) => (
                    <div key={i} className="w-8 bg-blue-600/10 rounded-t-2xl relative group transition-all hover:bg-blue-600" style={{ height: `${h / 1.5}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .shadow-glow-blue { box-shadow: 0 10px 40px -10px rgba(37, 99, 235, 0.7); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .filled { font-variation-settings: 'FILL' 1; }
        .shadow-glass { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.9); }
        .animate-spin-slow { animation: spin 30s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CockpitScreen;
