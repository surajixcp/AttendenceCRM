import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Navigation,
  RefreshCcw,
  LocateFixed,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  List,
  Map as MapIcon,
  X,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { AttendanceStatus, AttendanceLog } from '../types';
import { attendanceService } from '../services/attendanceService';

const AttendanceScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'mismatch' | 'error'>('idle');
  const [verificationMsg, setVerificationMsg] = useState('');

  useEffect(() => {
    getLiveLocation();
    fetchAttendanceLogs();
  }, [currentDate]);

  const fetchAttendanceLogs = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const id = user.id || user._id;

      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const data = await attendanceService.getMonthlyAttendance(id, month, year);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const getLiveLocation = (silent = false) => {
    if (!silent) setIsLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          if (!silent) setIsLocating(false);
          resolve(coords);
        },
        (err) => {
          setError(err.message);
          if (!silent) setIsLocating(false);
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const handleVerifyLocation = async () => {
    setVerificationStatus('verifying');
    try {
      const currentPos = await getLiveLocation(true);
      if (!currentPos) throw new Error("GPS failed");

      // Check if checked in today
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const id = user.id || user._id;
        const today = await attendanceService.getDailyAttendance(id);

        if (!today || !today.checkIn) {
          setVerificationStatus('error');
          setVerificationMsg("Not checked in today.");
          return;
        }
      }

      setVerificationStatus('verified');
      setVerificationMsg("Identity Verified: In secure zone.");
    } catch (err) {
      setVerificationStatus('error');
      setVerificationMsg("Link Error.");
    }

    setTimeout(() => {
      setVerificationStatus('idle');
    }, 5000);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDayStatus = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]; // simple comparison
    // Find log for this date. Log date format from backend might be full ISO string.
    const log = logs.find(l => {
      const lDate = new Date(l.date);
      return lDate.getDate() === day && lDate.getMonth() === currentDate.getMonth() && lDate.getFullYear() === currentDate.getFullYear();
    });

    if (log) {
      if (log.status === 'present') return 'present';
      if (log.status === 'absent') return 'absent';
      if (log.status === 'leave') return 'leave';
    }

    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';
    if (d > new Date()) return 'future';

    return 'weekend'; // treat unknown past as weekend/absent or just neutral
  };

  const statusColors: Record<string, string> = {
    present: 'bg-emerald-500 shadow-emerald-100 text-white',
    absent: 'bg-rose-500 shadow-rose-100 text-white',
    leave: 'bg-amber-500 shadow-amber-100 text-white',
    weekend: 'bg-slate-50 text-slate-300 shadow-none border-transparent',
    future: 'bg-white border-slate-100 text-slate-200 shadow-none'
  };

  const filteredLogs = logs.filter(l => {
    const d = new Date(l.date).toLocaleDateString();
    const s = l.status || '';
    return d.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight leading-none">Matrix Log</h2>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-2 md:mt-3">Geofencing & presence vault history.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-[18px] md:rounded-[22px] border border-slate-100 shadow-soft">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-[14px] md:rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-[14px] md:rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
          </div>
          <button
            onClick={handleVerifyLocation}
            disabled={verificationStatus === 'verifying'}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-[18px] md:rounded-[22px] text-xs font-black tracking-widest uppercase bg-slate-900 text-white hover:bg-black transition-all active-scale"
          >
            {verificationStatus === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Verify Pin
          </button>
        </div>
      </div>

      {verificationStatus !== 'idle' && verificationStatus !== 'verifying' && (
        <div className="p-4 md:p-5 rounded-[20px] md:rounded-[28px] bg-white border border-slate-100 flex items-center justify-between shadow-premium animate-scale-in">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {verificationStatus === 'verified' ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />}
            </div>
            <div>
              <p className="text-sm md:text-base font-black tracking-tight leading-none">{verificationStatus === 'verified' ? 'Success' : 'Failed'}</p>
              <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">{verificationMsg}</p>
            </div>
          </div>
          <button onClick={() => setVerificationStatus('idle')} className="text-slate-300 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft relative overflow-hidden group">
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Position Lock</h3>
            {location ? (
              <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <MapPin className="w-6 h-6 text-indigo-600" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-indigo-900 uppercase">Current Point</p>
                  <p className="text-base font-black text-indigo-700 tracking-tight tabular-nums truncate">
                    {location.lat.toFixed(2)}° N, {location.lng.toFixed(2)}° W
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-24 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-100">
                <span className="text-[10px] font-black text-slate-300 uppercase">Searching Satellite...</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 tracking-tight text-base md:text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1.5 text-slate-400 hover:text-slate-900"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => changeMonth(1)} className="p-1.5 text-slate-400 hover:text-slate-900"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-center text-[8px] font-black text-slate-300 uppercase">{d}</span>)}
              {Array.from({ length: startOffset }).map((_, i) => <div key={i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const status = getDayStatus(day);
                return (
                  <div key={day} className={`h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm ${statusColors[status]}`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-black text-slate-900 text-lg md:text-xl">Presence Vault</h3>
                <div className="relative flex-1 md:flex-none">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:w-48 pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold outline-none border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Interval</th>
                      <th className="px-6 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hours</th>
                      <th className="px-6 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 md:px-8 py-4 md:py-6 text-xs md:text-sm font-black text-slate-900">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-[10px] md:text-xs font-bold text-slate-600">IN {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} — OUT {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-[10px] md:text-xs font-bold text-slate-500 tabular-nums">{log.workingHours || '-'}</td>
                        <td className="px-6 md:px-8 py-4 md:py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${log.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{log.status}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold text-xs">No logs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-premium overflow-hidden flex flex-col h-[400px] md:h-[650px] relative transition-all">
              <div className="p-6 md:p-8 border-b border-slate-50 bg-white/80 backdrop-blur-md z-10 shrink-0">
                <h3 className="font-black text-slate-900 text-lg md:text-xl">GIS Spatial Log</h3>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Live Coordinate Overlay</p>
              </div>
              <div className="flex-1 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
                <div className="relative w-full h-full p-10 flex items-center justify-center">
                  <div className="text-center animate-scale-in">
                    <MapPin className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Map Environment Loaded</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-2 italic">Select a table log to zoom to point</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceScreen;
