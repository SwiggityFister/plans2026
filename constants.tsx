
import React from 'react';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { TaskStatus } from './types';

export const COLORS = {
  primary: '#d1a398', // Dusty Rose
  secondary: '#7b9a95', // Muted Teal
  background: '#fcf9f7',
  text: '#4a4a4a',
  accent: '#e8d5cf'
};

export const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.COMPLETED]: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  [TaskStatus.IN_PROGRESS]: <Clock className="w-4 h-4 text-amber-500" />,
  [TaskStatus.NOT_STARTED]: <Circle className="w-4 h-4 text-slate-300" />,
  [TaskStatus.CANCELLED]: <XCircle className="w-4 h-4 text-rose-400" />
};

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PRIORITY_ITEMS = [
  "Quarterly Performance Review Meeting",
  "Design Review for Project AI",
  "Website Redesign Proposal",
  "Customer Success Strategy Planning"
];
