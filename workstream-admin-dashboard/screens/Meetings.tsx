import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../constants';
import { meetingService } from '../src/api/meetingService';
import { employeeService } from '../src/api/employeeService';
import { Meeting, Employee } from '../types';

const Meetings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    fetchMeetings();
    fetchEmployees();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await meetingService.getAllMeetings();
      const mapped = Array.isArray(data) ? data.map((m: any) => ({
        id: m._id,
        title: m.title,
        description: m.description,
        date: m.date ? new Date(m.date).toLocaleDateString() : '',
        rawDate: m.date,
        time: m.time,
        platform: m.platform,
        meetingLink: m.meetingLink,
        attendees: m.attendees ? m.attendees.map((u: any) => u.name) : [],
        attendeeIds: m.attendees ? m.attendees.map((u: any) => u._id) : []
      })) : [];
      setMeetings(mapped);
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    date: '',
    time: '',
    platform: 'Google Meet',
    meetingLink: '',
    attendees: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMeeting) {
        await meetingService.updateMeeting(editingMeeting.id, formData);
      } else {
        await meetingService.createMeeting(formData);
      }
      fetchMeetings();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save meeting', err);
      alert('Failed to save meeting');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await meetingService.deleteMeeting(id);
      fetchMeetings();
    } catch (err) {
      console.error('Failed to delete meeting', err);
      alert('Failed to delete meeting');
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.rawDate ? new Date(meeting.rawDate).toISOString().split('T')[0] : '',
      time: meeting.time,
      platform: meeting.platform || 'Google Meet',
      meetingLink: meeting.meetingLink,
      attendees: meeting.attendeeIds || []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingMeeting(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      platform: 'Google Meet',
      meetingLink: '',
      attendees: []
    });
  };

  const inputClasses = "w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400";
  const labelClasses = "text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-0.5 mb-1 block";

  return (
    <div className="flex flex-col w-full h-full space-y-4 relative z-0">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Meetings & Events</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Coordinate team collaboration</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase shadow-lg flex items-center"
        >
          <Icons.Plus className="w-3.5 h-3.5" />
          <span className="ml-1.5">Schedule Meeting</span>
        </button>
      </div>

      {/* MEETING GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {meetings.length > 0 ? meetings.map((meeting) => (
          <div key={meeting.id} className="p-4 bg-white dark:bg-slate-900/40 rounded-xl border shadow-sm relative">
            <div className="flex justify-between">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg"><Icons.Meetings className="w-4 h-4" /></div>
              <div className="flex space-x-1 opacity-100">
                <button onClick={() => handleEdit(meeting)} className="text-blue-600">✎</button>
                <button onClick={() => handleDelete(meeting.id)} className="text-red-600">🗑</button>
              </div>
            </div>

            <h3 className="text-sm font-black mt-2 uppercase">{meeting.title}</h3>
            <p className="text-[11px] text-slate-500 mt-1">{meeting.description}</p>

            <div className="mt-3 text-[10px] flex flex-col gap-[4px]">
              <span>📅 {meeting.date}</span>
              <span>⏰ {meeting.time}</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-10 border rounded-xl">
            <p className="text-xs uppercase text-slate-500">No meetings scheduled.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950/50 backdrop-blur-sm flex justify-center items-center overflow-y-auto py-10 px-4 animate-in fade-in duration-300">

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">

            {/* MODAL HEADER */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">{editingMeeting ? 'Edit Event' : 'Schedule Event'}</h3>
                <p className="text-[9px] text-blue-500 uppercase">Team collaboration session</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-500 hover:text-black">✕</button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className={labelClasses}>Title</label>
                <input type="text" required className={inputClasses} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div>
                <label className={labelClasses}>Description</label>
                <textarea rows={2} className={inputClasses} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Date</label>
                  <input type="date" required className={inputClasses} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className={labelClasses}>Time</label>
                  <input type="time" required className={inputClasses} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Platform</label>
                  <select className={inputClasses} value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                    <option>Google Meet</option>
                    <option>Zoom</option>
                    <option>Teams</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Link</label>
                  <input type="url" className={inputClasses} placeholder="https://..." value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Participants</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {employees.map(emp => (
                    <label key={emp.id} className={`p-2 border rounded cursor-pointer ${formData.attendees.includes(emp.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold'}`}>
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.attendees.includes(emp.id)}
                        onChange={e => {
                          const current = formData.attendees;
                          if (current.includes(emp.id)) {
                            setFormData({ ...formData, attendees: current.filter((id: string) => id !== emp.id) });
                          } else {
                            setFormData({ ...formData, attendees: [...current, emp.id] });
                          }
                        }}
                      />
                      {emp.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 border p-2 rounded-lg text-slate-700 dark:text-slate-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-[1.5] bg-blue-600 text-white p-2 rounded-lg">
                  {editingMeeting ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Meetings;
