import { motion } from 'motion/react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  ArrowUp,
  Zap,
  Target
} from 'lucide-react';

const users = [
  { id: 1, name: 'VortexScholar', level: 42, xp: 95400, rank: 1, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrUZNMzZANnUV5NoawLxK8lQDCNt1U7cmeGpgYkmmM_-N9FC1YigEo2FwDT2zn8xyyu6tQkGyatHK0YZcEFATgmk_51JBEMouf5G-SETso28qnxL1utgF4HIBWIdAlpc4AY9aIERYzpxcyoudV3nLJu7ns8bSxaGTc54wme5RQXMBo6ylLQ-OWyNuB0jzxdV6GUHsaXy_Skp-7O_e4JFrC1Eik6uM2O0vZbqFQOIWx1bzheIAi7F_DchSPlmy95Gewftq9x6V6Gnqk' },
  { id: 2, name: 'QuantumMind', level: 38, xp: 82100, rank: 2, avatar: '' },
  { id: 3, name: 'CyberSage', level: 36, xp: 75000, rank: 3, avatar: '' },
  { id: 4, name: 'NeonKnight', level: 31, xp: 64200, rank: 4, avatar: '' },
  { id: 5, name: 'ProtoHero', level: 29, xp: 58000, rank: 5, avatar: '' },
];

export default function HallOfFame() {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(123,92,240,1)]">HALL OF FAME</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Honoring the legends of the ARIA</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel overflow-hidden">
             <div className="p-6 border-b-2 border-black flex items-center justify-between bg-slate-900/50">
                <h3 className="font-lexend font-black uppercase tracking-tight flex items-center gap-2">
                   <Medal className="text-yellow-400" />
                   Leaderboard: Global Scholars
                </h3>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Season 4 • Week 12</span>
             </div>
             
             <div className="divide-y divide-black/10">
                {users.map((user, i) => (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 flex items-center gap-6 group hover:bg-white/5 transition-colors cursor-pointer ${
                      user.rank === 1 ? 'bg-violet-600/10' : ''
                    }`}
                  >
                    <div className="w-12 text-center">
                       {user.rank === 1 ? <Crown className="text-yellow-400 mx-auto" /> : 
                        <span className="font-bangers text-3xl text-slate-500 group-hover:text-white transition-colors">#{user.rank}</span>}
                    </div>
                    
                    <div className="w-12 h-12 rounded bg-slate-800 border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                       <img src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1">
                       <h4 className="font-lexend font-black uppercase text-lg group-hover:text-cyan-400 transition-colors">{user.name}</h4>
                       <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lv. {user.level}</span>
                          <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden">
                             <div className="h-full bg-violet-500 w-3/4" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="text-right">
                       <p className="font-bangers text-2xl tracking-widest text-white">{user.xp.toLocaleString()}</p>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total XP</p>
                    </div>

                    <div className="w-8 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowUp size={16} className="text-green-500" />
                       <span className="text-[8px] font-black text-green-500">+12</span>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <section className="glass-panel p-6 bg-violet-600/40 relative overflow-hidden group">
              <h3 className="font-lexend font-black uppercase text-xl mb-4 italic flex items-center gap-2">
                 <Trophy className="text-yellow-400" />
                 Your Ranking
              </h3>
              <div className="relative z-10 flex flex-col items-center py-4 border-2 border-black rounded-xl bg-black/40 mb-4 h-48 justify-center">
                 <p className="text-slate-400 font-black uppercase text-xs tracking-widest mb-1">Global Standing</p>
                 <h4 className="font-bangers text-6xl text-white tracking-[0.2em] italic drop-shadow-[4px_4px_0px_rgba(123,92,240,1)]">#1</h4>
                 <div className="flex items-center gap-2 bg-green-500/20 text-green-500 px-3 py-1 rounded-full border border-green-500/20 mt-4">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase">Top of the World</span>
                 </div>
              </div>
              <p className="text-xs text-slate-400 font-medium text-center">You've maintained the #1 spot for <span className="text-white font-black">6 days</span>. Legend in the making!</p>
           </section>

           <section className="glass-panel p-6">
              <h3 className="font-lexend font-black uppercase text-lg mb-6 italic">Recent Feats</h3>
              <div className="space-y-4">
                 {[
                   { feat: 'Marathon Session', desc: 'Studied for 12 hours straight.', icon: Zap, color: 'text-orange-500' },
                   { feat: 'High Efficiency', desc: 'Maintained 95%+ focus score.', icon: Target, color: 'text-cyan-400' },
                   { feat: 'Perfect Week', desc: 'Completed all daily missions.', icon: Star, color: 'text-yellow-400' },
                 ].map((f, i) => (
                   <div key={i} className="flex gap-4 items-start border-l-2 border-black pl-4">
                      <f.icon className={`${f.color} shrink-0 mt-1`} size={20} />
                      <div>
                        <h5 className="font-lexend font-black uppercase text-xs italic">{f.feat}</h5>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{f.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
