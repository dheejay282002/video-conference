import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Shield, Users, Globe, Zap, MonitorPlay } from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: <Video className="w-8 h-8" />, title: 'HD Video', desc: 'Crystal clear video quality' },
    { icon: <Shield className="w-8 h-8" />, title: 'Secure', desc: 'End-to-end encryption' },
    { icon: <Users className="w-8 h-8" />, title: 'Multi-participant', desc: 'Connect with multiple people' },
    { icon: <Globe className="w-8 h-8" />, title: 'Global', desc: 'Connect from anywhere' },
    { icon: <Zap className="w-8 h-8" />, title: 'Fast', desc: 'Low latency connections' },
    { icon: <MonitorPlay className="w-8 h-8" />, title: 'Screen Share', desc: 'Share your screen easily' },
  ];

  return (
    <div className="min-h-screen bg-zoom-dark">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-zoom-darker/80 backdrop-blur-sm z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-zoom-blue" />
            <span className="text-2xl font-bold">VideoConf</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Video Conferencing
            <span className="text-zoom-blue block mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Connect face-to-face with anyone, anywhere. Start or join meetings instantly with a simple code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg py-3 px-8">
              Get Started Free
            </Link>
            <a href="#features" className="btn-secondary text-lg py-3 px-8">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-zoom-darker">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-zoom-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-400">Create a free account in seconds</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-zoom-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
              <p className="text-gray-400">Start a new meeting or enter a 6-digit code to join</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-zoom-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-400">Start video conferencing with crystal clear quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-zoom-darker rounded-xl border border-gray-700 hover:border-zoom-blue transition-all duration-300">
                <div className="text-zoom-blue mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-700">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>2026 VideoConf. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
