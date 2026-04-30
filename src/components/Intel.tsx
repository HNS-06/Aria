import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Brain, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGlobal } from '../context/GlobalContext';

export default function Intel() {
  const { user, notes, analytics } = useGlobal();

  // Peak hour display string
  const peakHourStr = analytics.peakHour >= 12 
    ? `${analytics.peakHour === 12 ? 12 : analytics.peakHour - 12} PM`
    : `${analytics.peakHour === 0 ? 12 : analytics.peakHour} AM`;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">STUDY INTEL</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Strategic Analytics for Academic Domination</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Card */}
        <section className="lg:col-span-2 glass-panel p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="font-lexend font-black uppercase text-xl flex items-center gap-2">
                <BarChart3 className="text-violet-500" />
                Focus Flux
              </h3>
              <div className="flex gap-2">
                 <button className="px-3 py-1 bg-violet-600 text-[10px] font-black uppercase tracking-widest rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Weekly</button>
                 <button className="px-3 py-1 bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded border-2 border-black opacity-50 cursor-not-allowed">Monthly</button>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={analytics.dailyTrend}>
                 <defs>
                   <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#7b5cf0" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#7b5cf0" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                 <XAxis 
                   dataKey="name" 
                   stroke="#64748b" 
                   fontSize={12} 
                   fontWeight="bold"
                   tickLine={false}
                   axisLine={false}
                 />
                 <YAxis 
                   stroke="#64748b" 
                   fontSize={12} 
                   fontWeight="bold"
                   tickLine={false}
                   axisLine={false}
                   label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontWeight: 'bold', fontSize: '10px' } }}
                 />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1d1e2e', 
                     border: '2px solid black',
                     borderRadius: '8px',
                     fontFamily: 'Lexend',
                     fontSize: '12px',
                     color: '#fff'
                   }}
                   itemStyle={{ color: '#7b5cf0' }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="focus" 
                    name="Focus Hours"
                    stroke="#7b5cf0" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorFocus)" 
                  />
               </AreaChart>
             </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Peak Intensity</p>
                 <h5 className="font-lexend font-black text-xl italic text-cyan-400">{peakHourStr}</h5>
                 <p className="text-[10px] font-bold text-slate-600">Optimal Window</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Consistency</p>
                 <h5 className="font-lexend font-black text-xl italic text-violet-500">{analytics.focusScore}%</h5>
                 <p className="text-[10px] font-bold text-slate-600">Focus Score</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total XP</p>
                 <h5 className="font-lexend font-black text-xl italic text-orange-500">{(user?.xp || 0).toLocaleString()}</h5>
                 <p className="text-[10px] font-bold text-slate-600">Level {user?.level || 1} Tier</p>
              </div>
           </div>
        </section>

        {/* Side Panel */}
        <div className="space-y-6">
           <section className="glass-panel p-6 bg-cyan-400/5">
              <h3 className="font-lexend font-black uppercase text-lg mb-6 flex items-center gap-2 italic">
                <Brain className="text-cyan-400" />
                Mastery Radar
              </h3>
              <div className="space-y-4">
                 {analytics.subjectMastery.length === 0 ? (
                   <p className="text-[10px] font-bold text-slate-500 uppercase text-center py-10 italic">No mission data acquired</p>
                 ) : (
                   analytics.subjectMastery.map((item) => (
                    <div key={item.subject}>
                       <div className="flex justify-between items-end mb-1">
                         <span className="text-xs font-black uppercase tracking-tighter truncate max-w-[100px]">{item.subject}</span>
                         <span className="font-bangers text-lg tracking-widest leading-none">{item.mastery}%</span>
                       </div>
                       <div className="w-full h-2 bg-black border border-white/10 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${item.mastery}%` }}
                           transition={{ duration: 0.8, delay: 0.2 }}
                           className={`h-full rounded-full bg-${item.color}`}
                           style={{ backgroundColor: !item.color.startsWith('#') ? undefined : item.color }}
                         />
                       </div>
                    </div>
                   ))
                 )}
              </div>
           </section>

           <section className="glass-panel p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-violet-600/20 rounded border border-violet-600/30">
                    <TrendingUp className="text-violet-500" size={20} />
                 </div>
                 <div>
                    <h4 className="font-lexend font-black uppercase text-sm italic">Velocity Rank</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Growth Vector</p>
                 </div>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="font-bangers text-4xl tracking-tighter text-white">#{Math.max(1, 2000 - (user?.xp || 0) / 5).toLocaleString()}</span>
                 <span className="text-xs font-black text-green-500 mb-1">▲ {analytics.streak * 5}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">You're advancing through the global standings. Your {analytics.streak} day streak provides a multiplier!</p>
           </section>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Focus Sessions', value: analytics.sessionsDone, icon: Activity, color: 'text-cyan-400' },
           { label: 'Strategic Intel', value: notes.length, icon: Brain, color: 'text-violet-500' },
           { label: 'Focus Hours', value: (analytics.totalFocusTime / 60).toFixed(1) + 'h', icon: Clock, color: 'text-orange-500' },
           { label: 'Active Streak', value: `${analytics.streak} DAYS`, icon: Calendar, color: 'text-green-500' },
         ].map((stat, i) => (
           <motion.div 
             key={i}
             whileHover={{ scale: 1.02 }}
             className="glass-panel p-5 flex items-center gap-4 border-b-4 border-b-black/50"
           >
             <div className={`p-3 rounded-lg bg-black/40 border-2 border-black ${stat.color}`}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="font-lexend font-black text-xl italic">{stat.value}</p>
             </div>
           </motion.div>
         ))}
      </div>

      {analytics.focusScore < 40 && analytics.sessionsDone > 0 && (
        <section className="glass-panel p-8 relative overflow-hidden">
           <div className="flex gap-4 items-start">
              <div className="shrink-0 p-3 bg-red-500/10 border-2 border-red-500/20 rounded-full text-red-500">
                 <AlertCircle size={32} />
              </div>
              <div>
                 <h3 className="font-lexend font-black uppercase text-xl text-red-400 mb-2 italic tracking-tighter">AI DIAGNOSIS: FOCUS DILUTION</h3>
                 <p className="text-slate-400 max-w-2xl font-medium">
                   Strategic analysis suggests your focus consistency is below optimal levels. Frequent interruptions or short sessions are diluting your XP gains. Recommendation: Initiate 'Deep Focus' protocol for at least 50 minutes.
                 </p>
                 <div className="flex gap-4 mt-6">
                    <button className="px-6 py-2 bg-red-600 text-white font-lexend font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">Accept Protocol</button>
                    <button className="px-6 py-2 bg-slate-800 text-slate-400 font-lexend font-black uppercase text-xs tracking-widest border-2 border-black hover:text-white transition-colors">Ignore Intel</button>
                 </div>
              </div>
           </div>
        </section>
      )}

      {analytics.focusScore >= 80 && (
         <section className="glass-panel p-8 relative overflow-hidden bg-green-500/10">
            <div className="flex gap-4 items-start">
               <div className="shrink-0 p-3 bg-green-500/10 border-2 border-green-500/20 rounded-full text-green-500">
                  <TrendingUp size={32} />
               </div>
               <div>
                  <h3 className="font-lexend font-black uppercase text-xl text-green-400 mb-2 italic tracking-tighter">AI STATUS: PEAK PERFORMANCE</h3>
                  <p className="text-slate-400 max-w-2xl font-medium">
                    Neural synchronization is at maximum capacity. Your current streak and session volume place you in the top 5% of ARIA operatives. Maintain this velocity to unlock legendary tier missions.
                  </p>
               </div>
            </div>
         </section>
      )}
    </div>
  );
}
