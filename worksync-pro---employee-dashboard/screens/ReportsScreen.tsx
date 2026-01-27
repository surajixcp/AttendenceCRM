import React, { useState, useEffect } from 'react';
import {
    FileText,
    Send,
    CheckCircle2,
    Clock,
    Search,
    Loader2,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { reportService } from '../services/reportService';

const ReportsScreen: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sodText, setSodText] = useState('');
    const [eodText, setEodText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [todayReport, setTodayReport] = useState<any>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportService.getMyReports();
            setReports(data || []);

            // Find today's report
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const found = data.find((r: any) => {
                const rDate = new Date(r.date);
                rDate.setHours(0, 0, 0, 0);
                return rDate.getTime() === today.getTime();
            });
            setTodayReport(found || null);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSodSubmit = async () => {
        if (!sodText.trim()) return;
        setSubmitting(true);
        try {
            await reportService.submitSOD(sodText);
            setSodText('');
            await fetchReports();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit SOD');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEodSubmit = async () => {
        if (!eodText.trim()) return;
        setSubmitting(true);
        try {
            await reportService.submitEOD(eodText);
            setEodText('');
            await fetchReports();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit EOD');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredReports = reports.filter(r =>
        new Date(r.date).toLocaleDateString().includes(searchQuery) ||
        r.sod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.eod && r.eod.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none uppercase">Daily logs</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[9px] lg:text-[11px] mt-2 uppercase tracking-tight">Activity & Progression Matrix</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOD Card */}
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight leading-none">Start of Day</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Planning & Objectives</p>
                            </div>
                        </div>
                        {todayReport ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tight">Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20 shadow-sm">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tight">Required</span>
                            </div>
                        )}
                    </div>

                    {todayReport ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    "{todayReport.sod}"
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                Submitted at {new Date(todayReport.sodTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={sodText}
                                onChange={(e) => setSodText(e.target.value)}
                                placeholder="What are your goals for today? List key tasks..."
                                className="w-full h-24 p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-400/50 resize-none"
                            />
                            <button
                                onClick={handleSodSubmit}
                                disabled={submitting || !sodText.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Initialize Day
                            </button>
                        </div>
                    )}
                </div>

                {/* EOD Card */}
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight leading-none">End of Day</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Achievements & Summary</p>
                            </div>
                        </div>
                        {todayReport?.eod ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tight">Completed</span>
                            </div>
                        ) : todayReport ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20 shadow-sm">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tight">Pending</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-slate-500/10 text-slate-400 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                                <Clock className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tight">Locked</span>
                            </div>
                        )}
                    </div>

                    {todayReport?.eod ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    "{todayReport.eod}"
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                Submitted at {new Date(todayReport.eodTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={eodText}
                                onChange={(e) => setEodText(e.target.value)}
                                disabled={!todayReport}
                                placeholder={todayReport ? "Summarize your achievements and tasks completed..." : "Submit SOD first to unlock EOD reporting."}
                                className="w-full h-24 p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-400/50 resize-none disabled:grayscale disabled:opacity-50"
                            />
                            <button
                                onClick={handleEodSubmit}
                                disabled={submitting || !eodText.trim() || !todayReport}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-lg shadow-indigo-600/10"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                Finalize Day
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-base uppercase tracking-tight leading-none">Submission History</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Past activity archives</p>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-400/50 uppercase"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Start of Day (SOD)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">End of Day (EOD)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <tr key={report._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[11px] font-black h-slate-700 dark:text-slate-200 uppercase tabular-nums">
                                                    {new Date(report.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] max-w-sm">
                                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {report.sod}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] max-w-sm">
                                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {report.eod || <span className="text-slate-300 dark:text-slate-700 italic">Not submitted</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${report.status === 'completed'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                        No reports found
                                    </td>
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
