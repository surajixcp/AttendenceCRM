
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { holidayService } from '../src/api/holidayService';
import { Holiday } from '../types';

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    type: 'Public'
  });

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const data = await holidayService.getAllHolidays();
      const mapped = Array.isArray(data) ? data.map((h: any) => ({
        ...h,
        id: h._id
      })) : [];
      setHolidays(mapped);
    } catch (err) {
      console.error('Failed to fetch holidays', err);
    }
  };

  const handleSaveHoliday = async () => {
    try {
      if (editingHoliday) {
        await holidayService.updateHoliday(editingHoliday.id, formData);
      } else {
        // @ts-ignore
        await holidayService.createHoliday(formData);
      }
      fetchHolidays();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save holiday', err);
      alert('Failed to save holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await holidayService.deleteHoliday(id);
      fetchHolidays();
    } catch (err) {
      console.error('Failed to delete holiday', err);
      alert('Failed to delete holiday');
    }
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date.split('T')[0],
      type: holiday.type
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingHoliday(null);
    setFormData({ name: '', date: '', type: 'Public' });
  };

  // Calendar Logic
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Company Holidays</h2>
          <p className="text-sm text-gray-500 font-medium">Scheduled events and public holidays for {currentMonth.getFullYear()}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 flex items-center shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          <Icons.Plus />
          <span className="ml-2">Add Holiday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-50 p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-xl text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
            </h3>
            <div className="flex space-x-3">
              <button onClick={prevMonth} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">&larr;</button>
              <button onClick={nextMonth} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">&rarr;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {/* Pad empty days */}
            {Array.from({ length: firstDayOfMonth(currentMonth) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 md:h-32"></div>
            ))}
            {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const holiday = holidays.find(h => h.date.split('T')[0] === dateStr);

              return (
                <div key={i} className={`h-24 md:h-32 border border-gray-50 rounded-2xl p-4 flex flex-col transition-all group hover:border-blue-100 ${holiday ? 'bg-blue-50 border-blue-100' : 'bg-white'}`}>
                  <span className={`text-sm font-black ${holiday ? 'text-blue-600' : 'text-gray-400'}`}>{dayNum}</span>
                  {holiday && (
                    <div className="mt-2 bg-blue-600 text-white text-[9px] p-2 rounded-xl font-black overflow-hidden truncate shadow-lg shadow-blue-100">
                      {holiday.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* List View */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 p-8 flex flex-col">
          <h3 className="font-black text-xl text-gray-900 mb-8">Holiday List</h3>
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-none">
            {holidays.length > 0 ? holidays.map((holiday) => (
              <div key={holiday.id} className="group flex items-center p-4 rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 flex flex-col items-center justify-center rounded-2xl mr-4 shrink-0 shadow-soft group-hover:scale-110 transition-transform">
                  <span className="text-[9px] font-black uppercase">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-black leading-none">{new Date(holiday.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate tracking-tight">{holiday.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{holiday.type}</p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(holiday)}
                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 font-bold py-10">No holidays scheduled.</p>}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Holiday Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. New Year's Day"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Public">Public</option>
                    <option value="Company">Company</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-6">
                <button onClick={handleCloseModal} className="flex-1 px-4 py-4 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleSaveHoliday} className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                  {editingHoliday ? 'Save Changes' : 'Launch Holiday'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
