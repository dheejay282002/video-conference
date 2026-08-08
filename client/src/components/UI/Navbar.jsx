import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Video, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-zoom-darker border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Video className="w-8 h-8 text-zoom-blue" />
          <span className="text-2xl font-bold">VideoConf</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-zoom-blue rounded-full flex items-center justify-center font-bold">
                  {user.displayName?.charAt(0)}
                </div>
              )}
              <span className="hidden md:block">{user.displayName}</span>
            </div>
            <button onClick={logout} className="btn-icon" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
