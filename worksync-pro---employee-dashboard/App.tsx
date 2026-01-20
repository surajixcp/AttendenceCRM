import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Briefcase,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Clock,
  Briefcase as ProjectIcon,
  Calendar,
  Settings,
  HelpCircle,
  Star
} from 'lucide-react';
import { Screen, UserProfile, AppNotification } from './types';
import { authService } from './services/authService';
import { settingService } from './services/settingService';

// Screen Components
import DashboardScreen from './screens/DashboardScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import LeavesScreen from './screens/LeavesScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import MeetingsScreen from './screens/MeetingsScreen';
import HolidaysScreen from './screens/HolidaysScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: 'WorkSync',
    logo: ''
  });

  // Derived state for unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Check auth on mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      // Optionally fetch fresh profile
      authService.getProfile().then(u => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      }).catch(() => {
        // Token might be invalid
        // setIsAuthenticated(false);
      });
    }

    // Fetch Global Settings
    settingService.getSettings().then(data => {
      setCompanySettings({
        name: data.companyName || 'WorkSync',
        logo: data.companyLogo || ''
      });
    }).catch(err => console.error("Setting fetch error", err));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentScreen('Dashboard');
    setUser(null);
  };

  const handleScreenChange = (screen: Screen) => {
    if (screen === currentScreen) return;
    setIsTransitioning(true);
    // Scroll to top on screen change
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }, 200);
  };

  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Attendance', icon: CalendarCheck, label: 'Attendance' },
    { id: 'Leaves', icon: FileText, label: 'Leaves' },
    { id: 'Projects', icon: Briefcase, label: 'Projects' },
    { id: 'Meetings', icon: Users, label: 'Meetings' },
    { id: 'Holidays', icon: Star, label: 'Holidays' },
    { id: 'Profile', icon: User, label: 'Profile' },
  ];

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard': return <DashboardScreen onNavigate={handleScreenChange} />;
      case 'Attendance': return <AttendanceScreen />;
      case 'Leaves': return <LeavesScreen />;
      case 'Projects': return <ProjectsScreen />;
      case 'Meetings': return <MeetingsScreen />;
      case 'Holidays': return <HolidaysScreen />;
      case 'Profile': return user ? <ProfileScreen user={user} /> : null;
      default: return <DashboardScreen onNavigate={handleScreenChange} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-100 transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 h-20 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 group cursor-pointer active-scale overflow-hidden">
              {companySettings.logo ? (
                <img src={companySettings.logo} alt="L" className="w-full h-full object-cover" />
              ) : (
                <span className="group-hover:rotate-12 transition-transform">{companySettings.name[0]}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none truncate">{companySettings.name}</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Enterprise</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4 scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScreenChange(item.id as Screen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative active-scale group ${currentScreen === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 nav-active'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${currentScreen === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto space-y-2 shrink-0">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Status</span>
              </div>
              <p className="text-[11px] font-bold text-slate-600">All systems operational.</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all active-scale group"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 md:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors active-scale"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight transition-all truncate max-w-[120px] md:max-w-none">
                {currentScreen}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{companySettings.name} Pro</span>
                <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-300" />
                <span className="hidden md:inline text-[10px] font-bold text-indigo-500 uppercase tracking-widest">v2.4.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <div className="hidden sm:flex items-center relative group">
              <Search className="w-4 h-4 absolute left-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 w-40 md:w-80 transition-all outline-none"
              />
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileMenuOpen(false);
                }}
                className={`p-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 relative transition-all active-scale ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600 shadow-inner' : ''}`}
              >
                <Bell className="w-5.5 h-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-live-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-4 w-[280px] sm:w-[420px] bg-white rounded-[24px] shadow-premium border border-slate-100 overflow-hidden z-[90] animate-scale-in">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                      <div>
                        <h3 className="font-black text-slate-900 text-lg tracking-tight">Activity Center</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Updates & Tasks</p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg active-scale"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-4 md:p-5 border-b border-slate-50 flex gap-4 cursor-pointer hover:bg-slate-50/80 transition-all group ${!n.read ? 'bg-indigo-50/10' : ''}`}
                          >
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[16px] md:rounded-[18px] flex items-center justify-center shrink-0 shadow-soft transition-transform group-hover:scale-110 ${n.type === 'meeting' ? 'bg-amber-100 text-amber-600' :
                              n.type === 'leave' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-indigo-100 text-indigo-600'
                              }`}>
                              {n.type === 'meeting' ? <Clock className="w-5 h-5 md:w-6 md:h-6" /> :
                                n.type === 'leave' ? <Calendar className="w-5 h-5 md:w-6 md:h-6" /> :
                                  <ProjectIcon className="w-5 h-5 md:w-6 md:h-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-xs md:text-sm font-black truncate tracking-tight ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h4>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2 bg-slate-100 px-2 py-0.5 rounded-full">{n.time}</span>
                              </div>
                              <p className={`text-[11px] md:text-xs leading-relaxed font-medium ${!n.read ? 'text-slate-600' : 'text-slate-500'}`}>{n.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-10">
                          <Bell className="w-10 h-10 text-slate-200 mb-3" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className={`flex items-center gap-3 p-1 rounded-full md:rounded-[20px] md:pl-3.5 hover:bg-slate-50 transition-all border border-transparent active-scale ${isProfileMenuOpen ? 'bg-white border-slate-100 shadow-soft' : ''}`}
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-slate-900 leading-none">{user?.name || 'User'}</p>
                  <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">{user?.department || 'Employee'}</p>
                </div>
                <div className="relative">
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')}
                    alt="Profile"
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full md:rounded-[16px] object-cover border-2 border-white shadow-soft ring-1 ring-slate-100"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-500 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-4 w-56 bg-white rounded-[24px] shadow-premium border border-slate-100 py-3 z-[90] animate-scale-in">
                    <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-bold group">
                      <Settings className="w-4.5 h-4.5 text-slate-400 group-hover:rotate-45 transition-transform" />
                      Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-bold group">
                      <HelpCircle className="w-4.5 h-4.5 text-slate-400" />
                      Support
                    </button>
                    <hr className="my-2 border-slate-50 mx-4" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-black transition-colors"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="animate-fade-in-up max-w-[1600px] mx-auto">
            {renderScreen()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
