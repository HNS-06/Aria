import { motion } from 'motion/react';
import { 
  User, 
  Clock, 
  Palette, 
  Bell, 
  Volume2, 
  Brain, 
  RotateCcw,
  ShieldCheck,
  Zap,
  Save,
  Moon,
  Sun,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { useGlobal, StudyMode } from '../context/GlobalContext';

export default function Settings() {
  const { settings, updateSettings, fullFactoryReset, user, setUser } = useGlobal();

  const handleThemeChange = (theme: 'dark' | 'light' | 'amoled') => {
    updateSettings({ theme });
  };

  const handleDurationChange = (mode: StudyMode, value: number) => {
    updateSettings({
      durations: {
        ...settings.durations,
        [mode]: value
      }
    });
  };

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      updateSettings({ [key]: !settings[key] });
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <header>
        <h2 className="font-lexend font-black text-4xl uppercase tracking-tighter italic text-white drop-shadow-[3px_3px_0px_rgba(34,211,238,1)]">SYSTEM PARAMETERS</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Configure your tactical environment</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <section className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <User className="text-cyan-400" size={24} />
            <h3 className="font-lexend font-black uppercase text-xl italic">Operator Profile</h3>
          </div>
          
          <div className="flex items-center gap-6 p-4 bg-black/40 border-2 border-black rounded-xl">
            <div className="relative group">
              <img 
                src={user?.avatar} 
                alt="Avatar" 
                className="w-20 h-20 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              />
              <button className="absolute -bottom-2 -right-2 bg-cyan-400 text-black p-1.5 rounded-lg border-2 border-black hover:scale-110 transition-transform">
                <Palette size={14} />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              <input 
                type="text" 
                value={user?.name}
                onChange={(e) => setUser(user ? { ...user, name: e.target.value } : null)}
                className="bg-transparent border-b-2 border-black focus:border-cyan-400 outline-none font-lexend font-black uppercase text-lg w-full text-white placeholder:text-slate-600"
                placeholder="Enter Callsign..."
              />
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level {user?.level} Elite Operator</span>
              </div>
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Palette className="text-violet-500" size={24} />
            <h3 className="font-lexend font-black uppercase text-xl italic">Visual Interface</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'dark', label: 'Dark', icon: Moon, color: 'bg-slate-900' },
              { id: 'light', label: 'Light', icon: Sun, color: 'bg-white text-black' },
              { id: 'amoled', label: 'OLED', icon: Monitor, color: 'bg-black border-slate-800' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as any)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  settings.theme === t.id 
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-[4px_4px_0px_rgba(34,211,238,1)] scale-105' 
                    : 'border-black bg-black/40 hover:border-slate-600'
                }`}
              >
                <t.icon size={20} className={settings.theme === t.id ? 'text-cyan-400' : 'text-slate-400'} />
                <span className="font-lexend font-black uppercase text-[10px] tracking-widest">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Timer Durations */}
        <section className="glass-panel p-8 space-y-6 md:col-span-2">
          <div className="flex items-center gap-4 mb-2">
            <Clock className="text-orange-500" size={24} />
            <h3 className="font-lexend font-black uppercase text-xl italic">Temporal Calibration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.values(StudyMode).map((mode) => (
              <div key={mode} className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{mode}</label>
                  <span className="font-bangers text-2xl text-white">{settings.durations[mode]}M</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="5"
                  value={settings.durations[mode]}
                  onChange={(e) => handleDurationChange(mode, parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-black border border-black rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase">
                  <span>5m</span>
                  <span>120m</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tactical Toggles */}
        <section className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <ShieldCheck className="text-green-500" size={24} />
            <h3 className="font-lexend font-black uppercase text-xl italic">Tactical Toggles</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 'notificationsEnabled', label: 'Neural Alerts', icon: Bell, desc: 'Enable Dynamic Island notifications' },
              { id: 'soundEnabled', label: 'Audio Feedback', icon: Volume2, desc: 'Enable tactical sound effects' },
              { id: 'aiSchedulingEnabled', label: 'AI Assistance', icon: Brain, desc: 'Allow AI to optimize schedule' },
              { id: 'autoStartFocus', label: 'Auto-Start Focus', icon: Zap, desc: 'Automatically begin focus sessions' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-black/40 border-2 border-black rounded-xl group hover:border-slate-700 transition-colors">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg border-2 border-black ${settings[item.id as keyof typeof settings] ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-500'}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-lexend font-black uppercase text-xs text-white">{item.label}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle(item.id as any)}
                  className={`w-12 h-6 rounded-full border-2 border-black relative transition-colors ${settings[item.id as keyof typeof settings] ? 'bg-cyan-400' : 'bg-slate-800'}`}
                >
                  <motion.div 
                    animate={{ x: settings[item.id as keyof typeof settings] ? 24 : 2 }}
                    className="absolute top-0.5 w-4 h-4 bg-white border-2 border-black rounded-full"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone / Global Actions */}
        <section className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <RotateCcw className="text-red-500" size={24} />
            <h3 className="font-lexend font-black uppercase text-xl italic">System Recovery</h3>
          </div>
          
          <div className="space-y-4">
             <button 
              onClick={() => {
                const confirmed = window.confirm("Are you sure? This will restore all system parameters to factory defaults.");
                if (confirmed) fullFactoryReset();
              }}
              className="w-full flex items-center justify-between p-4 bg-red-600/10 border-2 border-red-600/30 hover:border-red-600 rounded-xl transition-all group"
            >
              <div className="text-left">
                <h4 className="font-lexend font-black uppercase text-xs text-red-500">Factory Reset</h4>
                <p className="text-[9px] font-bold text-red-400/60 uppercase tracking-tighter">Wipe all custom parameters</p>
              </div>
              <RotateCcw size={20} className="text-red-500 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            <div className="p-6 border-4 border-dashed border-black rounded-xl text-center opacity-30 mt-4">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-500" />
              <p className="font-bangers text-xl tracking-widest text-slate-500 uppercase leading-none">All Systems Optimal</p>
              <p className="text-[8px] font-black uppercase mt-1">Firmware v1.0.4 - ARIA Intelligence</p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-4 pt-8">
        <div className="flex items-center gap-2 text-cyan-400 font-lexend font-black uppercase text-[10px] tracking-widest animate-pulse">
           <Save size={14} />
           <span>Live Synced to Neural Map</span>
        </div>
      </div>
    </div>
  );
}
