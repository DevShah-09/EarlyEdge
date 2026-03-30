import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PatientDetailPage = () => {
  const [sbpLimit, setSbpLimit] = useState(125);
  const [weightReduction, setWeightReduction] = useState(-5);
  const [smokingCessation, setSmokingCessation] = useState(true);

  const trajectoryData = {
    labels: ['JAN 23', 'MAR 23', 'JUN 23', 'NOW', 'SIMULATED', 'TARGET (6M)'],
    datasets: [
      {
        label: 'Historical',
        data: [45, 52, 68, 78, null, null],
        borderColor: '#0f172a',
        backgroundColor: '#0f172a',
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 6,
        tension: 0.4
      },
      {
        label: 'Projected',
        data: [null, null, null, 78, 62, 55],
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        borderWidth: 2,
        borderDash: [5, 5],
        pointStyle: 'circle',
        pointRadius: 6,
        tension: 0.4
      }
    ]
  };

  const handleAction = (msg) => {
    alert(msg);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-['Outfit'] pb-20 pr-4">
      {/* Header Profile Section */}
      <div className="flex justify-between items-end bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-8 z-10">
          <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-slate-100">
             <img src="https://ui-avatars.com/api/?name=Rajesh+Sharma&background=0f172a&color=fff&size=200" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Rajesh Sharma</h1>
              <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-red-100">High Risk</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
               <span>ID: 54 Years</span>
               <span>MRN-294021</span>
               <span>Mumbai, MH</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 z-10">
          <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             Export Report
          </button>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             Consult Specialist
          </button>
        </div>
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-blue-50/30 to-transparent pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Vitals & SDOH */}
        <div className="col-span-3 space-y-8 flex flex-col h-full">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8 flex-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Clinical Vitals</h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Pressure</p>
                    <div className="flex items-center gap-3">
                       <span className="text-2xl font-black text-red-600 tracking-tight">160/95</span>
                       <span className="text-xs font-bold text-slate-400">mmHg</span>
                       <div className="p-1.5 bg-red-50 rounded-lg text-red-600 ml-auto">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45 0c-.39.39-.39 1.024 0 1.414L13.586 6.586a1 1 0 001.414-1.414l-2.605-2.619zM4.618 4.618a1 1 0 011.414 0L15.382 14.382a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414 0L2.204 7.426a1 1 0 010-1.414L4.618 4.618z" clipRule="evenodd" /></svg>
                       </div>
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Mass Index</p>
                    <div className="flex items-center gap-3">
                       <span className="text-2xl font-black text-amber-500 tracking-tight">29.5</span>
                       <span className="text-xs font-bold text-slate-400">kg/m²</span>
                       <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500 ml-auto">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0 1 1 0 002 0zM7 9a1 1 0 100-2 1 1 0 000 2zM13 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                       </div>
                    </div>
                 </div>
                 <div className="pt-4 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifestyle Habits</p>
                    <div className="flex flex-wrap gap-3">
                       <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">Smoker</span>
                       <span className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest">Alcohol: Occ.</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8 flex-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">SDOH Context</h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-800">Urban Environment</p>
                       <p className="text-[10px] font-medium text-slate-400 leading-tight">High noise/pollution exposure in residential area.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-800">Insurance Grade A</p>
                       <p className="text-[10px] font-medium text-slate-400 leading-tight">Full coverage for specialized interventions.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Center Column: Risk Score & Contributors */}
        <div className="col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center gap-10">
           <div className="w-full flex justify-between items-center px-4">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">NCD Risk Score</h3>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
           </div>

           <div className="relative flex flex-col items-center group">
              <svg className="w-[280px] h-[140px] transition-transform duration-700" viewBox="0 0 200 100">
                 <path d="M20,100 A80,80 0 1,1 180,100" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
                 <path d="M20,100 A80,80 0 1,1 180,100" fill="none" stroke="url(#riskGradient)" strokeWidth="18" strokeLinecap="round" 
                       strokeDasharray={251} strokeDashoffset={251 - (251 * 78) / 100} />
                 <defs>
                   <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#2dd4bf" />
                     <stop offset="40%" stopColor="#fbbf24" />
                     <stop offset="100%" stopColor="#ef4444" />
                   </linearGradient>
                 </defs>
              </svg>
              <div className="absolute bottom-4 flex flex-col items-center">
                 <span className="text-6xl font-black text-slate-900 tracking-tighter">78%</span>
                 <span className="text-xs font-black text-red-600 uppercase tracking-widest">Critical</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-10 uppercase tracking-widest text-center">Probability of major adverse event<br/>(12 months)</p>
           </div>

           <div className="w-full space-y-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center px-2">
                 <h4 className="text-sm font-black text-slate-800 tracking-tight">Top Contributing Factors (XAI)</h4>
                 <button className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline">View SHAP Values</button>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Patient Age', impact: 15, color: 'bg-red-500' },
                   { label: 'Active Smoking Status', impact: 12, color: 'bg-red-400' },
                   { label: 'BMI (Overweight)', impact: 10, color: 'bg-amber-400' },
                   { label: 'Clinical History', impact: 8, color: 'bg-slate-300' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-600 w-32">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.impact / 20) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 w-8 text-right">+{item.impact}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Simulator */}
        <div className="col-span-4 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
           <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">What-If Intervention <br className="lg:hidden" /> Simulator</h3>
           </div>

           <div className="flex-1 space-y-10">
              <div className="space-y-4 px-2">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Target Systolic BP</span>
                    <span className="text-blue-600 font-extrabold">{sbpLimit} mmHg</span>
                 </div>
                 <input type="range" min="110" max="180" step="5" value={sbpLimit} onChange={(e) => setSbpLimit(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="space-y-4 px-2">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Weight Reduction</span>
                    <span className="text-blue-600 font-extrabold">{weightReduction} kg</span>
                 </div>
                 <input type="range" min="-15" max="0" step="1" value={weightReduction} onChange={(e) => setWeightReduction(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-xs font-black text-slate-700">Smoking Cessation</p>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Toggle for simulation</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSmokingCessation(!smokingCessation)}
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${smokingCessation ? 'bg-blue-600' : 'bg-slate-200'}`}
                 >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${smokingCessation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </button>
              </div>

              <div className="p-8 border-2 border-slate-50 rounded-[40px] space-y-6 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M11 20H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v7.17l-1 1V5H4v13h7v2z" /></svg>
                 </div>
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Projected Outcome</p>
                 <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col items-center flex-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Original Risk</p>
                       <p className="text-2xl font-black text-slate-400 line-through">78%</p>
                    </div>
                    <div className="w-12 h-0.5 bg-slate-50"></div>
                    <div className="flex flex-col items-center flex-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Simulated Risk</p>
                       <p className="text-4xl font-extrabold text-blue-600 tracking-tighter transition-all duration-500 scale-110">62%</p>
                    </div>
                 </div>
                 <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="text-emerald-500">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">16% Risk Reduction <br className="lg:hidden" /> <span className="font-medium text-emerald-600 lowercase opacity-80">Potential life-years gained: +2.4 yrs</span></p>
                 </div>
              </div>
           </div>

           <button 
            onClick={() => handleAction('Simulation saved as treatment target.')}
            className="w-full bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-[24px] mt-8 shadow-xl active:scale-95 transition-all"
           >
              Save Simulation as Treatment Goal
           </button>
        </div>
      </div>

      {/* Trajectory Bottom Plot */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
         <div className="flex justify-between items-center">
            <div className="space-y-1">
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Risk Trajectory & Projections</h3>
               <p className="text-xs font-medium text-slate-400 tracking-wide">Historical scores vs projected outcome based on simulation</p>
            </div>
            <div className="flex gap-8">
               <div className="flex items-center gap-3">
                  <div className="w-3 translate-y-px h-3 rounded-full bg-slate-900"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Historical</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3 translate-y-px h-0.5 border-t-2 border-dashed border-blue-600"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projected</span>
               </div>
            </div>
         </div>
         <div className="h-64 px-4 bg-slate-50/20 rounded-[32px] pt-8">
            <Line 
              data={trajectoryData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { 
                  y: { display: false }, 
                  x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8' } } 
                } 
              }} 
            />
         </div>
         <div className="flex justify-center gap-16 pt-2">
             <div className="text-center group">
                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto mb-2 group-hover:bg-slate-400 transition-colors"></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current</p>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Now</p>
             </div>
             <div className="text-center group">
                <div className="w-1.5 h-1.5 bg-blue-200 rounded-full mx-auto mb-2 group-hover:bg-blue-400 transition-colors"></div>
                <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Simulated</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">New</p>
             </div>
             <div className="text-center group">
                <div className="w-1.5 h-1.5 bg-blue-100 rounded-full mx-auto mb-2 group-hover:bg-blue-300 transition-colors"></div>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Target (6M)</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected</p>
             </div>
         </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
