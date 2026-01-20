
import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../constants';
import { leaveService, LeaveRequest } from '../src/api/leaveService';
import { settingService } from '../src/api/settingService';

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [policy, setPolicy] = useState({
    casualLeave: 12,
    sickLeave: 10,
    annualLeave: 18,
    maternityLeave: 12,
    requireApproval: true,
    notifyStaff: true,
    enableHalfDay: false
  });
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Fetch leaves on mount and when filter changes
  useEffect(() => {
    fetchLeaves();
    fetchPolicy();
  }, [statusFilter]);

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

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    try {
      await settingService.updateSettings({ leavePolicy: policy });
      setShowPolicyModal(false);
    } catch (err) {
      alert("Failed to update policy");
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const data = await leaveService.getAllLeaves(statusFilter);
      // Backend returns _id, map to id if needed for older components of just use _id
      setLeaves(data);
    } catch (error) {
      console.error('Failed to fetch leaves', error);
    }
  };

  // Internal Filtering Logic for search (status is handled by API now, but we can double filter or just use API)
  // Let's keep search client side for now as it is powerful enough for small lists
  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const userName = leave.user?.name || 'Unknown';
      const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchQuery.toLowerCase());
      // Status filter already applied by API, but if we did 'All' in API and filter locally:
      // const matchesStatus = statusFilter === 'All' || leave.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch;
    });
  }, [leaves, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      await leaveService.approveLeave(id);
      fetchLeaves(); // Refresh
    } catch (error) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveService.rejectLeave(id);
      fetchLeaves(); // Refresh
    } catch (error) {
      alert('Failed to reject');
    }
  };

  const inputClasses = "w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300";
  const labelClasses = "text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Leave Requests</h2>
          <p className="text-sm text-gray-500 font-medium">Manage and respond to employee leave applications</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPolicyModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center"
          >
            <Icons.Settings />
            <span className="ml-2">Policy Settings</span>
          </button>
        </div>
      </div>

      {/* Internal Filtering Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search request or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Employee</th>
                <th className="px-8 py-6">Leave Type</th>
                <th className="px-8 py-6">Dates</th>
                <th className="px-8 py-6">Reason</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeaves.length > 0 ? filteredLeaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                        {(leave.user?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{leave.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200/50">{leave.leaveType}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-400 font-medium max-w-xs truncate italic">"{leave.reason}"</td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl                      leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      leave.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right space-x-3">
                    {leave.status === 'pending' ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(leave._id)}
                          className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-90"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave._id)}
                          className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-90"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button className="p-2.5 text-gray-300 hover:text-gray-900 bg-gray-50 hover:bg-white border border-gray-100 rounded-xl transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                        <Icons.Leaves />
                      </div>
                      <p className="text-gray-900 font-black">No leave requests found</p>
                      <p className="text-gray-400 text-xs font-medium">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Settings Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-scale">
            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Leave Policy</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure global entitlement rules</p>
              </div>
              <button onClick={() => setShowPolicyModal(false)} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all active:rotate-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form className="p-10 space-y-8" onSubmit={handleUpdatePolicy}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                  <h4 className="font-black text-gray-900 uppercase tracking-[0.2em] text-[10px]">Annual Entitlements</h4>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Casual Leave (Days/Year)</label>
                    <input
                      type="number"
                      value={policy.casualLeave}
                      onChange={(e) => setPolicy({ ...policy, casualLeave: parseInt(e.target.value) })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Sick Leave (Days/Year)</label>
                    <input
                      type="number"
                      value={policy.sickLeave}
                      onChange={(e) => setPolicy({ ...policy, sickLeave: parseInt(e.target.value) })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Annual Leave (Days/Year)</label>
                    <input
                      type="number"
                      value={policy.annualLeave}
                      onChange={(e) => setPolicy({ ...policy, annualLeave: parseInt(e.target.value) })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Maternity Leave (Weeks)</label>
                    <input
                      type="number"
                      value={policy.maternityLeave}
                      onChange={(e) => setPolicy({ ...policy, maternityLeave: parseInt(e.target.value) })}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                  <h4 className="font-black text-gray-900 uppercase tracking-[0.2em] text-[10px]">Approval Workflow</h4>
                </div>

                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Require Manager Approval First</span>
                    <input
                      type="checkbox"
                      checked={policy.requireApproval}
                      onChange={(e) => setPolicy({ ...policy, requireApproval: e.target.checked })}
                      className="w-10 h-6 bg-gray-200 checked:bg-blue-600 rounded-full appearance-none relative cursor-pointer transition-all before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-4 shadow-inner"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Notify Staff via Email Automatically</span>
                    <input
                      type="checkbox"
                      checked={policy.notifyStaff}
                      onChange={(e) => setPolicy({ ...policy, notifyStaff: e.target.checked })}
                      className="w-10 h-6 bg-gray-200 checked:bg-blue-600 rounded-full appearance-none relative cursor-pointer transition-all before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-4 shadow-inner"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Enable Half-Day Requests</span>
                    <input
                      type="checkbox"
                      checked={policy.enableHalfDay}
                      onChange={(e) => setPolicy({ ...policy, enableHalfDay: e.target.checked })}
                      className="w-10 h-6 bg-gray-200 checked:bg-blue-600 rounded-full appearance-none relative cursor-pointer transition-all before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-4 shadow-inner"
                    />
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowPolicyModal(false)} className="flex-1 px-6 py-4 border border-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">Discard</button>
                <button
                  type="submit"
                  disabled={isSavingPolicy}
                  className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  {isSavingPolicy ? 'Saving...' : 'Update Global Policies'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
