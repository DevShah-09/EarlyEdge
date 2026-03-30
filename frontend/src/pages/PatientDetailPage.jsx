import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getPatientById, approveActionPlan } from '../services/patientService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Simulator states
    const [sbpLimit, setSbpLimit] = useState(130);
    const [weightReduction, setWeightReduction] = useState(-5);
    const [smokingCessation, setSmokingCessation] = useState(false);

    // AI Plan states
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const [actionPlan, setActionPlan] = useState(null);
    const [approving, setApproving] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState(null); // 'success' | 'error' | null

    useEffect(() => {
        const loadPatient = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getPatientById(id);
                setPatient(data);
                if (data.patient?.systolic_bp) setSbpLimit(data.patient.systolic_bp);
                if (data.patient?.smoking_status === 1) setSmokingCessation(false);
                setError('');
            } catch (err) {
                console.error("Failed to load patient:", err);
                setError("Could not retrieve patient data. Please check connection.");
            } finally {
                setLoading(false);
            }
        };
        loadPatient();
    }, [id]);

    const handleApprovePlan = async () => {
        if (!id || approving) return;
        try {
            setApproving(true);
            const result = await approveActionPlan(id);
            if (result.status === 'success') {
                setApprovalStatus('success');
                // Optional: Update actionPlan state to reflect approval
                setActionPlan(prev => ({ ...prev, is_approved: true }));
            } else {
                setApprovalStatus('error');
            }
        } catch (err) {
            console.error("Approval failed:", err);
            setApprovalStatus('error');
        } finally {
            setApproving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col items-center justify-center pt-32 pb-64 text-gray-400">
                <svg className="w-12 h-12 mb-4 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <div className="font-black tracking-widest uppercase">Fetching EMR Record...</div>
            </div>
        );
    }

    if (error || !patient || !patient.patient) {
        return (
            <div className="text-center pt-32 pb-64 text-red-500 font-bold">
                {error || "Patient not found."}
                <br/>
                <button onClick={() => navigate('/patients')} className="mt-4 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-xl transition-all">
                    Return to Directory
                </button>
            </div>
        );
    }

    const p = patient.patient;

    // Mapping real data
    const currentPatient = {
        name: p.name || 'Unknown Patient',
        id: p.patient_id,
        gender: p.gender || 'Unknown',
        age: p.age || '--',
        ward: p.ward || 'General Ward',
        asha: p.asha_worker_id ? `Assigned (${p.asha_worker_id.split('-')[0]})` : 'Unassigned',
        clinical_vitals: {
            sbp: p.systolic_bp,
            dbp: p.diastolic_bp,
            bmi: p.bmi,
            glucose: p.blood_glucose_fasting,
            hba1c: p.hba1c,
            cholesterol: p.cholesterol_total
        },
        riskTier: p.risk_score?.risk_tier || 'Low',
        overallRisk: p.risk_score?.overall_risk || 0,
        metrics: {
            diabetes: p.risk_score?.diabetes_risk || 0,
            hypertension: p.risk_score?.hypertension_risk || 0,
            cvd: p.risk_score?.cvd_risk || 0
        },
        trajectoryLabel: patient.trajectory_label || 'Stable',
        history: patient.trajectory_history || [],
        xaiSummary: p.risk_score?.xai_summary || "Risk profile based on clinical parameters.",
        shapFactors: p.risk_score?.top_factors || []
    };

    const xaiData = {
        labels: currentPatient.shapFactors.map(f => f.display_label || f.feature),
        datasets: [{
            data: currentPatient.shapFactors.map(f => f.impact),
            backgroundColor: currentPatient.shapFactors.map(f => f.impact > 0 ? '#ef4444' : '#10b981'),
            borderRadius: 6,
        }]
    };

    const xaiOptions = {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, border: { display: false } },
            y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' } } }
        }
    };

    const trajectoryData = {
        labels: currentPatient.history.length > 0 
           ? currentPatient.history.map(h => new Date(h.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
           : ['PREVIOUS', 'NOW'],
        datasets: [
          {
            label: 'Risk History',
            data: currentPatient.history.length > 0 ? currentPatient.history.map(h => h.overall_risk) : [currentPatient.overallRisk - 5, currentPatient.overallRisk],
            borderColor: '#0f172a',
            backgroundColor: '#0f172a',
            borderWidth: 2,
            pointStyle: 'circle',
            pointRadius: 6,
            tension: 0.4,
            fill: false
          }
        ]
    };

    // Simulation logic
    const simulatedRisk = Math.max(0, currentPatient.overallRisk - (smokingCessation ? 10 : 0) - (Math.abs(weightReduction) * 1.2) - (Math.max(0, p.systolic_bp - sbpLimit) * 0.5));

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-['Outfit'] pb-20 pr-4">
            {/* Header Profile Section */}
            <div className="flex justify-between items-end bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-8 z-10">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-blue-100 text-blue-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{currentPatient.name}</h1>
                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border ${
                                currentPatient.riskTier === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                                currentPatient.riskTier === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {currentPatient.riskTier} Risk
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                             <span>Age: {currentPatient.age}y</span>
                             <span>ID: {currentPatient.id}</span>
                             <span>Ward: {currentPatient.ward}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 z-10">
                    <button onClick={() => navigate('/patients')} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm">
                        Back to Directory
                    </button>
                    <button 
                        onClick={async () => {
                            if (generatingPlan) return;
                            try {
                                setGeneratingPlan(true);
                                const { getActionPlan } = await import('../services/patientService');
                                const planData = await getActionPlan(id, true);
                                setActionPlan(planData);
                            } catch (e) {
                                console.error("Failed to generate plan:", e);
                                alert("Failed to generate action plan.");
                            } finally {
                                setGeneratingPlan(false);
                            }
                        }}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                        disabled={generatingPlan}
                    >
                        {generatingPlan ? 'Generating...' : 'Generate Action Plan'}
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-blue-50/30 to-transparent pointer-events-none"></div>
            </div>

            {/* AI Action Plan Display */}
            {actionPlan && (
                <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[40px] shadow-sm animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-blue-900 tracking-tight">AI Generated Care Plan</h3>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Personalized 30-Day Intervention</p>
                            </div>
                        </div>
                        <button onClick={() => setActionPlan(null)} className="p-2 text-blue-400 hover:text-blue-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {actionPlan.plan_steps?.map((step, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50/50 flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center flex-shrink-0 mt-1">{idx + 1}</div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-slate-800">{step.title}</h4>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{step.description}</p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {[...(step.clinical_targets || []), ...(step.sdoh_factors || [])].map((tag, tIdx) => (
                                            <span key={tIdx} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Doctor Approval Footer */}
                    <div className="mt-8 pt-8 border-t border-blue-100 flex justify-between items-center bg-white/50 -mx-8 -mb-8 p-8 rounded-b-[40px]">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${approvalStatus === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Doctor Verification</p>
                                <p className="text-[10px] font-bold text-slate-400">Review content before dispatching to {currentPatient.name}</p>
                            </div>
                        </div>

                        {approvalStatus === 'success' ? (
                            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 animate-in slide-in-from-right-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                <span className="text-xs font-black uppercase tracking-widest">Approved & Dispatched</span>
                            </div>
                        ) : (
                            <button 
                                onClick={handleApprovePlan}
                                disabled={approving}
                                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-3"
                            >
                                {approving ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        <span>Dispatching...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        <span>Approve & Email Patient</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Vitals & SDOH */}
                <div className="col-span-3 space-y-8 flex flex-col h-full">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8 flex-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Clinical Vitals</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Pressure</p>
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl font-black tracking-tight ${p.systolic_bp > 140 ? 'text-red-600' : 'text-slate-800'}`}>
                                        {p.systolic_bp}/{p.diastolic_bp}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">mmHg</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BMI</p>
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl font-black tracking-tight ${p.bmi > 25 ? 'text-amber-500' : 'text-slate-800'}`}>
                                        {p.bmi}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">kg/m²</span>
                                </div>
                            </div>
                            <div className="pt-4 space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habits</p>
                                <div className="flex flex-wrap gap-2">
                                    {p.smoking_status === 1 && <span className="px-3 py-1 bg-slate-900 text-white text-[8px] font-black rounded-lg uppercase tracking-widest">Smoker</span>}
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[8px] font-black rounded-lg uppercase tracking-widest">
                                        LD: {p.last_visit_date ? new Date(p.last_visit_date).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8 flex-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Social Determinants</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">Housing</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{p.housing_status || 'Stable'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">Income</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{p.income_level || 'Medium'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Risk Score & Contributors */}
                <div className="col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="w-full flex justify-between items-center px-4">
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Health Risk Profile</h3>
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            currentPatient.trajectoryLabel.includes('Worsening') ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                            {currentPatient.trajectoryLabel}
                        </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                        <svg className="w-[280px] h-[140px]" viewBox="0 0 200 100">
                            <path d="M20,100 A80,80 0 1,1 180,100" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
                            <path d="M20,100 A80,80 0 1,1 180,100" fill="none" stroke="url(#riskGradient)" strokeWidth="18" strokeLinecap="round" 
                                    strokeDasharray={251} strokeDashoffset={251 - (251 * currentPatient.overallRisk) / 100} />
                            <defs>
                                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2dd4bf" />
                                    <stop offset="40%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#ef4444" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute bottom-4 flex flex-col items-center">
                            <span className="text-6xl font-black text-slate-900 tracking-tighter">{Math.round(currentPatient.overallRisk)}%</span>
                            <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                                {currentPatient.riskTier} Risk
                            </span>
                        </div>
                    </div>

                    <div className="w-full space-y-6 pt-6 border-t border-slate-50">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">Top Contributing Factors (XAI)</h4>
                            <button className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline">SHAP Baseline</button>
                        </div>
                        {currentPatient.shapFactors.length > 0 ? (
                            <div className="h-56">
                                <Bar data={xaiData} options={xaiOptions} />
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400 font-bold">No XAI data generated.</div>
                        )}
                        <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-bold text-slate-500 italic leading-relaxed">
                            "{currentPatient.xaiSummary}"
                        </div>
                    </div>
                </div>

                {/* Right Column: Simulator */}
                <div className="col-span-4 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Intervention Simulator</h3>
                    </div>

                    <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>Target Systolic BP</span>
                                <span className="text-blue-600 font-extrabold">{sbpLimit} mmHg</span>
                            </div>
                            <input type="range" min="110" max="180" step="5" value={sbpLimit} onChange={(e) => setSbpLimit(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>Weight Reduction</span>
                                <span className="text-blue-600 font-extrabold">{weightReduction} kg</span>
                            </div>
                            <input type="range" min="-15" max="0" step="1" value={weightReduction} onChange={(e) => setWeightReduction(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[32px] flex items-center justify-between">
                            <p className="text-xs font-black text-slate-700">Smoking Cessation</p>
                            <button 
                                onClick={() => setSmokingCessation(!smokingCessation)}
                                className={`w-14 h-8 rounded-full p-1 transition-all ${smokingCessation ? 'bg-blue-600' : 'bg-slate-200'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${smokingCessation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="p-8 border-2 border-slate-50 rounded-[40px] space-y-4">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Projected Score</p>
                            <div className="flex items-center justify-center gap-6">
                                <span className="text-2xl font-black text-slate-300 line-through">{Math.round(currentPatient.overallRisk)}%</span>
                                <div className="w-0.5 h-8 bg-slate-100"></div>
                                <span className="text-5xl font-black text-blue-600 tracking-tighter">{Math.round(simulatedRisk)}%</span>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3">
                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">
                                    {Math.round(currentPatient.overallRisk - simulatedRisk)}% reduction potential
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trajectory Plot */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Risk Trajectory</h3>
                <div className="h-64">
                    <Line 
                        data={trajectoryData} 
                        options={{ 
                            maintainAspectRatio: false, 
                            plugins: { legend: { display: false } }, 
                            scales: { 
                                y: { min: 0, max: 100, border: { display: false }, ticks: { font: { weight: 'bold' } } }, 
                                x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8' } } 
                            } 
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;
