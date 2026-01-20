
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { uploadService } from '../src/api/uploadService';
import { authService } from '../src/api/authService';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = await authService.getMe();
      setProfile({
        name: user.name || '',
        email: user.email || '',
        role: user.role === 'admin' ? 'Super Admin' : user.role === 'sub-admin' ? 'Manager' : 'Employee',
        image: user.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User'),
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        name: profile.name,
        email: profile.email,
        image: profile.image
      };

      // Only include password if user is trying to change it
      if (profile.newPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          alert('New password and confirm password do not match!');
          setIsLoading(false);
          return;
        }
        updateData.password = profile.newPassword;
      }

      await authService.updateProfile(updateData);
      alert('Profile updated successfully!');

      // Clear password fields
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      fetchProfile(); // Refresh
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        const url = await uploadService.uploadProfileImage(file);
        setProfile(prev => ({ ...prev, image: url }));
      } catch (error) {
        console.error('Upload failed', error);
        alert('Image upload failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-scale">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-black text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{profile.role}</p>
        </div>

        <form onSubmit={handleSave} className="p-8 border-t border-gray-50 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </span>
              Update Security Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                <input
                  type="password"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                <input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Minimum 8 chars"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="text-xs text-gray-400 font-medium">
              Last profile update: 2 days ago
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 flex items-center justify-between">
        <div>
          <h4 className="text-rose-900 font-black text-lg">Two-Factor Authentication</h4>
          <p className="text-rose-700 text-sm font-medium">Add an extra layer of security to your admin account.</p>
        </div>
        <button className="px-6 py-3 bg-white text-rose-600 rounded-xl font-bold border border-rose-200 hover:bg-rose-100 transition-colors active:scale-95 shadow-sm">
          Enable 2FA
        </button>
      </div>
    </div>
  );
};

export default Profile;
