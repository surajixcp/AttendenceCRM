
import React, { useState, useEffect } from 'react';
import { salaryService } from '../src/api/salaryService';
import { SalaryRecord } from '../types';
import { X, Edit2 } from 'lucide-react';

const Salary: React.FC = () => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    baseSalary: 0,
    deductions: 0,
    status: 'Unpaid'
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const data = await salaryService.getAllSalaries();
      setSalaries(data);
    } catch (err) {
      console.error('Failed to fetch salaries', err);
    }
  };

  const handleProcessBatch = async () => {
    if (!window.confirm('Process payroll for all employees for the current month?')) return;
    try {
      const now = new Date();
      await salaryService.generateBatch(now.getMonth() + 1, now.getFullYear());
      fetchSalaries();
      alert('Batch payroll generated successfully');
    } catch (err) {
      console.error('Failed to generate batch payroll', err);
      alert('Failed to generate batch payroll');
    }
  };

  const handlePay = async (id: string) => {
    try {
      await salaryService.updateSalary(id, { status: 'Paid' });
      fetchSalaries();
    } catch (err) {
      console.error('Failed to update salary', err);
      alert('Failed to update salary status');
    }
  };

  const openEditModal = (salary: SalaryRecord) => {
    setEditingSalary(salary);
    setEditFormData({
      baseSalary: salary.baseSalary,
      deductions: salary.deductions,
      status: salary.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalary) return;
    try {
      await salaryService.updateSalary(editingSalary.id, editFormData);
      setIsEditModalOpen(false);
      fetchSalaries();
    } catch (err) {
      console.error('Failed to update salary', err);
      alert('Failed to update salary');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 p-6 rounded-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-blue-100 text-sm font-medium">Monthly Payroll Budget</p>
          <h2 className="text-3xl font-bold">₹245,600.00</h2>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Generate Reports</button>
          <button
            onClick={handleProcessBatch}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold shadow-lg transition-transform active:scale-95"
          >
            Process Batch Payroll
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg">Employee Salary List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Base Salary</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Pay</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salaries.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.baseSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">-₹{item.deductions.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{item.netPay.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {item.status === 'Unpaid' ? (
                        <button onClick={() => handlePay(item.id)} className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-md hover:bg-blue-700 shadow-sm transition-all">Pay Now</button>
                      ) : (
                        <button className="text-gray-400 border border-gray-200 px-3 py-1 text-xs font-medium rounded-md hover:bg-gray-50">Receipt</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900">Edit Salary Record</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{editingSalary?.employeeName}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateSalary} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Base Salary (₹)</label>
                <input
                  type="number"
                  value={editFormData.baseSalary}
                  onChange={(e) => setEditFormData({ ...editFormData, baseSalary: Number(e.target.value) })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Deductions (₹)</label>
                <input
                  type="number"
                  value={editFormData.deductions}
                  onChange={(e) => setEditFormData({ ...editFormData, deductions: Number(e.target.value) })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all uppercase tracking-widest text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
