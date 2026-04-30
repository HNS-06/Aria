import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, BrainCircuit, ListTodo, Settings, BellRing, Clock } from 'lucide-react';
import { useGlobal, StudyMode } from '../context/GlobalContext';
import { Tab } from '../types';

export default function Focus() {
  const { 
    user, 
    timer, 
    startTimer, 
    pauseTimer, 
    resetTimer: resetGlobalTimer, 
    setTimerMode,
    addTask,
    settings,
    setActiveTab
  } = useGlobal();

  const [alertMessage, setAlertMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Sound effects
  const playAlarm = () => {
    if (!settings.soundEnabled) return;
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
    } catch (e) {
      console.log('Audio play error', e);
    }
  };

  useEffect(() => {
    if (timer.timeLeft === 0 && timer.isActive) {
      playAlarm();
      setAlertMessage("Mission Objective Reached! Take a tactical breather.");
    }
  }, [timer.timeLeft, timer.isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'CORE',
        priority: 'High'
      });
      setNewTaskTitle('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Alert Overlay */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3"
          >
            <BellRing className="text-violet-600 animate-pulse" />
            <span className="font-lexend font-black uppercase text-sm">{alertMessage}</span>
            <button onClick={() => setAlertMessage('')} className="ml-4 text-xs bg-black text-white px-3 py-1 rounded-lg border-2 border-black hover:bg-slate-800 transition-colors font-black">OK</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Focus Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Settings Toggle */}
        <button 
          onClick={() => setActiveTab(Tab.SETTINGS)}
          className="absolute top-4 right-4 p-3 bg-slate-800 text-slate-400 rounded-full border-2 border-black hover:text-white hover:bg-slate-700 transition-colors z-20"
        >
          <Settings size={20} />
        </button>

        {/* Top Badge */}
        <div className="bg-[#facc15] text-black px-6 py-2 rounded-sm border-2 border-black font-lexend font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 mb-12 flex items-center gap-2">
          {timer.timeLeft > 0 ? (timer.isActive ? 'UPLINK ACTIVE' : 'AWAITING COMMAND') : 'OBJECTIVE SECURED'} 
          <span className="text-xl">🔥</span>
        </div>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <div className="absolute inset-0 border-8 border-cyan-900 rounded-full opacity-30" />
          <motion.div 
            animate={{ rotate: timer.isActive ? 360 : 0 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 border-t-8 rounded-full ${timer.mode === StudyMode.DEEP_FOCUS ? 'border-cyan-400' : 'border-violet-500'}`} 
          />
          <div className="absolute inset-4 border-2 border-slate-800 rounded-full" />
          
          <h1 className={`font-bangers text-[120px] leading-none drop-shadow-[0px_0px_20px_rgba(34,211,238,0.5)] z-10 ${timer.isActive ? 'text-cyan-50' : 'text-slate-400'}`}>
            {formatTime(timer.timeLeft)}
          </h1>

          {/* Mascot Popout */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white p-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-24 flex flex-col items-center">
             <div className="bg-slate-100 text-black text-[10px] font-bold px-2 py-1 rounded mb-2 w-full text-center border border-slate-300">
               {timer.isActive ? "Focus!" : "Still there? 👻"}
             </div>
             <img src="https://api.dicebear.com/9.x/bottts/svg?seed=Aria&backgroundColor=b6e3f4" alt="Mascot" className="w-12 h-12" />
          </div>
        </div>

        {/* Mode Selectors */}
        <div className="flex gap-4 mt-12 bg-[#0b0d1c] p-2 rounded-full border-2 border-slate-800">
          <button onClick={() => setTimerMode(StudyMode.DEEP_FOCUS)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${timer.mode === StudyMode.DEEP_FOCUS ? 'bg-cyan-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:text-white'}`}>
            <Zap size={14} className="inline mr-2" /> Deep Focus
          </button>
          <button onClick={() => setTimerMode(StudyMode.LIGHT_REVIEW)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${timer.mode === StudyMode.LIGHT_REVIEW ? 'bg-violet-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:text-white'}`}>
            <BrainCircuit size={14} className="inline mr-2" /> Light Review
          </button>
          <button onClick={() => setTimerMode(StudyMode.CREATIVE_WORK)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${timer.mode === StudyMode.CREATIVE_WORK ? 'bg-orange-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:text-white'}`}>
            <ListTodo size={14} className="inline mr-2" /> Creative Work
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-6 mt-12">
          <button 
            onClick={timer.isActive ? pauseTimer : startTimer} 
            className={`w-40 py-4 ${timer.isActive ? 'bg-red-500' : 'bg-[#2dd4bf]'} text-black rounded-xl font-lexend font-black text-xl tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}
          >
            {timer.isActive ? 'PAUSE' : 'START'}
          </button>
          <button 
            onClick={resetGlobalTimer}
            className="w-40 py-4 bg-[#fb923c] text-black rounded-xl font-lexend font-black text-xl tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-[#0b0d1c] border-t-4 border-black p-6 flex justify-center gap-12 text-slate-400">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-400" />
          <span className="font-lexend font-black text-xs uppercase tracking-widest">Sessions Done: <span className="text-white text-base ml-2">{user?.sessionsDone || 0}</span></span>
        </div>
        <div className="w-px bg-slate-800" />
        <div className="flex items-center gap-3">
          <Clock className="text-violet-400" />
          <span className="font-lexend font-black text-xs uppercase tracking-widest">Total Focus Time: <span className="text-white text-base ml-2">{formatTotalTime(user?.totalFocusTime || 0)}</span></span>
        </div>
        <div className="w-px bg-slate-800" />
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-orange-400" />
          <span className="font-lexend font-black text-xs uppercase tracking-widest">Focus Score: <span className="text-white text-base ml-2">{user?.focusScore ? `${user.focusScore}%` : '---'}</span></span>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#101221] border-4 border-black p-8 rounded-2xl w-full max-w-md shadow-[12px_12px_0px_0px_rgba(34,211,238,1)]">
              <h2 className="font-lexend font-black text-2xl uppercase italic text-cyan-400 mb-6">New Tactical Objective</h2>
              <input 
                autoFocus
                type="text" 
                placeholder="MISSION TITLE..." 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full bg-black border-2 border-black rounded-lg p-4 font-black uppercase tracking-widest outline-none focus:border-cyan-400 text-white mb-6"
              />
              <div className="flex gap-4">
                <button onClick={handleAddTask} className="flex-1 bg-cyan-400 text-black py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-white transition-colors">Deploy</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-800 text-white py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Abort</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
