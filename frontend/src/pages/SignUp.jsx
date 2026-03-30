import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import loginBackground from '../assets/login-bg.png';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    hospitalName: ''
  });
  const { signIn } = useAuth(); // Reusing signIn as a mock for sign up
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate account creation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Log them in automatically with the provided credentials
      await signIn(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      alert('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-50 overflow-hidden font-['Outfit']">
      {/* Visual Side (Left) - Same as Login for consistency */}
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
              Empowering Medical <br/> <span className="text-blue-400">Collaborations.</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-light">
              Join a network of top-tier medical facilities leveraging data-driven insights to improve patient outcomes and operational efficiency.
            </p>
          </div>

          <div className="text-slate-500 text-sm font-medium">
             © 2026 RAM Bharose. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Auth Side (Right) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="absolute top-8 right-8 lg:hidden flex items-center gap-2">
           <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-serif italic font-black text-slate-800 uppercase text-lg">The Clinical Atelier</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700 py-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium">Register your hospital to get started with our medical suite.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  name="fullName"
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Dr. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest ml-1">Hospital / Clinic Name</label>
              <input 
                name="hospitalName"
                type="text" 
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="Central Hospital"
                value={formData.hospitalName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest ml-1">Work Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="j.doe@hospital.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extra-bold text-slate-500 uppercase tracking-widest ml-1">Create Password</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-3 px-2 py-2">
              <input type="checkbox" required className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-100 cursor-pointer" />
              <label className="text-xs text-slate-500 font-medium leading-relaxed">
                I agree to the <span className="text-blue-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-5 rounded-[24px] font-black text-sm tracking-wide shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase relative overflow-hidden group mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                   Creating Account...
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <footer className="text-center pt-2">
             <div className="text-sm font-medium text-slate-400">
               Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In Instead</Link>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
