import React, { useState } from 'react';
import { predictRisk } from '../services/riskService';

// ── Helpers ──────────────────────────────────────────────────────────────────
const RISK_COLORS = {
  Normal:   { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', bar: '#10b981' },
  Moderate: { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   bar: '#f59e0b' },
  High:     { bg: 'bg-orange-50',   border: 'border-orange-200',  text: 'text-orange-700',  bar: '#f97316' },
  Critical: { bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     bar: '#ef4444' },
};

const getRiskColor = (level) => RISK_COLORS[level] || RISK_COLORS.Moderate;

const ScoreBar = ({ label, value, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-700">{value.toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const SliderField = ({ label, unit, field, min, max, step = 1, value, onChange }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</label>
      <span className="text-sm font-black text-blue-600">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        {unit && <span className="text-[10px] ml-1 font-bold text-slate-400">{unit}</span>}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(field, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
    <div className="flex justify-between text-[9px] text-slate-300 font-bold">
      <span>{min}</span><span>{max}</span>
    </div>
  </div>
);

const ToggleField = ({ label, icon, field, value, onChange, activeClass }) => (
  <button
    type="button"
    onClick={() => onChange(field, value === 1 ? 0 : 1)}
    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 w-full ${
      value === 1 ? activeClass : 'bg-white border-slate-100 opacity-50'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

// ── Default vitals ────────────────────────────────────────────────────────────
const DEFAULTS = {
  age: 45,
  gender: 'M',
  systolic_bp: 125,
  diastolic_bp: 82,
  bmi: 26.5,
  hba1c: 5.8,
  blood_glucose_fasting: 105,
  cholesterol_total: 195,
  smoking_status: 'never',
  physical_activity: 1,
  family_history_diabetes: 0,
  family_history_hypertension: 0,
  family_history_cvd: 0,
};

const SMOKING_OPTIONS = [
  { value: 'never',   label: '🚭 Never' },
  { value: 'former',  label: '⏳ Former' },
  { value: 'current', label: '🚬 Current' },
];

// ── Main Component ────────────────────────────────────────────────────────────
const RiskSimulatorPage = () => {
  const [form, setForm]       = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        age:                    parseFloat(form.age),
        systolic_bp:            parseFloat(form.systolic_bp),
        diastolic_bp:           parseFloat(form.diastolic_bp),
        bmi:                    parseFloat(form.bmi),
        hba1c:                  parseFloat(form.hba1c),
        blood_glucose_fasting:  parseFloat(form.blood_glucose_fasting),
        cholesterol_total:      parseFloat(form.cholesterol_total),
      };
      const data = await predictRisk(payload);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm(DEFAULTS); setResult(null); setError(null); };

  const rc = result ? getRiskColor(result.risk_level) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 font-['Outfit']">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-[28px] p-7 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">ML Risk Simulator</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              NCD Prediction · XGBoost / LightGBM · Recall-Optimised
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black text-slate-500 transition-all border border-slate-100 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reset
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* ── Left Panel: Vitals Input ── */}
          <div className="col-span-7 space-y-6">

            {/* Demographics */}
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Demographics</h3>
              <div className="grid grid-cols-2 gap-8">
                <SliderField label="Age" unit="yrs" field="age" min={18} max={90} value={form.age} onChange={handleChange}/>

                {/* Gender toggle */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Gender</label>
                  <div className="flex gap-3">
                    {[['M','♂ Male'],['F','♀ Female']].map(([val, lbl]) => (
                      <button key={val} type="button"
                        onClick={() => handleChange('gender', val)}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                          form.gender === val
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >{lbl}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Pressure & Metabolic */}
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Blood Pressure &amp; Metabolic</h3>
              <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                <SliderField label="Systolic BP"  unit="mmHg" field="systolic_bp"  min={80}  max={200} value={form.systolic_bp}  onChange={handleChange}/>
                <SliderField label="Diastolic BP" unit="mmHg" field="diastolic_bp" min={50}  max={140} value={form.diastolic_bp} onChange={handleChange}/>
                <SliderField label="BMI"      unit="kg/m²" field="bmi"      min={14}  max={50}  step={0.1} value={form.bmi}      onChange={handleChange}/>
                <SliderField label="HbA1c"    unit="%"     field="hba1c"    min={3.5} max={15}  step={0.1} value={form.hba1c}    onChange={handleChange}/>
                <SliderField label="Fasting Glucose" unit="mg/dL" field="blood_glucose_fasting" min={60} max={400} value={form.blood_glucose_fasting} onChange={handleChange}/>
                <SliderField label="Total Cholesterol" unit="mg/dL" field="cholesterol_total" min={100} max={400} value={form.cholesterol_total} onChange={handleChange}/>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Lifestyle &amp; History</h3>

              {/* Smoking */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Smoking Status</label>
                <div className="flex gap-3">
                  {SMOKING_OPTIONS.map(({ value, label }) => (
                    <button key={value} type="button"
                      onClick={() => handleChange('smoking_status', value)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                        form.smoking_status === value
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Physical Activity */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Physical Activity</label>
                <div className="flex gap-3">
                  {[['Sedentary','🪑',0],['Moderate','🚶',1],['Active','🏃',2]].map(([lbl, icon, val]) => (
                    <button key={val} type="button"
                      onClick={() => handleChange('physical_activity', val)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                        form.physical_activity === val
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >{icon} {lbl}</button>
                  ))}
                </div>
              </div>

              {/* Family History toggles */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Family History</label>
                <div className="grid grid-cols-3 gap-3">
                  <ToggleField label="Diabetes"     icon="🩸" field="family_history_diabetes"     value={form.family_history_diabetes}     onChange={handleChange} activeClass="bg-red-50 border-red-300 text-red-600"/>
                  <ToggleField label="Hypertension" icon="🫀" field="family_history_hypertension" value={form.family_history_hypertension} onChange={handleChange} activeClass="bg-orange-50 border-orange-300 text-orange-600"/>
                  <ToggleField label="CVD"          icon="❤️" field="family_history_cvd"          value={form.family_history_cvd}          onChange={handleChange} activeClass="bg-pink-50 border-pink-300 text-pink-600"/>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-5 rounded-[24px] font-black text-sm tracking-[0.15em] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  RUNNING ML PREDICTION…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                      d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  PREDICT RISK WITH ML
                </>
              )}
            </button>
          </div>

          {/* ── Right Panel: Results ── */}
          <div className="col-span-5 space-y-5 sticky top-6">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-[24px] p-6 flex gap-4 items-start">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-red-800">Prediction Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Placeholder */}
            {!result && !error && !loading && (
              <div className="bg-white rounded-[28px] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[420px]">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-black text-slate-400">Awaiting Patient Vitals</p>
                  <p className="text-[10px] font-bold text-slate-300">Adjust the sliders and click Predict</p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && !result && (
              <div className="bg-white rounded-[28px] p-10 border border-slate-100 shadow-sm space-y-6 min-h-[420px] animate-pulse">
                <div className="h-4 bg-slate-100 rounded-full w-1/2"/>
                <div className="h-24 bg-slate-100 rounded-2xl"/>
                <div className="h-4 bg-slate-100 rounded-full w-3/4"/>
                <div className="h-4 bg-slate-100 rounded-full w-2/3"/>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"/>
              </div>
            )}

            {/* ── Result Card ── */}
            {result && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Overall risk score */}
                <div className={`rounded-[28px] p-8 border-2 ${rc.bg} ${rc.border} space-y-5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Overall Risk</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${rc.bg} ${rc.border} border ${rc.text}`}>
                      {result.risk_level}
                    </span>
                  </div>

                  {/* Big % dial */}
                  <div className="flex items-end gap-3">
                    <span className={`text-7xl font-black tracking-tighter ${rc.text}`}>
                      {result.risk_percent}
                    </span>
                    <span className={`text-3xl font-black pb-2 ${rc.text} opacity-60`}>%</span>
                    {result.high_risk && (
                      <span className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
                        ⚠️ HIGH RISK
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic border-t border-white/60 pt-4">
                    "{result.explanation}"
                  </p>
                </div>

                {/* Condition breakdown */}
                <div className="bg-white rounded-[24px] p-7 border border-slate-100 shadow-sm space-y-5">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Condition Breakdown</h3>
                  <ScoreBar label="Diabetes"     value={result.condition_scores.diabetes}     color="#6366f1"/>
                  <ScoreBar label="Hypertension" value={result.condition_scores.hypertension} color="#f97316"/>
                  <ScoreBar label="CVD"          value={result.condition_scores.cvd}          color="#ef4444"/>
                </div>

                {/* Top factors */}
                {result.top_factors?.length > 0 && (
                  <div className="bg-white rounded-[24px] p-7 border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Top Risk Factors</h3>
                    <div className="space-y-2">
                      {result.top_factors.slice(0, 5).map((factor, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical alerts */}
                {result.rule_triggered?.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-100 rounded-[24px] p-7 space-y-3">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.25em]">⚠️ Clinical Thresholds Exceeded</h3>
                    <div className="space-y-2">
                      {result.rule_triggered.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"/>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RiskSimulatorPage;
