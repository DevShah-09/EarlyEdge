import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import loginBackground from '../assets/login-bg.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signIn(email, password);
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-50 overflow-hidden font-['Outfit']">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 group">
        <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
           <img 
            src={loginBackground} 
            alt="Hospital Login Background" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/40" />
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <div className="flex items-center gap-3 animate-in slide-in-from-top duration-700">
            <div className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl border border-white/30 shadow-2xl">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-2xl font-serif italic font-black text-white tracking-tight uppercase">EarlyEdge</span>
          </div>

          <div className="space-y-6 animate-in slide-in-from-left duration-1000 delay-200">
            <h2 className="text-6xl font-serif italic font-bold text-white leading-tight">
              Clinical Excellence <br/> <span className="text-blue-400">Simplified.</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-light">
              Access the most advanced NCD risk prediction platform for hospitals. Manage patient screening, risk simulation, and ASHA worker coordination — all in one place.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex-1 hover:bg-white/20 transition-all cursor-default">
                <div className="text-3xl font-bold text-white mb-1">10k+</div>
                <div className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Patients Screened</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex-1 hover:bg-white/20 transition-all cursor-default text-right">
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Accuracy Rate</div>
              </div>
            </div>
          </div>

          <div className="text-slate-500 text-sm font-medium">
             © 2026 RAM Bharose. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Auth Side (Right) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-8 right-8 lg:hidden flex items-center gap-2">
           <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-serif italic font-black text-slate-800 uppercase text-lg">EarlyEdge</span>
        </div>

        <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in duration-700">
                    <div className="mb-12">
                        <h1 className="text-5xl font-extrabold text-blue-600 italic tracking-tighter leading-none mb-2">EarlyEdge</h1>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Precision NCD Risk Intelligence</p>
                    </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest ml-1">Hospital Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  id="login-email"
                  type="email" 
                  required
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g. dr.smith@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input 
                  id="login-password"
                  type="password" 
                  required
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-5 rounded-[24px] font-black text-sm tracking-wide shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase overflow-hidden relative group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                   Authenticating...
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <footer className="text-center space-y-4 pt-4">
             <div className="text-sm font-medium text-slate-400">
               New hospital? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Register Your Facility</Link>
             </div>
             
             <div className="flex items-center gap-2 justify-center py-4 opacity-40">
                <div className="h-px w-8 bg-slate-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">TRUSTED BY 200+ HOSPITALS</span>
                <div className="h-px w-8 bg-slate-200"></div>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
