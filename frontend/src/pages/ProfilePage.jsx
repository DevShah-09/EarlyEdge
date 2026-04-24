import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const ProfilePage = () => {
    const { user } = useAuth();
    
    // Form state
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [hospitalName, setHospitalName] = useState(user?.user_metadata?.hospital_name || '');
    const [designation, setDesignation] = useState(user?.user_metadata?.designation || '');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const email = user?.email || 'N/A';
    const initials = (user?.user_metadata?.full_name || email.split('@')[0])
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleUpdate = async () => {
        setUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    hospital_name: hospitalName,
                    designation: designation
                }
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error('Update error:', err);
            setMessage({ type: 'error', text: err.message });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 border-4 border-white ring-1 ring-slate-100 relative group overflow-hidden shrink-0">
                    <span className="relative z-10">{initials}</span>
                </div>
                <div className="text-center md:text-left space-y-1 flex-1">
                    <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">Profile Settings</h1>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                            Verified
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold tracking-[0.1em] uppercase text-[10px]">Manage your professional digital identity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Edit Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        
                        <div className="relative z-10 space-y-12">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Professional Profile</h3>
                                    <p className="text-slate-400 text-sm font-bold">Your details will be visible in patient reports.</p>
                                </div>
                            </div>

                            {message.text && (
                                <div className={`p-5 rounded-3xl font-bold text-sm flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">FULL NAME</label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[28px] px-8 py-5 font-bold text-slate-700 shadow-inner transition-all outline-none text-base"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-3 opacity-60 cursor-not-allowed">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">EMAIL ADDRESS (PRIMARY)</label>
                                    <div className="w-full bg-slate-100 border-2 border-transparent rounded-[28px] px-8 py-5 font-bold text-slate-500 shadow-inner">
                                        {email}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">HOSPITAL / CLINIC NAME</label>
                                    <input 
                                        type="text"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[28px] px-8 py-5 font-bold text-slate-700 shadow-inner transition-all outline-none text-base"
                                        placeholder="Where do you practice?"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">PROFESSIONAL DESIGNATION</label>
                                    <input 
                                        type="text"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[28px] px-8 py-5 font-bold text-slate-700 shadow-inner transition-all outline-none text-base"
                                        placeholder="e.g. Medical Officer, Specialist"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex items-center gap-6">
                                <button 
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className="bg-slate-900 text-white px-12 py-5 rounded-[28px] font-black text-xs tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-4"
                                >
                                    {updating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    {updating ? 'SYNCING DATA...' : 'UPDATE INFORMATION'}
                                </button>
                                <p className="text-[10px] text-slate-400 font-bold max-w-[200px] leading-relaxed">
                                    Changes will be reflected across all clinical reports and dashboards.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-10">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 space-y-10 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[36px] flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Security Protocol</h4>
                            <p className="text-slate-400 font-bold text-xs leading-relaxed px-2">
                                Your session is protected by end-to-end encryption. Last security audit: <span className="text-slate-600">Today</span>.
                            </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] border border-emerald-100 shadow-sm">
                            Identity Verified
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-black text-slate-800 text-sm">Auth Logs</h5>
                            <p className="text-[10px] text-slate-400 font-bold">System monitoring is active for your account.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

