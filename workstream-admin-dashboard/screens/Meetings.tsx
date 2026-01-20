
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { meetingService } from '../src/api/meetingService';
import { employeeService } from '../src/api/employeeService'; // Import employeeService
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
      // Map backend data to frontend model
      const mapped = Array.isArray(data) ? data.map((m: any) => ({
        id: m._id,
        title: m.title,
        description: m.description,
        date: m.date ? new Date(m.date).toLocaleDateString() : '', // Format date string
        rawDate: m.date,
        time: m.time,
        platform: m.platform,
        meetingLink: m.meetingLink,
        attendees: m.attendees ? m.attendees.map((u: any) => u.name) : [], // Start with names for display
        attendeeIds: m.attendees ? m.attendees.map((u: any) => u._id) : [] // Keep IDs
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

  // Helper form data structure for internal form use
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    date: '',
    time: '',
    platform: 'Google Meet',
    meetingLink: '',
    attendees: [] // Storing IDs here
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMeeting) {
        await meetingService.updateMeeting(editingMeeting.id, formData);
      } else {
        // @ts-ignore
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

  const inputClasses = "w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300";
  const labelClasses = "text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Meetings & Events</h2>
          <p className="text-sm text-gray-500 font-medium">Coordinate and schedule team activities</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 flex items-center shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Icons.Plus />
          <span className="ml-2">Schedule Meeting</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {meetings.length > 0 ? meetings.map((meeting) => (
          <div key={meeting.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col hover:border-blue-300 hover:shadow-xl transition-all group relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-blue-100/50 transition-colors"></div>

            <div className="flex justify-between items-start mb-6 relative">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Icons.Meetings />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(meeting)}
                  className="p-2 text-gray-300 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button
                  onClick={() => handleDelete(meeting.id)}
                  className="p-2 text-gray-300 hover:text-rose-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">{meeting.title}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-medium leading-relaxed">{meeting.description}</p>

            <div className="space-y-4 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {meeting.date}
                </div>
                <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {meeting.time}
                </div>
              </div>

              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Join via {meeting.platform || 'Link'}
                </a>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex -space-x-2">
                  {meeting.attendees && meeting.attendees.map((attendeeMember, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-700 shadow-sm overflow-hidden" title={attendeeMember}>
                      {attendeeMember[0]}
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[8px] font-black text-gray-400">
                    +
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{meeting.attendees ? meeting.attendees.length : 0} Team Members</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 font-bold">No meetings scheduled.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 md:p-10 animate-in fade-in duration-500">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingMeeting ? 'Update Event' : 'Schedule Event'}</h3>
                <div className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  {editingMeeting ? 'Modify existing session' : 'New team collaboration session'}
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all hover:rotate-90 active:scale-90 border border-slate-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form className="p-10 space-y-8 overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
              <div>
                <label className={labelClasses}>Session Title</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="e.g. Q4 Product Roadmap Review"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClasses}>Meeting Purpose & Agenda</label>
                <textarea
                  rows={3}
                  className={inputClasses}
                  placeholder="Outline the key discussion points..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Session Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Start Time</label>
                  <input
                    type="time"
                    className={inputClasses}
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 bg-blue-50/30 p-6 rounded-[24px] border border-blue-100/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">Remote Access Configuration</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Platform</label>
                    <select
                      className={inputClasses}
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Teams">Microsoft Teams</option>
                      <option value="Other">Custom Link</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Meeting URL</label>
                    <input
                      type="url"
                      className={inputClasses}
                      placeholder="https://meet.google.com/..."
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Select Key Participants</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {employees.map(emp => (
                    <label key={emp.id} className={`flex items-center gap-3 p-4 rounded-[20px] border transition-all cursor-pointer group active:scale-95 ${formData.attendees?.includes(emp.id)
                      ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100'
                      : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-indigo-200'
                      }`}>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-300 checked:border-white transition-all cursor-pointer"
                          checked={formData.attendees?.includes(emp.id)}
                          onChange={(e) => {
                            const current = formData.attendees || [];
                            if (e.target.checked) setFormData({ ...formData, attendees: [...current, emp.id] });
                            else setFormData({ ...formData, attendees: current.filter((n: string) => n !== emp.id) });
                          }}
                        />
                        <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black truncate tracking-tight transition-colors ${formData.attendees?.includes(emp.id) ? 'text-white' : 'text-slate-800'
                          }`}>
                          {emp.name}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${formData.attendees?.includes(emp.id) ? 'text-indigo-100' : 'text-slate-400'
                          }`}>
                          {emp.designation || 'Team'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/30 flex gap-4 shrink-0 mt-auto">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-6 py-4 border border-slate-200 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{editingMeeting ? 'Update Schedule' : 'Finalize Schedule'}</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
