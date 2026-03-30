import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const patients = [
    { id: '1024', name: 'Aswathy Menon', age: 45, ward: 'Ward 04', risk: 'HIGH', score: 82, condition: 'Diabetes' },
    { id: '1025', name: 'Rahul Pillai', age: 32, ward: 'Ward 12', risk: 'MEDIUM', score: 54, condition: 'Hypertension' },
    { id: '1026', name: 'Sneha Nair', age: 58, ward: 'Ward 04', risk: 'HIGH', score: 78, condition: 'Diabetes' },
    { id: '1027', name: 'Vimal Kumar', age: 41, ward: 'Ward 08', risk: 'LOW', score: 24, condition: 'None' },
    { id: '1028', name: 'Deepa Raj', age: 37, ward: 'Ward 21', risk: 'MEDIUM', score: 48, condition: 'Anaemia' },
  ];

  const handleRowClick = (id) => {
    navigate(`/patients/${id}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Patients Directory</h1>
          <p className="text-gray-500 font-medium">Access and manage individual risk profiles and clinical records.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2 uppercase">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Add New Patient
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className="col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Filters</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Risk Tier</label>
                <div className="grid grid-cols-1 gap-2">
                  {['High Risk', 'Medium Risk', 'Stable'].map(tier => (
                    <button key={tier} className="w-full text-left px-5 py-3 rounded-xl border border-gray-50 text-[10px] font-black text-gray-500 hover:border-blue-100 hover:bg-blue-50 transition-all">
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Ward Selection</label>
                <select className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-blue-100 transition-all">
                  <option>All Wards</option>
                  <option>Ward 04</option>
                  <option>Ward 12</option>
                </select>
              </div>

              <div className="pt-4">
                <button className="w-full text-center text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-blue-600 transition-colors">Clear All Filters</button>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Table Area */}
        <div className="col-span-9 bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Search name or ID..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-black placeholder-gray-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest">Export Dataset</button>
              <button className="px-6 py-3 bg-blue-50 rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-100 transition-all flex items-center gap-2 uppercase tracking-widest">
                <span>Sorted: Risk</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50">
                <th className="pb-6 pl-4">Patient ID</th>
                <th className="pb-6">Profile</th>
                <th className="pb-6">Clinical Data</th>
                <th className="pb-6">Risk Trajectory</th>
                <th className="pb-6 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => handleRowClick(p.id)}
                  className="group hover:bg-blue-50/20 transition-all cursor-pointer"
                >
                  <td className="py-7 pl-4 text-[10px] font-black text-gray-300 tracking-widest">#{p.id}</td>
                  <td className="py-7">
                    <div className="font-black text-gray-800 text-sm tracking-tight">{p.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">{p.age}y / {p.gender || 'Female'}</div>
                  </td>
                  <td className="py-7">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{p.condition}</div>
                    <div className="text-[10px] font-bold text-blue-400 mt-0.5 uppercase tracking-tighter">{p.ward}</div>
                  </td>
                  <td className="py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${p.risk === 'HIGH' ? 'bg-red-500' : p.risk === 'MEDIUM' ? 'bg-orange-400' : 'bg-emerald-500'}`} 
                          style={{ width: `${p.score}%` }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-black ${p.risk === 'HIGH' ? 'text-red-500' : p.risk === 'MEDIUM' ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {p.score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-7 text-right pr-4">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button className="bg-white shadow-xl border border-gray-100 p-3 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
