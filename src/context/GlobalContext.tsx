import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SystemEvent } from '../types';
import { calculateAnalytics, type SessionLog, type AnalyticsStats } from '../services/analyticsEngine';
import { useNotification } from './NotificationContext';
import { Clock, Zap, Target, Flame, BrainCircuit, Coffee, CheckCircle2 } from 'lucide-react';

export enum StudyMode {
  DEEP_FOCUS = 'DEEP FOCUS',
  LIGHT_REVIEW = 'LIGHT REVIEW',
  CREATIVE_WORK = 'CREATIVE WORK'
}

export interface UserProfile {
  name: string;
  avatar: string;
  studyFocus: string[];
  studyStyle: StudyMode;
  level: number;
  xp: number;
  streak: number;
  totalFocusTime: number; // in minutes
  focusScore: number;
  sessionsDone: number;
}

export interface Mission {
  id: number;
  title: string;
  progress: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  time: string;
  type: 'CORE' | 'TACTICAL' | 'INTEL' | 'COMBAT' | 'RESEARCH' | 'SUPPORT';
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'subject' | 'topic' | 'subtopic';
  parentId?: string;
  children?: string[];
}

export interface Note {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  color: string;
}

export interface TimerState {
  isActive: boolean;
  timeLeft: number; // in seconds
  mode: StudyMode;
  endTime: number | null; // Timestamp (ms) when timer should end
  duration: number; // in seconds
}

interface GlobalContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  missions: Mission[];
  setMissions: (missions: Mission[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  knowledgeMap: KnowledgeNode[];
  setKnowledgeMap: (map: KnowledgeNode[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  timer: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: StudyMode) => void;
  updateXp: (amount: number) => void;
  hasOnboarded: boolean;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addKnowledgeNode: (node: Omit<KnowledgeNode, 'id'>) => void;
  deleteKnowledgeNode: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'date' | 'color'>) => void;
  deleteNote: (id: string) => void;
  analytics: AnalyticsStats;
}

const GlobalContext = createContext<GlobalContextType>(null!);

export const useGlobal = () => useContext(GlobalContext);

const STORAGE_KEYS = {
  USER: 'aria_user_profile',
  MISSIONS: 'aria_missions',
  TASKS: 'aria_tasks',
  KNOWLEDGE_MAP: 'aria_knowledge_map',
  NOTES: 'aria_notes',
  TIMER: 'aria_timer_state',
  LOGS: 'aria_session_logs'
};

const safeParse = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`[SafeParse] Error parsing ${key}:`, e);
    return defaultValue;
  }
};

const getDurationForMode = (mode: StudyMode) => {
  switch (mode) {
    case StudyMode.DEEP_FOCUS: return 50 * 60;
    case StudyMode.LIGHT_REVIEW: return 25 * 60;
    case StudyMode.CREATIVE_WORK: return 60 * 60;
    default: return 25 * 60;
  }
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const [user, setUser] = useState<UserProfile | null>(() => safeParse(STORAGE_KEYS.USER, null));
  const [missions, setMissions] = useState<Mission[]>(() => safeParse(STORAGE_KEYS.MISSIONS, [
    { id: 1, title: 'Conquer Differential Equations', progress: 65, color: 'bg-cyan-400' },
    { id: 2, title: 'Mastering React Internals', progress: 30, color: 'bg-violet-500' },
    { id: 3, title: 'History of the Multiverse', progress: 10, color: 'bg-orange-500' },
  ]));
  const [tasks, setTasks] = useState<Task[]>(() => safeParse(STORAGE_KEYS.TASKS, []));
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeNode[]>(() => safeParse(STORAGE_KEYS.KNOWLEDGE_MAP, []));
  const [notes, setNotes] = useState<Note[]>(() => safeParse(STORAGE_KEYS.NOTES, []));
  const [logs, setLogs] = useState<SessionLog[]>(() => safeParse(STORAGE_KEYS.LOGS, []));

  const [timer, setTimer] = useState<TimerState>(() => {
    const saved = safeParse<TimerState | null>(STORAGE_KEYS.TIMER, null);
    if (saved && saved.isActive && saved.endTime) {
      const remaining = Math.max(0, Math.floor((saved.endTime - Date.now()) / 1000));
      return { ...saved, timeLeft: remaining, isActive: remaining > 0, endTime: remaining > 0 ? saved.endTime : null };
    }
    return saved || {
      isActive: false,
      timeLeft: 25 * 60,
      mode: StudyMode.DEEP_FOCUS,
      endTime: null,
      duration: 25 * 60
    };
  });

  const analytics = useMemo(() => {
    const stats = calculateAnalytics(logs, tasks.filter(t => t.completed).length);
    stats.subjectMastery = missions.map(m => ({
      subject: m.title.split(' ').slice(-1)[0],
      mastery: m.progress,
      color: m.color.replace('bg-', '')
    }));
    return stats;
  }, [logs, tasks, missions]);

  useEffect(() => {
    if (user && (user.streak !== analytics.streak || user.focusScore !== analytics.focusScore || user.sessionsDone !== analytics.sessionsDone || user.totalFocusTime !== analytics.totalFocusTime)) {
      
      // Notify on streak increase
      if (analytics.streak > user.streak) {
        addNotification({
          title: "Streak Extended!",
          message: `You've maintained consistency for ${analytics.streak} days. Keep the momentum!`,
          icon: Flame,
          type: 'INSIGHT',
          priority: 'MEDIUM'
        });
      }

      setUser(prev => prev ? ({
        ...prev,
        streak: analytics.streak,
        focusScore: analytics.focusScore,
        sessionsDone: analytics.sessionsDone,
        totalFocusTime: analytics.totalFocusTime
      }) : null);
    }
  }, [analytics, user, addNotification]);

  const socketRef = useRef<Socket | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warnedRef = useRef(false);

  const updateXp = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      if (newLevel > prev.level) {
        addNotification({
          title: "Level Up!",
          message: `You've reached level ${newLevel}. Tactical capabilities expanded.`,
          icon: Zap,
          type: 'INSIGHT',
          priority: 'HIGH'
        });
      }
      
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, [addNotification]);

  const logSession = useCallback((session: Omit<SessionLog, 'id'>) => {
    const newLog = { ...session, id: crypto.randomUUID() };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setTimer(prev => {
      const duration = prev.duration;
      const minutes = Math.floor(duration / 60);
      
      logSession({
        startTime: prev.endTime ? prev.endTime - duration * 1000 : Date.now() - duration * 1000,
        endTime: Date.now(),
        duration,
        mode: prev.mode,
        completed: true
      });

      addNotification({
        title: "Session Completed!",
        message: `Great work! ${minutes} minutes of ${prev.mode} finalized.`,
        icon: CheckCircle2,
        type: 'TIMER',
        priority: 'HIGH'
      });

      updateXp(minutes * 10);
      warnedRef.current = false;
      return { ...prev, isActive: false, timeLeft: 0, endTime: null };
    });
  }, [logSession, updateXp, addNotification]);

  useEffect(() => {
    if (timer.isActive && timer.endTime) {
      timerIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timer.endTime! - Date.now()) / 1000));
        
        // 1 minute warning
        if (remaining <= 60 && remaining > 55 && !warnedRef.current) {
          warnedRef.current = true;
          addNotification({
            title: "1 Minute Remaining",
            message: "Prepare to wrap up your current focus unit.",
            icon: Clock,
            type: 'TIMER',
            priority: 'MEDIUM'
          });
        }

        if (remaining <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleTimerComplete();
        } else {
          setTimer(prev => ({ ...prev, timeLeft: remaining }));
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timer.isActive, timer.endTime, handleTimerComplete, addNotification]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer));
  }, [timer.isActive, timer.mode, timer.endTime]);

  useEffect(() => {
    const handleUnload = () => localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer));
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [timer]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && timer.isActive && timer.endTime) {
        const remaining = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
        setTimer(prev => ({ ...prev, timeLeft: remaining }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timer.isActive, timer.endTime]);

  const startTimer = () => {
    const duration = timer.timeLeft;
    const endTime = Date.now() + duration * 1000;
    setTimer(prev => ({ ...prev, isActive: true, endTime }));
    
    addNotification({
      title: "Focus Initiated",
      message: `${Math.floor(duration / 60)}m ${timer.mode} protocol active.`,
      icon: Target,
      type: 'TIMER',
      priority: 'LOW'
    });
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isActive: true, endTime: null })); // isActive stays true to show it's "paused" but state is active? 
    // Actually, timer.isActive means it's RUNNING.
    setTimer(prev => ({ ...prev, isActive: false, endTime: null }));
    
    addNotification({
      title: "Focus Paused",
      message: "Neural synchronization suspended.",
      icon: Coffee,
      type: 'TIMER',
      priority: 'LOW'
    });
  };

  const resetTimer = () => {
    const duration = getDurationForMode(timer.mode);
    setTimer(prev => ({ ...prev, isActive: false, timeLeft: duration, endTime: null, duration }));
  };

  const setTimerMode = (mode: StudyMode) => {
    const duration = getDurationForMode(mode);
    setTimer(prev => ({ ...prev, mode, timeLeft: duration, duration, isActive: false, endTime: null }));
    
    addNotification({
      title: "Mode Shift",
      message: `Switched to ${mode}. Optimizing parameters.`,
      icon: BrainCircuit,
      type: 'AI',
      priority: 'MEDIUM'
    });
  };

  useEffect(() => { if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions)); }, [missions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_MAP, JSON.stringify(knowledgeMap)); }, [knowledgeMap]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)); }, [logs]);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    socketRef.current.on('connect', () => {
      socketRef.current?.emit(SystemEvent.NEURAL_SYNC, { status: 'ONLINE', timestamp: new Date() });
    });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const completeOnboarding = (profile: Partial<UserProfile>) => {
    setUser({
      name: profile.name || 'Hero',
      avatar: profile.avatar || 'https://api.dicebear.com/9.x/bottts/svg?seed=Aria&backgroundColor=b6e3f4',
      studyFocus: profile.studyFocus || [],
      studyStyle: (profile.studyStyle as StudyMode) || StudyMode.DEEP_FOCUS,
      level: 1, xp: 0, streak: 1, totalFocusTime: 0, focusScore: 0, sessionsDone: 0
    });
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    if (!task.title.trim()) return;
    const newTask: Task = { ...task, id: crypto.randomUUID(), completed: false };
    setTasks(prev => [...prev, newTask]);
    
    addNotification({
      title: "Mission Deployed",
      message: `New objective: ${task.title}`,
      icon: Target,
      type: 'SCHEDULE',
      priority: 'LOW'
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      const original = prev.find(t => t.id === id);
      
      if (updates.completed && !original?.completed) {
        addNotification({
          title: "Objective Secured",
          message: `Strategic mission '${original?.title}' completed.`,
          icon: CheckCircle2,
          type: 'SCHEDULE',
          priority: 'MEDIUM'
        });
        updateXp(100);
      }
      
      return updated;
    });
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const addKnowledgeNode = (node: Omit<KnowledgeNode, 'id'>) => {
    if (!node.label.trim()) return;
    const newNode: KnowledgeNode = { ...node, id: crypto.randomUUID(), children: [] };
    setKnowledgeMap(prev => {
      const updated = [...prev, newNode];
      if (node.parentId) {
        return updated.map(n => n.id === node.parentId ? { ...n, children: [...(n.children || []), newNode.id] } : n);
      }
      return updated;
    });
  };

  const deleteKnowledgeNode = (id: string) => {
    setKnowledgeMap(prev => {
      const filtered = prev.filter(n => n.id !== id);
      return filtered.map(n => ({ ...n, children: n.children?.filter(cId => cId !== id) }));
    });
  };

  const addNote = (note: Omit<Note, 'id' | 'date' | 'color'>) => {
    if (!note.title.trim()) return;
    const colors = ['border-cyan-400', 'border-violet-500', 'border-orange-500', 'border-pink-500'];
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      date: 'Just now',
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <GlobalContext.Provider value={{
      user, setUser, missions, setMissions, tasks, setTasks, knowledgeMap, setKnowledgeMap, notes, setNotes,
      timer, startTimer, pauseTimer, resetTimer, setTimerMode,
      updateXp, hasOnboarded: !!user, completeOnboarding,
      addTask, updateTask, deleteTask, addKnowledgeNode, deleteKnowledgeNode,
      addNote, deleteNote, analytics
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
