import React, { useState } from 'react';
import {
  Camera,
  Mail,
  MapPin,
  Phone,
  Lock,
  Edit3,
  ShieldCheck,
  Building,
  IndianRupee,
  Calendar,
  X,
  Save,
  CheckCircle2,
  Loader2,
  User
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { uploadService } from '../services/uploadService';

interface ProfileScreenProps {
  user: UserProfile;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'employment'>('personal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Local form state
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: (user as any).phone || '', // Using 'any' to bypass if interface not updated yet
    location: (user as any).location || '',
    workMode: user.workMode || 'WFO'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let imageUrl = user.image || user.avatar;

      if (selectedFile) {
        imageUrl = await uploadService.uploadProfileImage(selectedFile);
      }

      const updateData = {
        ...formData,
        image: imageUrl
      };

      const updated = await authService.updateProfile(updateData);

      // Update local storage with the new user data
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...storedUser, ...updated, image: imageUrl, avatar: imageUrl };
      localStorage.setItem('user', JSON.stringify(newUser));

      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);

      // Force a reload or notify parent to update state if necessary
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      <div className="px-6 md:px-10 relative space-y-8 pt-4">
        {/* Profile Header Info */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] border-[6px] border-white shadow-premium overflow-hidden bg-white">
                <img
                  src={previewUrl || user.image || user.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[40px] transition-all duration-300 ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 cursor-default'}`}
              >
                <Camera className="w-8 h-8" />
              </button>
            </div>
            <div className="pb-2">
              <h2 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight">{formData.name}</h2>
              <p className="text-indigo-600 font-black text-xs md:text-sm uppercase tracking-[0.2em] mt-1">{formData.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-[22px] text-sm font-black text-slate-700 hover:bg-slate-50 shadow-soft transition-all active-scale uppercase tracking-widest"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="p-4 bg-slate-900 text-white rounded-[22px] hover:bg-indigo-600 shadow-premium transition-all active-scale"
                >
                  <Lock className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 md:flex-none px-8 py-4 bg-slate-100 border border-slate-200 rounded-[22px] text-sm font-black text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest active-scale"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[22px] text-sm font-black shadow-premium hover:bg-indigo-700 transition-all active-scale uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Updating...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-[24px] border border-slate-100 w-fit">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-[20px] transition-all ${activeTab === 'personal' ? 'bg-white text-indigo-600 shadow-soft' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('employment')}
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-[20px] transition-all ${activeTab === 'employment' ? 'bg-white text-indigo-600 shadow-soft' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Employment
          </button>
        </div>

        {/* Dynamic Card Content */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft p-8 md:p-12 transition-all duration-500">
          {activeTab === 'personal' ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${isEditing ? 'animate-scale-in' : ''}`}>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[20px] border border-transparent">
                      <User className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{formData.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Email</label>
                  {isEditing ? (
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[20px] border border-transparent">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{formData.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[20px] border border-transparent">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{formData.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Location</label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-12 pr-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[20px] border border-transparent">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{formData.location || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Mode</label>
                  {isEditing ? (
                    <div className="flex gap-4">
                      {['WFO', 'WFH'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFormData(prev => ({ ...prev, workMode: mode as any }))}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${formData.workMode === mode
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                          {mode === 'WFO' ? 'Office (WFO)' : 'Home (WFH)'}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[20px] border border-transparent">
                      <Building className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                        {formData.workMode === 'WFH' ? 'Work From Home' : 'Work From Office'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-soft transition-all">
                  <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Role</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{formData.role}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-soft transition-all">
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                    <Building className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Organization</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{(user as any).department || 'Engineering'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-soft transition-all">
                  <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                    <IndianRupee className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Annual Payout</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{user.salary ? `₹${Number(user.salary).toLocaleString()} (${(user as any).salaryType || 'monthly'})` : 'Confidential'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-soft transition-all">
                  <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Onboard Date</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{(user as any).joiningDate || '-'}</p>
                </div>
              </div>

              <div className="p-8 bg-indigo-50/30 rounded-[32px] border border-indigo-100 relative overflow-hidden">
                <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] text-indigo-900 rotate-12" />
                <h4 className="font-[900] text-indigo-900 mb-6 flex items-center gap-3 tracking-tight">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                  Security Clearance & Privileges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['Admin Control Panel', 'Internal API Access', 'Financial Ledger View', 'HR Database Gateway', 'Cloud Deployment', 'Security Audit Logs'].map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                      </div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
