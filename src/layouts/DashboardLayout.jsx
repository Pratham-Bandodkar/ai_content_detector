import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Music, Video, 
  FileCheck, History, Settings, LogOut, Menu, X, Bell, Search, 
  User, CheckCircle, ShieldAlert, Zap, Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const { user, notifications, markAllNotificationsRead, clearNotifications, history } = useApp();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle mock search logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = history.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, history]);

  const handleExit = () => {
    showToast('Returning to landing portal.', 'info');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Text Detection', path: '/dashboard/text', icon: <FileText className="w-5 h-5" /> },
    { name: 'Image Detection', path: '/dashboard/image', icon: <ImageIcon className="w-5 h-5" /> },
    { name: 'Audio Detection', path: '/dashboard/audio', icon: <Music className="w-5 h-5" /> },
    { name: 'Video Detection', path: '/dashboard/video', icon: <Video className="w-5 h-5" /> },
  ];

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 flex relative overflow-hidden">
      {/* Cyber Grid Overlay background */}
      <div className="absolute inset-0 cyber-grid pointer-events-none" />

      {/* Sidebar navigation for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#121826]/70 border-r border-white/5 backdrop-blur-xl shrink-0 z-40 relative">
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              AI Content Detector
            </h1>
            <span className="text-[9px] font-bold text-blue-400 tracking-wider">
              A.I. THREAT ARREST
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          
          <button
            onClick={handleExit}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            EXIT TO PORTAL
          </button>
        </div>
      </aside>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Slide-out Menu */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#121826]/95 border-r border-white/5 backdrop-blur-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-blue-500" />
                  <span className="font-extrabold text-white tracking-widest text-sm uppercase">AI Content Detector</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/20 text-blue-400' 
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-white/5 bg-black/20">
                
                <button
                  onClick={handleExit}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  EXIT TO PORTAL
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-4 lg:px-8 border-b border-white/5 bg-[#0B0F19]/60 backdrop-blur-xl flex items-center justify-between shrink-0 z-30 relative">
          {/* Left search/menu toggler */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="font-extrabold text-white tracking-widest text-xs uppercase truncate">AI Content Detector</span>
            </div>
            
            {/* Search Input Box */}
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scans by system name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#121826]/40 hover:bg-[#121826]/80 focus:bg-[#121826] border border-white/5 focus:border-blue-500/50 rounded-xl text-xs font-medium text-white placeholder-gray-400 focus:outline-none transition-all focus:ring-1 focus:ring-blue-500/20"
              />
              
              {/* Search Results Popover */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-x-0 top-full mt-2 bg-[#121826] border border-white/10 rounded-xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto"
                  >
                    <div className="text-[10px] font-bold text-gray-500 px-3 py-1.5 uppercase tracking-wider">
                      Matching Scan Logs
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => {
                          setSearchQuery('');
                          navigate('/dashboard/reports', { state: { highlightScanId: result.id } });
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{result.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{result.type} • {result.date}</p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          result.result === 'AI Generated' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable workspace content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#0B0F19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
