import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../src/api/uploadService';
import { authService } from '../src/api/authService';
import { settingService, CompanySettings } from '../src/api/settingService';

const Settings: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    image: '',
    phone: '',
    location: ''
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'WorkStream Inc.',
    adminEmail: 'admin@workstream.com',
    workingHours: {
      checkIn: '09:00',
      gracePeriod: 15,
      checkOut: '18:00'
    },
    weekendPolicy: ['Sat', 'Sun']
  });

  useEffect(() => {
    fetchProfile();
    fetchCompanySettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = await authService.getMe();
      setProfile({
        name: user.name || '',
        email: user.email || '',
        password: '',
        image: user.image || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const data = await settingService.getSettings();
      setCompanySettings(data);
      if (data.companyLogo) setLogo(data.companyLogo);
    } catch (err) {
      console.error('Failed to fetch company settings', err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profile);
      alert('Profile updated successfully!');
      fetchProfile(); // Refresh
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile');
    }
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingService.updateSettings(companySettings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to update settings', err);
      alert('Failed to update settings');
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadService.uploadProfileImage(file);
        setProfile(prev => ({ ...prev, image: url }));
      } catch (err) {
        console.error('Profile image upload failed', err);
        alert('Image upload failed');
      }
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadService.uploadCompanyLogo(file);
        setLogo(url);
        setCompanySettings(prev => ({ ...prev, companyLogo: url }));
        alert('Logo uploaded successfully');
      } catch (error) {
        console.error('Logo upload failed', error);
        alert('Logo upload failed');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleWeekendDay = (day: string) => {
    setCompanySettings(prev => {
      const newPolicy = prev.weekendPolicy.includes(day)
        ? prev.weekendPolicy.filter(d => d !== day)
        : [...prev.weekendPolicy, day];
      return { ...prev, weekendPolicy: newPolicy };
    });
  };

  const inputClasses = "w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 font-medium placeholder:text-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm mb-1";
  const labelClasses = "text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">

      {/* Personal Profile Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-2xl font-black text-gray-900">Personal Profile</h3>
          <p className="text-sm text-gray-500 font-medium">Manage your account details and security</p>
        </div>

        <form className="p-8 space-y-8" onSubmit={handleProfileUpdate}>
          {/* Profile Image */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden border-4 border-white shadow-lg">
                {profile.image ? (
                  <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                )}
              </div>
              <button
                type="button"
                onClick={() => profileImageInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                title="Change Photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
              <input
                type="file"
                ref={profileImageInputRef}
                onChange={handleProfileImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-black text-gray-900">{profile.name || 'Admin User'}</h4>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClasses}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className={inputClasses}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className={inputClasses}
                placeholder="New York, USA"
              />
            </div>
            <div className="space-y-1 col-span-full">
              <label className={labelClasses}>New Password (Optional)</label>
              <input
                type="password"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                className={inputClasses}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
              Update Profile
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-2xl font-black text-gray-900">General Settings</h3>
          <p className="text-sm text-gray-500 font-medium">Global system configurations and policies</p>
        </div>

        <form className="p-8 space-y-10" onSubmit={handleCompanyUpdate}>
          {/* Logo Management Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200 overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  companySettings.companyName?.[0] || "W"
                )}
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-blue-600 hover:text-blue-700 hover:scale-110 transition-all active:scale-95"
                title="Change Logo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-black text-gray-900">Company Logo</h4>
              <p className="text-sm text-gray-500 mb-3">Update your brand identity across the dashboard</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Upload New
                </button>
                {logo && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogo(null);
                      setCompanySettings(prev => ({ ...prev, companyLogo: '' }));
                    }}
                    className="px-4 py-2 bg-rose-50 text-xs font-bold text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClasses}>Company Identity Name</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Primary Admin Email</label>
              <input
                type="email"
                value={companySettings.adminEmail}
                onChange={(e) => setCompanySettings({ ...companySettings, adminEmail: e.target.value })}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Working Hours Policy</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className={labelClasses}>Standard Check-in</label>
                <div className="relative">
                  <input
                    type="time"
                    value={companySettings.workingHours.checkIn}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      workingHours: { ...companySettings.workingHours, checkIn: e.target.value }
                    })}
                    className={inputClasses}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Grace Period (Min)</label>
                <input
                  type="number"
                  value={companySettings.workingHours.gracePeriod}
                  onChange={(e) => setCompanySettings({
                    ...companySettings,
                    workingHours: { ...companySettings.workingHours, gracePeriod: parseInt(e.target.value) || 0 }
                  })}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Work Day End</label>
                <div className="relative">
                  <input
                    type="time"
                    value={companySettings.workingHours.checkOut}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      workingHours: { ...companySettings.workingHours, checkOut: e.target.value }
                    })}
                    className={inputClasses}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Weekend Policy</h4>
            </div>
            <div className="flex flex-wrap gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <label key={day} className="flex items-center space-x-3 cursor-pointer p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all hover:shadow-md group">
                  <input
                    type="checkbox"
                    checked={companySettings.weekendPolicy.includes(day)}
                    onChange={() => toggleWeekendDay(day)}
                    className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
              Save All Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-2xl font-black text-gray-900">Role & Permissions</h3>
          <p className="text-sm text-gray-500 font-medium">Manage what different user roles can access</p>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[
              { role: 'Admin', users: 3, description: 'Full system access and data modification', color: 'bg-blue-600' },
              { role: 'Manager', users: 12, description: 'Access to department employees and leave approval', color: 'bg-indigo-600' },
              { role: 'Employee', users: 109, description: 'View own dashboard and request leaves', color: 'bg-emerald-600' },
            ].map((role, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-gray-100 hover:border-blue-100 transition-all group hover:shadow-lg hover:bg-blue-50/10">
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 ${role.color} rounded-2xl flex items-center justify-center text-white font-black shadow-lg`}>
                    {role.role[0]}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-gray-900 text-lg">{role.role}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase font-black tracking-widest">{role.users} Active Users</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{role.description}</p>
                  </div>
                </div>
                <button className="px-5 py-2.5 text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                  Edit Permissions
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
