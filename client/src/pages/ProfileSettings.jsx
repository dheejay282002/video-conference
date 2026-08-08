import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, User, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileSettings = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedFile) {
        await uploadAvatar(selectedFile);
      }
      if (displayName !== user.displayName) {
        await updateProfile({ displayName });
      }
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    setLoading(true);
    try {
      await updateProfile({ avatar: '' });
      setPreviewAvatar('');
      setSelectedFile(null);
      setSuccess('Avatar removed');
    } catch (err) {
      setError('Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zoom-dark">
      <nav className="bg-zoom-darker border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Profile Settings</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700">
            <h2 className="text-lg font-semibold mb-6">Profile Photo</h2>
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-zoom-blue">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-zoom-blue rounded-full flex items-center justify-center hover:bg-zoom-blue-hover transition-all shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="btn-secondary text-sm"
                >
                  Change Photo
                </button>
                {previewAvatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="text-red-400 hover:text-red-300 text-sm px-4 py-2"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB. This will be shown in meetings.</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700">
            <h2 className="text-lg font-semibold mb-6">Personal Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
          {success && <p className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
