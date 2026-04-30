export enum Tab {
  HQ = 'hq',
  INTEL = 'intel',
  SCHEDULE = 'schedule',
  MAP = 'map',
  NOTES = 'notes',
  HALL_OF_FAME = 'hall_of_fame',
  PDF_LAB = 'pdf_lab',
  FOCUS = 'focus',
  SETTINGS = 'settings'
}

export enum SystemEvent {
  TASK_CREATED = 'TASK_CREATED',
  MISSION_UPDATED = 'MISSION_UPDATED',
  XP_GAINED = 'XP_GAINED',
  FOCUS_SESSION_COMPLETE = 'FOCUS_SESSION_COMPLETE',
  NEURAL_SYNC = 'NEURAL_SYNC'
}

export interface Mission {
  id: number;
  title: string;
  progress: number;
  color: string;
}

export interface UserStats {
  streak: number;
  xp: number;
  rank: string;
  focusScore: number;
  timeStudied: number;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'amoled';
  durations: {
    [key: string]: number; // minutes
  };
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  aiSchedulingEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}
