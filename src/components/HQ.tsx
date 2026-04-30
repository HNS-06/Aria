import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Target, Flame, Trophy, ChevronRight, BrainCircuit, Loader2, Sparkles, Clock, AlertTriangle, ShieldCheck, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import { generateStudyPlan, analyzeMissionProgress, type StudyPlan, type MissionAnalysis } from '../services/geminiService';
import { useGlobal } from '../context/GlobalContext';

export default function HQ() {
  const { user, missions, timer, startTimer, pauseTimer, resetTimer } = useGlobal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [analysis, setAnalysis] = useState<MissionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateStudyPlan(missions, user.xp, user.level, 180);
      setPlan(result);
    } catch (err) {
      console.error(err);
      setError("AI Uplink Failed. Please try again, Hero.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeProgress = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeMissionProgress(missions);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysisError("Neural Analysis Failed. Signal jamming detected.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTotalTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">HERO HEADQUARTERS</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Status: Mission Ready | Power Level: {user?.level}</p>
        </div>
        <button 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="bg-violet-600 text-white px-6 py-3 rounded-lg border-2 border-black font-lexend font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 group"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:scale-125 transition-transform" />}
          Generate Study Plan
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -5, rotate: -1 }}
          className="glass-panel p-6 bg-violet-600/20"
        >
          <div className="flex justify-between items-start mb-4">
            <Zap className="text-violet-400" size={24} />
            <span className="text-[10px] font-black uppercase text-violet-400 tracking-tighter bg-violet-400/10 px-2 py-0.5 rounded border border-violet-400/20">Active Trace</span>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Focus Time</p>
          <h4 className="text-3xl font-bangers tracking-wider uppercase">{formatTotalTime(user?.totalFocusTime || 0)}</h4>
          <p className="text-xs text-violet-300/60 font-bold mt-2">{user?.totalFocusTime || 0} minutes total</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, rotate: 1 }}
          className="glass-panel p-6 bg-cyan-400/10"
        >
          <div className="flex justify-between items-start mb-4">
            <Flame className="text-cyan-400" size={24} />
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-tighter bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">On Fire</span>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Current Streak</p>
          <h4 className="text-3xl font-bangers tracking-wider">{user?.streak || 0} DAYS</h4>
          <p className="text-xs text-cyan-300/60 font-bold mt-2">Persistence is key!</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, rotate: -1 }}
          className="glass-panel p-6 bg-orange-500/10"
        >
          <div className="flex justify-between items-start mb-4">
            <Trophy className="text-orange-500" size={24} />
            <span className="text-[10px] font-black uppercase text-orange-500 tracking-tighter bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">High Tier</span>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Focus Score</p>
          <h4 className="text-3xl font-bangers tracking-wider">{user?.focusScore ? `${user.focusScore}%` : '---'}</h4>
          <p className="text-xs text-orange-300/60 font-bold mt-2">Efficiency Rating</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, rotate: 1 }}
          className="glass-panel p-6 bg-green-500/10"
        >
          <div className="flex justify-between items-start mb-4">
            <Target className="text-green-500" size={24} />
            <span className="text-[10px] font-black uppercase text-green-500 tracking-tighter bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Sharp Eye</span>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Sessions Done</p>
          <h4 className="text-3xl font-bangers tracking-wider">{user?.sessionsDone || 0} COMPLETED</h4>
          <p className="text-xs text-green-300/60 font-bold mt-2">Tactical objectives secured</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-lexend font-black uppercase text-xl flex items-center gap-2">
                <span className="w-2 h-6 bg-cyan-400 inline-block border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                Active Missions
              </h3>
              <button 
                onClick={handleAnalyzeProgress}
                disabled={isAnalyzing}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 p-2 bg-cyan-400/5 border border-cyan-400/20 rounded hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} className="group-hover:animate-pulse" />}
                {isAnalyzing ? 'Scanning...' : 'Efficiency Diagnostic'}
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {analysis && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-900/80 border-2 border-black p-6 rounded-lg mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                      <button 
                        onClick={() => setAnalysis(null)}
                        className="absolute top-2 right-2 text-slate-500 hover:text-white font-bold"
                      >
                        [X]
                      </button>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-4 italic flex items-center gap-2">
                        <Sparkles size={14} />
                        Intelligence Briefing: {analysis.overallStatus}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.bottlenecks.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase text-red-400 flex items-center gap-1">
                              <AlertTriangle size={12} /> Critical Bottlenecks
                            </p>
                            {analysis.bottlenecks.map((b, i) => (
                              <div key={i} className="p-3 bg-red-500/5 border border-red-500/20 rounded-md">
                                <p className="text-[11px] font-bold text-red-200 mb-1">{b.issue}</p>
                                <p className="text-[9px] text-slate-400 italic">Vector: {b.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {analysis.victories.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase text-green-400 flex items-center gap-1">
                              <ShieldCheck size={12} /> Strategic Victories
                            </p>
                            {analysis.victories.map((v, i) => (
                              <div key={i} className="p-3 bg-green-500/5 border border-green-500/20 rounded-md">
                                <p className="text-[11px] font-bold text-green-200">{v.strength}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {missions.map((mission) => (
                <div key={mission.id} className="group cursor-pointer">
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-bold text-lg italic group-hover:text-cyan-400 transition-colors">{mission.title}</p>
                    <span className="font-bangers text-xl tracking-widest">{mission.progress}%</span>
                  </div>
                  <div className="w-full h-5 bg-black border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${mission.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${mission.color} rounded-sm`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 font-lexend font-black uppercase text-xs tracking-widest text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              View All Missions <ChevronRight size={14} />
            </button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <section className="glass-panel p-6 border-b-4 border-black/50">
                <h3 className="font-lexend font-black uppercase text-lg mb-4 flex items-center gap-2">
                  <Clock className="text-violet-500" size={20} />
                  Focus Command
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-black border-2 border-black rounded-lg flex items-center justify-center font-bangers text-4xl text-cyan-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {formatTime(timer.timeLeft)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pomodoro Protocol</p>
                      <p className="font-bold text-sm italic">{timer.isActive ? 'Focus Active...' : 'Ready for Duty'}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={timer.isActive ? pauseTimer : startTimer}
                          className={`p-2 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                            timer.isActive ? 'bg-orange-500 text-black' : 'bg-cyan-400 text-black'
                          }`}
                        >
                          {timer.isActive ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button 
                          onClick={resetTimer}
                          className="p-2 bg-slate-800 text-slate-400 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={timer.isActive ? pauseTimer : startTimer}
                    className={`w-full py-3 font-lexend font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                      timer.isActive 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-violet-600 text-white hover:bg-violet-500'
                    }`}
                  >
                    {timer.isActive ? 'Pause Protocol' : 'Initiate focus'}
                  </button>
                </div>
             </section>
             <section className="glass-panel p-6 bg-slate-900/50 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-lexend font-black uppercase text-lg italic flex items-center gap-2">
                    <BrainCircuit className="text-cyan-400" />
                    AI Commander Plan
                  </h3>
                  {!plan && !isGenerating && (
                    <button 
                      onClick={handleGeneratePlan}
                      className="bg-cyan-400 text-black px-3 py-1 rounded text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-colors"
                    >
                      Sync Intelligence
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full py-8 text-center"
                      >
                         <Loader2 className="animate-spin text-cyan-400 mb-4" size={32} />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Consulting Mainframe...</p>
                      </motion.div>
                    )}

                    {error && (
                       <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded text-red-500 text-xs font-bold italic"
                       >
                         {error}
                         <button onClick={handleGeneratePlan} className="block mt-2 underline">Retry Uplink</button>
                       </motion.div>
                    )}

                    {plan && !isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 pb-4"
                      >
                        <div className="p-3 bg-violet-600/10 border border-violet-500/20 rounded text-[11px] font-medium text-violet-200 italic leading-relaxed">
                          "{plan.strategicAdvice}"
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suggested Priorities</p>
                          {plan.prioritizedMissions.map((p, i) => {
                            const mission = missions.find(m => m.id === p.missionId);
                            return (
                              <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-lg group">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-xs text-white truncate max-w-[120px]">{mission?.title || 'Unknown Mission'}</span>
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-black ${
                                    p.priority === 'High' ? 'bg-red-600 text-white' : 
                                    p.priority === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'
                                  }`}>
                                    {p.priority}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 leading-tight mb-2">{p.reason}</p>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-cyan-400 uppercase tracking-tighter">
                                  <Clock size={10} />
                                  Target: {p.suggestedFocusMinutes} Minutes
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {!plan && !isGenerating && !error && (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 py-8">
                         <Sparkles size={40} className="mb-2 text-slate-600" />
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Awaiting Tactical Command...</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
             </section>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="glass-panel p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-violet-600/5 group-hover:bg-violet-600/10 transition-colors" />
            <h3 className="font-lexend font-black uppercase text-lg mb-4 relative z-10 italic">Hero Profile</h3>
            <div className="relative z-10 flex flex-col items-center py-4">
              <div className="w-32 h-32 relative mb-4">
                <div className="absolute inset-0 border-4 border-violet-500 rounded-full animate-pulse" />
                <div className="absolute inset-2 border-2 border-cyan-400 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                   <img 
                    src={user?.avatar || "https://api.dicebear.com/9.x/bottts/svg?seed=Aria&backgroundColor=b6e3f4"}
                    alt="Hero Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>
              <h4 className="font-lexend font-black text-2xl uppercase tracking-tighter text-center">{user?.name || 'Vortex Scholar'}</h4>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Level {user?.level} COMMANDER</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Neural Progress</span>
                  <span>{(user?.xp || 0) % 1000} / 1,000 XP</span>
                </div>
                <div className="w-full h-3 bg-black rounded-full overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-0.5">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${((user?.xp || 0) % 1000) / 10}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
             <h3 className="font-lexend font-black uppercase text-lg mb-4 italic">Recent Feats</h3>
             <div className="space-y-4">
                {[
                  { label: 'Neural Surge', desc: `${user?.sessionsDone || 0} sessions locked`, icon: Zap, color: 'text-cyan-400' },
                  { label: 'Unstoppable', desc: `${user?.streak || 0} day streak`, icon: Flame, color: 'text-orange-500' },
                  { label: 'Dominance', desc: `${user?.focusScore || 0}% focus score`, icon: Trophy, color: 'text-yellow-400' }
                ].map((feat, i) => (
                  <div key={i} className="flex gap-3 items-center p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className={`p-2 rounded bg-slate-800 border border-black ${feat.color}`}>
                      <feat.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight text-white">{feat.label}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black italic">{feat.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
