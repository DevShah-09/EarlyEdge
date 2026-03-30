import React, { useState } from 'react';

const ASHATasksPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [showOptimization, setShowOptimization] = useState(false);
    const [optimizing, setOptimizing] = useState(false);

    const kpis = [
        { title: 'TOTAL TASKS', value: '142', change: '+12% vs last week', color: 'bg-blue-600' },
        { title: 'PENDING', value: '38', change: 'Action Needed', color: 'bg-red-500' },
        { title: 'IN PROGRESS', value: '54', change: 'Live Tracking', color: 'bg-orange-400' },
        { title: 'COMPLETED', value: '50', change: 'Daily Target Reached', color: 'bg-emerald-500' },
    ];

    const tasks = [
        { id: 1, patient: 'Anita Deshpande', risk: 'HIGH RISK', distance: '2.1 km away', due: 'Today, 4:00 PM', status: 'Pending', icon: 'bg-red-50 text-red-500', symbol: '*' },
        { id: 2, patient: 'Rajesh Kumar', risk: 'MEDIUM RISK', distance: '0.8 km away', due: 'Tomorrow', status: 'In Progress', icon: 'bg-orange-50 text-orange-500', symbol: 'm' },
        { id: 3, patient: 'Priya Sharma', risk: 'LOW RISK', distance: '3.5 km away', due: '24 Oct', status: 'Assigned', icon: 'bg-cyan-50 text-cyan-500', symbol: 'u' },
    ];

    const roster = [
        { name: 'Lakshmi Bai', zone: 'ZONE A', tasks: 4, online: true },
        { name: 'Sunita Verma', zone: 'ZONE B', tasks: 2, online: true },
        { name: 'Meena Gupta', zone: 'ZONE A', online: false },
        { name: 'Rekha Patil', zone: 'ZONE C', tasks: 6, online: true },
    ];

    const handleSimulate = () => {
        setOptimizing(true);
        setTimeout(() => setOptimizing(false), 2000);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 relative">
            {/* Header section */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">OPERATIONS OVERVIEW</p>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">ASHA Field Tasks</h1>
                </div>
                <button 
                    onClick={() => setShowOptimization(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-3 uppercase"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    Auto-Assign Tasks
                </button>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.title}</p>
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl font-black text-gray-800 tracking-tighter">{kpi.value}</h3>
                                <span className={`text-[10px] font-bold ${idx === 0 ? 'text-emerald-500' : 'text-gray-400'}`}>{kpi.change}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                <div className={`h-full ${kpi.color} w-3/4 rounded-full`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Task List Section */}
                <div className="col-span-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Active Tasks</h2>
                        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                            {['All', 'Pending', 'InProgress', 'Done'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-8">
                                    <div className={`w-14 h-14 ${task.icon} rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner`}>
                                        {task.symbol}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-gray-800 tracking-tight">{task.patient}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase ${task.icon}`}>
                                                {task.risk}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {task.distance}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Due: {task.due}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex -space-x-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">+2</div>
                                    </div>
                                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">
                                        {task.status === 'In Progress' ? 'Monitor Live' : 'View Details'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Roster Section */}
                <div className="col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">ASHA Worker Roster</h2>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest">12 ONLINE</span>
                        </div>

                        <div className="space-y-6">
                            {roster.map((worker, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                <img src={`https://ui-avatars.com/api/?name=${worker.name}&background=random`} alt="" />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${worker.online ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">{worker.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{worker.zone} • {worker.tasks || 0} ACTIVE TASKS</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimization Engine Modal */}
            {showOptimization && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowOptimization(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-12 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="flex justify-between items-start relative">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-blue-700 tracking-tight">Task Optimization Engine</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI-Driven Assignment Strategy</p>
                            </div>
                            <button onClick={() => setShowOptimization(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="flex justify-between items-center py-4 border-b border-gray-50">
                                <p className="text-xs font-bold text-gray-500">Unassigned Tasks</p>
                                <p className="text-lg font-black text-gray-800">24</p>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-gray-50">
                                <p className="text-xs font-bold text-gray-500">Optimal ASHA Match</p>
                                <p className="text-lg font-black text-emerald-500">92% Confidence</p>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <p className="text-xs font-bold text-gray-500">Estimated Travel Saving</p>
                                <p className="text-lg font-black text-blue-600">14.2 km</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative">
                            <button 
                                onClick={handleSimulate}
                                className={`py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${
                                    optimizing ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                                {optimizing ? 'Calculating...' : 'Simulate'}
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-100 transition-all active:scale-95">
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ASHATasksPage;
