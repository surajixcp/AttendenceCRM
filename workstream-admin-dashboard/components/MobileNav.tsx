import React from 'react';
import { Icons } from '../constants';
import { ScreenType } from '../types';

interface MobileNavProps {
    activeScreen: ScreenType;
    onNavigate: (screen: ScreenType) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeScreen, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const mainItems: { id: ScreenType; label: string; icon: React.FC<any> }[] = [
        { id: 'Dashboard', label: 'Dash', icon: Icons.Dashboard },
        { id: 'Employees', label: 'Staff', icon: Icons.Employees },
        { id: 'Attendance', label: 'Logs', icon: Icons.Attendance },
        { id: 'Leaves', label: 'Leaves', icon: Icons.Leaves },
    ];

    const allPages: { id: ScreenType; label: string; icon: React.FC<any> }[] = [
        { id: 'Dashboard', label: 'Home', icon: Icons.Dashboard },
        { id: 'Employees', label: 'Employees', icon: Icons.Employees },
        { id: 'Attendance', label: 'Attendance', icon: Icons.Attendance },
        { id: 'Leaves', label: 'Leaves', icon: Icons.Leaves },
        { id: 'Projects', label: 'Projects', icon: Icons.Projects },
        { id: 'Salary', label: 'Salary', icon: Icons.Salary },
        { id: 'Holidays', label: 'Holidays', icon: Icons.Holidays },
        { id: 'Meetings', label: 'Meetings', icon: Icons.Meetings },
        { id: 'Settings', label: 'Settings', icon: Icons.Settings },
        { id: 'Profile', label: 'Profile', icon: Icons.User },
    ];

    const handleNavigate = (id: ScreenType) => {
        onNavigate(id);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* All Pages Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200 dark:border-slate-800 p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">All Modules</h3>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {allPages.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeScreen === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigate(item.id)}
                                        className="flex flex-col items-center gap-2 group transition-all"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 group-hover:text-blue-500 transition-all'
                                            }`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tight text-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/50 z-[101] px-4 py-2 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {mainItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeScreen === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive
                                ? 'text-blue-600 dark:text-blue-400 scale-105'
                                : 'text-slate-400 dark:text-slate-500'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 shadow-sm' : ''
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}

                {/* More Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${isMenuOpen
                        ? 'text-blue-600 dark:text-blue-400 scale-105'
                        : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <div className={`p-1.5 rounded-xl transition-all ${isMenuOpen ? 'bg-blue-50 dark:bg-blue-500/10 shadow-sm' : ''
                        }`}>
                        <Icons.More className="w-5 h-5" />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isMenuOpen ? 'opacity-100' : 'opacity-60'
                        }`}>
                        More
                    </span>
                </button>
            </div>
        </>
    );
};

export default MobileNav;
