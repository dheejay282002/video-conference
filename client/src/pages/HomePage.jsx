import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, ArrowRight, Shield, Users, Zap } from 'lucide-react';

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zoom-dark">
        <div className="bg-zoom-darker border-b border-gray-700 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zoom-blue rounded-lg animate-pulse" />
              <div className="h-7 w-28 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-20 bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-10 w-24 bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="h-16 w-16 bg-gray-700 rounded-2xl mx-auto animate-pulse" />
            <div className="h-12 w-96 bg-gray-700 rounded mx-auto animate-pulse" />
            <div className="h-6 w-80 bg-gray-700 rounded mx-auto animate-pulse" />
            <div className="flex gap-4 justify-center">
              <div className="h-14 w-44 bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-14 w-44 bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {[1,2,3].map(i => (
              <div key={i} className="bg-zoom-darker p-6 rounded-2xl border border-gray-700 space-y-3">
                <div className="w-14 h-14 bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zoom-dark">
      <nav className="bg-zoom-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-zoom-blue" />
            <span className="text-2xl font-bold">VideoConf</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all">Login</Link>
            <Link to="/register" className="btn-primary">Sign Up Free</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-zoom-blue/10 text-zoom-blue px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Zap className="w-4 h-4" /> Now powered by WebRTC & PeerJS
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Video Conferencing <br />
          <span className="text-zoom-blue">Made Simple</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Connect with anyone, anywhere. Crystal-clear video, instant messaging, and seamless screen sharing — all for free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-4">
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700 hover:border-zoom-blue/50 transition-all group">
            <div className="w-14 h-14 bg-zoom-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-zoom-blue/20 transition-all">
              <Video className="w-7 h-7 text-zoom-blue" />
            </div>
            <h3 className="text-xl font-bold mb-3">HD Video Calls</h3>
            <p className="text-gray-400">Crystal-clear video and audio powered by WebRTC peer-to-peer connections.</p>
          </div>
          <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700 hover:border-green-500/50 transition-all group">
            <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-all">
              <Users className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Chat</h3>
            <p className="text-gray-400">Send messages, share links, and communicate during your video calls.</p>
          </div>
          <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-all">
              <Shield className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
            <p className="text-gray-400">End-to-end encrypted connections. Your meetings stay private.</p>
          </div>
        </div>
      </section>

      <footer className="bg-zoom-darker border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>VideoConf - Free Video Conferencing Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
