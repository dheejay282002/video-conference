import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roomAPI } from '../../services/api';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { SkeletonDashboard } from '../UI/Skeleton';
import { Video, Plus, LogOut, Clock, Users, ChevronRight, Shield, Menu, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [meetings, setMeetings] = useState({ hosted: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await roomAPI.getMyMeetings();
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = (roomCode) => {
    navigate(`/room/${roomCode}`);
  };

  if (authLoading || loading) {
    return <SkeletonDashboard />;
  }

  const isAdmin = user?.email === 'admin@videoconf.com';

  return (
    <div className="min-h-screen bg-zoom-dark">
      {/* Navbar */}
      <nav className="bg-zoom-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-zoom-blue" />
            <span className="text-2xl font-bold">VideoConf</span>
          </div>

          {/* Burger Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-zoom-blue rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.displayName?.charAt(0)}
                </div>
              )}
              <Menu className="w-5 h-5 text-gray-300" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-64 bg-zoom-darker border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-zoom-blue rounded-full flex items-center justify-center font-bold">
                        {user?.displayName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{user?.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 transition-colors">
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                </div>
                <div className="border-t border-gray-700 py-1">
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-700 pb-4">
          <button onClick={() => setActiveTab('home')} className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'home' ? 'bg-zoom-blue text-white' : 'text-gray-400 hover:text-white'}`}>
            Home
          </button>
          <button onClick={() => setActiveTab('meetings')} className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'meetings' ? 'bg-zoom-blue text-white' : 'text-gray-400 hover:text-white'}`}>
            My Meetings
          </button>
        </div>

        {activeTab === 'home' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zoom-darker p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-zoom-blue rounded-2xl flex items-center justify-center">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">New Meeting</h2>
                  <p className="text-gray-400">Start a new video conference</p>
                </div>
              </div>
              <CreateRoom />
            </div>
            <div className="bg-zoom-darker p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Join Meeting</h2>
                  <p className="text-gray-400">Enter a meeting code to join</p>
                </div>
              </div>
              <JoinRoom />
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-zoom-blue" />
                Hosted by You ({meetings.hosted.length})
              </h3>
              {meetings.hosted.length === 0 ? (
                <p className="text-gray-400">No meetings hosted yet</p>
              ) : (
                <div className="grid gap-4">
                  {meetings.hosted.map((meeting) => (
                    <div key={meeting._id} className="bg-zoom-darker p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zoom-blue rounded-xl flex items-center justify-center">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{meeting.title}</h4>
                          <p className="text-sm text-gray-400">Code: {meeting.roomCode}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(meeting.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${meeting.isActive ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                          {meeting.isActive ? 'Active' : 'Ended'}
                        </span>
                        <button onClick={() => joinMeeting(meeting.roomCode)} className="btn-primary py-2 px-4">Join</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChevronRight className="w-6 h-6 text-green-500" />
                Joined Meetings ({meetings.joined.length})
              </h3>
              {meetings.joined.length === 0 ? (
                <p className="text-gray-400">No meetings joined yet</p>
              ) : (
                <div className="grid gap-4">
                  {meetings.joined.map((meeting) => (
                    <div key={meeting._id} className="bg-zoom-darker p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{meeting.title}</h4>
                          <p className="text-sm text-gray-400">Code: {meeting.roomCode}</p>
                          <p className="text-xs text-gray-500">Host: {meeting.host?.displayName}</p>
                        </div>
                      </div>
                      <button onClick={() => joinMeeting(meeting.roomCode)} className="btn-primary py-2 px-4">Join</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
