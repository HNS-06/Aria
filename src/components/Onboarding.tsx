import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, Moon, Hourglass, Calendar, ImagePlus } from 'lucide-react';
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
  { id: 'DEEP FOCUS', title: 'DEEP FOCUS', desc: 'Long stretches of silence & intense flow.', icon: Clock },
  { id: 'NIGHT OWL', title: 'NIGHT OWL', desc: 'High cognitive performance after sunset.', icon: Moon },
  { id: 'SPRINTS', title: 'SPRINTS', desc: '25m work / 5m break loops.', icon: Hourglass },
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
      studyStyle: selectedStyle
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#101221] text-white overflow-y-auto">
      <div className="text-center mb-12">
        <h1 className="font-lexend font-black uppercase tracking-tighter text-5xl italic text-violet-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">ARIA</h1>
        <p className="font-lexend font-bold text-slate-400 uppercase tracking-widest mt-2 text-sm">INITIALIZE HERO PROTOCOL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Panel 1 */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#0b0d1c] border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -left-4 bg-violet-500 border-2 border-black px-3 py-1 font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">PANEL 01</div>
          
          <div className="flex items-center gap-4 mt-6 mb-8">
            <div className="w-16 h-16 bg-cyan-200 border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Assistant&backgroundColor=c0aede" className="w-12 h-12" alt="Bot" />
            </div>
            <div className="bg-white text-black font-bold px-4 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 relative">
              "WHO ARE YOU, HERO?"
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white border-l-2 border-b-2 border-black transform -translate-y-1/2 rotate-45"></div>
            </div>
          </div>

          <p className="font-lexend font-bold text-sm mb-4">Avatar Picker</p>
          <div className="flex gap-4 mb-8">
            {avatars.map((av, idx) => (
              <button key={idx} onClick={() => setSelectedAvatar(av)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${selectedAvatar === av ? 'border-violet-400 scale-110 shadow-[4px_4px_0px_0px_rgba(167,139,250,0.5)]' : 'border-black hover:scale-105'}`}>
                <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
            <button className="w-16 h-16 rounded-lg border-2 border-slate-600 bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <ImagePlus size={24} className="text-slate-400" />
            </button>
          </div>

          <input 
            type="text" 
            placeholder="Enter your hero name..." 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1d1e2e] border-2 border-black rounded-lg p-4 focus:ring-4 focus:ring-violet-500/20 outline-none font-bold placeholder:text-slate-600 transition-all text-white"
          />
        </motion.div>

        {/* Panel 2 */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0b0d1c] border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -left-4 bg-cyan-400 text-black border-2 border-black px-3 py-1 font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-2">PANEL 02</div>
          
          <p className="font-lexend font-black uppercase text-cyan-400 tracking-widest mt-6 mb-4">WHAT ARE YOU STUDYING?</p>
          <div className="flex flex-wrap gap-3 mb-10">
            {focusAreas.map(area => (
              <button 
                key={area}
                onClick={() => handleFocusToggle(area)}
                className={`px-4 py-2 rounded-full border-2 text-xs font-bold transition-all ${selectedFocus.includes(area) ? 'bg-cyan-400 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}
              >
                {area}
              </button>
            ))}
          </div>

          <p className="font-lexend font-black uppercase text-slate-400 tracking-widest mb-4">MISSION DEADLINE (GOAL DATE)</p>
          <div className="relative">
             <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-400" />
             <input 
              type="text" 
              placeholder="e.g. Finals Week, May 2024" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#1d1e2e] border-2 border-black rounded-lg p-4 focus:ring-4 focus:ring-cyan-400/20 outline-none font-bold placeholder:text-slate-600 transition-all text-white"
            />
          </div>
        </motion.div>

        {/* Panel 3 */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#0b0d1c] border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -left-4 bg-orange-500 text-black border-2 border-black px-3 py-1 font-black italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">PANEL 03</div>
          
          <p className="font-lexend font-black uppercase text-orange-400 tracking-widest mt-6 mb-6">HOW DO YOU STUDY BEST?</p>
          <div className="space-y-4">
            {studyStyles.map(style => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-violet-500 border-dashed bg-violet-500/10' : 'border-slate-800 bg-[#1d1e2e] hover:border-slate-600'}`}
                >
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{style.title}</h4>
                    <p className="text-xs text-slate-500">{style.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="mt-16 flex flex-col items-center">
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 bg-violet-500 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></div>
          <div className="w-3 h-3 bg-violet-500 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></div>
          <div className="w-3 h-3 bg-violet-500 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>

        <button 
          onClick={handleFinish}
          className="bg-violet-500 text-white px-12 py-5 rounded-xl border-4 border-black font-lexend font-black text-xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-3"
        >
          <Sparkles /> LET VERTEX BUILD YOUR PLAN!
        </button>

        <button onClick={handleFinish} className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
          SKIP FOR NOW
        </button>
      </div>
    </div>
  );
}
