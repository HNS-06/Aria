import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BarChart3, 
  CalendarDays, 
  Map as MapIcon, 
  NotebookPen, 
  Trophy, 
  FileText, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Zap,
  Plus,
  Loader2,
  Clock,
  Target,
  X,
  PlusCircle,
  Network,
  StickyNote
} from 'lucide-react';
import { Tab } from './types.ts';
import { useGlobal } from './context/GlobalContext';
import Onboarding from './components/Onboarding';

// Lazy load components
const HQ = lazy(() => import('./components/HQ'));
const Intel = lazy(() => import('./components/Intel'));
const Schedule = lazy(() => import('./components/Schedule'));
const Map = lazy(() => import('./components/Map'));
const Notes = lazy(() => import('./components/Notes'));
const HallOfFame = lazy(() => import('./components/HallOfFame.tsx'));
const PDFLab = lazy(() => import('./components/PDFLab'));
const Focus = lazy(() => import('./components/Focus'));

export default function App() {
  const { hasOnboarded, user, setUser, addTask, addKnowledgeNode, addNote } = useGlobal();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HQ);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Quick Add State
  const [quickAddType, setQuickAddType] = useState<'TASK' | 'NODE' | 'NOTE'>('TASK');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');

  if (!hasOnboarded || !user) {
    return <Onboarding />;
  }

  const navItems = [
    { id: Tab.HQ, label: 'HQ', icon: LayoutDashboard },
    { id: Tab.FOCUS, label: 'Focus', icon: Clock },
    { id: Tab.INTEL, label: 'Intel', icon: BarChart3 },
    { id: Tab.SCHEDULE, label: 'Schedule', icon: CalendarDays },
    { id: Tab.MAP, label: 'Map', icon: MapIcon },
    { id: Tab.NOTES, label: 'Notes', icon: NotebookPen },
    { id: Tab.HALL_OF_FAME, label: 'Hall of Fame', icon: Trophy },
    { id: Tab.PDF_LAB, label: 'PDF Lab', icon: FileText },
  ];

  const handleAction = () => {
    if (!title.trim()) return;
    
    if (quickAddType === 'TASK') {
      addTask({
        title,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'CORE',
        priority: 'Medium'
      });
    } else if (quickAddType === 'NODE') {
      addKnowledgeNode({
        label: title,
        type: 'subject'
      });
    } else {
      addNote({
        title,
        excerpt: excerpt || 'No blueprint description provided.',
        tags: ['General']
      });
    }
    
    setTitle('');
    setExcerpt('');
    setShowQuickAdd(false);
  };

  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader2 className="animate-spin text-cyan-400" size={48} />
          <p className="font-lexend font-black uppercase tracking-tighter text-slate-500 animate-pulse">Initializing Interface...</p>
        </div>
      }>
        {activeTab === Tab.HQ && <HQ />}
        {activeTab === Tab.FOCUS && <Focus />}
        {activeTab === Tab.INTEL && <Intel />}
        {activeTab === Tab.SCHEDULE && <Schedule />}
        {activeTab === Tab.MAP && <Map />}
        {activeTab === Tab.NOTES && <Notes />}
        {activeTab === Tab.HALL_OF_FAME && <HallOfFame />}
        {activeTab === Tab.PDF_LAB && <PDFLab />}
      </Suspense>
    );
  };

  return (
    <div className="flex min-h-screen halftone-bg overflow-hidden font-plus-jakarta bg-[#101221]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0b0d1c]/90 backdrop-blur-md border-r-4 border-black flex flex-col z-40 shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-8 border-b-2 border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-600 rounded-lg border-2 border-black flex items-center justify-center overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <img 
                src="https://api.dicebear.com/9.x/bottts/svg?seed=Aria&backgroundColor=b6e3f4" 
                alt="Mascot" 
                className="w-10 h-10 object-cover"
              />
            </div>
            <div>
              <h1 className="font-lexend font-black uppercase tracking-tighter text-2xl italic text-violet-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">ARIA</h1>
              <p className="font-lexend font-bold text-[10px] text-cyan-400 opacity-80 uppercase tracking-widest">{user.name} HQ</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-4 transition-all duration-200 group relative ${
                activeTab === item.id
                  ? 'bg-violet-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 scale-105 z-10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={24} className={activeTab === item.id ? 'text-white' : 'group-hover:text-cyan-400 transition-colors'} />
              <span className="font-lexend font-black uppercase tracking-tighter text-lg">{item.label}</span>
              {activeTab === item.id && (
                 <div className="absolute -right-2 top-0 bottom-0 w-1 bg-cyan-400 shadow-[2px_0px_0px_0px_rgba(0,0,0,1)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t-2 border-black/10">
          <button 
            onClick={() => setActiveTab(Tab.FOCUS)}
            className="w-full bg-violet-600 text-white py-4 font-lexend font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mb-6 italic hover:bg-violet-500">
            Start Focus
          </button>
          <div className="space-y-1">
            <button className="w-full text-slate-400 flex items-center gap-3 px-2 py-1 text-sm hover:text-white transition-colors group">
              <Settings size={18} className="group-hover:rotate-45 transition-transform" />
              <span className="font-bold uppercase text-[10px] tracking-widest">Settings</span>
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('aria_user_profile');
                setUser(null);
              }}
              className="w-full text-slate-400 flex items-center gap-3 px-2 py-1 text-sm hover:text-red-400 transition-colors">
              <LogOut size={18} />
              <span className="font-bold uppercase text-[10px] tracking-widest">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 relative min-h-screen flex flex-col">
        {/* Top App Bar */}
        <header className="sticky top-0 w-full h-20 bg-[#101221]/80 backdrop-blur-lg border-b-4 border-black flex justify-between items-center px-8 z-30 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search mission intel..." 
                className="bg-[#1d1e2e] border-2 border-black rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-4 focus:ring-cyan-400/20 outline-none font-medium transition-all text-sm text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-300 hover:text-cyan-300 transition-all hover:scale-110 active:scale-95">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full text-[8px] flex items-center justify-center font-black text-white">2</span>
            </button>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border-2 border-black">
              <Zap size={20} className="text-orange-500 fill-orange-500" />
              <span className="font-bangers text-lg text-orange-500 tracking-wider">{user.level}</span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-violet-500 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:scale-105 transition-transform">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <section className="p-8 flex-1 relative overflow-y-auto max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Unified Global Floating Action Button */}
        <button 
          onClick={() => {
            if (activeTab === Tab.MAP) setQuickAddType('NODE');
            else if (activeTab === Tab.NOTES) setQuickAddType('NOTE');
            else setQuickAddType('TASK');
            setShowQuickAdd(true);
          }}
          className="fixed bottom-10 right-10 w-16 h-16 bg-cyan-400 text-black rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all z-50 group overflow-hidden"
        >
          <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />
          <Plus size={32} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Advanced Quick Add Modal (Unified) */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-[#101221] border-4 border-black p-8 rounded-2xl w-full max-w-md shadow-[12px_12px_0px_0px_rgba(34,211,238,1)]">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                    <Target className="text-cyan-400" />
                    <h2 className="font-lexend font-black text-2xl uppercase italic text-white">Quick Deployment</h2>
                  </div>
                  <button onClick={() => setShowQuickAdd(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                </div>

                <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl border-2 border-black overflow-x-auto scrollbar-hide">
                  <button 
                    onClick={() => setQuickAddType('TASK')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black uppercase text-[10px] whitespace-nowrap transition-all ${quickAddType === 'TASK' ? 'bg-violet-600 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'text-slate-500'}`}
                  >
                    <PlusCircle size={14} /> Mission
                  </button>
                  <button 
                    onClick={() => setQuickAddType('NODE')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black uppercase text-[10px] whitespace-nowrap transition-all ${quickAddType === 'NODE' ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'text-slate-500'}`}
                  >
                    <Network size={14} /> Node
                  </button>
                  <button 
                    onClick={() => setQuickAddType('NOTE')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black uppercase text-[10px] whitespace-nowrap transition-all ${quickAddType === 'NOTE' ? 'bg-orange-500 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'text-slate-500'}`}
                  >
                    <StickyNote size={14} /> Archive
                  </button>
                </div>

                <div className="space-y-4">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder={quickAddType === 'TASK' ? "MISSION TITLE..." : quickAddType === 'NODE' ? "SECTOR NAME..." : "INTEL TITLE..."}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-black border-2 border-black rounded-lg p-4 font-black uppercase tracking-widest outline-none focus:border-cyan-400 text-white"
                  />
                  
                  {quickAddType === 'NOTE' && (
                    <textarea 
                      placeholder="ENTER INTEL SUMMARY..."
                      value={excerpt}
                      onChange={e => setExcerpt(e.target.value)}
                      className="w-full h-32 bg-black border-2 border-black rounded-lg p-4 font-bold tracking-tight outline-none focus:border-orange-500 text-white resize-none"
                    />
                  )}
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={handleAction} 
                    className="flex-1 bg-cyan-400 text-black py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Deploy
                  </button>
                  <button 
                    onClick={() => setShowQuickAdd(false)} 
                    className="flex-1 bg-slate-800 text-white py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
