import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts';
import { attendanceService } from '../src/api/attendanceService';
import { leaveService, LeaveRequest } from '../src/api/leaveService';
import { holidayService } from '../src/api/holidayService';
import { meetingService } from '../src/api/meetingService';
import { Holiday, Meeting } from '../types';

const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [metric, setMetric] = useState<'actual' | 'overtime'>('actual');

  // Real Data State
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    onLeave: 0
  });
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Chart Data State (initialized with empty or zeroed data)
  const [attendanceChartData, setAttendanceChartData] = useState<any[]>([
    { name: 'Mon', actual: 0, target: 98, overtime: 0 },
    { name: 'Tue', actual: 0, target: 98, overtime: 0 },
    { name: 'Wed', actual: 0, target: 98, overtime: 0 },
    { name: 'Thu', actual: 0, target: 98, overtime: 0 },
    { name: 'Fri', actual: 0, target: 98, overtime: 0 },
    { name: 'Sat', actual: 0, target: 45, overtime: 0 },
    { name: 'Sun', actual: 0, target: 35, overtime: 0 }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Summary Stats
      const summary = await attendanceService.getSummary(); // { totalEmployees, present, absent }

      // 2. Fetch Recently Pending Leaves
      const allLeaves: any[] = await leaveService.getAllLeaves();
      const pendingLeaves = allLeaves.filter(l => l.status === 'pending').slice(0, 3);

      // Calculate "On Leave" today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const onLeaveCount = allLeaves.filter(l => {
        if (l.status !== 'approved') return false;
        // Backend uses startDate/endDate usually, or dailyAttendance logic
        // For Dashboard, we'll just check if current user is check-inable
        return false; // Simplified for now to avoid crash
      }).length;

      setStats({
        totalEmployees: summary.totalEmployees,
        present: summary.present,
        absent: summary.absent - onLeaveCount, // Adjust absent count? Or just trust summary?
        onLeave: onLeaveCount
      });
      setLeaves(pendingLeaves);

      // 3. Fetch Upcoming Holidays
      const allHolidays: any[] = await holidayService.getAllHolidays();
      setHolidays((Array.isArray(allHolidays) ? allHolidays : [])
        .map((h: any) => ({ ...h, id: h._id }))
        .filter((h: Holiday) => new Date(h.date) >= new Date())
        .sort((a: Holiday, b: Holiday) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3));

      // 4. Fetch Meetings
      const allMeetings = await meetingService.getAllMeetings();
      setMeetings(Array.isArray(allMeetings) ? allMeetings.map((m: any) => ({ ...m, id: m._id })).slice(0, 3) : []);

      // 5. Populate Chart Data (Mocking logic for now based on 'present')
      // Ideally we fetch weekly logs. For now, let's just show 'Today' data on the chart or leave placeholders.
      // Or we can try to fetch logs for the week if we had a range endpoint.
      // We will leave the chart strictly static or randomized based on 'present' to avoid breaking UI if no historical data.
      // Let's update at least one bar with today's real data?
      const dayIndex = new Date().getDay(); // 0-6
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayName = names[dayIndex];

      const newChartData = attendanceChartData.map(d => {
        if (d.name === todayName && summary.totalEmployees > 0) {
          return {
            ...d,
            actual: Math.round((summary.present / summary.totalEmployees) * 100)
          };
        }
        return d;
      });
      setAttendanceChartData(newChartData);

    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const pieData = [
    { name: 'Present', value: stats.present, color: '#3b82f6' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' },
    { name: 'On Leave', value: stats.onLeave, color: '#f59e0b' }
  ];

  // Calculate percentage of active
  const activePercentage = stats.totalEmployees > 0
    ? Math.round((stats.present / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, change: '+0', color: 'bg-blue-600', trend: 'stable' },
          { label: 'Present Today', value: stats.present, change: `${activePercentage}%`, color: 'bg-emerald-500', trend: 'up' },
          { label: 'Absent Today', value: stats.absent, change: '-', color: 'bg-rose-500', trend: 'down' },
          { label: 'On Leave Today', value: stats.onLeave, change: '-', color: 'bg-amber-500', trend: 'stable' }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-600 transition-colors">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <span className={`p-3 rounded-xl ${stat.color} text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </div>
            {/* Trend indicator omitted or static since we don't have historical comparison yet */}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Attendance Analysis</h3>
              <p className="text-xs text-gray-400 font-medium">Comparison of {metric === 'actual' ? 'Actual vs Target' : 'Overtime Hours'}</p>
            </div>
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => setMetric('actual')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${metric === 'actual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Attendance
              </button>
              <button
                onClick={() => setMetric('overtime')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${metric === 'overtime' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Overtime
              </button>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 900 }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="rect"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                />

                {metric === 'actual' ? (
                  <>
                    <Bar
                      dataKey="actual"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                      name="Actual Attendance %"
                    />
                    <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Target', fill: '#10b981', fontSize: 10, fontWeight: 800 }} />
                  </>
                ) : (
                  <Bar
                    dataKey="overtime"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    name="Overtime Hours"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-900">Real-time Status</h3>
          <div className="h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl font-black text-gray-900">{activePercentage}%</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Pending Leave Requests</h3>
            <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
          </div>
          <div className="space-y-1">
            {leaves.length > 0 ? leaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer border border-transparent hover:border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                    {(leave.employeeName || 'U')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{leave.employeeName}</p>
                    <p className="text-xs text-gray-500">{leave.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${leave.status === 'approved' ? 'text-emerald-500 bg-emerald-50' :
                      leave.status === 'rejected' ? 'text-rose-500 bg-rose-50' :
                        'text-amber-500 bg-amber-50'
                    }`}>
                    {leave.status?.charAt(0).toUpperCase() + leave.status?.slice(1)}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Upcoming Holidays</h3>
            <div className="space-y-5">
              {holidays.length > 0 ? holidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center space-x-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <span className="text-[10px] font-black uppercase">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black leading-none">{holiday.date.split('-')[2]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{holiday.name}</p>
                    <p className="text-xs text-gray-400">{holiday.type}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400">No upcoming holidays</p>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Meetings</h3>
            <div className="space-y-4">
              {meetings.length > 0 ? meetings.map((meeting) => (
                <div key={meeting.id} className="relative pl-6 border-l-2 border-blue-500 group cursor-pointer hover:bg-blue-50/50 p-2 rounded-r-xl transition-colors">
                  <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                  <p className="text-sm font-bold text-gray-900 truncate">{meeting.title}</p>
                  <p className="text-xs text-gray-500">{meeting.time} • {meeting.attendees?.length || 0} Team</p>
                </div>
              )) : (
                <p className="text-sm text-gray-400">No scheduled meetings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;