import React, { useState, useRef, useEffect } from 'react';
import { uploadDataset, getUploadHistory, deleteBatch } from '../services/uploadService';

const UploadPage = () => {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [history, setHistory] = useState([]);
    const [totalProcessed, setTotalProcessed] = useState(0);
    const [uploadError, setUploadError] = useState(null);



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
            setUploading(false);
            setCurrentFile(null);
            setProgress(0);
            setUploadError(null);
            loadHistory();
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(error.response?.data?.detail || "Upload failed. Please ensure the backend server and Supabase keys are configured.");
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDeleteBatch = async (batchId, filename) => {
        if (!window.confirm(`Are you sure you want to remove the ingestion for "${filename}"? All associated patient records and risk scores will be deleted.`)) {
            return;
        }

        try {
            await deleteBatch(batchId);
            loadHistory();
        } catch (error) {
            console.error('Failed to delete batch:', error);
            alert('Failed to delete ingestion. Please check the logs.');
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
                <div className="col-span-12 space-y-10">
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

                    {/* Error Indicator */}
                    {uploadError && (
                        <div className="bg-red-50 border border-red-100 rounded-[40px] p-8 shadow-sm flex items-center gap-8 animate-in slide-in-from-top-4 duration-400">
                             <div className="w-14 h-14 bg-white text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             </div>
                             <div className="flex-1 space-y-1">
                                 <h4 className="text-sm font-black text-red-800 uppercase tracking-widest">Ingestion Core Failure</h4>
                                 <p className="text-xs font-bold text-red-600/80 leading-relaxed">{uploadError}</p>
                             </div>
                             <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-700 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                    )}
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
                                        <div className="flex items-center justify-end gap-3">
                                            <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 rounded-xl hover:shadow-md" title="Download Source">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteBatch(batch.batch_id, batch.filename)}
                                                className="p-3 text-slate-200 hover:text-rose-600 transition-colors bg-slate-50/50 rounded-xl hover:bg-rose-50 hover:shadow-sm"
                                                title="Remove Ingestion"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

export default UploadPage;
