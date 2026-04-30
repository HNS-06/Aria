import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  Moon, 
  Hourglass, 
  Calendar, 
  ImagePlus, 
  User, 
  ShieldCheck, 
  Zap,
  Info
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

const avatars = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Bobo&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Cali&backgroundColor=ffd5dc',
];

const focusAreas = [
  'MEDICAL', 'ENGINEERING', 'COMPUTER SCIENCE', 'BUSINESS', 'LAW', 
  'PSYCHOLOGY', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'MATHEMATICS',
  'GRAPHIC DESIGN', 'AI SYSTEMS', 'DATA SCIENCE', 'ECONOMICS',
  'LITERATURE', 'HISTORY', 'PHILOSOPHY', 'ART & MUSIC', 'NURSING',
  'PHARMACY', 'ARCHITECTURE', 'JOURNALISM', 'EDUCATION', 'OTHER'
];

const studyStyles = [
  { id: 'DEEP FOCUS', title: 'DEEP FOCUS', desc: 'Long stretches of silence & intense flow.', icon: Clock, focus: '50m', break: '10m', behavior: 'Strict', hint: 'Best for complex problem solving' },
  { id: 'NIGHT OWL', title: 'NIGHT OWL', desc: 'High cognitive performance after sunset.', icon: Moon, focus: '90m', break: '15m', behavior: 'Flexible', hint: 'Ideal for late-night creative flow' },
  { id: 'SPRINTS', title: 'SPRINTS', desc: '25m work / 5m break loops.', icon: Hourglass, focus: '25m', break: '5m', behavior: 'Strict', hint: 'Perfect for rapid task clearing' },
];

export default function Onboarding() {
  const { completeOnboarding } = useGlobal();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('DEEP FOCUS');

  const handleFocusToggle = (area: string) => {
    if (selectedFocus.includes(area)) {
      setSelectedFocus(prev => prev.filter(a => a !== area));
    } else {
      setSelectedFocus(prev => [...prev, area]);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      name: name.trim() || 'Hero',
      avatar: selectedAvatar,
      studyFocus: selectedFocus,
      studyStyle: selectedStyle as any
    });
  };

  const currentImpact = studyStyles.find(s => s.id === selectedStyle);
  const profileCompletion = [
    name.trim().length > 0,
    selectedFocus.length > 0,
    deadline.length > 0
  ].filter(Boolean).length * 33;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-8 bg-[#101221] text-white overflow-y-auto halftone-bg">
      {/* Header Fix: Vertical Flex Container */}
      <div className="flex flex-col items-center gap-4 mb-12 relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-cyan-400 text-black px-4 py-1 rounded-full border-2 border-black font-black text-[10px] tracking-[0.2em] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          System Online
        </motion.div>
        <div className="text-center">
          <h1 className="font-lexend font-black uppercase tracking-tighter text-6xl italic text-violet-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] leading-none">ARIA</h1>
          <p className="font-lexend font-bold text-slate-400 uppercase tracking-widest mt-4 text-sm">INITIALIZE HERO PROTOCOL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full mb-12">
        {/* Panel 1: Profile & Identity */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#0b0d1c] border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col">
          <div className="absolute -top-4 -left-4 bg-violet-500 border-2 border-black px-3 py-1 font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 z-10 text-xs">PANEL 01</div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mt-4 mb-8">
              <div className="w-14 h-14 bg-cyan-200 border-2 border-black rounded-full flex items-center justify-center overflow-hidden shrink-0">
                <img src="https://api.dicebear.com/9.x/bottts/svg?seed=Aria&backgroundColor=b6e3f4" className="w-10 h-10" alt="Bot" />
              </div>
              <div className="bg-white text-black font-bold px-4 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs relative">
                "WHO ARE YOU, HERO?"
                <div className="absolute top-1/2 -left-2 w-3 h-3 bg-white border-l-2 border-b-2 border-black transform -translate-y-1/2 rotate-45"></div>
              </div>
            </div>

            <p className="font-lexend font-black text-[10px] text-slate-500 uppercase tracking-widest mb-4">Select Identification</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {avatars.map((av, idx) => (
                <button key={idx} onClick={() => setSelectedAvatar(av)} className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all relative ${selectedAvatar === av ? 'border-violet-400 scale-110 shadow-[4px_4px_0px_0px_rgba(167,139,250,0.3)] z-10' : 'border-black bg-[#1d1e2e] hover:border-slate-600'}`}>
                  <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  {selectedAvatar === av && <div className="absolute inset-0 border-2 border-violet-400 rounded-xl pointer-events-none" />}
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-8">
               <label className="font-lexend font-black text-[10px] text-slate-500 uppercase tracking-widest">Callsign</label>
               <input 
                type="text" 
                placeholder="ENTER HERO NAME..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1d1e2e] border-2 border-black rounded-xl p-4 focus:border-violet-500 outline-none font-black uppercase text-sm tracking-widest placeholder:text-slate-700 transition-all text-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {/* ADDED: Agent Summary Card & Status Indicator */}
          <div className="mt-8 space-y-4">
            <div className="bg-black/40 border-2 border-black rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-violet-400" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Agent Intel</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded border border-violet-500/30">{profileCompletion}% SYNC</span>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center overflow-hidden">
                   <img src={selectedAvatar} className="w-full h-full object-cover" alt="Selected" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-lexend font-black uppercase text-xs truncate">{name || '---'}</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase truncate">Sector: {selectedFocus[0] || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border-2 border-green-500/20 rounded-lg text-green-400">
               <ShieldCheck size={14} className={name ? 'animate-pulse' : 'opacity-30'} />
               <span className="text-[9px] font-black uppercase tracking-widest">Status: {name ? 'Ready for Deployment' : 'Awaiting Data'}</span>
            </div>
          </div>
        </motion.div>

        {/* Panel 2: Objectives & Timeline */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0b0d1c] border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col">
          <div className="absolute -top-4 -left-4 bg-cyan-400 text-black border-2 border-black px-3 py-1 font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-2 z-10 text-xs">PANEL 02</div>
          
          <p className="font-lexend font-black uppercase text-cyan-400 text-[10px] tracking-widest mt-4 mb-4">Operational Sectors</p>
          <div className="flex flex-wrap gap-2 mb-10 overflow-y-auto max-h-[300px] futuristic-scroll pr-4">
            {focusAreas.map(area => (
              <button 
                key={area}
                onClick={() => handleFocusToggle(area)}
                className={`px-3 py-1.5 rounded-lg border-2 text-[9px] font-black tracking-widest transition-all ${selectedFocus.includes(area) ? 'bg-cyan-400 border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-slate-800 bg-[#1d1e2e] text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <p className="font-lexend font-black uppercase text-slate-500 text-[10px] tracking-widest">Mission Deadline</p>
            <div className="relative group">
               <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 group-focus-within:scale-110 transition-transform" size={18} />
               <input 
                type="text" 
                placeholder="E.G. FINALS WEEK, MAY 2024" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#1d1e2e] border-2 border-black rounded-xl pl-12 pr-4 py-4 focus:border-cyan-400 outline-none font-black uppercase text-xs tracking-widest placeholder:text-slate-700 transition-all text-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="p-4 border-2 border-dashed border-black rounded-xl text-center">
               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Temporal tracking enabled for target date</p>
            </div>
          </div>
        </motion.div>

        {/* Panel 3: Tactical Style */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#0b0d1c] border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col">
          <div className="absolute -top-4 -left-4 bg-orange-500 text-black border-2 border-black px-3 py-1 font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 z-10 text-xs">PANEL 03</div>
          
          <div className="flex-1">
            <p className="font-lexend font-black uppercase text-orange-400 text-[10px] tracking-widest mt-4 mb-6">Cognitive Protocol</p>
            <div className="space-y-4">
              {studyStyles.map(style => {
                const Icon = style.icon;
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group ${isSelected ? 'border-orange-500 bg-orange-500/5 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.2)]' : 'border-slate-800 bg-[#1d1e2e] hover:border-slate-700'}`}
                  >
                    <div className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-orange-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-800 text-slate-500 border-black'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-lexend font-black uppercase text-xs tracking-widest ${isSelected ? 'text-white' : 'text-slate-400'}`}>{style.title}</h4>
                      <p className="text-[9px] font-bold text-slate-600 uppercase truncate group-hover:text-slate-500">{style.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ADDED: Mode Impact Preview & AI Hint */}
          <div className="mt-8 space-y-4">
             <div className="bg-black/40 border-2 border-black rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Zap size={14} className="text-orange-400" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Impact Forecast</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-600 uppercase">Focus Unit</p>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-orange-500" />
                      <span className="font-bangers text-xl text-white tracking-wider">{currentImpact?.focus}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-600 uppercase">Behavior</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-green-500" />
                      <span className="font-lexend font-black text-[10px] text-white uppercase">{currentImpact?.behavior}</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="flex items-start gap-3 px-4 py-3 bg-violet-500/10 border-2 border-violet-500/20 rounded-lg text-violet-400">
                <Info size={14} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none">AI Recommendation</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase leading-tight italic">{currentImpact?.hint}</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col items-center mt-auto">
        <div className="flex gap-3 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${i === 0 ? 'bg-violet-500' : 'bg-slate-800'}`}></div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={handleFinish}
            className="group relative bg-violet-600 text-white px-12 py-5 rounded-2xl border-4 border-black font-lexend font-black text-2xl uppercase tracking-tighter italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="group-hover:rotate-12 transition-transform" />
            <span>DEPLOY INTERFACE</span>
          </button>

          <button onClick={handleFinish} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors">
            Skip Initialization Protocol
          </button>
        </div>
      </div>
    </div>
  );
}
