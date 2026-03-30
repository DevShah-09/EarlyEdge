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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PatientDetailPage = () => {
    const [patientIndex, setPatientIndex] = useState(0);
    
    const patients = [
      { 
        id: 'PX-99281', 
        name: 'Amara K. Vance', 
        gender: 'Female', 
        age: 54, 
        ward: 'Ward 04',
        asha: 'Meena Tai',
        risk: 'HIGH',
        metrics: {
          diabetes: 75,
          hypertension: 62,
          cvd: 87
        },
        trajectory: 'Rapidly Worsening',
        history: [
          { date: '2023-11-20', type: 'Lab', value: 'HbA1c: 6.4%', status: 'Warning' },
          { date: '2023-11-15', type: 'Clinical', value: 'SBP: 132 mmHg', status: 'Stable' },
          { date: '2023-10-30', type: 'Lab', value: 'Glucose: 112 mg/dL', status: 'Elevated' },
        ],
        xaiContributors: [
          { feature: 'BMI', value: 8.5, impact: 'High' },
          { feature: 'Smoking', value: 6.2, impact: 'Medium' },
          { feature: 'HbA1c', value: 5.8, impact: 'Medium' },
          { feature: 'Age', value: 4.1, impact: 'Low' },
          { feature: 'Exercise', value: -3.2, impact: 'Negative' },
        ]
      },
      { 
        id: 'PX-44120', 
        name: 'Julian M. Rossi', 
        gender: 'Male', 
        age: 62, 
        ward: 'Ward 12',
        asha: 'Savita Devi',
        risk: 'MEDIUM',
        metrics: {
          diabetes: 42,
          hypertension: 81,
          cvd: 55
        },
        trajectory: 'Stable',
        history: [
          { date: '2023-11-21', type: 'Clinical', value: 'SBP: 148 mmHg', status: 'Critical' },
          { date: '2023-11-10', type: 'Lab', value: 'HbA1c: 5.8%', status: 'Stable' },
        ],
        xaiContributors: [
          { feature: 'SBP', value: 12.1, impact: 'High' },
          { feature: 'Age', value: 7.2, impact: 'Medium' },
          { feature: 'BMI', value: 4.8, impact: 'Low' },
          { feature: 'Activity', value: -1.5, impact: 'Negative' },
        ]
      }
    ];

    const currentPatient = patients[patientIndex];

    const xaiData = {
        labels: currentPatient.xaiContributors.map(c => c.feature),
        datasets: [{
            data: currentPatient.xaiContributors.map(c => c.value),
            backgroundColor: currentPatient.xaiContributors.map(c => c.value > 0 ? '#ef4444' : '#10b981'),
            borderRadius: 6,
        }]
    };

    const xaiOptions = {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, border: { display: false } },
            y: { grid: { display: false }, border: { display: false } }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex justify-between items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex items-center gap-8 relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-[32px] flex items-center justify-center text-blue-600 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black text-gray-800 tracking-tight">{currentPatient.name}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                currentPatient.risk === 'HIGH' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-orange-50 text-orange-500 border border-orange-100'
                            }`}>
                                {currentPatient.risk} Risk Tier
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
                            <span>ID: {currentPatient.id}</span>
                            <span>{currentPatient.gender}, {currentPatient.age}y</span>
                            <span>{currentPatient.ward}</span>
                            <span className="text-blue-500 lowercase tracking-normal">ASHA: {currentPatient.asha}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 relative">
                    <button 
                        onClick={() => setPatientIndex((prev) => (prev + 1) % patients.length)}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all active:scale-95 border border-gray-100 shadow-sm"
                    >
                        CHANGE PATIENT
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95">
                        GENERATE PLAN
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="col-span-8 space-y-8">
                    {/* Risk Score Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        {Object.entries(currentPatient.metrics).map(([key, val]) => (
                            <div key={key} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center gap-4 transition-transform hover:scale-105 duration-300">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{key}</span>
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-50" />
                                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                            strokeDasharray={276} strokeDashoffset={276 - (276 * val) / 100}
                                            className={`${val > 70 ? 'text-red-500' : 'text-blue-500'}`} />
                                    </svg>
                                    <span className="absolute text-xl font-black text-gray-800">{val}%</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${val > 70 ? 'text-red-500' : 'text-blue-500'}`}>
                                    {val > 70 ? 'High Risk' : 'Elevated'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* SHAP Explainability Section */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-800">Risk Contributors (SHAP)</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Model Explainability Output</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                currentPatient.trajectory === 'Rapidly Worsening' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                            }`}>
                                {currentPatient.trajectory}
                            </div>
                        </div>

                        <div className="h-64 pt-6">
                            <Bar data={xaiData} options={xaiOptions} />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-xs font-semibold leading-relaxed text-gray-500 italic">
                            "Current risk profile is predominantly driven by high BMI (8.5 contribution points) and active smoking status. Improving physical activity levels could reduce total risk by 3.2%."
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Clinical History & Logs</h3>
                        <div className="space-y-4">
                            {currentPatient.history.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 hover:bg-white transition-all rounded-3xl border border-transparent hover:border-gray-100 hover:shadow-subtle cursor-pointer group">
                                    <div className="flex items-center gap-6">
                                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{log.date}</div>
                                        <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">{log.type}</div>
                                        <div className="text-sm font-black text-gray-800">{log.value}</div>
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${
                                        log.status === 'Warning' || log.status === 'Critical' ? 'text-orange-500' : 'text-emerald-500'
                                    }`}>
                                        {log.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Support Area */}
                <div className="col-span-4 space-y-8">
                    {/* Action Plan Section */}
                    <div className="bg-gray-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        
                        <div className="space-y-6 relative">
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">30-Day AI Action Plan</h3>
                            
                            <div className="space-y-6">
                                {[1, 2, 3].map((week) => (
                                    <div key={week} className="flex gap-4 group/item">
                                        <div className="space-y-2 flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[10px] font-black group-hover/item:bg-blue-600 transition-colors">W{week}</div>
                                            <div className="w-0.5 h-full bg-white/5 group-last:hidden"></div>
                                        </div>
                                        <div className="space-y-1 pb-6">
                                            <p className="text-xs font-black text-gray-300">Phase {week}: {week === 1 ? 'Intensive Monitoring' : week === 2 ? 'Lifestyle Shift' : 'Maintenance'}</p>
                                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                                                {week === 1 ? 'Bi-weekly BP checks and daily glucose logging.' : 'Introduce 20min brisk walk 4x/week.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button className="w-full bg-white/10 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all border border-white/5 mb-4">
                                REGENERATE PLAN
                            </button>
                        </div>
                    </div>

                    {/* SDOH Panel */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Social Determinants (SDOH)</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                                <span>Income Level</span>
                                <span className="text-emerald-500 px-3 py-1 bg-emerald-50 rounded-lg">Low Stable</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                                <span>Food Insecurity</span>
                                <span className="text-gray-400">Not-Reported</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                                <span>Housing Stability</span>
                                <span className="text-emerald-500">Stable</span>
                            </div>
                        </div>
                        <button className="w-full bg-blue-50 text-blue-600 font-black text-[10px] py-4 rounded-2xl uppercase tracking-widest border border-blue-100 shadow-inner">
                            Assign ASHA Worker
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;
