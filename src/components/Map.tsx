import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  Map as MapIcon, 
  Star,
  Info,
  Plus,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useGlobal, KnowledgeNode } from '../context/GlobalContext';

export default function Map() {
  const { knowledgeMap, addKnowledgeNode, deleteKnowledgeNode } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState<{label: string, type: KnowledgeNode['type'], parentId?: string}>({
    label: '',
    type: 'subject'
  });

  const subjects = knowledgeMap.filter(n => n.type === 'subject');

  const handleAddNode = () => {
    if (newNode.label.trim()) {
      addKnowledgeNode(newNode);
      setNewNode({ label: '', type: 'subject' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">KNOWLEDGE MAP</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Charting your path to cognitive supremacy</p>
        </div>
        <button 
          onClick={() => {
            setNewNode({ label: '', type: 'subject' });
            setShowAddModal(true);
          }}
          className="bg-cyan-400 text-black px-6 py-2 rounded-xl border-4 border-black font-lexend font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Initialize Subject
        </button>
      </header>

      <div className="space-y-12">
        {subjects.length === 0 ? (
          <div className="py-20 text-center glass-panel border-dashed border-slate-800 opacity-30">
            <MapIcon size={80} className="mx-auto text-slate-500 mb-6" />
            <h3 className="font-bangers text-3xl uppercase tracking-widest text-slate-500">Cartography Module Offline</h3>
            <p className="text-[10px] font-black uppercase mt-2">Initialize your first subject to begin mapping</p>
          </div>
        ) : (
          subjects.map((subject) => {
            const topics = knowledgeMap.filter(n => n.parentId === subject.id);
            return (
              <section key={subject.id} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="group relative">
                    <h3 className="font-lexend font-black uppercase text-2xl italic text-cyan-400 bg-cyan-400/10 px-4 py-1 rounded border-2 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {subject.label}
                    </h3>
                    <button 
                      onClick={() => deleteKnowledgeNode(subject.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setNewNode({ label: '', type: 'topic', parentId: subject.id });
                      setShowAddModal(true);
                    }}
                    className="p-2 bg-slate-800 text-slate-400 rounded-lg border-2 border-black hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <div className="flex-1 h-[2px] bg-black border-b border-white/5" />
                </div>

                <div className="flex flex-wrap gap-12 justify-center py-8 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-black/40 -translate-y-1/2 z-0 hidden lg:block" />
                  
                  {topics.map((topic, idx) => (
                    <div key={topic.id} className="relative z-10 flex flex-col items-center gap-4 w-48 group">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="h-24 w-24 rounded-full border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative transition-all bg-violet-600"
                      >
                        <PlayCircle size={40} className="text-black" />
                        
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-md flex items-center justify-center border border-white/10 text-[10px] font-black uppercase text-cyan-400">
                          {idx + 1}
                        </div>

                        <button 
                          onClick={() => deleteKnowledgeNode(topic.id)}
                          className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>

                      <div className="text-center">
                        <h4 className="font-lexend font-black uppercase text-sm leading-tight text-white group-hover:text-cyan-400 transition-colors">
                          {topic.label}
                        </h4>
                        <div className="flex flex-col items-center gap-1 mt-2">
                           {knowledgeMap.filter(n => n.parentId === topic.id).map(sub => (
                             <div key={sub.id} className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                               <ChevronRight size={8} /> {sub.label}
                             </div>
                           ))}
                           <button 
                             onClick={() => {
                               setNewNode({ label: '', type: 'subtopic', parentId: topic.id });
                               setShowAddModal(true);
                             }}
                             className="text-[8px] font-black uppercase text-cyan-400 hover:underline mt-1"
                           >
                             + Add Subtopic
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {topics.length === 0 && (
                    <div className="text-center opacity-20 py-8">
                       <p className="text-xs font-black uppercase tracking-widest italic">No Topics Initialized for this sector</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
      </div>

      <section className="glass-panel p-8 bg-violet-600/40 relative overflow-hidden flex justify-between items-center">
         <div className="relative z-10 max-w-xl">
            <h3 className="font-lexend font-black uppercase text-2xl mb-2 flex items-center gap-3 italic">
              <Star className="text-yellow-400 fill-yellow-400" />
              Intelligence Briefing
            </h3>
            <p className="font-bold text-slate-100">
              Your knowledge map is a living tactical grid. Each subject sector expands your cognitive footprint. <span className="text-cyan-300 underline">Add topics</span> to define your mission parameters.
            </p>
         </div>
         <button className="relative z-10 bg-white text-black p-4 rounded-full border-4 border-black hover:bg-cyan-300 transition-colors">
            <Info size={32} />
         </button>
         <MapIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-black/10 -rotate-12" />
      </section>

      {/* Add Node Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#101221] border-4 border-black p-8 rounded-2xl w-full max-w-md shadow-[12px_12px_0px_0px_rgba(34,211,238,1)]">
              <h2 className="font-lexend font-black text-2xl uppercase italic text-cyan-400 mb-6">
                Initialize {newNode.type === 'subject' ? 'Sector' : newNode.type === 'topic' ? 'Mission Node' : 'Sub-Unit'}
              </h2>
              <input 
                autoFocus
                type="text" 
                placeholder="NODE IDENTIFIER..." 
                value={newNode.label}
                onChange={e => setNewNode({...newNode, label: e.target.value})}
                className="w-full bg-black border-2 border-black rounded-lg p-4 font-black uppercase tracking-widest outline-none focus:border-cyan-400 text-white mb-6"
              />
              <div className="flex gap-4">
                <button onClick={handleAddNode} className="flex-1 bg-cyan-400 text-black py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-white transition-colors">Deploy</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-800 text-white py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Abort</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
