import React, { useState } from 'react';

const ScreeningCampsPage = () => {
  const [selectedConditions, setSelectedConditions] = useState(['Hypertension']);

  const timelineEvents = [
    { date: 'Oct 12', ward: 'Ward 04', type: 'Primary BP Screening', color: 'bg-blue-600' },
    { date: 'Oct 18', ward: 'Ward 21', type: 'GDM Awareness Drive', color: 'bg-emerald-600' },
    { date: 'Oct 24', ward: 'Ward 09', type: 'Pediatric Health Check', color: 'bg-gray-400' },
  ];

  const riskMatrix = [
    { name: 'Ward 04 - Alappuzha North', density: 'CRITICAL (78%)', densityColor: 'text-red-600 bg-red-50', population: '4,200', nns: '8.2', trend: 'up' },
    { name: 'Ward 12 - Lakeside', density: 'MODERATE (42%)', densityColor: 'text-orange-600 bg-orange-50', population: '3,150', nns: '14.5', trend: 'stable' },
    { name: 'Ward 08 - Canal View', density: 'LOW (12%)', densityColor: 'text-emerald-600 bg-emerald-50', population: '5,800', nns: '22.1', trend: 'down' },
  ];

  const toggleCondition = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition) 
        : [...prev, condition]
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-gray-800">Screening </span>
            <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl">
            Strategize community health interventions using predictive screening metrics and ward-level risk mapping.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 pr-12">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total NNS</p>
              <p className="text-3xl font-black text-blue-700">12.4</p>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-relaxed">
              Number Needed<br/>To Screen
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-100 transition-all duration-300 flex items-center gap-4 group active:scale-95">
            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg pr-4">Generate Camp Plan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Filters & Timeline */}
        <div className="col-span-3 space-y-8">
          {/* Filters Card */}
          <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 space-y-8">
            <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time Period</label>
                <select className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3.5 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer shadow-sm">
                  <option>October 2023</option>
                  <option>November 2023</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ward Sector</label>
                <select className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3.5 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer shadow-sm">
                  <option>All Wards</option>
                  <option>North Sector</option>
                  <option>South Sector</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Clinical Condition</label>
                <div className="flex flex-wrap gap-2">
                  {['Hypertension', 'Diabetes', 'Anaemia'].map((condition) => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(condition)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                        selectedConditions.includes(condition)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-105'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="px-2 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Upcoming Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="flex gap-4 relative group">
                  <div className={`w-6 h-6 rounded-full ${event.color} border-4 border-white shadow-sm z-10 flex-shrink-0 transition-transform group-hover:scale-125`}></div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-800 flex items-center gap-2">
                      {event.date} <span className="text-gray-300">•</span> {event.ward}
                    </p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{event.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Matrix & Next Camp */}
        <div className="col-span-6 space-y-8">
          {/* Geospatial Risk Matrix */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Geospatial Risk Matrix</h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-100 border-2 border-red-400"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">High Priority</span>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">
                  <th className="pb-4 font-bold">Ward Name</th>
                  <th className="pb-4 font-bold text-center">Risk Density</th>
                  <th className="pb-4 font-bold text-center">Population</th>
                  <th className="pb-4 font-bold text-center">NNS Target</th>
                  <th className="pb-4 font-bold text-right pr-4">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {riskMatrix.map((ward, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 font-bold text-gray-700 text-sm">{ward.name}</td>
                    <td className="py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${ward.densityColor}`}>
                        {ward.density}
                      </span>
                    </td>
                    <td className="py-6 text-center font-bold text-gray-500 text-sm">{ward.population}</td>
                    <td className="py-6 text-center font-black text-blue-600 text-sm">{ward.nns}</td>
                    <td className="py-6 text-right pr-4">
                      {ward.trend === 'up' && <svg className="w-5 h-5 ml-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" /></svg>}
                      {ward.trend === 'stable' && <svg className="w-5 h-5 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14" /></svg>}
                      {ward.trend === 'down' && <svg className="w-5 h-5 ml-auto text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-9-9-4 4-6-6" /></svg>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Next Active Camp Card */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 flex gap-10 relative overflow-hidden group">
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] animate-pulse">Next Active Camp</p>
                <h3 className="text-3xl font-black text-gray-800">Ward 04 Health Mela</h3>
              </div>

              <div className="flex gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Screening</p>
                  <p className="text-xl font-black text-gray-800">450 <span className="text-sm font-bold text-gray-400">Patients</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Cost</p>
                  <p className="text-xl font-black text-gray-800">₹12,400</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff Requirements</p>
                <div className="flex items-center -space-x-3">
                  {[1, 2, 3].map((n) => (
                    <img key={n} src={`https://ui-avatars.com/api/?name=Staff+${n}&background=random`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-50 border-4 border-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">+4</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-xs transition-all">NCD & ANC Profile</button>
                <button className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 group/btn">
                  View Logic 
                  <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0 transform group-hover:rotate-3 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Proposed Camp */}
        <div className="col-span-3 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50 p-8 flex flex-col h-full ring-4 ring-gray-50 relative group">
            <button className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-2xl text-white flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all active:scale-95 shadow-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-black text-gray-800 leading-tight">Proposed: Ward 21 Diabetes Drive</h3>
              </div>

              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Based on 32% increase in reported hyperglycemia cases in last 3 months. Recommended screening focus: HbA1c and Foot Exams.
              </p>

              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Required Kits</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 transition-colors group-hover/item:bg-emerald-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 14.83a2 2 0 00-1.823.362 2.25 2.25 0 00-1.107 2.052l.259 4.316a.375.375 0 00.374.352h14.536a.375.375 0 00.374-.352l.259-4.316a2.25 2.25 0 00-1.107-2.052z" /></svg>
                    </div>
                    <p className="font-bold text-gray-700 leading-tight text-sm">Glucometers (20), Strips (500)</p>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 transition-colors group-hover/item:bg-gray-100">
                      <svg className="w-5 h-5 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    <p className="font-bold text-gray-400 leading-tight text-sm italic">Add Custom Asset...</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-gray-100 hover:bg-gray-800 hover:text-white py-4 rounded-[20px] font-black text-sm tracking-wide transition-all mt-12 flex items-center justify-center gap-3 active:scale-95 shadow-sm">
              <svg className="w-5 h-5 bg-white/20 rounded-full" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              Approve for Scheduling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningCampsPage;
