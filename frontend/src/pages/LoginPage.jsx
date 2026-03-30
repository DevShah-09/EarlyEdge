import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('dr.julian@hospital.com');
  const [password, setPassword] = useState('password');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl border border-gray-100 p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800">Welcome Back</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">The Clinical Atelier <br/> Medical Staff Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
            <input 
              type="email" 
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Password</label>
            <input 
              type="password" 
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[20px] font-black text-sm tracking-wide shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase mt-4">
            Sign In
          </button>
        </form>

        <div className="text-center">
          <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Forgot your password?</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
