import React from 'react';
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
import { Line, Doughnut } from 'react-chartjs-2';

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
  
  const kpis = [
    { title: 'Total Patients', value: '1,284', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'High Risk Count', value: '412', change: '+5%', color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Pending ASHA Tasks', value: '86', change: '-2%', color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Upcoming Camps', value: '4', change: '0%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const priorityPatients = [
    { id: '1024', name: 'Aswathy Menon', condition: 'Diabetes', risk: 'HIGH', lastVisit: '2 days ago' },
    { id: '1026', name: 'Sneha Nair', condition: 'Hypertension', risk: 'HIGH', lastVisit: 'Yesterday' },
    { id: '1105', name: 'Rajesh Kumar', condition: 'CVD Risk', risk: 'HIGH', lastVisit: '3 days ago' },
    { id: '1025', name: 'Rahul Pillai', condition: 'Hypertension', risk: 'MEDIUM', lastVisit: 'Today' },
  ];

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'High Risk Trend',
        data: [420, 380, 450, 412, 460, 412],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        fill: true,
        tension: 0.5,
        pointRadius: 0,
        borderWidth: 4,
      }
    ],
  };

  const donutData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [412, 540, 332],
        backgroundColor: ['#ef4444', '#f97316', '#10b981'],
        hoverOffset: 20,
        borderWidth: 0,
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      {/* KPI Section */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{kpi.title}</p>
            <div className="flex items-end justify-between mt-4">
              <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{kpi.value}</h3>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${kpi.bg} ${kpi.color} shadow-sm`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="col-span-8 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Population Risk Trend</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Aggregate Data Analysis</p>
            </div>
            <select className="bg-gray-50 border-none rounded-2xl px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest focus:ring-2 focus:ring-blue-100">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-72">
            <Line data={lineData} options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { display: false } }, 
              scales: { 
                y: { display: false, grid: { display: false } }, 
                x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#cbd5e1' } } 
              } 
            }} />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="col-span-4 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col items-center">
          <h2 className="text-xl font-black text-gray-800 self-start mb-10 tracking-tight">Risk Distribution</h2>
          <div className="h-60 w-60 relative">
            <Doughnut data={donutData} options={{ 
              cutout: '82%', 
              plugins: { 
                legend: { display: false } 
              } 
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-gray-800 tracking-tighter">1,284</span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Monitored</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-10 w-full">
            {['High', 'Med', 'Low'].map((label, i) => (
              <div key={label} className="text-center space-y-1">
                <div className={`w-2 h-2 rounded-full mx-auto ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Table */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-10">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Priority Interventions</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Action Required: Immediate</p>
          </div>
          <button 
            onClick={() => navigate('/patients')}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
          >
            View Full Directory →
          </button>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50">
              <th className="pb-6 pl-4">Patient Name</th>
              <th className="pb-6">Primary Condition</th>
              <th className="pb-6 text-center">Status</th>
              <th className="pb-6">Last Clinical Input</th>
              <th className="pb-6 text-right pr-4">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {priorityPatients.map((p, i) => (
              <tr key={i} className="group hover:bg-blue-50/20 transition-all cursor-pointer" onClick={() => navigate(`/patients/${p.id}`)}>
                <td className="py-7 pl-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-gray-800 text-sm">{p.name}</div>
                      <div className="text-[10px] font-bold text-gray-400">ID: #{p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-7">
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{p.condition}</span>
                </td>
                <td className="py-7 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${
                    p.risk === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {p.risk}
                  </span>
                </td>
                <td className="py-7 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {p.lastVisit}
                </td>
                <td className="py-7 text-right pr-4">
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
    </div>
  );
};

export default DashboardPage;
