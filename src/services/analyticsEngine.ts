export interface SessionLog {
  id: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // seconds
  mode: string;
  subject?: string;
  completed: boolean;
}

export interface AnalyticsStats {
  totalFocusTime: number; // minutes
  sessionsDone: number;
  focusScore: number;
  streak: number;
  peakHour: number; // 0-23
  dailyTrend: { name: string; focus: number; efficiency: number }[];
  subjectMastery: { subject: string; mastery: number; color: string }[];
}

/**
 * ARIA Analytics Engine
 * Processes raw session logs into high-fidelity productivity metrics.
 */

export const calculateAnalytics = (logs: SessionLog[], tasksCompleted: number): AnalyticsStats => {
  if (logs.length === 0) {
    return {
      totalFocusTime: 0,
      sessionsDone: 0,
      focusScore: 0,
      streak: 0,
      peakHour: 0,
      dailyTrend: generateEmptyTrend(),
      subjectMastery: []
    };
  }

  const completedLogs = logs.filter(l => l.completed);
  const totalFocusTime = completedLogs.reduce((acc, log) => acc + log.duration, 0) / 60;
  
  // Calculate Streak
  const streak = calculateStreak(logs);
  
  // Calculate Peak Performance Hour
  const peakHour = calculatePeakHour(completedLogs);
  
  // Calculate Focus Score (0-100)
  // Formula: (Consistency * 0.4) + (Volume * 0.4) + (Task Adherence * 0.2)
  const consistency = Math.min(100, streak * 10); 
  const volume = Math.min(100, (totalFocusTime / 1200) * 100); // 20 hours = 100%
  const taskAdherence = Math.min(100, (tasksCompleted / 20) * 100);
  const focusScore = Math.floor(consistency * 0.4 + volume * 0.4 + taskAdherence * 0.2);

  // Generate Daily Trend for last 7 days
  const dailyTrend = generateDailyTrend(completedLogs);

  return {
    totalFocusTime: Math.floor(totalFocusTime),
    sessionsDone: completedLogs.length,
    focusScore,
    streak,
    peakHour,
    dailyTrend,
    subjectMastery: [] // This will be hydrated with mission data in GlobalContext
  };
};

const calculateStreak = (logs: SessionLog[]): number => {
  if (logs.length === 0) return 0;
  
  const days = Array.from(new Set(logs.map(l => new Date(l.endTime).toDateString()))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (days[0] !== today && days[0] !== yesterday) return 0;

  for (let i = 0; i < days.length; i++) {
    const current = new Date(days[i]);
    const prev = i === 0 ? new Date() : new Date(days[i-1]);
    
    // Check if consecutive
    const diff = Math.floor((prev.getTime() - current.getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const calculatePeakHour = (logs: SessionLog[]): number => {
  const hours = new Array(24).fill(0);
  logs.forEach(log => {
    const hour = new Date(log.endTime).getHours();
    hours[hour]++;
  });
  return hours.indexOf(Math.max(...hours));
};

const generateDailyTrend = (logs: SessionLog[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return last7Days.map(date => {
    const dayStr = date.toDateString();
    const dayLogs = logs.filter(l => new Date(l.endTime).toDateString() === dayStr);
    const focusTime = dayLogs.reduce((acc, l) => acc + l.duration, 0) / 60;
    
    return {
      name: days[date.getDay()],
      focus: Number(focusTime.toFixed(1)),
      efficiency: focusTime > 0 ? Math.min(100, Math.floor((focusTime / 300) * 100)) : 0 // 5 hours target
    };
  });
};

const generateEmptyTrend = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(d => ({ name: d, focus: 0, efficiency: 0 }));
};
