import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, ArrowRight, Shield, Users, Zap, Globe, Lock, Sparkles } from 'lucide-react';

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 mesh-bg">
        <div className="h-16 border-b border-surface-200/60">
          <div className="page-container h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600/20 animate-pulse" />
              <div className="h-6 w-24 bg-surface-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-20 bg-surface-200 rounded-xl animate-pulse" />
              <div className="h-10 w-28 bg-brand-600 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
        <div className="page-container py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="h-12 w-64 bg-surface-200 rounded-full mx-auto animate-pulse" />
            <div className="h-16 w-full max-w-lg bg-surface-200 rounded-2xl mx-auto animate-pulse" />
            <div className="h-16 w-full max-w-md bg-surface-200 rounded-2xl mx-auto animate-pulse" />
            <div className="h-6 w-96 bg-surface-200 rounded-lg mx-auto animate-pulse" />
            <div className="flex gap-4 justify-center">
              <div className="h-14 w-48 bg-brand-600 rounded-2xl animate-pulse" />
              <div className="h-14 w-48 bg-surface-200 rounded-2xl animate-pulse" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-24">
            {[1,2,3].map(i => (
              <div key={i} className="card space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-200 animate-pulse" />
                <div className="h-5 w-32 bg-surface-200 rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-surface-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-surface-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 mesh-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
        <div className="page-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VidConf</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-[128px]" />
        <div className="page-container relative py-28 lg:py-36">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 px-4 py-1.5 rounded-full text-sm font-medium border border-brand-500/20 mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Free forever. No credit card required.
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up">
              Meetings that<br />
              <span className="text-gradient">feel in person</span>
            </h1>
            <p className="text-lg sm:text-xl text-surface-600 max-w-xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Crystal-clear video, instant chat, and screen sharing. Built with WebRTC for zero-latency, peer-to-peer connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2.5 group">
                Start for Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-4 px-8">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Video className="w-6 h-6" />, title: 'HD Video & Audio', desc: 'Crystal-clear peer-to-peer calls powered by WebRTC. No plugins, no downloads.', color: 'brand' },
            { icon: <Users className="w-6 h-6" />, title: 'Real-time Chat', desc: 'Send messages, share links, and stay connected during your calls.', color: 'success' },
            { icon: <Shield className="w-6 h-6" />, title: 'End-to-End Encrypted', desc: 'Your calls are peer-to-peer and never pass through our servers.', color: 'brand' },
          ].map((f, i) => (
            <div key={i} className="card group hover:shadow-glow transition-all duration-500">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                f.color === 'success' ? 'bg-success/10 text-success group-hover:bg-success/20' : 'bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20'
              }`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-surface-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="page-container py-16 border-t border-surface-200/60">
        <div className="flex flex-wrap items-center justify-center gap-12 text-surface-500">
          {[
            { icon: <Globe className="w-5 h-5" />, label: 'Works Everywhere' },
            { icon: <Lock className="w-5 h-5" />, label: 'Zero Data Collection' },
            { icon: <Zap className="w-5 h-5" />, label: 'No Latency' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium">
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200/60 py-8">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <div className="w-5 h-5 rounded-md bg-brand-600/20 flex items-center justify-center">
              <Video className="w-3 h-3 text-brand-400" />
            </div>
            VidConf
          </div>
          <p className="text-surface-500 text-sm">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
