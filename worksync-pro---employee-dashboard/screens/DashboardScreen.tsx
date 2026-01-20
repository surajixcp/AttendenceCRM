import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Navigation,
  ExternalLink,
  Zap,
  TrendingUp,
  Target,
  Star
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Screen, ProjectStatus, Meeting, AttendanceLog, Project, LeaveRequest, Holiday } from '../types';
import { holidayService } from '../services/holidayService';
import { attendanceService } from '../services/attendanceService';
import { meetingService } from '../services/meetingService';
import { projectService } from '../services/projectService';
import { leaveService } from '../services/leaveService';
import { authService } from '../services/authService';
import { settingService } from '../services/settingService';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkInLoc, setCheckInLoc] = useState<string | null>(null);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [user, setUser] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Load User
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchDashboardData();
    fetchCompanySettings();

    return () => clearInterval(timer);
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const data = await settingService.getSettings();
      setCompanySettings(data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const userId = userData?.id || userData?._id;

      if (!userId) return;

      // 1. Check Attendance Status (Daily)
      try {
        const daily = await attendanceService.getDailyAttendance(userId);
        if (daily && daily.checkIn && !daily.checkOut) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(daily.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setIsCheckedIn(false);
          setCheckInTime(null);
        }
      } catch (e) {
        // No record found likely means not checked in
        setIsCheckedIn(false);
      }

      // 2. Weekly Activity (Fetching monthly for now and filtering)
      const date = new Date();
      const logs = await attendanceService.getMonthlyAttendance(userId, date.getMonth() + 1, date.getFullYear());
      // Process logs for chart (last 7 days or current week)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = days.map(day => ({ name: day, hours: 0 }));
      if (Array.isArray(logs)) {
        logs.forEach((log: any) => {
          const logDate = new Date(log.date);
          const dayIndex = logDate.getDay();
          const hours = parseFloat(log.workingHours || '0');
          chartData[dayIndex].hours += hours;
        });
      }
      setWeeklyData(chartData);

      // 3. Meetings
      const myMeetings = await meetingService.getMyMeetings();
      setMeetings(Array.isArray(myMeetings) ? myMeetings.map((m: any) => ({ ...m, id: m._id })) : []);

      // 4. Projects
      const myProjects = await projectService.getMyProjects();
      setProjects(Array.isArray(myProjects) ? myProjects : []);

      // 5. Leaves
      const myLeaves = await leaveService.getMyLeaves();
      setLeaves(Array.isArray(myLeaves) ? myLeaves : []);

      // 6. Holidays
      const allHolidays = await holidayService.getAllHolidays();
      setHolidays(Array.isArray(allHolidays) ? allHolidays.map((h: any) => ({ ...h, id: h._id })) : []);

    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  const handleCheckInOut = async () => {
    try {
      if (!isCheckedIn) {
        await attendanceService.checkIn();
        setIsCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setCheckInLoc(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
          });
        }
      } else {
        await attendanceService.checkOut();
        setIsCheckedIn(false);
        setCheckInTime(null);
        setCheckInLoc(null);
      }
      // Refresh data
      // fetchDashboardData(); 
    } catch (error) {
      console.error("Check-in/out failed", error);
      alert("Action failed. Please try again.");
    }
  };

  // Derived stats
  const activeProjects = projects.filter(p => p.status === 'Active');
  const firstProject = activeProjects[0];
  const leavesTaken = leaves.filter(l => l.status === 'Approved').length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Welcome Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Productivity Engine</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight leading-none">Welcome, {user?.name?.split(' ')[0] || 'Employee'}!</h2>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-2 md:mt-3 flex items-center gap-2">
            Progress: <span className="text-indigo-600">85% Weekly Completion</span>
          </p>
        </div>

        <div className="flex items-center gap-3 animate-in slide-in-from-right duration-700">
          <div className="bg-white w-full lg:w-auto px-4 md:px-6 py-3 md:py-3.5 rounded-[18px] md:rounded-[22px] border border-slate-100 flex items-center gap-4 md:gap-5 shadow-soft">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-right flex-1 lg:flex-none">
              <p className="font-black text-slate-900 text-xs md:text-sm tracking-tight">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              <p className="text-indigo-600 font-black text-[10px] md:text-xs tabular-nums mt-0.5">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Check-in Widget */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft flex flex-col justify-between relative overflow-hidden group hover-lift active-scale">
              <div className="absolute -top-6 -right-6 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all pointer-events-none">
                <Clock className="w-32 md:w-48 h-32 md:h-48" />
              </div>
              <div className="space-y-6 md:space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Session</h3>
                  {isCheckedIn && (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-live-pulse" />
                      TRACKING
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl md:text-5xl font-[900] text-slate-900 tracking-tighter tabular-nums">{isCheckedIn ? 'Checked In' : 'Logged Out'}</p>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
                    {isCheckedIn ? `Started: ${checkInTime}` : 'Shift not active'}
                  </p>
                </div>
                {companySettings && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Policy Shift</span>
                      <span className="text-indigo-600 font-black">{companySettings.workingHours.checkIn} - {companySettings.workingHours.checkOut}</span>
                    </div>
                    <div className="mt-2 text-[9px] font-bold text-slate-500">
                      Grace Period: {companySettings.workingHours.gracePeriod} minutes
                    </div>
                  </div>
                )}
                <button
                  onClick={handleCheckInOut}
                  className={`w-full py-4 md:py-5 rounded-[16px] md:rounded-[20px] font-black text-xs md:text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 shadow-lg ${isCheckedIn
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                >
                  {isCheckedIn ? 'End Shift' : 'Begin Shift'}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft hover-lift group">
              <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 md:mb-8">Stats Radar</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
                    <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight">+12.4%</p>
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white">
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                    <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight">98.2%</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 md:mt-10 pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                  <Navigation className="w-3.5 h-3.5" />
                  {checkInLoc ? `${checkInLoc}` : 'Geofence Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Chart Section */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-none">Activity Flow</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">7 Day Cycle</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Week</button>
                <button className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Month</button>
              </div>
            </div>
            <div className="h-60 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }} />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: '800' }} />
                  <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={24}>
                    {weeklyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#4f46e5' : '#f1f5f9'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Quick Pulse */}
          <div className="bg-slate-900 p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-premium text-white relative overflow-hidden group">
            <Target className="absolute -top-10 -right-10 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform" />
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Velocity</h3>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-xs font-black">{firstProject ? firstProject.name : 'No Active Projects'}</span>
                <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{firstProject ? firstProject.progress : 0}%</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-xs font-black">Leaves Taken</span>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">{leavesTaken} Days</span>
              </div>
            </div>
          </div>

          {/* Meetings List */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agenda</h3>
              <button onClick={() => onNavigate('Meetings')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-4">
              {meetings.length > 0 ? meetings.slice(0, 2).map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-50">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                    <span className="text-[8px] font-bold text-indigo-500 group-hover:text-indigo-100 uppercase">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-base md:text-lg font-black text-slate-900 group-hover:text-white leading-none">{new Date(m.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-900 truncate tracking-tight">{m.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{m.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-center text-slate-400 font-bold py-4">No upcoming meetings</p>
              )}
            </div>
          </div>

          {/* Holidays List */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Holidays</h3>
              <button onClick={() => onNavigate('Holidays')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">Full List <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-4">
              {holidays
                .filter(h => new Date(h.date) >= new Date())
                .slice(0, 3)
                .map((h) => (
                  <div key={h.id} className="flex items-center gap-4 p-3 hover:bg-indigo-50/50 rounded-2xl transition-all group border border-transparent">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-soft group-hover:scale-110 transition-transform">
                      <span className="text-[8px] font-bold uppercase">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-base md:text-lg font-black leading-none">{new Date(h.date).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-black text-slate-900 truncate tracking-tight">{h.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.type}</p>
                    </div>
                  </div>
                ))}
              {holidays.filter(h => new Date(h.date) >= new Date()).length === 0 && (
                <p className="text-xs text-center text-slate-400 font-bold py-4">No upcoming holidays</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
