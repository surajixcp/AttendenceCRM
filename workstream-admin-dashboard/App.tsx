
import React, { useState, useEffect } from 'react';
import { ScreenType } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardScreen from './screens/Dashboard';
import EmployeesScreen from './screens/Employees';
import AttendanceScreen from './screens/Attendance';
import LeavesScreen from './screens/Leaves';
import ProjectsScreen from './screens/Projects';
import SalaryScreen from './screens/Salary';
import HolidaysScreen from './screens/Holidays';
import MeetingsScreen from './screens/Meetings';
import SettingsScreen from './screens/Settings';
import ProfileScreen from './screens/Profile';
import LoginScreen from './screens/Login';

const AUTH_KEY = 'workstream_auth_session';

const App: React.FC = () => {
  // Initialize state from localStorage if available
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });
  
  const [activeScreen, setActiveScreen] = useState<ScreenType>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [screenKey, setScreenKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Trigger animation on screen change
  const handleNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
    setScreenKey(prev => prev + 1);
  };

  const handleLogin = (status: boolean, remember: boolean) => {
    if (status) {
      if (remember) {
        localStorage.setItem(AUTH_KEY, 'true');
      }
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simulate session clear with a brief delay for a better UX feeling
    setTimeout(() => {
      localStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
      setIsLoggingOut(false);
      setActiveScreen('Dashboard');
    }, 800);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated || isLoggingOut) {
    return (
      <div className={isLoggingOut ? "animate-pulse" : ""}>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Dashboard': return <DashboardScreen />;
      case 'Employees': return <EmployeesScreen />;
      case 'Attendance': return <AttendanceScreen />;
      case 'Leaves': return <LeavesScreen />;
      case 'Projects': return <ProjectsScreen />;
      case 'Salary': return <SalaryScreen />;
      case 'Holidays': return <HolidaysScreen />;
      case 'Meetings': return <MeetingsScreen />;
      case 'Settings': return <SettingsScreen />;
      case 'Profile': return <ProfileScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-gray-800 selection:bg-blue-100 selection:text-blue-700">
      <Sidebar 
        activeScreen={activeScreen} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 min-w-0 bg-[#f8fafc] overflow-hidden">
        <Navbar 
          title={activeScreen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onNavigate={handleNavigate}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div key={screenKey} className="max-w-7xl mx-auto animate-fade-scale">
            {renderScreen()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
