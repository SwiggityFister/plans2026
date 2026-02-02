
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
  Home,
  Calendar as CalendarIcon,
  Check
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

  const daysInCurrentMonth = useMemo(() => {
    return new Date(2026, currentMonth + 1, 0).getDate();
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const year = 2026;
    const firstDayOfMonth = new Date(year, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const blanks = Array(adjustedFirstDay).fill(null);
    const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [currentMonth, daysInCurrentMonth]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFCFB] text-slate-800 font-sans overflow-hidden select-none">
      
      {/* Sidebar - Desktop Only */}
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

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Universal Header */}
        <header className="h-16 lg:h-20 bg-white/95 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(m => (m > 0 ? m - 1 : 11))} className="p-2 hover:bg-slate-50 active:bg-slate-100 rounded-full text-slate-400 transition-colors"><ChevronLeft size={24} /></button>
            <h2 className="text-base lg:text-lg font-bold w-32 lg:w-48 text-center text-slate-700">
              {MONTHS[currentMonth]} 2026
            </h2>
            <button onClick={() => setCurrentMonth(m => (m < 11 ? m + 1 : 0))} className="p-2 hover:bg-slate-50 active:bg-slate-100 rounded-full text-slate-400 transition-colors"><ChevronRight size={24} /></button>
          </div>
          <button 
            onClick={handleAddTask}
            className="flex items-center justify-center h-10 px-4 bg-[#7b9a95] text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-50 active:scale-95 transition-all"
          >
            <Plus size={20} className="mr-1" /> New Task
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4 lg:p-8 scrollbar-hide pb-24 lg:pb-8">
          {currentView === 'Dashboard' ? (
            /* Dashboard View (Remains similar but with better touch spacing) */
            <div className="max-w-xl mx-auto space-y-12">
              <section className="space-y-8">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Monthly Overview</span>
                </div>
                <div className="text-center space-y-1 py-4">
                  <div className="text-[80px] font-light leading-none text-[#d1a398]">{stats.total}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Planned</div>
                </div>
                <div className="space-y-6 px-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Completion Rate</span>
                      <span>{stats.rate}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7b9a95] transition-all duration-700 ease-out" style={{ width: `${stats.rate}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <StatBar label="Completed" value={stats.completed} total={stats.total} color="#d1a398" />
                    <StatBar label="In Progress" value={stats.inProgress} total={stats.total} color="#d1a398" />
                    <StatBar label="Not Started" value={stats.notStarted} total={stats.total} color="#d1a398" />
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Interactive Calendar</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl font-light text-[#d1a398]">{currentMonth + 1}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase leading-tight">2026<br />{MONTHS[currentMonth]}</div>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {['M','T','W','T','F','S','S'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-[#d1a398] py-2 border-b border-rose-50 mb-2">{d}</div>
                    ))}
                    {calendarDays.map((day, i) => (
                      <div key={i} className={`aspect-square flex flex-col items-center justify-center text-xs font-medium rounded-xl transition-colors ${day ? (monthTasks.some(t => t.day === day) ? 'bg-[#d1a398]/10 text-[#d1a398] font-bold' : 'text-slate-400') : ''}`}>
                        {day}
                        {day && monthTasks.some(t => t.day === day && t.status === TaskStatus.COMPLETED) && <div className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Pending Tasks</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  {pendingTasks.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {pendingTasks.map((task, idx) => (
                        <div key={task.id} className="flex items-start gap-4 p-5 active:bg-slate-50 transition-colors">
                          <span className="text-[10px] font-bold text-slate-300 w-4 pt-1">{idx + 1}</span>
                          <div className="flex-grow">
                            <p className="text-sm font-semibold text-slate-700">{task.title || 'Untitled Task'}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                               <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">Day {task.day}</span>
                               <span className={`text-[10px] font-bold uppercase ${task.status === TaskStatus.IN_PROGRESS ? 'text-amber-500' : 'text-slate-300'}`}>
                                 {task.status.replace('-', ' ')}
                               </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={24} /></div>
                      <p className="text-xs text-slate-400 font-medium italic">Your schedule is clear for now!</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-8 pt-4 pb-12">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Home size={18} className="text-[#7b9a95]" />
                  <span>Monthly Reflections</span>
                </div>
                <div className="bg-white rounded-2xl border border-rose-100 p-6 space-y-8 shadow-sm">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 border-l-2 border-[#d1a398] pl-3 uppercase tracking-widest">Achievements</h4>
                    <textarea 
                      className="w-full min-h-[140px] text-sm font-medium text-slate-600 bg-slate-50/30 rounded-xl border-none focus:ring-2 focus:ring-[#d1a398]/20 resize-none p-4 leading-relaxed placeholder:italic transition-all"
                      placeholder="What went well this month? List your wins here..."
                      value={reviews[currentMonth]?.achievements || ''}
                      onChange={(e) => updateReview('achievements', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 border-l-2 border-[#d1a398] pl-3 uppercase tracking-widest">Next Month's Focus</h4>
                    <textarea 
                      className="w-full min-h-[100px] text-sm font-medium text-slate-600 bg-slate-50/30 rounded-xl border-none focus:ring-2 focus:ring-[#d1a398]/20 resize-none p-4 leading-relaxed placeholder:italic transition-all"
                      placeholder="Top priorities for next month..."
                      value={reviews[currentMonth]?.nextPlan || ''}
                      onChange={(e) => updateReview('nextPlan', e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* Task Data Entry View */
            <div className="max-w-4xl mx-auto">
              {/* Desktop Table - Hidden on small screens */}
              <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-5 w-24">Day</th>
                      <th className="px-6 py-5">Task Description</th>
                      <th className="px-6 py-5 w-40">Status</th>
                      <th className="px-6 py-5 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {monthTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <select 
                            className="w-full bg-slate-50/50 rounded-lg border-none text-sm font-bold text-slate-500 focus:ring-2 focus:ring-[#d1a398]/20 py-2"
                            value={task.day} 
                            onChange={e => handleUpdateTask(task.id, { day: parseInt(e.target.value) })}
                          >
                            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" placeholder="Task title..." className="w-full bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 placeholder:font-normal" value={task.title} onChange={e => handleUpdateTask(task.id, { title: e.target.value })} />
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className={`w-full bg-slate-50/50 rounded-lg border-none text-[11px] font-bold uppercase focus:ring-2 focus:ring-[#d1a398]/20 py-2 cursor-pointer ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : task.status === TaskStatus.IN_PROGRESS ? 'text-amber-500' : 'text-slate-400'}`} 
                            value={task.status} 
                            onChange={e => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                          >
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-rose-400 p-2 transition-colors"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List - Visible only on small screens */}
              <div className="lg:hidden space-y-4">
                {monthTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Day</span>
                        <select 
                          className="bg-[#d1a398]/5 border-none rounded-lg text-lg font-bold text-[#d1a398] py-1 px-4 focus:ring-0 active:scale-95 transition-transform"
                          value={task.day}
                          onChange={e => handleUpdateTask(task.id, { day: parseInt(e.target.value) })}
                        >
                          {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-rose-300 hover:text-rose-500 active:scale-90 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <textarea 
                      className="w-full bg-slate-50/30 border-none rounded-xl text-sm font-semibold text-slate-700 p-4 focus:ring-2 focus:ring-[#d1a398]/10 placeholder:font-normal placeholder:text-slate-300 min-h-[80px]"
                      placeholder="Describe your task..."
                      value={task.title}
                      onChange={e => handleUpdateTask(task.id, { title: e.target.value })}
                    />

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-12 shrink-0">Status</span>
                      <select 
                        className={`flex-grow bg-slate-50/80 border-none rounded-xl text-[12px] font-bold uppercase py-3 px-4 focus:ring-0 active:scale-95 transition-transform ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : task.status === TaskStatus.IN_PROGRESS ? 'text-amber-500' : 'text-slate-500'}`}
                        value={task.status}
                        onChange={e => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                      >
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {monthTasks.length === 0 && (
                <div className="p-20 text-center text-slate-400 text-sm italic bg-white rounded-2xl border border-dashed border-slate-200">
                  Tap "New Task" above to start planning {MONTHS[currentMonth]}.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 h-20 px-6 flex items-center justify-between z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <button 
          onClick={() => setCurrentView('Dashboard')} 
          className={`flex flex-col items-center justify-center gap-1.5 w-24 h-full transition-all ${currentView === 'Dashboard' ? 'text-[#d1a398]' : 'text-slate-300'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Report</span>
          {currentView === 'Dashboard' && <div className="w-1.5 h-1.5 bg-[#d1a398] rounded-full mt-0.5"></div>}
        </button>
        <button 
          onClick={() => setCurrentView('Tasks')} 
          className={`flex flex-col items-center justify-center gap-1.5 w-24 h-full transition-all ${currentView === 'Tasks' ? 'text-[#d1a398]' : 'text-slate-300'}`}
        >
          <ClipboardList size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Entry</span>
          {currentView === 'Tasks' && <div className="w-1.5 h-1.5 bg-[#d1a398] rounded-full mt-0.5"></div>}
        </button>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-200 ${active ? 'bg-[#d1a398] text-white shadow-xl shadow-rose-100 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}>
      {icon} <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

function StatBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const width = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold text-slate-400 w-20 uppercase tracking-tighter">{label}</span>
      <div className="flex-grow h-5 bg-slate-50 rounded-lg relative overflow-hidden">
        <div className="h-full transition-all duration-1000 ease-in-out" style={{ width: `${width}%`, backgroundColor: color, opacity: 0.65 }}></div>
      </div>
      <span className="text-[11px] font-bold text-slate-500 w-8 text-right font-mono">{value}</span>
    </div>
  );
}
