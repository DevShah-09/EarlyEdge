import React, { useState, useRef, useEffect } from 'react';
import { uploadDataset, getUploadHistory } from '../services/uploadService';

const UploadPage = () => {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [history, setHistory] = useState([]);
    const [totalProcessed, setTotalProcessed] = useState(0);

    const [mapping, setMapping] = useState({
        patient_id: 'Auto-Detected',
        risk_score: 'Auto-Detected',
        dob: 'Auto-Computed',
    });

    const fileInputRef = useRef(null);

    const loadHistory = async () => {
        try {
            const data = await getUploadHistory();
            const hList = data.history || [];
            setHistory(hList);
            const total = hList.reduce((acc, curr) => {
                return curr.status === 'SUCCESS' ? acc + (curr.processed || 0) : acc;
            }, 0);
            setTotalProcessed(total);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            startUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            startUpload(e.dataTransfer.files[0]);
        }
    };

    const startUpload = async (file) => {
        setCurrentFile(file);
        setUploading(true);
        setProgress(0);

        try {
            const response = await uploadDataset(file, (percent) => {
                setProgress(percent);
            });
            loadHistory();
            // Success feedback
            setTimeout(() => {
                setUploading(false);
                setCurrentFile(null);
                setProgress(0);
            }, 2000);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24 animate-in fade-in duration-700 font-['Outfit'] pr-4">
            {/* Header Section with KPIs */}
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Data Ingestion Engine</h1>
                    <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
                        Bulk upload patient diagnostic records. Our ML engine automatically extracts clinical markers and calculates risk trajectories.
                    </p>
                </div>
                <div className="flex gap-6">
                    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[220px] transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">TOTAL RECORDS</p>
                        <h4 className="text-4xl font-black text-blue-600 tracking-tighter">{totalProcessed.toLocaleString()}</h4>
                    </div>
                    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[220px] transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ENGINE UPTIME</p>
                        <h4 className="text-4xl font-black text-emerald-500 tracking-tighter">99.9%</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Main Interaction Area */}
                <div className="col-span-8 space-y-10">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept=".csv, .xlsx, .xls" 
                        className="hidden" 
                    />
                    
                    {/* Drag & Drop Card */}
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current.click()}
                        className={`bg-white border-4 border-dashed rounded-[56px] p-20 space-y-10 text-center relative overflow-hidden group transition-all duration-500 ${
                            uploading ? 'border-slate-100 opacity-60 cursor-not-allowed' : 'border-blue-50 hover:border-blue-200 cursor-pointer hover:shadow-2xl hover:shadow-blue-50/50'
                        }`}
                    >
                        <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <div className="space-y-3 relative z-10">
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Drop screening files here</h3>
                            <p className="text-slate-400 font-bold text-lg">Supported: CSV, XLSX (Max 100MB)</p>
                        </div>
                        <button disabled={uploading} className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95 relative z-10 uppercase">
                            {uploading ? 'ENGINE INGESTING...' : 'SELECT CLINICAL DATA'}
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    {uploading && currentFile && (
                        <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm flex items-center gap-10 animate-in slide-in-from-bottom-5 duration-500">
                             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                             </div>
                             <div className="flex-1 space-y-4">
                                 <div className="flex justify-between items-end">
                                     <div className="space-y-1">
                                         <h4 className="text-xl font-black text-slate-800 tracking-tight">{currentFile.name}</h4>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating Schema & Ingesting Records...</p>
                                     </div>
                                     <span className="text-lg font-black text-blue-600 tracking-tighter">{progress}%</span>
                                 </div>
                                 <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                                     <div className="h-full bg-blue-600 rounded-full transition-all duration-700 shadow-lg shadow-blue-200" style={{ width: `${progress}%` }}></div>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Schema Mapping Column */}
                <div className="col-span-4 space-y-8">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Field Mapping</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">PATIENT IDENTIFIER</label>
                                <div className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] px-7 py-5 font-bold text-sm text-slate-700 shadow-inner">
                                    {mapping.patient_id}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">AGE / DOB COLUMN</label>
                                <div className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-[24px] px-7 py-5 font-bold text-sm text-emerald-700 shadow-inner flex justify-between items-center">
                                    <span>{mapping.dob}</span>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4">
                                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-5 rounded-[24px] font-black text-xs tracking-widest uppercase transition-all">
                                    Config Schema
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ingestion Table */}
            <div className="space-y-8 pt-6">
                <div className="flex justify-between items-center px-4">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight underline decoration-blue-100 decoration-8 underline-offset-[12px]">Recent Ingestions</h2>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline transition-all">View Cloud Audit Trail →</button>
                </div>
                <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden p-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] border-b border-slate-50">
                                <th className="pb-10 pl-6">FILE IDENTITY</th>
                                <th className="pb-10">INGESTION DATE</th>
                                <th className="pb-10 text-center">RECORD COUNT</th>
                                <th className="pb-10 text-center">STATUS</th>
                                <th className="pb-10 text-right pr-6">DOWNLOAD</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-slate-400 font-bold italic">No cloud ingestion history found.</td>
                                </tr>
                            ) : history.map((batch) => (
                                <tr key={batch.batch_id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="py-9 pl-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <span className="font-extrabold text-slate-800 text-base">{batch.filename}</span>
                                        </div>
                                    </td>
                                    <td className="py-9 font-bold text-slate-400 text-xs uppercase tracking-tighter">
                                        {new Date(batch.uploaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-9 text-center font-black text-slate-800 text-sm">
                                        {batch.processed?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-9 text-center">
                                        <span className={`px-5 py-2 rounded-full text-[9px] font-black tracking-[0.2em] shadow-sm uppercase ${
                                            batch.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                        }`}>
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td className="py-9 text-right pr-6">
                                        <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 rounded-xl hover:shadow-md">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assistance Floating Button */}
            <button className="fixed bottom-12 right-12 flex items-center gap-5 bg-white p-2.5 pr-8 rounded-[32px] shadow-2xl shadow-blue-200/50 border border-slate-100 group hover:-translate-y-2 transition-all active:scale-95 z-40">
                <div className="w-14 h-14 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:rotate-12 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="text-left">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none">IMPORT ASSISTANT</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Need help with CSV schema?</p>
                </div>
            </button>
        </div>
    );
};

export default UploadPage;
