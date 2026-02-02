
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus,
  LayoutDashboard,
  ClipboardList,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Home,
  Calendar as CalendarIcon
} from 'lucide-react';
import { TaskStatus, TaskPriority, Task, MonthlyReview } from './types';
import { MONTHS, WEEKDAYS } from './constants';

type AppView = 'Dashboard' | 'Tasks';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('Dashboard');
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Record<number, MonthlyReview>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence: Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('annual_plan_tasks');
    const savedReviews = localStorage.getItem('annual_plan_reviews');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    setIsLoaded(true);
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('annual_plan_tasks', JSON.stringify(tasks));
      localStorage.setItem('annual_plan_reviews', JSON.stringify(reviews));
    }
  }, [tasks, reviews, isLoaded]);

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      month: currentMonth,
      day: new Date().getDate(),
      title: '',
      status: TaskStatus.NOT_STARTED,
      priority: TaskPriority.MEDIUM,
      date: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    setCurrentView('Tasks');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateReview = (field: keyof MonthlyReview, value: string) => {
    setReviews(prev => ({
      ...prev,
      [currentMonth]: {
        ...(prev[currentMonth] || { achievements: '', nextPlan: '' }),
        [field]: value
      }
    }));
  };

  const handleDownloadCSV = () => {
    if (tasks.length === 0) return alert("No tasks to export yet!");
    const headers = ['Month', 'Day', 'Task', 'Priority', 'Status'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(t => [MONTHS[t.month], t.day, `"${t.title}"`, t.priority, t.status].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `2026_Plan_${MONTHS[currentMonth]}.csv`;
    link.click();
  };

  const monthTasks = useMemo(() => 
    tasks.filter(t => t.month === currentMonth).sort((a, b) => a.day - b.day), 
    [tasks, currentMonth]
  );

  const pendingTasks = useMemo(() => 
    monthTasks.filter(t => t.status !== TaskStatus.COMPLETED),
    [monthTasks]
  );
  
  const stats = useMemo(() => {
    const total = monthTasks.length;
    const completed = monthTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const inProgress = monthTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const notStarted = monthTasks.filter(t => t.status === TaskStatus.NOT_STARTED).length;
    return {
      total,
      completed,
      inProgress,
      notStarted,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [monthTasks]);

  // Calendar Helper Logic for 2026
  const calendarDays = useMemo(() => {
    const year = 2026;
    const firstDayOfMonth = new Date(year, currentMonth, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
    
    // Adjust for Monday start: 0(Sun) -> 6, 1(Mon) -> 0...
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const blanks = Array(adjustedFirstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [currentMonth]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFCFB] text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
          <div className="w-10 h-10 bg-[#d1a398] rounded-xl flex items-center justify-center shadow-lg shadow-rose-100">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Plan <span className="text-[#d1a398]">2026</span></span>
        </div>
        <nav className="flex-grow p-4 space-y-2 mt-4">
          <NavButton active={currentView === 'Dashboard'} onClick={() => setCurrentView('Dashboard')} icon={<LayoutDashboard size={20} />} label="Overview Report" />
          <NavButton active={currentView === 'Tasks'} onClick={() => setCurrentView('Tasks')} icon={<ClipboardList size={20} />} label="Data Entry" />
        </nav>
        <div className="p-4 border-t border-slate-50">
          <button onClick={handleDownloadCSV} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden pb-16 lg:pb-0">
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(m => (m > 0 ? m - 1 : 11))} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={20} /></button>
            <h2 className="text-base lg:text-lg font-bold w-32 lg:w-48 text-center text-slate-700">
              {MONTHS[currentMonth]} 2026
            </h2>
            <button onClick={() => setCurrentMonth(m => (m < 11 ? m + 1 : 0))} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronRight size={20} /></button>
          </div>
          <button 
            onClick={handleAddTask}
            className="flex items-center justify-center h-10 px-4 bg-[#7b9a95] text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-50 hover:opacity-90 transition-all"
          >
            <Plus size={18} className="mr-1" /> Add Task
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          {currentView === 'Dashboard' ? (
            <div className="max-w-xl mx-auto space-y-10 pb-20">
              
              {/* Section 1: Planning Overview */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Monthly Plan Overview</span>
                </div>
                
                <div className="text-center space-y-1 py-4">
                  <div className="text-[72px] font-light leading-none text-[#d1a398]">{stats.total}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Tasks</div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>Completion Rate</span>
                      <span>{stats.rate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7b9a95] transition-all duration-700" style={{ width: `${stats.rate}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <StatBar label="Completed" value={stats.completed} total={stats.total} color="#d1a398" />
                    <StatBar label="In Progress" value={stats.inProgress} total={stats.total} color="#d1a398" />
                    <StatBar label="Not Started" value={stats.notStarted} total={stats.total} color="#d1a398" />
                  </div>
                </div>
              </section>

              {/* Section 2: Calendar */}
              <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Monthly Calendar</span>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl font-light text-[#d1a398]">{currentMonth + 1}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase leading-tight">
                      2026<br />{MONTHS[currentMonth]}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {['M','T','W','T','F','S','S'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-[#d1a398] py-2 border-b border-rose-50 mb-2">{d}</div>
                    ))}
                    {calendarDays.map((day, i) => (
                      <div key={i} className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg ${day ? (monthTasks.some(t => t.day === day) ? 'bg-[#d1a398]/10 text-[#d1a398] font-bold' : 'text-slate-400') : ''}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 3: Pending Tasks */}
              <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Monthly Pending Tasks</span>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm min-h-[200px]">
                  {pendingTasks.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {pendingTasks.map((task, idx) => (
                        <div key={task.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                          <span className="text-[10px] font-bold text-slate-300 w-4 pt-0.5">{idx + 1}</span>
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-slate-700">{task.title || 'Untitled Task'}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Day {task.day}</span>
                               <span className={`text-[9px] font-bold uppercase tracking-tighter ${task.status === TaskStatus.IN_PROGRESS ? 'text-amber-500' : 'text-slate-300'}`}>
                                 {task.status.replace('-', ' ')}
                               </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-xs text-slate-400 font-medium italic">All tasks completed or none scheduled.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 4: Monthly Review */}
              <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Monthly Review</span>
                </div>
                
                <div className="bg-white rounded-xl border border-rose-100 p-6 space-y-6 shadow-sm">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 border-l-2 border-[#d1a398] pl-2 uppercase tracking-wider">Month Achievements:</h4>
                    <textarea 
                      className="w-full min-h-[100px] text-xs font-medium text-slate-600 bg-transparent border-none focus:ring-0 resize-none p-0 leading-relaxed placeholder:italic"
                      placeholder="1、Completed project files...&#10;2、Launched new initiative..."
                      value={reviews[currentMonth]?.achievements || ''}
                      onChange={(e) => updateReview('achievements', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 border-l-2 border-[#d1a398] pl-2 uppercase tracking-wider">Next Month Plan:</h4>
                    <textarea 
                      className="w-full min-h-[80px] text-xs font-medium text-slate-600 bg-transparent border-none focus:ring-0 resize-none p-0 leading-relaxed placeholder:italic"
                      placeholder="1、Deep dive review...&#10;2、Add 3 new channels..."
                      value={reviews[currentMonth]?.nextPlan || ''}
                      onChange={(e) => updateReview('nextPlan', e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* Task Entry View - Simplified Grid */
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-50">
                      <th className="px-6 py-4 w-20">Day</th>
                      <th className="px-6 py-4">Task Description</th>
                      <th className="px-6 py-4 w-32">Status</th>
                      <th className="px-6 py-4 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {monthTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <input type="number" min="1" max="31" className="w-full bg-transparent border-none text-sm font-bold text-slate-500 focus:ring-0" value={task.day} onChange={e => handleUpdateTask(task.id, { day: parseInt(e.target.value) || 1 })} />
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" placeholder="What needs to be done?" className="w-full bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0" value={task.title} onChange={e => handleUpdateTask(task.id, { title: e.target.value })} />
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className={`w-full bg-transparent border-none text-[10px] font-bold uppercase focus:ring-0 cursor-pointer ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : 'text-amber-500'}`} 
                            value={task.status} 
                            onChange={e => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                          >
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-rose-400 p-1"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {monthTasks.length === 0 && (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-400 text-sm italic">No tasks for this month yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-50 h-16 flex items-center justify-around z-50">
        <button onClick={() => setCurrentView('Dashboard')} className={`flex flex-col items-center gap-1 ${currentView === 'Dashboard' ? 'text-[#d1a398]' : 'text-slate-300'}`}>
          <LayoutDashboard size={20} /><span className="text-[9px] font-bold uppercase tracking-tighter">Report</span>
        </button>
        <button onClick={() => setCurrentView('Tasks')} className={`flex flex-col items-center gap-1 ${currentView === 'Tasks' ? 'text-[#d1a398]' : 'text-slate-300'}`}>
          <ClipboardList size={20} /><span className="text-[9px] font-bold uppercase tracking-tighter">Data Entry</span>
        </button>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#d1a398] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
      {icon} <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

function StatBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const width = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold text-slate-500 w-16 uppercase">{label}</span>
      <div className="flex-grow h-4 bg-slate-50 rounded-sm relative overflow-hidden">
        <div className="h-full transition-all duration-1000" style={{ width: `${width}%`, backgroundColor: color, opacity: 0.6 }}></div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{value}</span>
    </div>
  );
}
