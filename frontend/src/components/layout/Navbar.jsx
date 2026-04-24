/**
 * COMPONENT: Navbar
 * Purpose: Top navigation bar shown on all protected pages.
 * Features:
 *  - Search bar
 *  - User avatar with initials from real auth
 *  - Notification bell
 *  - Sign-out dropdown
 *  - Export PDF button
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Derive display name & initials from Supabase user metadata
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const hospitalName = user?.user_metadata?.hospital_name || '';
  const initials = fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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

  return (
    <nav className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      {/* Spacer to push content to the right */}
      <div className="flex-1"></div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-8">

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
              <span className="text-white font-black text-xs">{initials}</span>
            </div>
            <svg className={`w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-all ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-sm font-bold text-slate-800">{fullName}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
                {hospitalName && (
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{hospitalName}</p>
                )}
              </div>
              <div className="py-2">
                <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile Settings
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all duration-200 flex items-center gap-2 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
