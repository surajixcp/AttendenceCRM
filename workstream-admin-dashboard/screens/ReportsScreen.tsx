import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { reportService } from '../src/api/reportService';
import { employeeService } from '../src/api/employeeService';
import { Employee } from '../types';

interface ReportLog {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        designation: string;
        department: string;
    };
    date: string;
    sod: string;
    sodTime: string;
    eod: string;
    eodTime: string;
    status: string;
}

const ReportsScreen: React.FC = () => {
    const [reports, setReports] = useState<ReportLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [startDate, endDate, selectedUser]);

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportService.getAllReports({
                startDate,
                endDate,
                userId: selectedUser || undefined
            });
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/40 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl shrink-0">
                        <div className="flex items-center px-1">
                            <input
                                type="date"
                                className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-300 outline-none cursor-pointer uppercase tracking-tight"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="w-px h-3 bg-slate-100 dark:bg-slate-800"></div>
                        <div className="flex items-center px-1">
                            <input
                                type="date"
                                className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-300 outline-none cursor-pointer uppercase tracking-tight"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="w-px h-3 bg-slate-100 dark:bg-slate-800"></div>
                        <div className="flex items-center px-1">
                            <select
                                className="bg-transparent text-[10px] font-black text-slate-600 dark:text-slate-300 outline-none cursor-pointer uppercase tracking-tight max-w-[120px]"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="" className="bg-white dark:bg-slate-900">ALL STAFF</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id} className="bg-white dark:bg-slate-900">
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={fetchReports}
                            className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all active:scale-90"
                        >
                            <Icons.Search className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reporting Matrix</p>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">Active Surveillance Enabled</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/50">
                            <tr className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                <th className="px-5 py-3.5">Employee</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">SOD Status</th>
                                <th className="px-5 py-3.5">EOD Status</th>
                                <th className="px-5 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Scanning Archives...</td>
                                </tr>
                            ) : reports.length > 0 ? reports.map((report) => (
                                <React.Fragment key={report._id}>
                                    <tr className={`group transition-all ${expandedId === report._id ? 'bg-blue-50/30 dark:bg-blue-500/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                                    {report.user?.name || 'Incomplete Identity'}
                                                </span>
                                                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                                    {report.user?.designation || 'STAFF'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-tighter">
                                                {new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">SUBMITTED</span>
                                                <span className="text-[8px] font-bold text-slate-400">{new Date(report.sodTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            {report.eod ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">COMPLETED</span>
                                                    <span className="text-[8px] font-bold text-slate-400">{new Date(report.eodTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">PENDING</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={() => setExpandedId(expandedId === report._id ? null : report._id)}
                                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-all ${expandedId === report._id ? 'bg-blue-600 text-white' : 'text-blue-600 border border-blue-600/20 hover:bg-blue-600/5'}`}
                                            >
                                                {expandedId === report._id ? 'Close' : 'Review'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedId === report._id && (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-4 bg-slate-50/50 dark:bg-slate-950/20">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="text-[8px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-500/10 pb-1">Start of Day (SOD) Content</h4>
                                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            {report.sod}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-[8px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-500/10 pb-1">End of Day (EOD) Content</h4>
                                                        {report.eod ? (
                                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                {report.eod}
                                                            </p>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-3">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Awaiting end of day transmission</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No reports found for the selected period</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
