import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import loginBackground from '../assets/login-bg.png'; // Using generated image

const LoginPage = () => {
  const [email, setEmail] = useState('dr.julian@hospital.com');
  const [password, setPassword] = useState('password');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      // Brief delay for transition effect
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      alert('Login failed. Please check your credentials.');
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
            <span className="text-2xl font-serif italic font-black text-white tracking-tight uppercase">The Clinical Atelier</span>
          </div>

          <div className="space-y-6 animate-in slide-in-from-left duration-1000 delay-200">
            <h2 className="text-6xl font-serif italic font-bold text-white leading-tight">
              Clinical Excellence <br/> <span className="text-blue-400">Simplified.</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-light">
              Access the most advanced medical data analytics platform today. Manage patient screening, risk simulation, and ASHA tasks with one intuitive interface.
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
          <span className="font-serif italic font-black text-slate-800 uppercase text-lg">The Clinical Atelier</span>
        </div>

        <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Staff Login</h1>
            <p className="text-slate-500 font-medium">Welcome back! Please enter your hospital credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  type="email" 
                  required
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g. j.doe@hospital.com"
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
                   Processing...
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <footer className="text-center space-y-4 pt-4">
             <div className="text-sm font-medium text-slate-400">
               Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Request Access</Link>
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
