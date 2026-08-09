import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonProfile } from '../components/UI/Skeleton';
import { ArrowLeft, Camera, Loader2, Save, LogOut, Shield } from 'lucide-react';

const ProfileSettings = () => {
  const { user, loading, updateProfile, updatePassword, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (loading) return <SkeletonProfile />;
  if (!user) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://videoconf-api.onrender.com';

      const response = await fetch(`${API_URL}/api/user/profile-photo`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
      });
      const data = await response.json();
      if (response.ok) window.location.reload();
      else setMessage({ type: 'error', text: data.message });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to upload photo' }); }
    finally { setUploading(false); }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://videoconf-api.onrender.com';

      const response = await fetch(`${API_URL}/api/user/profile-photo`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) window.location.reload();
    } catch (error) { setMessage({ type: 'error', text: 'Failed to remove photo' }); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try { await updateProfile(displayName); setMessage({ type: 'success', text: 'Profile updated!' }); }
    catch (error) { setMessage({ type: 'error', text: 'Failed to update profile' }); }
    finally { setSaving(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updatePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password updated!' });
      setCurrentPassword(''); setNewPassword('');
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <nav className="border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
        <div className="page-container h-16 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-surface-100 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4 text-surface-600" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Profile Settings</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {message.text && (
          <div className={`p-4 rounded-xl animate-slide-down ${
            message.type === 'success' ? 'bg-success/5 border border-success/20' : 'bg-danger/5 border border-danger/20'
          }`}>
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>{message.text}</p>
          </div>
        )}

        {/* Photo */}
        <div className="card">
          <h2 className="text-sm font-semibold text-surface-700 mb-6 uppercase tracking-wider">Profile Photo</h2>
          <div className="flex flex-col items-center gap-5">
            {user.avatar ? (
              <div className="relative group">
                <img src={user.avatar} alt={user.displayName} className="w-28 h-28 rounded-full object-cover ring-4 ring-surface-200 transition-all duration-300 group-hover:ring-brand-500/30" />
                <div className="absolute inset-0 rounded-full bg-surface-0/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-4xl font-bold text-white shadow-glow">
                {user.displayName?.charAt(0)}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              {user.avatar && (
                <button onClick={handleRemovePhoto} className="btn-secondary py-2.5 px-5 text-sm">Remove</button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-surface-700 mb-6 uppercase tracking-wider">Basic Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input type="email" value={user.email} className="input-field opacity-60 cursor-not-allowed" disabled />
              <p className="text-xs text-surface-400 mt-1.5">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <h2 className="text-sm font-semibold text-surface-700 mb-6 uppercase tracking-wider">Change Password</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" required />
            </div>
            <button type="submit" disabled={saving} className="btn-secondary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Sign Out */}
        <div className="card border-danger/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Sign Out</h2>
              <p className="text-sm text-surface-500">Sign out from your account</p>
            </div>
            <button onClick={() => { logout(); window.location.href = '/'; }} className="btn-danger flex items-center gap-2 py-2.5">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
