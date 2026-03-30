import React, { useState, useEffect } from 'react';
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
import { getPatients } from '../services/patientService';
import { simulateRisk } from '../services/simulatorService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RiskSimulatorPage = () => {
  const [patients, setPatients] = useState([]);
  const [patientIndex, setPatientIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Simulation States
  const [factors, setFactors] = useState({
    bmi: 25.0,
    sbp: 120,
    hba1c: 5.5,
    glucose: 100,
    smoking_status: 0,
    activity_level: 0
  });
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [clinicianNote, setClinicianNote] = useState('');

  // Initial Data Load
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await getPatients({ page: 1 });
        setPatients(data.patients || []);
      } catch (err) {
        console.error('Failed to load patients for simulator:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const currentPatient = patients.length > 0 ? patients[patientIndex] : null;

  // Reset factors when patient changes
  useEffect(() => {
    if (currentPatient) {
      setFactors({
        bmi: currentPatient.patient_data?.bmi || 25.0,
        sbp: currentPatient.patient_data?.systolic_bp || 120,
        hba1c: currentPatient.patient_data?.hba1c || 5.5,
        glucose: currentPatient.patient_data?.fasting_blood_sugar || 100,
        smoking_status: currentPatient.patient_data?.smoking_status_encoded || 0,
        activity_level: 0 // Default mapped active
      });
      setSimulationResult(null); // Clear previous sim
    }
  }, [currentPatient]);

  const handleSliderChange = (key, val) => {
    setFactors(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const changePatient = () => {
    if (patients.length > 0) {
      setPatientIndex((prev) => (prev + 1) % patients.length);
    }
  };

  const handleRunSimulation = async () => {
    if (!currentPatient) return;
    try {
      setSimulating(true);
      const overrides = {
        bmi: factors.bmi,
        systolic_bp: factors.sbp,
        hba1c: factors.hba1c,
        fasting_blood_sugar: factors.glucose,
        smoking_status_encoded: factors.smoking_status
      };
      const res = await simulateRisk(currentPatient.patient_id, overrides);
      setSimulationResult(res);
    } catch (err) {
      console.error('Failed simulation:', err);
      alert('Simulation failed. Please check connection.');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
        <div className="flex animate-pulse flex-col items-center justify-center pt-32 pb-64 text-gray-400">
            <svg className="w-12 h-12 mb-4 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <div className="font-black tracking-widest uppercase">Loading Patient Cohort...</div>
        </div>
    );
  }

  if (patients.length === 0) {
    return (
        <div className="text-center pt-32 pb-64 text-gray-500 font-bold">
            No patients available for simulation. Please upload a dataset first.
        </div>
    );
  }

  const currentRisk = currentPatient.overall_risk || 0;
  const simulatedRisk = simulationResult ? simulationResult.simulated.overall_risk : currentRisk;
  
  // The delta calculation dynamically checks if risk went up or down.
  const reductionDelta = simulationResult ? simulationResult.delta.overall_risk_delta : 0;
  const isImproved = reductionDelta < 0;

  // Chart Data
  const chartData = {
    labels: ['Original Risk', 'Simulated Risk'],
    datasets: [
      {
        data: [currentRisk, simulatedRisk],
        backgroundColor: ['#f97316', simulatedRisk < currentRisk ? '#10b981' : '#ef4444'],
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
            <h1 className="text-2xl font-black text-gray-800">{currentPatient.name || 'Unknown'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {currentPatient.patient_id?.slice(0,8)}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentPatient.gender}, {currentPatient.age}y</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{currentPatient.primary_condition || 'Normal'}</span>
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
          <div className="col-span-1 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10 relative">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Intervention Options</h3>
            
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
                  onClick={() => handleSliderChange('smoking_status', factors.smoking_status === 1 ? 0 : 1)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${factors.smoking_status === 1 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 opacity-60'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Smoker</span>
                </button>
                <button 
                  onClick={() => handleSliderChange('activity_level', factors.activity_level === 1 ? 0 : 1)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${factors.activity_level === 1 ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-white border-gray-100 opacity-60'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                </button>
              </div>
            </div>

            {/* Run button instead of live sync */}
            <div className="pt-8">
              <button 
                onClick={handleRunSimulation}
                disabled={simulating}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[20px] font-black text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {simulating ? 'COMPUTING AI MODEL...' : 'CALCULATE PROJECTED RISK'}
              </button>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            {/* Risk Score Display */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">Risk Inference Engine</h3>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-600 rounded-lg text-[8px] font-black uppercase tracking-widest">API Linked</span>
              </div>

              <div className="flex items-center justify-around py-4">
                <div className="text-center group">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Current</p>
                  <div className="text-4xl font-black text-gray-800 group-hover:scale-110 transition-transform">{currentRisk}%</div>
                  <div className="mt-2 w-16 h-1 bg-orange-400 rounded-full mx-auto"></div>
                  <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1">
                    {currentPatient.risk_tier || 'Moderate'}
                  </p>
                </div>
                
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>

                <div className="text-center group">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Simulated</p>
                  <div className={`text-4xl font-black group-hover:scale-110 transition-transform ${isImproved ? 'text-emerald-500' : 'text-blue-600'}`}>
                    {simulatedRisk}%
                  </div>
                  <div className={`mt-2 w-16 h-1 rounded-full mx-auto ${isImproved ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                </div>
              </div>

              {/* Delta Card */}
              {simulationResult && (
                <div className={`${isImproved ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'} border p-6 rounded-3xl space-y-4`}>
                    <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Projected Delta</p>
                    <span className={`text-xl font-black ${isImproved ? 'text-emerald-600' : 'text-red-600'}`}>
                        {reductionDelta > 0 ? '+' : ''}{reductionDelta}%
                    </span>
                    </div>
                    <p className={`text-[10px] font-medium leading-relaxed ${isImproved ? 'text-emerald-700' : 'text-red-700'}`}>
                        {simulationResult.simulation_summary}
                    </p>
                </div>
              )}

              {/* Bar Chart Projection */}
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
                 Simulation utilizes your active Random Forest and Logistic Regression ML pipeline directly via the backend endpoints.
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
                onClick={() => setSimulationResult(null)}
                className="w-full text-center text-[10px] font-black text-gray-300 uppercase tracking-widest pt-4 hover:text-gray-500 transition-colors"
               >
                 Reset Simulation
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskSimulatorPage;
