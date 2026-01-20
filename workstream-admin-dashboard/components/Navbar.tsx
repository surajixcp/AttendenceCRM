
import React, { useState } from 'react';
import { Icons } from '../constants';
import { ScreenType } from '../types';

interface NavbarProps {
  title: string;
  onToggleSidebar: () => void;
  onNavigate: (screen: ScreenType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, onToggleSidebar, onNavigate }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-40">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar}
          className="p-2 mr-4 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input 
            type="text" 
            placeholder="Search activity..." 
            className="w-64 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2"
          />
        </div>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Icons.Bell />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img 
              src="https://picsum.photos/seed/admin/100/100" 
              alt="Admin" 
              className="w-8 h-8 rounded-full border border-gray-200" 
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold">Admin User</p>
              <p className="text-[10px] text-gray-500">Super Admin</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fade-scale origin-top-right">
              <button 
                onClick={() => { onNavigate('Profile'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Your Profile
              </button>
              <button 
                onClick={() => { onNavigate('Settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Account Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
