import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RiskSimulatorPage = () => {
  const [patientIndex, setPatientIndex] = useState(0);
  
  const patients = [
    { 
      id: 'PX-99281', 
      name: 'Amara K. Vance', 
      gender: 'Female', 
      age: 54, 
      condition: 'Pre-Diabetic',
      baseMetrics: {
        bmi: 28.4,
        sbp: 132,
        hba1c: 6.4,
        glucose: 112,
        smoking: true,
        active: false
      }
    },
    { 
      id: 'PX-44120', 
      name: 'Julian M. Rossi', 
      gender: 'Male', 
      age: 62, 
      condition: 'Hypertensive',
      baseMetrics: {
        bmi: 31.2,
        sbp: 148,
        hba1c: 5.8,
        glucose: 105,
        smoking: false,
        active: false
      }
    },
    { 
      id: 'PX-11204', 
      name: 'Sarah L. Chen', 
      gender: 'Female', 
      age: 41, 
      condition: 'Normal',
      baseMetrics: {
        bmi: 22.1,
        sbp: 118,
        hba1c: 5.1,
        glucose: 88,
        smoking: false,
        active: true
      }
    }
  ];

  const currentPatient = patients[patientIndex];
  const [factors, setFactors] = useState(currentPatient.baseMetrics);
  const [clinicianNote, setClinicianNote] = useState('');

  // Reset factors when patient changes
  useEffect(() => {
    setFactors(currentPatient.baseMetrics);
  }, [patientIndex]);

  // Risk Calculation Logic (Mocked ASCVD)
  const calculateRisk = (f) => {
    let base = currentPatient.age > 50 ? 12 : 5;
    let score = base + (f.bmi - 25) * 0.8 + (f.sbp - 120) * 0.2 + (f.hba1c - 5.5) * 4 + (f.glucose - 100) * 0.05;
    if (f.smoking) score += 6;
    if (f.active) score -= 4;
    return Math.max(1.5, Math.min(score, 45)).toFixed(1);
  };

  const currentRisk = calculateRisk(currentPatient.baseMetrics);
  const simulatedRisk = calculateRisk(factors);
  const reductionDelta = (simulatedRisk - currentRisk).toFixed(1);

  const handleSliderChange = (key, val) => {
    setFactors(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const changePatient = () => {
    setPatientIndex((prev) => (prev + 1) % patients.length);
  };

  // Chart Data
  const chartData = {
    labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'],
    datasets: [
      {
        data: [2, 3, 4, 5, 5.5, 6, 7, 7.5, 8.2, simulatedRisk],
        backgroundColor: '#e2e8f0',
        hoverBackgroundColor: '#3b82f6',
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { display: false, grid: { display: false } },
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Patient Header */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">{currentPatient.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {currentPatient.id}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentPatient.gender}, {currentPatient.age}y</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{currentPatient.condition}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 overflow-hidden mr-4">
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=a" alt="" />
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=b" alt="" />
            <span className="text-[10px] font-bold text-gray-400 ml-6 self-center uppercase tracking-wider">Active Peer Review</span>
          </div>
          <button 
            onClick={changePatient}
            className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-black text-gray-600 transition-all active:scale-95 border border-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Change Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Intervention Parameters */}
        <div className="col-span-8 grid grid-cols-2 gap-6">
          <div className="col-span-1 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Intervention Parameters</h3>
            
            <div className="space-y-10">
              {/* BMI Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Body Mass Index (BMI)</label>
                  <span className="text-sm font-black text-blue-600">{factors.bmi} <span className="text-[10px]">kg/m²</span></span>
                </div>
                <input 
                  type="range" min="15" max="45" step="0.1" value={factors.bmi} 
                  onChange={(e) => handleSliderChange('bmi', e.target.value)}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest">
                  <span>Underweight</span>
                  <span>Optimal</span>
                  <span>Obese</span>
                </div>
              </div>

              {/* SBP Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Systolic BP</label>
                  <span className="text-sm font-black text-blue-600">{factors.sbp} <span className="text-[10px]">mmHg</span></span>
                </div>
                <input 
                  type="range" min="90" max="200" value={factors.sbp} 
                  onChange={(e) => handleSliderChange('sbp', e.target.value)}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest">
                  <span>Hypo</span>
                  <span>Normal</span>
                  <span>Stage 2</span>
                </div>
              </div>

              {/* HbA1c Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">HbA1c Level</label>
                  <span className="text-sm font-black text-blue-600">{factors.hba1c} <span className="text-[10px]">%</span></span>
                </div>
                <input 
                  type="range" min="4" max="14" step="0.1" value={factors.hba1c} 
                  onChange={(e) => handleSliderChange('hba1c', e.target.value)}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
              </div>

              {/* Glucose Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Fasting Glucose</label>
                  <span className="text-sm font-black text-blue-600">{factors.glucose} <span className="text-[10px]">mg/dL</span></span>
                </div>
                <input 
                  type="range" min="60" max="400" value={factors.glucose} 
                  onChange={(e) => handleSliderChange('glucose', e.target.value)}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFactors(prev => ({ ...prev, smoking: !prev.smoking }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${factors.smoking ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 opacity-60'}`}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Smoker</span>
                </button>
                <button 
                  onClick={() => setFactors(prev => ({ ...prev, active: !prev.active }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${factors.active ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-white border-gray-100 opacity-60'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            {/* Risk Score Display */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">10-Year ASCVD Risk Score</h3>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Live Sync</span>
              </div>

              <div className="flex items-center justify-around py-4">
                <div className="text-center group">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Current</p>
                  <div className="text-4xl font-black text-gray-800 group-hover:scale-110 transition-transform">{currentRisk}%</div>
                  <div className="mt-2 w-16 h-1 bg-orange-400 rounded-full mx-auto"></div>
                  <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1">Moderate Risk</p>
                </div>
                
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>

                <div className="text-center group">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Simulated</p>
                  <div className="text-4xl font-black text-blue-600 group-hover:scale-110 transition-transform">{simulatedRisk}%</div>
                  <div className="mt-2 w-16 h-1 bg-emerald-400 rounded-full mx-auto"></div>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Low-Moderate</p>
                </div>
              </div>

              {/* Delta Card */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Projected Reduction Delta</p>
                  <span className={`text-xl font-black ${reductionDelta < 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {reductionDelta > 0 ? '+' : ''}{reductionDelta}%
                  </span>
                </div>
                <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
                </div>
                <p className="text-[10px] font-medium text-emerald-700/70 italic leading-relaxed">
                  "Achieving a target BMI of {(factors.bmi * 0.9).toFixed(1)} and maintaining activity could prevent 1 cardiovascular event over the next 10 years for patients in this cohort."
                </p>
              </div>

              {/* Bar Chart Placeholder */}
              <div className="h-40 w-full pt-4">
                 <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Decision Support Sidebar */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Decision Support</h3>
             
             <div className="bg-gray-50 p-6 rounded-3xl space-y-3 border border-gray-100">
               <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest block">Clinician Note</label>
               <textarea 
                className="w-full bg-transparent border-none p-0 text-xs font-medium text-gray-400 placeholder-gray-300 focus:ring-0 resize-none h-24"
                placeholder="Add clinical rationale for this simulation..."
                value={clinicianNote}
                onChange={(e) => setClinicianNote(e.target.value)}
               ></textarea>
               <div className="flex justify-end">
                <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               </div>
             </div>

             <div className="flex gap-4 p-5 bg-blue-50/30 rounded-3xl border border-blue-50">
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                <span className="font-black text-xs">i</span>
               </div>
               <p className="text-[10px] font-medium text-blue-900/60 leading-relaxed">
                 Simulation uses pooled cohort equations adjusted for the Asian-Indian phenotype data sets (ICMR-INDIAB).
               </p>
             </div>

             <div className="space-y-3 pt-4">
               <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[20px] font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 GENERATE ACTION PLAN
               </button>
               <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-5 rounded-[20px] font-black text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 border border-gray-100">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                 APPLY TO RECORD
               </button>
               <button 
                onClick={() => setFactors(currentPatient.baseMetrics)}
                className="w-full text-center text-[10px] font-black text-gray-300 uppercase tracking-widest pt-4 hover:text-gray-500 transition-colors"
               >
                 Reset Simulation
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center px-4">
        <div className="flex gap-12">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Last Sync</p>
            <p className="text-xs font-black text-gray-600 tracking-tight">14:02 PM Today</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Model Accuracy</p>
            <p className="text-xs font-black text-emerald-500 tracking-tight">High (R² 0.94)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Verified by WHO-CVD Protocols</span>
        </div>
      </div>
    </div>
  );
};

export default RiskSimulatorPage;
