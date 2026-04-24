import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const designation = user?.user_metadata?.designation || 'Medical Officer';
  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { name: 'Patients', href: '/patients', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { name: 'Calendar', href: '/calendar', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { name: 'ASHA Tasks', href: '/asha-tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { name: 'Risk Simulator', href: '/simulator', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: 'Screening Camps', href: '/screening-camps', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { name: 'Upload', href: '/upload', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    )},
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
      {/* Logo Section */}
      <div className="px-8 py-10">
        <h2 className="text-4xl font-extrabold text-blue-600 leading-tight italic tracking-tighter">
          EarlyEdge
        </h2>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-1">
          Medical Officer
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 mb-10 border-t border-gray-50 relative" ref={dropdownRef}>
        {dropdownOpen && (
          <div className="absolute bottom-full left-4 mb-3 w-64 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-50">
              <p className="text-sm font-black text-slate-800 tracking-tight">{fullName}</p>
              <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="p-2 space-y-1">
              <button 
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all flex items-center gap-4 group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span className="flex-1">Profile Settings</span>
              </button>
              <button 
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setDropdownOpen(false);
                  handleSignOut(); 
                }}
                className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-4 group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors shrink-0">
                  <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="flex-1">Sign Out</span>
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-[24px] transition-all duration-300 group ${dropdownOpen ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50/80 hover:bg-slate-100'}`}
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all duration-300 shrink-0 ${dropdownOpen ? 'bg-white border-blue-400' : 'bg-blue-600 border-white shadow-sm'}`}>
            <span className={`font-black text-xs ${dropdownOpen ? 'text-blue-600' : 'text-white'}`}>{initials}</span>
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <p className={`text-sm font-black tracking-tight truncate w-full text-left transition-colors ${dropdownOpen ? 'text-white' : 'text-slate-800'}`}>{fullName}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest truncate w-full text-left transition-colors ${dropdownOpen ? 'text-blue-100' : 'text-slate-400'}`}>{designation}</p>
          </div>
          <svg className={`w-4 h-4 ml-auto transition-all duration-300 ${dropdownOpen ? 'text-white rotate-180' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
