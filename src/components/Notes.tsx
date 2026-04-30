import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Share2, 
  Maximize2,
  Tag,
  StickyNote,
  Clock,
  Inbox
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

export default function Notes() {
  const { notes, deleteNote, addNote, setShowQuickAdd, setQuickAddType } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20 h-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">HERO ARCHIVES</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Storing the blueprints of your intellect</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Find specific intel..." 
                className="bg-[#1d1e2e] border-2 border-black rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:ring-4 focus:ring-cyan-400/20 outline-none font-medium transition-all text-sm text-white placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </header>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 border-4 border-dashed border-slate-800 rounded-3xl">
          <Inbox size={64} className="mb-4" />
          <h3 className="font-lexend font-black uppercase text-xl">Archives Empty</h3>
          <p className="text-xs font-bold uppercase tracking-widest">No intel matches your current parameters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredNotes.map((note, i) => (
              <motion.div 
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-panel p-6 border-l-8 ${note.color} group relative overflow-hidden flex flex-col hover:border-r-8 transition-all`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-900 border border-black rounded group-hover:bg-violet-600/20 transition-colors">
                    <StickyNote size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1.5 text-slate-500 hover:text-white transition-colors" title="Maximize"><Maximize2 size={16} /></button>
                     <button className="p-1.5 text-slate-500 hover:text-white transition-colors" title="Share"><Share2 size={16} /></button>
                     <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" 
                      title="Delete"
                     >
                      <Trash2 size={16} />
                     </button>
                  </div>
                </div>

                <h3 className="font-lexend font-black uppercase text-lg leading-tight mb-2 group-hover:text-cyan-400 transition-colors">{note.title}</h3>
                <p className="text-slate-400 text-sm font-medium line-clamp-3 mb-6 italic">"{note.excerpt}"</p>
                
                <div className="mt-auto flex flex-col gap-4">
                   <div className="flex flex-wrap gap-2">
                     {note.tags.map(tag => (
                       <span key={tag} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-black group-hover:border-white/10 transition-colors">
                         <Tag size={10} />
                         {tag}
                       </span>
                     ))}
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                        <Clock size={12} />
                        {note.date}
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:underline">Access Intel</button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Manual Creation Section */}
      <section 
        onClick={() => {
           setQuickAddType('NOTE');
           setShowQuickAdd(true);
        }}
        className="glass-panel p-12 border-dashed flex flex-col items-center justify-center text-center bg-slate-950/20 opacity-40 hover:opacity-100 transition-opacity group cursor-pointer"
      >
         <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mb-4 bg-slate-900 group-hover:bg-cyan-400 group-hover:text-black transition-all">
            <Plus size={32} />
         </div>
         <h3 className="font-lexend font-black uppercase text-xl">Archive New Intel</h3>
         <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Use the Quick Deployment module to add blueprints</p>
      </section>
    </div>
  );
}
