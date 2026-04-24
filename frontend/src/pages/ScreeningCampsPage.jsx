import React, { useState, useEffect } from 'react';
import { getCampPlan, getCamps, createCamp } from '../services/campsService';

const ScreeningCampsPage = () => {
    const [plan, setPlan] = useState(null);
    const [camps, setCamps] = useState({ upcoming: [], past: [], total_upcoming: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedConditions, setSelectedConditions] = useState(['Hypertension', 'Diabetes']);
    const [schedulingWard, setSchedulingWard] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [planData, campsData] = await Promise.all([
                getCampPlan({ month: selectedMonth }),
                getCamps()
            ]);
            setPlan(planData);
            setCamps(campsData);
        } catch (err) {
            console.error("Failed to load camp data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [selectedMonth]);

    const handleScheduleCamp = async (wardPlan) => {
        try {
            setSchedulingWard(wardPlan.ward);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 7);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            await createCamp({
                ward: wardPlan.ward,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                venue: `Community Center, ${wardPlan.ward}`,
                target_patient_count: wardPlan.estimated_patients_per_camp,
                screenings: wardPlan.suggested_screenings
            });
            alert(`Camp scheduled successfully for ${wardPlan.ward}`);
            await loadData();
        } catch (err) {
            console.error("Scheduling failed:", err);
            alert("Failed to schedule camp. Check backend connection.");
        } finally {
            setSchedulingWard(null);
        }
    };

    const toggleCondition = (condition) => {
        setSelectedConditions(prev =>
            prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
        );
    };

    const isScheduled = (wardName) => camps.upcoming.some(c => c.ward === wardName);

    if (loading || !plan) {
        return (
            <div className="flex flex-col items-center justify-center pt-40 text-slate-400 gap-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Calculating Screening Efficiency...</p>
            </div>
        );
    }

    const avgNNS = plan.ward_plans.length > 0
        ? (plan.ward_plans.reduce((acc, curr) => acc + (curr.number_needed_to_screen || 0), 0) / plan.ward_plans.length).toFixed(1)
        : "0.0";

    const topWard = plan.ward_plans[0];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 font-['Inter','Outfit',sans-serif] pr-4 pb-16">

            {/* ── Header ── */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Screening <span className="text-blue-600">Intelligence</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium max-w-lg">
                        Strategize community health interventions using predictive screening metrics and ward-level risk mapping.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* NNS Stat */}
                    <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex items-center gap-5">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Avg. NNS</p>
                            <p className="text-2xl font-black text-blue-600 leading-none mt-1">{avgNNS}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight">
                            Number Needed<br />To Screen
                        </p>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={loadData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-2xl shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-3 font-bold text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Refresh Strategy
                    </button>
                </div>
            </div>

            {/* ── 3-Column Grid ── */}
            <div className="grid grid-cols-12 gap-6">

                {/* ── LEFT SIDEBAR ── */}
                <div className="col-span-3 space-y-6">
                    {/* Filters Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Period</label>
                                <input
                                    type="month"
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Focus</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Hypertension', 'Diabetes', 'Cardio', 'Anaemia'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => toggleCondition(c)}
                                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                                selectedConditions.includes(c)
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Timeline */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Timeline</h3>
                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                {camps.total_upcoming || 0} PLANNED
                            </span>
                        </div>

                        {camps.upcoming.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No scheduled camps.</p>
                        ) : (
                            <div className="space-y-5 relative before:absolute before:left-[9px] before:top-1 before:bottom-1 before:w-px before:bg-slate-100">
                                {camps.upcoming.map((camp, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        <div className="w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10 shrink-0 mt-0.5"></div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-black text-slate-800">
                                                {new Date(camp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                <span className="text-slate-300 mx-1">·</span>
                                                {camp.ward}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400">{camp.venue}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CENTER MAIN ── */}
                <div className="col-span-6 space-y-6">
                    {/* Geospatial Risk Matrix */}
                    <div className="bg-white rounded-3xl shadow-sm p-7 space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-extrabold text-slate-800">Geospatial Risk Matrix</h2>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400 border-2 border-red-200"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Priority</span>
                            </div>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                    <th className="pb-4 font-black">Ward Name</th>
                                    <th className="pb-4 font-black text-center">Risk Density</th>
                                    <th className="pb-4 font-black text-center">Coverage</th>
                                    <th className="pb-4 font-black text-center">NNS Target</th>
                                    <th className="pb-4 font-black text-right pr-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plan.ward_plans.map((ward, idx) => (
                                    <tr key={idx} className="group border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                                        <td className="py-5 font-bold text-slate-700 text-sm">{ward.ward}</td>
                                        <td className="py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                                ward.high_risk_count > 10
                                                    ? 'text-red-600 bg-red-50'
                                                    : 'text-emerald-600 bg-emerald-50'
                                            }`}>
                                                {ward.high_risk_count > 10 ? 'CRITICAL' : 'STABLE'} ({ward.high_risk_count})
                                            </span>
                                        </td>
                                        <td className="py-5 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${ward.coverage_percent}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{ward.coverage_percent}%</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-center font-black text-blue-600 text-sm">{ward.number_needed_to_screen}</td>
                                        <td className="py-5 text-right pr-2">
                                            {isScheduled(ward.ward) ? (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] font-black">
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    Scheduled
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleScheduleCamp(ward)}
                                                    disabled={schedulingWard === ward.ward}
                                                    className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center ml-auto disabled:opacity-50"
                                                >
                                                    {schedulingWard === ward.ward ? (
                                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="col-span-3 space-y-6">
                    {/* Insight Card */}
                    <div className="bg-white rounded-3xl shadow-sm p-7 flex gap-4 h-full flex-col">
                        <div className="flex gap-4 items-start">
                            <div className="w-1 h-12 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">Insight: Resource Allocation</h3>
                        </div>

                        <p className="text-sm text-slate-500 leading-relaxed">
                            Our ML engine recommends conducting <strong className="text-slate-700">{plan.total_recommended_camps}</strong> camps in <strong className="text-slate-700">{plan.month}</strong> to detect an estimated <strong className="text-slate-700">{plan.total_high_risk}</strong> high-priority NCD cases before escalation.
                        </p>

                        <div className="space-y-3 pt-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Recommended Screenings</p>
                            <div className="flex flex-wrap gap-2">
                                {topWard?.suggested_screenings.map((s, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* System Tip */}
                        <div className="mt-auto bg-emerald-50 rounded-2xl p-5 flex gap-3 items-start">
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 text-emerald-600 mt-0.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">System Tip</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                    Prioritizing {topWard?.ward} could reduce clinic ER visits by 12%.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScreeningCampsPage;
