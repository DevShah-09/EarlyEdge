import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 'PA-9021-X', name: 'Arjun Mehra', initials: 'AM', condition: 'Congestive Heart Failure', ward: 'Ward B', asha: 'Sunita Sharma', score: 88, risk: 'HIGH' },
    { id: 'PA-8842-B', name: 'Rina Kumari', initials: 'RK', condition: 'Gestational Diabetes', ward: 'Ward C', asha: 'Priya Verma', score: 52, risk: 'MED' },
    { id: 'PA-7731-S', name: 'Vikram Prasad', initials: 'VP', condition: 'Post-Op Recovery', ward: 'Ward A', asha: 'Anita Devi', score: 18, risk: 'LOW' },
    { id: 'PA-1209-Z', name: 'Sanya Kapoor', initials: 'SK', condition: 'Severe Hypertension', ward: 'Ward B', asha: 'Sunita Sharma', score: 74, risk: 'HIGH' },
  ];

  const handleRegister = () => {
    alert('Opening Patient Registration Form...');
  };

  const handleExport = () => {
    alert('Exporting Patient Directory to CSV...');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-['Outfit'] pb-20 pr-4">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl">
            Manage and monitor high-risk populations across assigned wards with real-time risk scoring and clinical oversight.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export to CSV
          </button>
          <button 
            onClick={handleRegister}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Register Patient
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Risk Tier', value: 'All Tiers' },
          { label: 'Condition', value: 'All Conditions' },
          { label: 'Ward Location', value: 'Global View' },
          { label: 'ASHA Assigned', value: 'All Staff' },
        ].map((filter, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{filter.label}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">{filter.value}</span>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              <th className="pb-6">Patient Name & ID</th>
              <th className="pb-6">Condition</th>
              <th className="pb-6">Ward</th>
              <th className="pb-6">ASHA Worker</th>
              <th className="pb-6">Risk Score &darr;</th>
              <th className="pb-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-['Outfit']">
            {patients.map((p, i) => (
              <tr 
                key={i} 
                onClick={() => navigate(`/patients/${p.id}`)}
                className="group hover:bg-slate-50/50 transition-all cursor-pointer"
              >
                <td className="py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-inner transition-transform group-hover:scale-105 ${
                      p.risk === 'HIGH' ? 'bg-red-50 text-red-600' : 
                      p.risk === 'MED' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                    }`}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">ID: {p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-6 text-sm font-semibold text-slate-600 max-w-[200px] leading-snug">
                  {p.condition}
                </td>
                <td className="py-6">
                   <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-center inline-block">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ward</p>
                      <p className="text-xs font-black text-slate-700 leading-none">{p.ward.split(' ')[1]}</p>
                   </div>
                </td>
                <td className="py-6">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                      <span className="text-sm font-bold text-slate-600">{p.asha}</span>
                   </div>
                </td>
                <td className="py-6">
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                         <div 
                           className={`h-full rounded-full ${
                             p.risk === 'HIGH' ? 'bg-red-600' : 
                             p.risk === 'MED' ? 'bg-amber-700' : 'bg-teal-400'
                           }`} 
                           style={{ width: `${p.score}%` }}
                         ></div>
                      </div>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        p.risk === 'HIGH' ? 'bg-red-50 text-red-600' : 
                        p.risk === 'MED' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-600'
                      }`}>
                         {p.score} - {p.risk}
                      </span>
                   </div>
                </td>
                <td className="py-6 text-right">
                   <button className="p-2 text-slate-300 group-hover:text-slate-600 transition-colors">
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="mt-10 flex justify-between items-center py-4 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1-10 of 248 patients</p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-[10px] font-black">1</button>
            {[2, 3, '...', 25].map((n, i) => (
              <button key={i} className="w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-400 text-[10px] font-black transition-colors">{n}</button>
            ))}
            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </div>

      {/* Floating Emergency Alert Button (match image) */}
      <div className="fixed bottom-10 right-10 z-50">
         <button className="flex items-center gap-3 bg-white px-6 py-4 rounded-[28px] shadow-2xl border border-slate-100 hover:-translate-y-1 transition-all active:scale-95 group">
            <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:animate-pulse">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 11v4m0 0l-2-2m2 2l2-2" /></svg>
            </div>
            <span className="text-sm font-black text-slate-800 tracking-tight uppercase">Emergency Alert</span>
         </button>
      </div>
    </div>
  );
};

export default PatientsPage;
