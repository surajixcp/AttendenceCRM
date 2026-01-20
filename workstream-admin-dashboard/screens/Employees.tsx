
import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../constants';
import { Employee } from '../types';
import { employeeService } from '../src/api/employeeService';

const ITEMS_PER_PAGE = 8;

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      // Map backend data to frontend model if necessary
      // Backend returns: { _id, name, email, role, designation, status, ... }
      // Frontend expects: { id, name, email, role, designation, status, salary, image... }
      const formatStatus = (s: string) => {
        if (s === 'active') return 'Active';
        if (s === 'on_leave') return 'On Leave';
        if (s === 'terminated') return 'Terminated';
        return s.charAt(0).toUpperCase() + s.slice(1);
      };

      const mapped = data.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'admin' ? 'Admin' : (u.role === 'sub-admin' ? 'Manager' : 'Employee'),
        designation: u.designation || 'N/A',
        status: formatStatus(u.status || 'active'),
        salary: u.salary || 0,
        image: u.image || `https://ui-avatars.com/api/?name=${u.name}`,
        phone: u.phone || 'N/A',
        location: u.location || 'N/A',
        workMode: u.workMode || 'WFO'
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtering & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Form States
  const [roleType, setRoleType] = useState<'preset' | 'custom'>('preset');
  const [selectedRole, setSelectedRole] = useState('Developer');
  const [customRole, setCustomRole] = useState('');
  const [formData, setFormData] = useState<Partial<Employee>>({});

  // Memoized Filtered List
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      salary: '', // Changed to empty string for input type="number"
      salaryType: 'monthly', // Added
      status: 'Active',
      password: '',
      location: '',
      workMode: 'WFO',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setRoleType('preset');
    setSelectedRole('Developer');
    setCustomRole('');
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      password: '',
      salary: emp.salary, // Ensure salary is passed as number or string
      status: emp.status,
      phone: emp.phone,
      location: emp.location,
      workMode: emp.workMode || 'WFO',
      salaryType: (emp as any).salaryType || 'monthly',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }); // Don't show hash or old password
    const isPreset = ['Developer', 'Designer', 'Manager', 'Marketing'].includes(emp.role);
    if (isPreset) {
      setRoleType('preset');
      setSelectedRole(emp.role);
    } else {
      setRoleType('custom');
      setCustomRole(emp.role);
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'CUSTOM_TRIGGER') {
      setRoleType('custom');
    } else {
      setSelectedRole(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = roleType === 'custom' ? customRole : selectedRole;

    // Construct payload
    // We are putting frontend 'role' into designation for now or valid field? 
    // Wait, earlier I decided to put it in valid fields.
    // If I map `finalRole` to `role` in the object sent to `createEmployee`, 
    // my `employeeService` ignores it or tries to send it.
    // Let's send it.

    const employeeData = {
      ...formData,
      role: finalRole,
      salary: Number(formData.salary),
      salaryType: formData.salaryType || 'monthly', // Added salaryType to payload
      status: formData.status?.toLowerCase() || 'active',
      phone: formData.phone,
      location: formData.location,
      workMode: formData.workMode,
      joiningDate: formData.joiningDate
    };

    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, employeeData);
        // Optimistically update or refetch
        fetchEmployees();
      } else {
        await employeeService.createEmployee(employeeData);
        fetchEmployees();
      }
    } catch (err) {
      console.error('Failed to save employee', err);
      alert('Failed to save employee');
    }

    resetForm();
  };

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        await employeeService.deleteEmployee(deletingId);
        setEmployees(employees.filter(emp => emp.id !== deletingId));
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete employee');
      }
      setDeletingId(null);
      if (paginatedEmployees.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto relative">
          <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="bg-white border border-gray-200 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 block pl-11 p-3 w-full md:w-80 shadow-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-3 border rounded-xl shadow-sm active:scale-95 transition-all ${filterStatus !== 'All' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500'}`}
              title="Filter by Status"
            >
              <Icons.Filter />
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 animate-fade-scale">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest p-2 mb-1">Status Filter</p>
                {['All', 'Active', 'On Leave', 'Terminated'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${filterStatus === status ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Icons.Plus />
          <span className="ml-2">Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-gray-400 text-[11px] font-black uppercase tracking-[0.1em]">
                <th className="px-6 py-6">Employee Profile</th>
                <th className="px-6 py-6">Role & Designation</th>
                <th className="px-6 py-6">Email Address</th>
                <th className="px-6 py-6">Current Status</th>
                <th className="px-6 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedEmployees.length > 0 ? paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition-all group cursor-default">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative">
                        <img className="h-11 w-11 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform object-cover" src={emp.image} alt="" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${emp.status === 'Active' ? 'bg-green-500' : emp.status === 'On Leave' ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{emp.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">EMP-{emp.id.padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-700">{emp.role}</div>
                    <div className="text-xs text-gray-400">{emp.designation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-900 font-bold">{emp.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{emp.phone !== 'N/A' ? emp.phone : 'No Phone'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{emp.location !== 'N/A' ? emp.location : 'Remote'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${emp.workMode === 'WFH' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          {emp.workMode}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[11px] font-bold rounded-lg ${emp.status === 'Active' ? 'bg-green-100 text-green-700' :
                      emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="text-blue-600 hover:bg-blue-100 p-2.5 rounded-xl transition-all active:scale-90"
                      title="Edit Profile"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button
                      onClick={() => setDeletingId(emp.id)}
                      className="text-rose-600 hover:bg-rose-100 p-2.5 rounded-xl transition-all active:scale-90"
                      title="Remove Employee"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                        <Icons.Search />
                      </div>
                      <p className="text-gray-900 font-black">No results found</p>
                      <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Functional Pagination Footer */}
        <div className="bg-gray-50/30 px-6 py-5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
            <span className="ml-4 text-[10px]">({filteredEmployees.length} total staff)</span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || totalPages === 0}
              className={`px-4 py-2 text-xs font-bold border rounded-xl shadow-sm transition-all ${currentPage === 1 || totalPages === 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 active:scale-95'
                }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-4 py-2 text-xs font-bold border rounded-xl shadow-sm transition-all ${currentPage === totalPages || totalPages === 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 active:scale-95'
                }`}
            >
              Next Page
            </button>
          </div>
        </div>
      </div>

      {/* Unified Add/Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-scale">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900">{editingEmployee ? 'Edit Employee' : 'New Employee'}</h3>
                <p className="text-xs text-gray-500 font-medium">Update profile information and access rights</p>
              </div>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm active:rotate-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form className="p-8 space-y-6 max-h-[70vh] overflow-y-auto" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-bold"
                  placeholder="e.g. Johnathan Smith"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Corporate Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-bold"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Proposed Salary (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="flex-1 border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-bold"
                      placeholder="e.g. 45000"
                      required
                    />
                    <select
                      value={formData.salaryType || 'monthly'}
                      onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
                      className="w-32 border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-bold"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Office Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-bold"
                    placeholder="New York, HQ"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Working Mode</label>
                  <select
                    value={formData.workMode || 'WFO'}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-bold"
                  >
                    <option value="WFO">Work From Office (WFO)</option>
                    <option value="WFH">Work From Home (WFH)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{editingEmployee ? 'Reset Password' : 'Initial Password'}</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-bold"
                  placeholder={editingEmployee ? "Leave blank to keep current" : "Min 6 chars"}
                  required={!editingEmployee}
                  minLength={6}
                />
              </div>


              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Team Role</label>
                  <div className="relative">
                    {roleType === 'preset' ? (
                      <>
                        <select
                          value={selectedRole}
                          onChange={handleRoleChange}
                          className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer pr-10 font-bold"
                        >
                          <option value="Developer">Developer</option>
                          <option value="Designer">Designer</option>
                          <option value="Manager">Manager</option>
                          <option value="Marketing">Marketing</option>
                          <option value="CUSTOM_TRIGGER">+ Add Custom Role...</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          autoFocus
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 pr-20 font-bold"
                          placeholder="Type custom role..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setRoleType('preset')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer pr-10 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-colors">Discard</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                  {editingEmployee ? 'Update Profile' : 'Register Now'}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}

      {/* Delete Confirmation Modal */}
      {
        deletingId && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-scale p-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-center text-gray-500 text-sm font-medium mb-8">This action will permanently remove this employee from the system records.</p>
              <div className="flex space-x-4">
                <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-3 border border-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all active:scale-95">Yes, Delete</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Employees;
