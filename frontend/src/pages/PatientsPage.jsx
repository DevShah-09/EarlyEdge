import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '../services/patientService';

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // We'll initially load page 1 and pass search if provided
        const data = await getPatients({ page: 1, search: searchTerm });
        setPatients(data.patients || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patient records. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
                  {['High', 'Medium', 'Low'].map(tier => (
                    <button key={tier} className="w-full text-left px-5 py-3 rounded-xl border border-gray-50 text-[10px] font-black text-gray-500 hover:border-blue-100 hover:bg-blue-50 transition-all">
                      {tier} Risk
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

          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          {loading ? (
             <div className="py-20 text-center text-gray-400 font-bold loading-pulse">
               Loading Patient Directory...
             </div>
          ) : (
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
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 text-sm font-bold">No patients found. Please upload data.</td>
                  </tr>
                ) : patients.map((p) => (
                  <tr 
                    key={p.patient_id} 
                    onClick={() => handleRowClick(p.patient_id)}
                    className="group hover:bg-blue-50/20 transition-all cursor-pointer"
                  >
                    <td className="py-7 pl-4 text-[10px] font-black text-gray-300 tracking-widest">#{p.patient_id?.slice(0,8)}</td>
                    <td className="py-7">
                      <div className="font-black text-gray-800 text-sm tracking-tight">{p.name || 'Unknown'}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5">{p.age}y / {p.gender}</div>
                    </td>
                    <td className="py-7">
                      <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{p.primary_condition || 'Normal'}</div>
                      <div className="text-[10px] font-bold text-blue-400 mt-0.5 uppercase tracking-tighter">{p.ward || 'General'}</div>
                    </td>
                    <td className="py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${p.risk_tier === 'High' ? 'bg-red-500' : p.risk_tier === 'Medium' ? 'bg-orange-400' : 'bg-emerald-500'}`} 
                            style={{ width: `${p.overall_risk}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-black ${p.risk_tier === 'High' ? 'text-red-500' : p.risk_tier === 'Medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                          {p.overall_risk}%
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
