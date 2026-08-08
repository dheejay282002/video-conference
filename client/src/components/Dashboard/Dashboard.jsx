import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roomAPI } from '../../services/api';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { SkeletonDashboard } from '../UI/Skeleton';
import { Video, Plus, LogOut, Clock, Users, ChevronRight, Shield, Menu, Settings, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [meetings, setMeetings] = useState({ hosted: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { fetchMeetings(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await roomAPI.getMyMeetings();
      setMeetings(response.data);
    } catch (error) { console.error('Error fetching meetings:', error); }
    finally { setLoading(false); }
  };

  const joinMeeting = (roomCode) => navigate(`/room/${roomCode}`);

  if (authLoading || loading) return <SkeletonDashboard />;

  const isAdmin = user?.email === 'admin@videoconf.com';

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
        <div className="page-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">VidConf</span>
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2.5 hover:bg-surface-100 px-3 py-2 rounded-xl transition-all duration-200">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.displayName?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium hidden sm:block">{user?.displayName}</span>
              <Menu className="w-4 h-4 text-surface-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-64 glass shadow-float py-2 z-50 animate-scale-in">
                <div className="px-4 py-3 border-b border-surface-200/60">
                  <div className="flex items-center gap-3">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-sm font-bold text-white">
                        {user?.displayName?.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user?.displayName}</p>
                      <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors">
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-warning hover:bg-warning/5 transition-colors">
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                </div>
                <div className="border-t border-surface-200/60 py-1">
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors w-full">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="page-container py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit mb-8">
          <button onClick={() => setActiveTab('home')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'home' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            Home
          </button>
          <button onClick={() => setActiveTab('meetings')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'meetings' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            My Meetings
          </button>
        </div>

        {activeTab === 'home' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <div className="card group hover:shadow-glow transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 flex items-center justify-center group-hover:from-brand-500/20 group-hover:to-brand-600/20 transition-all duration-300">
                  <Plus className="w-7 h-7 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">New Meeting</h2>
                  <p className="text-sm text-surface-500">Start a video conference</p>
                </div>
              </div>
              <CreateRoom />
            </div>

            {/* Join Room */}
            <div className="card group hover:shadow-glow transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center group-hover:from-success/20 group-hover:to-success/10 transition-all duration-300">
                  <Video className="w-7 h-7 text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Join Meeting</h2>
                  <p className="text-sm text-surface-500">Enter a code to join</p>
                </div>
              </div>
              <JoinRoom />
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-10">
            <div>
              <h3 className="section-title mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-brand-400" />
                </div>
                Hosted by You
                <span className="badge-info">{meetings.hosted.length}</span>
              </h3>
              {meetings.hosted.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-surface-500">No meetings hosted yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.hosted.map((meeting) => (
                    <div key={meeting._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-elevated transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-brand-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{meeting.title}</h4>
                          <p className="text-sm text-surface-500 font-mono">{meeting.roomCode}</p>
                          <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(meeting.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-shrink-0">
                        <span className={meeting.isActive ? 'badge-success' : 'badge'}>
                          {meeting.isActive ? 'Active' : 'Ended'}
                        </span>
                        <button onClick={() => joinMeeting(meeting.roomCode)} className="btn-primary py-2 px-4 text-sm">Join</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="section-title mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-success" />
                </div>
                Joined Meetings
                <span className="badge-info">{meetings.joined.length}</span>
              </h3>
              {meetings.joined.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-surface-500">No meetings joined yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.joined.map((meeting) => (
                    <div key={meeting._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-elevated transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-success" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{meeting.title}</h4>
                          <p className="text-sm text-surface-500 font-mono">{meeting.roomCode}</p>
                          <p className="text-xs text-surface-400 mt-0.5">Host: {meeting.host?.displayName}</p>
                        </div>
                      </div>
                      <button onClick={() => joinMeeting(meeting.roomCode)} className="btn-primary py-2 px-4 text-sm sm:flex-shrink-0">Join</button>
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
