import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { holidayService } from '../services/holidayService';
import { Holiday } from '../types';

const HolidaysScreen: React.FC = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
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

    // Calendar Logic
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-[900] text-slate-900 tracking-tight leading-none">Holiday Calendar</h2>
                    <p className="text-slate-500 font-bold text-sm mt-3">Company events and public holidays for {currentMonth.getFullYear()}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar View */}
                <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-soft p-8">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                            {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={prevMonth}
                                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-soft active-scale"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-soft active-scale"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: firstDayOfMonth(currentMonth) }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-24 md:h-32"></div>
                        ))}
                        {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const holiday = holidays.find(h => h.date.split('T')[0] === dateStr);

                            return (
                                <div key={dateStr} className={`h-24 md:h-32 border border-slate-50 rounded-[24px] p-4 flex flex-col transition-all group hover:border-indigo-100 ${holiday ? 'bg-indigo-50 border-indigo-100' : 'bg-white'}`}>
                                    <span className={`text-sm font-black ${holiday ? 'text-indigo-600' : 'text-slate-400'}`}>{dayNum}</span>
                                    {holiday && (
                                        <div className="mt-2 bg-indigo-600 text-white text-[9px] p-2 rounded-xl font-black overflow-hidden truncate shadow-lg shadow-indigo-100 animate-scale-in">
                                            {holiday.name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* List View */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[32px] shadow-premium text-white relative overflow-hidden group">
                        <Star className="absolute -top-10 -right-10 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Upcoming Events</h3>
                        <div className="space-y-4">
                            {holidays
                                .filter(h => new Date(h.date) >= new Date())
                                .slice(0, 4)
                                .map((holiday) => (
                                    <div key={holiday.id} className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4 group/item hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex flex-col items-center justify-center shrink-0 border border-white/10 group-hover/item:bg-indigo-600 transition-colors">
                                            <span className="text-[8px] font-black uppercase text-indigo-300 group-hover/item:text-indigo-100">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-base font-black leading-none">{new Date(holiday.date).getDate()}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black truncate tracking-tight">{holiday.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{holiday.type}</p>
                                        </div>
                                    </div>
                                ))}
                            {holidays.filter(h => new Date(h.date) >= new Date()).length === 0 && (
                                <p className="text-xs text-slate-400 font-bold py-4 text-center">No upcoming holidays scheduled.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-soft">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-500">Total Holidays</span>
                                <span className="text-slate-900 font-black">{holidays.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-500">Public Holidays</span>
                                <span className="text-slate-900 font-black">{holidays.filter(h => h.type === 'Public').length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-500">Company Events</span>
                                <span className="text-slate-900 font-black">{holidays.filter(h => h.type === 'Company').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolidaysScreen;
