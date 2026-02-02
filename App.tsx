
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Plus,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { TaskStatus, TaskPriority, Task, DayPlan } from './types';
import { MONTHS, WEEKDAYS } from './constants';

type AppView = 'Dashboard' | 'Tasks';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('Dashboard');
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence: Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('annual_plan_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Seed data if empty
      const initialTasks: Task[] = Array.from({ length: 15 }, (_, i) => ({
        id: crypto.randomUUID(),
        month: 0, // January
        day: (i % 28) + 1,
        title: `Example Task ${i + 1}`,
        status: i % 3 === 0 ? TaskStatus.COMPLETED : i % 3 === 1 ? TaskStatus.IN_PROGRESS : TaskStatus.NOT_STARTED,
        priority: i % 2 === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
        date: '2026-01-01'
      }));
      setTasks(initialTasks);
    }
    setIsLoaded(true);
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('annual_plan_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      month: currentMonth,
      day: 1,
      title: 'New Task',
      status: TaskStatus.NOT_STARTED,
      priority: TaskPriority.MEDIUM,
      date: '2026-01-01'
    };
    setTasks(prev => [newTask, ...prev]);
    setCurrentView('Tasks');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDownloadCSV = () => {
    const headers = ['Month', 'Day', 'Task', 'Priority', 'Status'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(t => [MONTHS[t.month], t.day, `"${t.title}"`, t.priority, t.status].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2026_Work_Plan.csv';
    link.click();
  };

  const monthTasks = useMemo(() => tasks.filter(t => t.month === currentMonth), [tasks, currentMonth]);
  
  const stats = useMemo(() => {
    const total = monthTasks.length;
    const completed = monthTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return {
      total,
      completed,
      inProgress: monthTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      notStarted: monthTasks.filter(t => t.status === TaskStatus.NOT_STARTED).length,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [monthTasks]);

  const chartData = useMemo(() => {
    const data = Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      planned: monthTasks.filter(t => t.day === i + 1).length,
      done: monthTasks.filter(t => t.day === i + 1 && t.status === TaskStatus.COMPLETED).length
    }));
    return data;
  }, [monthTasks]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
          <div className="w-10 h-10 bg-[#d1a398] rounded-xl flex items-center justify-center shadow-lg shadow-rose-100">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Plan <span className="text-[#d1a398]">2026</span></span>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4">
          <button 
            onClick={() => setCurrentView('Dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'Dashboard' ? 'bg-[#d1a398] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setCurrentView('Tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'Tasks' ? 'bg-[#d1a398] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ClipboardList size={20} />
            <span className="font-medium text-sm">Task Manager</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleDownloadCSV} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export Data
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentMonth(m => (m > 0 ? m - 1 : 11))}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold w-40 text-center">{MONTHS[currentMonth]} 2026</h2>
              <button 
                onClick={() => setCurrentMonth(m => (m < 11 ? m + 1 : 0))}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <Search size={20} />
              </button>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={handleAddTask}
              className="flex items-center gap-2 bg-[#7b9a95] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-teal-50 hover:bg-teal-700 transition-all"
            >
              <Plus size={18} /> Add Task
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-grow overflow-y-auto p-8 scrollbar-hide">
          {currentView === 'Dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Tasks" value={stats.total} color="bg-blue-500" icon={<ClipboardList className="text-blue-500" />} />
                <StatCard title="Completed" value={stats.completed} color="bg-emerald-500" icon={<CheckCircle2 className="text-emerald-500" />} />
                <StatCard title="In Progress" value={stats.inProgress} color="bg-amber-500" icon={<Clock className="text-amber-500" />} />
                <StatCard title="Completion Rate" value={`${stats.rate}%`} color="bg-purple-500" icon={<LayoutDashboard className="text-purple-500" />} />
              </div>

              {/* Chart and Mini Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-6 uppercase tracking-wider">Performance Trends</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="planned" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="done" fill="#d1a398" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="text-base font-bold text-slate-800 mb-6 uppercase tracking-wider">Monthly Snapshot</h3>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2 flex-grow">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${i < 31 ? 'bg-slate-50 text-slate-600' : 'text-transparent'}`}
                      >
                        {i < 31 ? i + 1 : ''}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Recent Activity</span>
                      <button className="text-[10px] text-[#d1a398] font-bold uppercase hover:underline">View All</button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {monthTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${t.status === TaskStatus.COMPLETED ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                          <span className="text-xs text-slate-600 truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Operational Log</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Auto-saved to local memory</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <th className="px-6 py-4">Day</th>
                        <th className="px-6 py-4">Task Name</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthTasks.map(task => (
                        <tr key={task.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              className="w-12 bg-transparent focus:ring-0 border-none text-sm font-semibold text-slate-500"
                              value={task.day}
                              onChange={e => handleUpdateTask(task.id, { day: parseInt(e.target.value) || 1 })}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              className="w-full bg-transparent focus:ring-2 focus:ring-[#d1a398]/20 border-none text-sm font-medium text-slate-700 px-2 py-1 rounded"
                              value={task.title}
                              onChange={e => handleUpdateTask(task.id, { title: e.target.value })}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              className="bg-transparent border-none text-xs font-bold text-slate-500 cursor-pointer"
                              value={task.priority}
                              onChange={e => handleUpdateTask(task.id, { priority: e.target.value as TaskPriority })}
                            >
                              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              className={`bg-transparent border-none text-xs font-bold uppercase tracking-tight cursor-pointer ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : 'text-amber-500'}`}
                              value={task.status}
                              onChange={e => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                            >
                              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {monthTasks.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                            No tasks scheduled for {MONTHS[currentMonth]}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string, value: string | number, color: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
