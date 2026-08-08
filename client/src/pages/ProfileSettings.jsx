import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonProfile } from '../components/UI/Skeleton';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';

const ProfileSettings = () => {
  const { user, loading, updateProfile, updatePassword, logout } = useAuth();
  const navigate = useNavigate();
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/user/profile-photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok) { window.location.reload(); } else { setMessage({ type: 'error', text: data.message }); }
    } catch (error) { setMessage({ type: 'error', text: 'Failed to upload photo' }); }
    finally { setUploading(false); }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/user/profile-photo`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) window.location.reload();
    } catch (error) { setMessage({ type: 'error', text: 'Failed to remove photo' }); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(displayName);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to update profile' }); }
    finally { setSaving(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updatePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword(''); setNewPassword('');
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-zoom-dark">
      <div className="bg-zoom-darker border-b border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-700 rounded-lg transition-all"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-semibold">Profile Settings</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {message.text && (<div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}><p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p></div>)}
        <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700">
          <h2 className="text-lg font-semibold mb-6">Profile Photo</h2>
          <div className="flex flex-col items-center gap-4">
            {user.avatar ? (<img src={user.avatar} alt={user.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-zoom-blue" />) : (<div className="w-32 h-32 bg-zoom-blue rounded-full flex items-center justify-center text-4xl font-bold">{user.displayName?.charAt(0)}</div>)}
            <div className="flex gap-3">
              <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="flex items-center gap-2 bg-zoom-blue hover:bg-blue-600 px-4 py-2 rounded-lg transition-all disabled:opacity-50">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              {user.avatar && <button onClick={handleRemovePhoto} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all">Remove</button>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
        </div>
        <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700">
          <h2 className="text-lg font-semibold mb-6">Basic Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Email</label><input type="email" value={user.email} className="input-field opacity-60 cursor-not-allowed" disabled /><p className="text-xs text-gray-500 mt-1">Email cannot be changed</p></div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
        <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700">
          <h2 className="text-lg font-semibold mb-6">Change Password</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" required /></div>
            <button type="submit" disabled={saving} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50">
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        <div className="bg-zoom-darker p-6 rounded-2xl border border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Account</h2>
          <p className="text-gray-400 text-sm mb-4">Sign out from your account</p>
          <button onClick={() => { logout(); navigate('/'); }} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-all">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
