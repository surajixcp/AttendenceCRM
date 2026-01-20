import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  ChevronRight,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { Meeting } from '../types';
import { meetingService } from '../services/meetingService';

const MeetingsScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await meetingService.getMyMeetings();
      if (Array.isArray(data)) {
        setMeetings(data);
      }
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    }
  };

  const filteredMeetings = meetings.filter(m =>
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayStr = new Date().toDateString();
  const todaysMeetings = filteredMeetings.filter(m => new Date(m.date).toDateString() === todayStr);
  const upcomingMeetings = filteredMeetings.filter(m => new Date(m.date) > new Date() && new Date(m.date).toDateString() !== todayStr);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Meetings</h2>
          <p className="text-slate-500">Stay updated with your daily and weekly schedule.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3">Today - {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {todaysMeetings.length > 0 ? todaysMeetings.map((meeting) => (
              <div key={meeting.id || meeting._id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft hover:border-indigo-300 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[100px] -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors"></div>

                <div className="flex flex-col sm:flex-row items-start gap-8 relative z-10">
                  <div className="w-full sm:w-24 text-center flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner group-hover:bg-indigo-50 transition-colors">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{meeting.time.split(' ')[1] || 'AM'}</span>
                    <span className="text-3xl font-black text-slate-900 leading-none">{meeting.time.split(' ')[0] || meeting.time}</span>
                    <div className="h-1 w-8 bg-indigo-200 rounded-full mt-3" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">Live Today</span>
                          <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">{meeting.platform || 'General'}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{meeting.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{meeting.description}</p>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={`https://ui-avatars.com/api/?name=${(meeting.createdBy as any)?.name || 'Organizer'}&background=4f46e5&color=fff`}
                            className="w-8 h-8 rounded-xl border-2 border-white shadow-soft"
                            alt="Avatar"
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Organized by</span>
                          <span className="text-xs font-black text-slate-800">{(meeting.createdBy as any)?.name || 'Organizer'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-600">{meeting.attendees?.length || 0} Members</span>
                      </div>
                    </div>

                    {meeting.meetingLink && (
                      <div className="pt-4 flex gap-4">
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                          <Video className="w-4 h-4" />
                          Join via {meeting.platform || 'Link'}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No meetings today</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3">Upcoming</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {upcomingMeetings.length > 0 ? upcomingMeetings.map((meeting) => (
              <div key={meeting.id || meeting._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:border-indigo-200 transition-all group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[80px] group-hover:bg-indigo-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-400">{new Date(meeting.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none mt-1">{new Date(meeting.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">{meeting.platform || 'General'}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{meeting.time}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">{meeting.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Organized by <span className="text-slate-600">{(meeting.createdBy as any)?.name || 'Organizer'}</span></p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white p-8 rounded-[32px] border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Mini Calendar Column */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Calendar Mode</h3>
            <div className="aspect-square bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Switch to Calendar View</p>
                <p className="text-xs text-slate-500 mt-1">Get a visual bird's eye view of your meetings across the entire month.</p>
              </div>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-indigo-100">Open Calendar</button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <h4 className="font-bold text-lg mb-4">Meeting Tips</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-xs text-slate-400">Join 2 minutes before the start time to test your audio.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-xs text-slate-400">Keep your camera on for better engagement during planning sessions.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-xs text-slate-400">Record all client demos for future reference and documentation.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsScreen;
