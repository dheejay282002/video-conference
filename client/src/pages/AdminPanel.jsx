import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { ArrowLeft, Trash2, Shield, Users, Video, Mail, Calendar, Loader2 } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, roomsRes] = await Promise.all([adminAPI.getUsers(), adminAPI.getRooms()]);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
    } catch (error) { console.error('Error fetching data:', error); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try { await adminAPI.deleteUser(userId); setUsers(users.filter(u => u._id !== userId)); }
    catch (error) { console.error('Error deleting user:', error); }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Delete this room?')) return;
    try { await adminAPI.deleteRoom(roomId); setRooms(rooms.filter(r => r._id !== roomId)); }
    catch (error) { console.error('Error deleting room:', error); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0">
        <div className="h-16 border-b border-surface-200/60">
          <div className="page-container h-full flex items-center gap-4">
            <div className="w-8 h-8 bg-surface-200 rounded-xl animate-pulse" />
            <div className="h-5 w-32 bg-surface-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="page-container py-8 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-200 rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-surface-200 rounded animate-pulse" />
                <div className="h-3 w-48 bg-surface-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-surface-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <nav className="border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
        <div className="page-container h-16 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-surface-100 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4 text-surface-600" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-warning" />
            <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
          </div>
        </div>
      </nav>

      <div className="page-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-surface-500">Total Users</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rooms.length}</p>
              <p className="text-sm text-surface-500">Total Rooms</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit mb-6">
          <button onClick={() => setActiveTab('users')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('rooms')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'rooms' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            Rooms ({rooms.length})
          </button>
        </div>

        {/* Users */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="card flex items-center gap-4 group hover:shadow-elevated transition-all duration-300">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.displayName} className="w-12 h-12 rounded-full object-cover ring-2 ring-surface-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {u.displayName?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">{u.displayName}</h4>
                  </div>
                  <p className="text-sm text-surface-500 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                  <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                {u.email !== 'admin@videoconf.com' && (
                  <button onClick={() => handleDeleteUser(u._id)} className="p-2.5 rounded-xl hover:bg-danger/10 text-surface-400 hover:text-danger transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rooms */}
        {activeTab === 'rooms' && (
          <div className="space-y-3">
            {rooms.length === 0 ? (
              <div className="card text-center py-12"><p className="text-surface-500">No rooms created yet</p></div>
            ) : (
              rooms.map((room) => (
                <div key={room._id} className="card flex items-center gap-4 group hover:shadow-elevated transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{room.title}</h4>
                    <p className="text-sm text-surface-500 font-mono">{room.roomCode}</p>
                    <p className="text-xs text-surface-400 mt-0.5">Host: {room.host?.displayName} &middot; {new Date(room.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={room.isActive ? 'badge-success' : 'badge'}>
                    {room.isActive ? 'Active' : 'Ended'}
                  </span>
                  <button onClick={() => handleDeleteRoom(room._id)} className="p-2.5 rounded-xl hover:bg-danger/10 text-surface-400 hover:text-danger transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
