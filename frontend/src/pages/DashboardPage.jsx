import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getDashboardData } from '../services/dashboardService';
import { getPatients } from '../services/patientService';

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

const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [priorityPatients, setPriorityPatients] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const [dash, patientsData] = await Promise.all([
                    getDashboardData(),
                    getPatients({ tier: 'High', page: 1 })
                ]);
                setDashboardData(dash);
                const pList = Array.isArray(patientsData) ? patientsData : (patientsData.patients || []);
                setPriorityPatients(pList.slice(0, 5));
                setError(null);
            } catch (err) {
                console.error("Dashboard load failed:", err);
                setError("Could not retrieve dashboard metrics. Please check network connection.");
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (error) {
        return (
            <div className="text-center pt-32 pb-64 text-red-500 font-bold">
                {error}
                <br/>
                <button onClick={() => window.location.reload()} className="mt-4 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-xl transition-all">
                    Retry Dashboard
                </button>
            </div>
        );
    }

    if (loading || !dashboardData) {
        return (
            <div className="flex animate-pulse flex-col items-center justify-center pt-32 pb-64 text-gray-400">
                <svg className="w-12 h-12 mb-4 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <div className="font-black tracking-widest uppercase">Initializing Clinic Pulse...</div>
            </div>
        );
    }

    const { kpis = {}, risk_distribution = {}, monthly_trend = [] } = dashboardData;

    const kpiCards = [
        { title: 'Total Patients', value: kpis?.total_patients?.toLocaleString() || '0', change: '+12%', type: 'positive', icon: (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )},
        { title: 'High Risk Count', value: kpis?.high_risk_count?.toLocaleString() || '0', change: 'Alert', type: 'negative', icon: (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        )},
        { title: 'Pending ASHA Tasks', value: kpis?.pending_asha_tasks?.toLocaleString() || '0', change: 'Syncing', type: 'active', icon: (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        )},
        { title: 'Upcoming Camps', value: (kpis?.upcoming_camps?.toLocaleString() || '0').padStart(2, '0'), change: 'New', type: 'info', icon: (
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        )},
    ];

    const barData = {
        labels: monthly_trend.map(m => m.month.split(' ')[0]),
        datasets: [
            {
                label: 'High Risk Cases',
                data: monthly_trend.map(m => m.diabetes + m.hypertension + m.cvd),
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#d1e4ff');
                    gradient.addColorStop(1, '#3b82f6');
                    return gradient;
                },
                borderRadius: 8,
                barThickness: 45,
            }
        ],
    };

    const donutData = {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [
            {
                data: [risk_distribution.high, risk_distribution.medium, risk_distribution.low],
                backgroundColor: ['#b91c1c', '#fcd34d', '#2dd4bf'],
                borderWidth: 0,
                cutout: '75%',
            },
        ],
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-['Outfit'] pr-4">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Pulse</p>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Clinic Overview</h1>
                    <p className="text-sm font-medium text-slate-500">Real-time clinical performance and patient risk metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm">
                        Export Report
                    </button>
                    <button onClick={() => navigate('/upload')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Upload Data
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-4 gap-6">
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                    {kpi.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                                    <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tighter">{kpi.value}</h3>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${
                                kpi.type === 'positive' ? 'text-green-600' : 
                                kpi.type === 'negative' ? 'text-red-600' : 
                                kpi.type === 'active' ? 'text-orange-600' : 'text-slate-400'
                            }`}>
                                {kpi.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="space-y-1">
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">High-Risk Patient Trends</h2>
                            <p className="text-xs text-slate-400 font-medium">Monthly volume tracking for critical intervention</p>
                        </div>
                        <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Last 6 Months
                        </div>
                    </div>
                    <div className="h-64 px-4">
                        <Bar 
                            data={barData} 
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
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-8">Risk Distribution</h2>
                    <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
                        <div className="w-[180px] h-[180px]">
                            <Doughnut data={donutData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                        </div>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-black text-slate-800 tracking-tighter">100%</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">Cohort<br/>Total</span>
                        </div>
                    </div>
                    <div className="space-y-3 mt-6">
                        {[
                            { label: 'High Risk', value: `${risk_distribution.high_pct}%`, color: 'bg-red-700' },
                            { label: 'Medium Risk', value: `${risk_distribution.medium_pct}%`, color: 'bg-amber-300' },
                            { label: 'Low Risk', value: `${risk_distribution.low_pct}%`, color: 'bg-teal-400' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                </div>
                                <span className="text-sm font-black text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Priority Interventions Table */}
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10 px-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Priority Interventions</h2>
                        <button 
                            onClick={() => navigate('/patients')}
                            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                            View Full Directory →
                        </button>
                    </div>
                    
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                <th className="pb-4">Patient Name</th>
                                <th className="pb-4">Condition</th>
                                <th className="pb-4">Risk %</th>
                                <th className="pb-4 text-right pr-4">Profile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {priorityPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center text-slate-400 font-bold">No high-risk patients detected.</td>
                                </tr>
                            ) : priorityPatients.map((p, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => navigate(`/patients/${p.patient_id}`)}>
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400">ID: #{p.patient_id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 text-sm font-bold text-slate-600">{p.primary_condition || 'N/A'}</td>
                                    <td className="py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase bg-red-50 text-red-600`}>
                                            {Math.round(p.overall_risk)}% RISK
                                        </span>
                                    </td>
                                    <td className="py-5 text-right pr-4">
                                        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                            <button className="bg-white shadow-xl p-3 rounded-xl text-blue-600 border border-gray-100 hover:bg-blue-600 hover:text-white transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-8 h-full">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Condition Prevalence</h2>
                        <div className="space-y-5">
                            {[
                                { label: 'Hypertension', value: 42, color: 'bg-blue-600' },
                                { label: 'Diabetes', value: 28, color: 'bg-blue-600' },
                                { label: 'Cardio Vascular', value: 18, color: 'bg-blue-400' },
                                { label: 'Respiratory', value: 12, color: 'bg-slate-300' },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-700">{item.label}</span>
                                        <span className="text-slate-400">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50/30 p-8 rounded-[40px] border border-emerald-100 shadow-sm relative group hover:bg-emerald-50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Clinic Insight</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                    High-risk CVD trends are accelerating in Sector 4. Recommend prioritizing rural screening camps for the next quarter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
