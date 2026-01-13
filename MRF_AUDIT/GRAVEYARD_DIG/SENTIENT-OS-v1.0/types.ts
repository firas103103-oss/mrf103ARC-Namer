
export enum Mode {
  DAILY = 'DAILY',
  DRIVING = 'DRIVING',
  WORK = 'WORK',
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Notification {
  id: number;
  app: string;
  title: string;
  message: string;
  time: string;
}

export interface Email {
  id: number;
  from: string;
  subject: string;
  snippet: string;
  read: boolean;
}

export interface Project {
    id: number;
    name: string;
    progress: number;
    status: 'On Track' | 'At Risk' | 'Delayed';
}
