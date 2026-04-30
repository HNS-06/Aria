import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Zap, 
  Target, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  BrainCircuit,
  Info,
  Flame,
  Coffee,
  LucideIcon
} from 'lucide-react';

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type NotificationType = 'TIMER' | 'SCHEDULE' | 'INSIGHT' | 'AI';

export interface ARIA_Notification {
  id: string;
  title: string;
  message: string;
  icon: LucideIcon;
  type: NotificationType;
  priority: NotificationPriority;
  duration?: number;
}

interface NotificationContextType {
  addNotification: (notification: Omit<ARIA_Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>(null!);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<ARIA_Notification[]>([]);
  const [active, setActive] = useState<ARIA_Notification | null>(null);
  const isProcessing = useRef(false);

  const addNotification = useCallback((n: Omit<ARIA_Notification, 'id'>) => {
    const id = crypto.randomUUID();
    setQueue(prev => {
      // Avoid duplicates for the same message in the queue
      if (prev.some(item => item.title === n.title && item.message === n.message)) return prev;
      
      const newNotification = { ...n, id };
      const newQueue = [...prev, newNotification];
      
      // Sort by priority: HIGH > MEDIUM > LOW
      return newQueue.sort((a, b) => {
        const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorities[b.priority] - priorities[a.priority];
      });
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setActive(null);
    setQueue(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (!active && queue.length > 0) {
      const next = queue[0];
      setActive(next);
      
      const duration = next.duration || (next.priority === 'HIGH' ? 6000 : 4000);
      const timer = setTimeout(() => {
        removeNotification(next.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, queue, removeNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <DynamicIsland active={active} onDismiss={() => active && removeNotification(active.id)} />
    </NotificationContext.Provider>
  );
};

const DynamicIsland = ({ active, onDismiss }: { active: ARIA_Notification | null, onDismiss: () => void }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ y: -100, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -20, scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto cursor-pointer"
            onClick={onDismiss}
          >
            <div className={`
              min-w-[200px] max-w-[400px] bg-black border-2 border-black p-4 rounded-[2rem] 
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 relative overflow-hidden
              ${active.priority === 'HIGH' ? 'ring-4 ring-cyan-400/30' : ''}
            `}>
              <div className="absolute inset-0 halftone-bg opacity-10" />
              
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-black
                ${active.priority === 'HIGH' ? 'bg-cyan-400 text-black' : 
                  active.priority === 'MEDIUM' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}
              `}>
                <active.icon size={24} />
              </div>

              <div className="flex-1 pr-4">
                <h4 className="font-lexend font-black uppercase text-xs tracking-widest text-slate-500 mb-0.5">
                  {active.type} | {active.priority}
                </h4>
                <p className="font-lexend font-black uppercase text-sm italic text-white leading-tight">
                  {active.title}
                </p>
                <p className="font-bold text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                  {active.message}
                </p>
              </div>

              {active.priority === 'HIGH' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-400 animate-pulse" />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-8 bg-black rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">System Online</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
