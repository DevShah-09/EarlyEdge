import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import loginBackground from '../assets/login-bg.png';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospitalName: '',
    hospitalType: '',
    designation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Call backend registration endpoint (uses service_role key, no email confirmation needed)
      await axios.post(`${API_BASE}/auth/register`, {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        hospital_name: formData.hospitalName,
        hospital_type: formData.hospitalType,
        designation: formData.designation,
      });

      // Auto-login after successful registration
      await signIn(formData.email, formData.password);
      setSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err.response?.data?.detail || err.message || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state — auto-redirect after brief celebration
  if (success) {
    setTimeout(() => navigate('/dashboard'), 2000);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-['Outfit'] p-8">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">Welcome to EarlyEdge!</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Your hospital account for <span className="text-blue-600 font-bold">{formData.hospitalName}</span> has been activated. 
              Redirecting you to the dashboard...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="w-5 h-5 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-bold">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-slate-50 overflow-hidden font-['Outfit']">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex w-[45%] relative bg-blue-900 group">
        <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
           <img 
            src={loginBackground} 
            alt="Hospital Signup Background" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/40" />
        
        <div className="relative z-10 w-full p-16 flex flex-col min-h-full">
          <div className="flex items-center gap-3 animate-in slide-in-from-top duration-700">
            <div className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl border border-white/30 shadow-2xl">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-2xl font-serif italic font-black text-white tracking-tight uppercase">EarlyEdge</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in zoom-in duration-1000 delay-200">
            <h2 className="text-5xl font-serif italic font-bold text-white leading-tight">
              Empowering <br/> Hospital <br/> <span className="text-blue-400">Intelligence.</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-lg leading-relaxed font-light">
              Join a growing network of healthcare facilities using AI-powered NCD risk prediction to save lives and optimize community health outcomes.
            </p>

            {/* Feature highlights */}
            <div className="space-y-6 pt-4 w-full max-w-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-1">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <p className="text-white font-bold text-base">AI Risk Prediction</p>
                <p className="text-slate-400 text-sm">Diabetes, Hypertension & CVD screening</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-1">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <p className="text-white font-bold text-base">ASHA Worker Integration</p>
                <p className="text-slate-400 text-sm">Task assignment & community follow-up</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-1">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <p className="text-white font-bold text-base">Explainable AI (XAI)</p>
                <p className="text-slate-400 text-sm">SHAP-driven reasoning for every decision</p>
              </div>
            </div>
          </div>
        </div>



      </div>

      {/* Auth Side (Right) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="absolute top-8 right-8 lg:hidden flex items-center gap-2">
           <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-serif italic font-black text-slate-800 uppercase text-lg">EarlyEdge</span>
        </div>

        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in duration-700 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-blue-600 italic tracking-tighter leading-none mb-2">Register Hospital</h1>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Create Your EarlyEdge Account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Doctor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  id="signup-fullname"
                  name="fullName"
                  type="text"   
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Dr. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                <select
                  id="signup-designation"
                  name="designation"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.designation}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select role</option>
                  <option value="Medical Officer">Medical Officer</option>
                  <option value="Chief Medical Officer">Chief Medical Officer</option>
                  <option value="PHC In-charge">PHC In-charge</option>
                  <option value="Block Health Officer">Block Health Officer</option>
                  <option value="District Health Officer">District Health Officer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Type</label>
                <select
                  id="signup-hospital-type"
                  name="hospitalType"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.hospitalType}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select type</option>
                  <option value="Primary Health Centre">Primary Health Centre (PHC)</option>
                  <option value="Community Health Centre">Community Health Centre (CHC)</option>
                  <option value="District Hospital">District Hospital</option>
                  <option value="Sub-District Hospital">Sub-District Hospital</option>
                  <option value="Private Hospital">Private Hospital</option>
                  <option value="Clinic">Clinic / Nursing Home</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hospital / Facility Name</label>
              <input 
                id="signup-hospital-name"
                name="hospitalName"
                type="text" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="e.g. Central District Hospital, Jaipur"
                value={formData.hospitalName}
                onChange={handleChange}
              />
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  id="signup-email"
                  name="email"
                  type="email" 
                  required
                  className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="admin@hospital.gov.in"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  id="signup-password"
                  name="password"
                  type="password" 
                  required
                  minLength={6}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <input 
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password" 
                  required
                  minLength={6}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 px-2 py-2">
              <input id="signup-terms" type="checkbox" required className="w-5 h-5 mt-0.5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-100 cursor-pointer" />
              <label htmlFor="signup-terms" className="text-xs text-slate-500 font-medium leading-relaxed cursor-pointer">
                I confirm that the above information is accurate. I agree to the <span className="text-blue-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-bold hover:underline cursor-pointer">Data Processing Agreement</span>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4.5 rounded-[24px] font-black text-sm tracking-wide shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase relative overflow-hidden group mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                   Creating Account...
                </div>
              ) : (
                <>
                  <span>Register Hospital</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <footer className="text-center pt-1">
             <div className="text-sm font-medium text-slate-400">
               Already registered? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In Instead</Link>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
