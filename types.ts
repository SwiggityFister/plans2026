
export enum TaskStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  NOT_STARTED = 'not-started',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  date: string; // ISO format or YYYY-MM-DD
  day: number;
  month: number; // 0-11
}

export interface DayPlan {
  day: number;
  tasks: Task[];
  plannedCount: number;
  completedCount: number;
}

export interface MonthlyStats {
  totalPlanned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: keyof Task;
  direction: SortDirection;
}
