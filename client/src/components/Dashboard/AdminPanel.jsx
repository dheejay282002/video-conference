import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Video, Activity, Trash2, Edit2, ArrowLeft, 
  UserPlus, BarChart3, Shield, Calendar, Loader2, X, Check 
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, roomsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getRooms()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      await adminAPI.updateUser(userId, { displayName: editName });
      setUsers(users.map(u => u._id === userId ? { ...u, displayName: editName } : u));
      setEditingUser(null);
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Delete this room?')) return;
    try {
      await adminAPI.deleteRoom(roomId);
      setRooms(rooms.filter(r => r._id !== roomId));
    } catch (error) {
      alert('Failed to delete room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zoom-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zoom-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zoom-dark">
      <nav className="bg-zoom-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-zoom-blue" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">ADMIN</span>
            {user?.displayName}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700 pb-4">
          {['dashboard', 'users', 'rooms'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                activeTab === tab ? 'bg-zoom-blue text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'dashboard' && <BarChart3 className="w-4 h-4 inline mr-1" />}
              {tab === 'users' && <Users className="w-4 h-4 inline mr-1" />}
              {tab === 'rooms' && <Video className="w-4 h-4 inline mr-1" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-zoom-darker p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    <p className="text-gray-400 text-sm">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-zoom-darker p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalRooms || 0}</p>
                    <p className="text-gray-400 text-sm">Total Rooms</p>
                  </div>
                </div>
              </div>
              <div className="bg-zoom-darker p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.activeRooms || 0}</p>
                    <p className="text-gray-400 text-sm">Active Rooms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-zoom-darker p-6 rounded-xl border border-gray-700">
              <h3 className="font-semibold mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats?.recentUsers?.map(u => (
                  <div key={u._id} className="flex items-center gap-3 p-3 bg-zoom-dark rounded-lg">
                    <div className="w-8 h-8 bg-zoom-blue rounded-full flex items-center justify-center text-sm font-bold">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full" /> : u.displayName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.displayName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-zoom-darker rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">All Users ({users.length})</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {users.map(u => (
                <div key={u._id} className="p-4 flex items-center justify-between hover:bg-zoom-dark/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zoom-blue rounded-full flex items-center justify-center font-bold">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : u.displayName?.charAt(0)}
                    </div>
                    <div>
                      {editingUser === u._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-zoom-dark border border-gray-600 rounded px-2 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateUser(u._id)} className="text-green-400 hover:text-green-300">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{u.displayName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    {u.email === 'admin@videoconf.com' && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Admin</span>
                    )}
                    <button
                      onClick={() => { setEditingUser(u._id); setEditName(u.displayName); }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.email !== 'admin@videoconf.com' && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="bg-zoom-darker rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">All Rooms ({rooms.length})</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {rooms.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No rooms created yet</p>
              ) : (
                rooms.map(r => (
                  <div key={r._id} className="p-4 flex items-center justify-between hover:bg-zoom-dark/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zoom-blue/20 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-zoom-blue" />
                      </div>
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="text-xs text-gray-500">
                          Code: {r.roomCode} | Host: {r.host?.displayName} | {r.participants?.length || 0} participants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${r.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                        {r.isActive ? 'Active' : 'Ended'}
                      </span>
                      <button
                        onClick={() => handleDeleteRoom(r._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
