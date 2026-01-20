import React, { useEffect, useState } from 'react';
import { ScreenType } from '../types';
import { Icons } from '../constants';
import { settingService } from '../src/api/settingService';

interface SidebarProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate, isOpen, onToggle, onLogout }) => {
  const [companySettings, setCompanySettings] = useState({
    name: 'WorkStream',
    logo: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingService.getSettings();
        setCompanySettings({
          name: data.companyName || 'WorkStream',
          logo: data.companyLogo || ''
        });
      } catch (err) {
        console.error('Failed to fetch sidebar settings', err);
      }
    };
    fetchSettings();
  }, []);

  const menuItems: { id: ScreenType; label: string; icon: React.FC }[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'Employees', label: 'Employees', icon: Icons.Employees },
    { id: 'Attendance', label: 'Attendance', icon: Icons.Attendance },
    { id: 'Leaves', label: 'Leaves', icon: Icons.Leaves },
    { id: 'Projects', label: 'Projects', icon: Icons.Projects },
    { id: 'Salary', label: 'Salary', icon: Icons.Salary },
    { id: 'Holidays', label: 'Holidays', icon: Icons.Holidays },
    { id: 'Meetings', label: 'Meetings', icon: Icons.Meetings },
    { id: 'Settings', label: 'Settings', icon: Icons.Settings }
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-50
        ${isOpen ? 'w-72' : 'w-24'} fixed inset-y-0 left-0 lg:static shadow-sm`}
    >
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-50">
        <div className={`flex items-center space-x-3 overflow-hidden transition-all duration-500 ${!isOpen && 'lg:scale-0 lg:hidden'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 overflow-hidden">
            {companySettings.logo ? (
              <img src={companySettings.logo} alt="L" className="w-full h-full object-cover" />
            ) : companySettings.name[0]}
          </div>
          {isOpen && <span className="text-xl font-black tracking-tighter text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 truncate">{companySettings.name}</span>}
        </div>
        {!isOpen && (
          <div className="w-full flex justify-center lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md overflow-hidden">
              {companySettings.logo ? (
                <img src={companySettings.logo} alt="L" className="w-full h-full object-cover" />
              ) : companySettings.name[0]}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 sidebar-item-active active:scale-[0.98]'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'} transition-all duration-300`}>
                <Icon />
              </div>
              {isOpen && (
                <span className={`ml-4 text-sm font-bold tracking-tight transition-all duration-300 ${isActive ? 'translate-x-0' : 'translate-x-0 group-hover:translate-x-1'}`}>
                  {item.label}
                </span>
              )}
              {!isOpen && (
                <div className="absolute left-20 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-xl whitespace-nowrap">
                  {item.label}
                </div>
              )}
              {isActive && (
                <div className="absolute right-[-20px] top-[-20px] w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group relative active:scale-95"
        >
          <Icons.Logout />
          {isOpen && <span className="ml-4 text-sm font-black uppercase tracking-widest">Logout</span>}
          {!isOpen && (
            <div className="absolute left-20 px-3 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-xl whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;