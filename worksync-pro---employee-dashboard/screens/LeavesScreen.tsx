import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { LeaveRequest, LeaveStatus } from '../types';
import { leaveService } from '../services/leaveService';
import { settingService } from '../services/settingService';

const LeavesScreen: React.FC = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [policy, setPolicy] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const settings = await settingService.getSettings();
      if (settings.leavePolicy) {
        setPolicy(settings.leavePolicy);
      }
    } catch (err) {
      console.error("Failed to fetch policy", err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      if (Array.isArray(data)) {
        setLeaves(data);
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await leaveService.applyLeave(formData);
      setIsApplyModalOpen(false);
      setFormData({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      console.error("Failed to apply leave", error);
      alert("Failed to apply leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateUsed = (type: string) => {
    return leaves
      .filter(l => l.status?.toLowerCase() === 'approved' && l.leaveType?.toLowerCase().includes(type.toLowerCase()))
      .length;
  };

  const leaveBalances = useMemo(() => {
    if (!policy) return [];
    return [
      { type: 'Annual', used: calculateUsed('Annual'), total: policy.annualLeave, color: 'indigo', accent: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-500' },
      { type: 'Sick', used: calculateUsed('Sick'), total: policy.sickLeave, color: 'emerald', accent: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
      { type: 'Personal', used: calculateUsed('Casual'), total: policy.casualLeave, color: 'amber', accent: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
    ];
  }, [policy, leaves]);

  const filteredLeaves = leaves.filter(l =>
    (l.leaveType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-[900] text-slate-900 tracking-tight leading-none">Time Off Hub</h2>
          <p className="text-slate-500 font-bold text-sm mt-3">Plan your breaks and monitor your leave allocations.</p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[22px] text-sm font-black tracking-widest uppercase hover:bg-indigo-600 shadow-premium transition-all active-scale"
        >
          <Plus className="w-5 h-5" />
          Request Leave
        </button>
      </div>

      {/* Leave Balance Cards refined */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {leaveBalances.map((balance, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft relative overflow-hidden group hover-lift transition-all">
            <div className={`absolute top-0 left-0 w-2 h-full ${balance.bar} opacity-60`} />
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{balance.type} Quota</h3>
                  <p className="text-xl font-[900] text-slate-900 mt-1 tracking-tight">{Math.max(0, balance.total - balance.used)} Days Left</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${balance.bg} ${balance.accent} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform`}>
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Used: {balance.used}</span>
                  <span className="text-slate-900">Allocation: {balance.total}</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100/50">
                  <div
                    className={`h-full ${balance.bar} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                    style={{ width: `${Math.min(100, (balance.used / balance.total) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applied Leaves Table refined */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-black text-slate-900 tracking-tight text-xl">My Requests</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status Tracking</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-[20px] border border-slate-100 shadow-inner group focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 placeholder:text-slate-400 w-full sm:w-48 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeaves.length > 0 ? filteredLeaves.map((request) => (
                <tr key={request.id || request._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-slate-900 tracking-tight">{request.leaveType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-800 tracking-tight">{new Date(request.startDate).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(request.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-xs font-medium text-slate-500 italic truncate group-hover:text-slate-800 transition-colors">{request.reason}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${(request.status || '').toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      (request.status || '').toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                      {(request.status || '').toLowerCase() === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                      {(request.status || '').toLowerCase() === 'pending' && <Clock className="w-4 h-4 animate-pulse" />}
                      {(request.status || '').toLowerCase() === 'rejected' && <XCircle className="w-4 h-4" />}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 active-scale">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold text-xs">No leave requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal refined */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
            onClick={() => setIsApplyModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-scale-in">
            <div className="px-8 h-20 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Time Off Application</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HR Internal Gateway</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 rounded-2xl hover:bg-white shadow-soft transition-all active-scale"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleApply}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Reason</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide essential details for approval..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none resize-none"
                />
              </div>

              <div className="bg-indigo-50/50 p-5 rounded-[24px] flex gap-4 text-indigo-900 border border-indigo-100">
                <div className="p-2.5 bg-white rounded-xl h-fit shadow-soft">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5">Compliance Notice</p>
                  <p className="text-xs font-bold leading-relaxed opacity-80">
                    Requests are subject to department load and policy verification. Approval typically takes <span className="text-indigo-600">24-48 hours</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-100 rounded-[22px] text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-[22px] text-sm font-black tracking-widest uppercase hover:bg-indigo-600 shadow-premium transition-all active-scale disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesScreen;
