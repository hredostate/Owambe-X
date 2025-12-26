import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Coins, Wallet } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import EventPage from './pages/EventPage';
import HostDashboard from './pages/HostDashboard';
import ScreenMode from './pages/ScreenMode';
import OwambeScreenMode from './src/pages/OwambeScreenMode';
import OwambeGuest from './src/pages/OwambeGuest';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/owambe" className="flex items-center gap-2 group">
              <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Owambe<span className="text-purple-500">Mode</span></span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/owambe" className="text-sm font-medium hover:text-purple-400 transition-colors">Find Party</Link>
              <Link to="/owambe/wallet" className="flex items-center gap-1.5 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 px-4">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">₦0.00</span>
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/owambe" element={<LandingPage />} />
            <Route path="/owambe/event/:id" element={<EventPage />} />
            <Route path="/owambe/host/:id" element={<HostDashboard />} />
            <Route path="/owambe/screen/:id" element={<ScreenMode />} />
            <Route path="/owambe/screen-mode" element={<OwambeScreenMode />} />
            <Route path="/owambe/guest" element={<OwambeGuest />} />
            <Route path="*" element={<Navigate to="/owambe" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-white/5 py-8 bg-black">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">© 2024 Owambe Mode. Spray responsibly. Made for the culture.</p>
          </div>
        </footer>
      </div>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e1e1e', color: '#fff', border: '1px solid #333' } }} />
    </Router>
  );
};

export default App;
