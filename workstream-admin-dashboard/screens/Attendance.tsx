import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { attendanceService } from '../src/api/attendanceService';
// import { AttendanceRecord } from '../types'; // Adjust imports if needed

// Interface for API response might differ slightly or we map it
interface AttendanceLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  checkIn: string;
  checkOut: string;
  workingHours: number;
  status: string;
}

const Attendance: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchLogs();
  }, [startDate]); // Fetch on mount and date change. Maybe add debounce or explicit button.

  const fetchLogs = async () => {
    try {
      const data = await attendanceService.getAllAttendance({ startDate, endDate });
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch attendance logs', error);
    }
  };

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative group">
            <p className="absolute -top-6 left-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Start Date</p>
            <input
              type="date"
              className="bg-transparent text-sm font-bold text-gray-700 rounded-xl focus:ring-0 focus:border-none block p-2 outline-none cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-px h-6 bg-gray-100"></div>
          <div className="relative group">
            <p className="absolute -top-6 left-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">End Date</p>
            <input
              type="date"
              className="bg-transparent text-sm font-bold text-gray-700 rounded-xl focus:ring-0 focus:border-none block p-2 outline-none cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={fetchLogs} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <Icons.Search />
          </button>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95 group">
          <div className="group-hover:-translate-y-1 transition-transform">
            <Icons.Download />
          </div>
          <span className="ml-3">Export Log</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/30 border-b border-gray-50">
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Staff Member</th>
                <th className="px-8 py-6">Registry Date</th>
                <th className="px-8 py-6">In</th>
                <th className="px-8 py-6">Out</th>
                <th className="px-8 py-6">Duration</th>
                <th className="px-8 py-6">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length > 0 ? logs.map((record) => (
                <tr key={record._id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                    {record.user?.name || 'Unknown'} <span className="text-gray-400 font-normal">({record.user?.email})</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-bold">
                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-bold">
                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-black text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {record.workingHours || 0} hrs
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        record.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                          record.status === 'leave' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 font-bold">No attendance records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
