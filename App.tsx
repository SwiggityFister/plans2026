
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  Bell,
  Search,
  Calendar as CalendarIcon
} from 'lucide-react';
import { TaskStatus, TaskPriority, Task } from './types';
import { MONTHS } from './constants';

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
      // Start with a completely empty array for a clean user experience
      setTasks([]);
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

  const handleDownloadCSV = () => {
    if (tasks.length === 0) {
      alert("No tasks to export yet!");
      return;
    }
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

  const monthTasks = useMemo(() => 
    tasks.filter(t => t.month === currentMonth).sort((a, b) => a.day - b.day), 
    [tasks, currentMonth]
  );
  
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
    return Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      planned: monthTasks.filter(t => t.day === i + 1).length,
      done: monthTasks.filter(t => t.day === i + 1 && t.status === TaskStatus.COMPLETED).length
    }));
  }, [monthTasks]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
          <div className="w-10 h-10 bg-[#d1a398] rounded-xl flex items-center justify-center shadow-lg shadow-rose-100">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Plan <span className="text-[#d1a398]">2026</span></span>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4">
          <NavButton active={currentView === 'Dashboard'} onClick={() => setCurrentView('Dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavButton active={currentView === 'Tasks'} onClick={() => setCurrentView('Tasks')} icon={<ClipboardList size={20} />} label="Task Manager" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleDownloadCSV} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export Data
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden pb-16 lg:pb-0">
        {/* Top Header Bar */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-1 lg:gap-4">
            <button 
              onClick={() => setCurrentMonth(m => (m > 0 ? m - 1 : 11))}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-sm lg:text-lg font-bold w-28 lg:w-44 text-center truncate">
              {MONTHS[currentMonth]} <span className="hidden lg:inline">2026</span>
            </h2>
            <button 
              onClick={() => setCurrentMonth(m => (m < 11 ? m + 1 : 0))}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="hidden sm:block p-2 text-slate-400 hover:text-slate-600">
              <Search size={20} />
            </button>
            <button 
              onClick={handleAddTask}
              className="flex items-center justify-center w-10 h-10 lg:w-auto lg:h-auto lg:px-4 lg:py-2.5 bg-[#7b9a95] text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-50 hover:bg-teal-700 transition-all"
            >
              <Plus size={20} className="lg:mr-2" /> 
              <span className="hidden lg:inline">Add Task</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-grow overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          {currentView === 'Dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
                <StatCard title="Total" value={stats.total} icon={<ClipboardList className="text-blue-500 w-4 h-4 lg:w-5 lg:h-5" />} />
                <StatCard title="Done" value={stats.completed} icon={<CheckCircle2 className="text-emerald-500 w-4 h-4 lg:w-5 lg:h-5" />} />
                <StatCard title="Pending" value={stats.inProgress} icon={<Clock className="text-amber-500 w-4 h-4 lg:w-5 lg:h-5" />} />
                <StatCard title="Rate" value={`${stats.rate}%`} icon={<LayoutDashboard className="text-purple-500 w-4 h-4 lg:w-5 lg:h-5" />} />
              </div>

              {monthTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-12 lg:p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No data for {MONTHS[currentMonth]}</h3>
                  <p className="text-slate-500 text-sm max-w-xs mb-8">Your dashboard is empty. Start by adding tasks for this month to see your progress charts.</p>
                  <button 
                    onClick={handleAddTask}
                    className="px-6 py-3 bg-[#d1a398] text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-100 hover:opacity-90 transition-opacity"
                  >
                    Add Your First Task
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 animate-in fade-in duration-500">
                  <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 lg:mb-6">Performance Trend</h3>
                    <div className="h-48 lg:h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="planned" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={12} />
                          <Bar dataKey="done" fill="#d1a398" radius={[4, 4, 0, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 lg:mb-6">Snapshot</h3>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] font-bold text-slate-300">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: 31 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`aspect-square flex items-center justify-center rounded-lg text-[10px] lg:text-xs font-semibold ${monthTasks.some(t => t.day === i+1) ? 'bg-[#d1a398]/10 text-[#d1a398]' : 'bg-slate-50 text-slate-400'}`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
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
                          <input type="number" className="w-12 bg-transparent border-none text-sm font-semibold text-slate-500" value={task.day} min="1" max="31" onChange={e => handleUpdateTask(task.id, { day: parseInt(e.target.value) || 1 })} />
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" placeholder="Enter task name..." className="w-full bg-transparent border-none text-sm font-medium text-slate-700 focus:outline-none" value={task.title} onChange={e => handleUpdateTask(task.id, { title: e.target.value })} />
                        </td>
                        <td className="px-6 py-4">
                          <select className="bg-transparent border-none text-xs font-bold text-slate-500 cursor-pointer focus:outline-none" value={task.priority} onChange={e => handleUpdateTask(task.id, { priority: e.target.value as TaskPriority })}>
                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select className={`bg-transparent border-none text-xs font-bold uppercase cursor-pointer focus:outline-none ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : 'text-amber-500'}`} value={task.status} onChange={e => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}>
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {monthTasks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400 text-sm font-medium italic">
                          Click "Add Task" to start planning for {MONTHS[currentMonth]}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="lg:hidden space-y-3">
                {monthTasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Day {task.day}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === TaskPriority.HIGH ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                          {task.priority}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 p-1"><Trash2 size={14} /></button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Task name..."
                      className="w-full bg-slate-50/50 border-none rounded-lg text-sm font-medium px-3 py-2 text-slate-700 focus:ring-1 focus:ring-[#d1a398]/20 focus:outline-none"
                      value={task.title}
                      onChange={e => handleUpdateTask(task.id, { title: e.target.value })}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      {Object.values(TaskStatus).map(s => (
                        <button 
                          key={s}
                          onClick={() => handleUpdateTask(task.id, { status: s })}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${task.status === s ? (s === TaskStatus.COMPLETED ? 'bg-emerald-500 text-white shadow-md' : 'bg-amber-500 text-white shadow-md') : 'bg-slate-50 text-slate-400'}`}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {monthTasks.length === 0 && (
                  <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-medium italic">No tasks found for {MONTHS[currentMonth]}.</p>
                    <button onClick={handleAddTask} className="mt-4 text-[#d1a398] text-xs font-bold uppercase transition-transform active:scale-95">+ Add your first task</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-16 flex items-center justify-around px-6 z-50">
        <button 
          onClick={() => setCurrentView('Dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'Dashboard' ? 'text-[#d1a398]' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Overview</span>
        </button>
        <button 
          onClick={() => setCurrentView('Tasks')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'Tasks' ? 'text-[#d1a398]' : 'text-slate-400'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Tasks</span>
        </button>
        <button 
          onClick={handleDownloadCSV}
          className="flex flex-col items-center gap-1 text-slate-400 transition-colors active:text-slate-600"
        >
          <Download size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Export</span>
        </button>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#d1a398] text-white shadow-lg shadow-rose-100' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] duration-300">
      <div className="overflow-hidden">
        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 lg:mb-1 truncate">{title}</p>
        <p className="text-lg lg:text-3xl font-extrabold text-slate-900 leading-none">{value}</p>
      </div>
      <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl bg-slate-50/50 flex items-center justify-center shrink-0 ml-2">
        {icon}
      </div>
    </div>
  );
}
