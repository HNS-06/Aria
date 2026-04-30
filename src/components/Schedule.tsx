import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Zap,
  Sparkles,
  Plus,
  Brain,
  User,
  Trash2,
  Loader2,
  Bell
} from 'lucide-react';
import { useGlobal, Task } from '../context/GlobalContext';
import { generateStudyPlan } from '../services/geminiService';
import { useNotification } from '../context/NotificationContext';

export default function Schedule() {
  const { tasks, user, missions, addTask, updateTask, deleteTask } = useGlobal();
  const { addNotification } = useNotification();
  const [selectedDate] = useState(new Date());
  const [isAiMode, setIsAiMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const alertedTasks = useRef<Set<string>>(new Set());

  const [newTask, setNewTask] = useState({
    title: '',
    time: '09:00 AM',
    type: 'CORE' as Task['type'],
    priority: 'Medium' as Task['priority']
  });

  // Smart Alert Logic: Check for upcoming tasks (5 min before)
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.completed || alertedTasks.current.has(task.id)) return;

        // Parse "HH:MM AM/PM"
        const [time, modifier] = task.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const taskDate = new Date();
        taskDate.setHours(hours, minutes, 0, 0);

        const diffMinutes = (taskDate.getTime() - now.getTime()) / (1000 * 60);

        if (diffMinutes > 0 && diffMinutes <= 5) {
          alertedTasks.current.add(task.id);
          addNotification({
            title: "Upcoming Mission",
            message: `'${task.title}' begins in 5 minutes. Prepare for deployment.`,
            icon: Bell,
            type: 'SCHEDULE',
            priority: 'MEDIUM'
          });
        }
        
        // Missed task detection (5 min after)
        if (diffMinutes < -5 && diffMinutes > -10 && !task.completed) {
          alertedTasks.current.add(task.id);
          addNotification({
            title: "Missed Objective",
            message: `Strategic mission '${task.title}' was scheduled for ${task.time}.`,
            icon: AlertCircle,
            type: 'SCHEDULE',
            priority: 'HIGH'
          });
        }
      });
    };

    const interval = setInterval(checkSchedule, 30000); // Check every 30s
    checkSchedule();
    return () => clearInterval(interval);
  }, [tasks, addNotification]);

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTask(id, { completed: !completed });
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask(newTask);
      setNewTask({ title: '', time: '09:00 AM', type: 'CORE', priority: 'Medium' });
      setShowAddModal(false);
    }
  };

  const handleAiSchedule = async () => {
    if (!user || missions.length === 0) return;
    setIsGenerating(true);
    try {
      const plan = await generateStudyPlan(missions, user.xp, user.level, 180); // 3h plan
      plan.prioritizedMissions.forEach((p: any, i: number) => {
        const mission = missions.find(m => m.id === p.missionId);
        const startTime = new Date();
        startTime.setHours(new Date().getHours() + 1 + i, 0, 0); 
        addTask({
          title: `Focus: ${mission?.title || 'Unknown Mission'}`,
          time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'CORE',
          priority: p.priority as any
        });
      });
      setIsAiMode(true);
      
      addNotification({
        title: "Tactical Update",
        message: "AI Engine has optimized your temporal matrix.",
        icon: Brain,
        type: 'AI',
        priority: 'MEDIUM'
      });
    } catch (error) {
      console.error("AI Scheduling failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">TEMPORAL MATRIX</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Strategic Mission Timeline</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-black/60 border-2 border-black p-1 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => setIsAiMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${!isAiMode ? 'bg-violet-600 text-white border border-white/20' : 'text-slate-500 hover:text-white'}`}
            >
              <User size={14} /> Manual
            </button>
            <button 
              onClick={() => setIsAiMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${isAiMode ? 'bg-cyan-400 text-black border border-black/20' : 'text-slate-500 hover:text-white'}`}
            >
              <Brain size={14} /> AI Engine
            </button>
          </div>

          <div className="flex items-center gap-4 bg-black/40 border-2 border-black p-2 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <button className="p-1 hover:text-cyan-400 transition-colors"><ChevronLeft /></button>
             <span className="font-lexend font-black uppercase text-sm tracking-widest px-4">
               {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
             </span>
             <button className="p-1 hover:text-cyan-400 transition-colors"><ChevronRight /></button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-8 relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-lexend font-black uppercase text-xl flex items-center gap-2">
                <Clock className="text-violet-500" />
                {isAiMode ? 'AI Optimized Ops' : 'Manual Operations'}
              </h3>
              
              <div className="flex gap-4">
                {isAiMode && (
                  <button 
                    onClick={handleAiSchedule}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-cyan-400 text-black px-4 py-2 rounded-lg border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Recalculate Plan
                  </button>
                )}
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
            </div>
            
            <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-black before:border-r before:border-white/10">
              {tasks.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <p className="font-bangers text-2xl uppercase tracking-widest text-slate-500">No Mission Data Found</p>
                  <p className="text-[10px] font-black uppercase mt-2">Initialize tasks manually or use AI Uplink</p>
                </div>
              ) : (
                tasks.map((task, i) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-12 group"
                  >
                    <motion.div 
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      animate={{
                        scale: task.completed ? [1, 1.3, 1] : 1,
                        backgroundColor: task.completed ? '#22c55e' : 
                                        '#334155'
                      }}
                      className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-black z-10 transition-transform group-hover:scale-110 cursor-pointer" 
                    />
                    
                    <div className={`glass-panel p-5 transition-all group-hover:-translate-y-1 group-hover:border-violet-500/50 relative overflow-hidden ${
                      !task.completed ? 'border-l-8 border-l-cyan-400' : ''
                    }`}>
                      <AnimatePresence>
                        {task.completed && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-green-500 pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      <div className="flex justify-between items-start mb-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{task.time}</span>
                        <div className="flex gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                            task.type === 'CORE' ? 'bg-violet-600/20 text-violet-400' : 
                            task.type === 'COMBAT' ? 'bg-orange-600/20 text-orange-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {task.type}
                          </span>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 relative z-10">
                        <h4 className={`font-lexend font-black text-lg uppercase transition-colors tracking-tight ${
                          task.completed ? 'text-green-400 italic' : 'group-hover:text-cyan-400'
                        }`}>
                          {task.title}
                        </h4>
                        {task.completed && (
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-yellow-400"
                          >
                            <Sparkles size={20} fill="currentColor" />
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-1.5">
                          {task.completed ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : (
                            <Circle size={12} className="text-slate-600" />
                          )}
                          <span className={`text-[10px] font-bold uppercase ${task.completed ? 'text-green-500' : 'text-slate-500'}`}>
                            {task.completed ? 'Success' : 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={10} className={task.priority === 'High' ? 'text-red-500' : 'text-slate-600'} />
                          <span className="text-[10px] font-bold uppercase text-slate-500">{task.priority} Priority</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <section className="glass-panel p-6 bg-violet-600/10">
              <h3 className="font-lexend font-black uppercase text-lg mb-4 italic">Alerts & Intel</h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-red-400">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-xs font-bold italic leading-tight">Deadlines approaching for active missions.</p>
                </div>
                <div className="flex gap-3 text-cyan-400">
                  <Zap size={18} className="shrink-0" />
                  <p className="text-xs font-bold italic leading-tight">XP Opportunity: Complete focus session for bonus multiplier.</p>
                </div>
              </div>
           </section>

           <section className="glass-panel p-6">
              <h3 className="font-lexend font-black uppercase text-lg mb-4 italic">Mission Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                {['CORE', 'TACTICAL', 'INTEL', 'COMBAT', 'RESEARCH', 'SUPPORT'].map(f => (
                  <button key={f} className="text-[10px] font-black uppercase tracking-widest py-2 bg-slate-900 border border-black rounded hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                    {f}
                  </button>
                ))}
              </div>
           </section>

           <div className="p-8 border-4 border-dashed border-black rounded-xl text-center opacity-30">
              <p className="font-bangers text-3xl tracking-widest text-slate-500 uppercase">Classified Content</p>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#101221] border-4 border-black p-8 rounded-2xl w-full max-w-md shadow-[12px_12px_0px_0px_rgba(124,58,237,1)]">
              <h2 className="font-lexend font-black text-2xl uppercase italic text-violet-500 mb-6">New Operational Task</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="E.G. STUDY QUANTUM..." 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-black border-2 border-black rounded-lg p-3 font-black uppercase tracking-widest outline-none focus:border-violet-500 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</label>
                    <input 
                      type="text" 
                      value={newTask.time}
                      onChange={e => setNewTask({...newTask, time: e.target.value})}
                      className="w-full bg-black border-2 border-black rounded-lg p-3 font-black uppercase tracking-widest outline-none focus:border-violet-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                      className="w-full bg-black border-2 border-black rounded-lg p-3 font-black uppercase tracking-widest outline-none focus:border-violet-500 text-white"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddTask} className="flex-1 bg-violet-600 text-white py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Confirm</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-800 text-white py-3 rounded-xl border-4 border-black font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
