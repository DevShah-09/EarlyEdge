import React, { useState, useRef, useEffect } from 'react';
import { uploadDataset, getUploadHistory } from '../services/uploadService';

const UploadPage = () => {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [history, setHistory] = useState([]);
    
    // Aggregated Metrics
    const [totalProcessed, setTotalProcessed] = useState(0);

    const [mapping, setMapping] = useState({
        patient_id: 'Auto-Detected',
        risk_score: 'Auto-Detected',
        dob: null,
    });

    const fileInputRef = useRef(null);

    const loadHistory = async () => {
        try {
            const data = await getUploadHistory();
            setHistory(data.history || []);
            
            // Calculate total records processed from successful batches
            const total = (data.history || []).reduce((acc, curr) => {
                return curr.status === 'SUCCESS' ? acc + curr.records_processed : acc;
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
            console.log('Upload success:', response);
            // Refresh history table
            loadHistory();
            alert(`Success! Processed ${response.records_processed} records.`);
            setTimeout(() => {
                setUploading(false);
                setCurrentFile(null);
                setProgress(0);
            }, 2000);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Check console for details.');
            setUploading(false);
            setProgress(0);
        }
    };

    const criticalErrors = []; // We could populate this from the backend response if extended

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            {/* Header with KPI cards */}
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">Data Ingestion</h1>
                    <p className="text-gray-500 font-medium max-w-xl text-lg leading-relaxed">
                        Upload patient diagnostic records and screening data. Supported formats: .csv, .xlsx. Max file size 50MB.
                    </p>
                </div>
                <div className="flex gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-w-[200px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL PROCESSED</p>
                        <h4 className="text-3xl font-black text-blue-600">{totalProcessed.toLocaleString()}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-w-[200px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SUCCESS RATE</p>
                        <h4 className="text-3xl font-black text-emerald-500">100%</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Left side column: Upload progress & Errors */}
                <div className="col-span-8 space-y-10">
                    {/* Upload Card */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                        className="hidden" 
                    />
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current.click()}
                        className={`bg-white border-4 border-dashed rounded-[48px] p-16 space-y-8 text-center relative overflow-hidden group transition-all ${uploading ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-blue-50 hover:border-blue-100 cursor-pointer'}`}
                    >
                        {!uploading && <div className="absolute inset-0 bg-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                        <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center mx-auto shadow-xl shadow-blue-100 relative z-10 transition-transform group-hover:scale-110">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Drag and drop your file here</h3>
                            <p className="text-gray-400 font-bold text-sm">Or click to browse from your clinical workstation</p>
                        </div>
                        <button disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 relative z-10 uppercase disabled:opacity-50">
                            {uploading ? 'Processing File...' : 'Select Patient Data'}
                        </button>
                    </div>

                    {/* Progress Card */}
                    {uploading && currentFile && (
                        <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex items-center gap-8 relative group overflow-hidden">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-gray-800 tracking-tight leading-none">{currentFile.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Running ML Inference • {(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <span className="text-sm font-black text-blue-600 tracking-tighter">{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden shadow-inner ring-1 ring-gray-100">
                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-lg shadow-blue-200" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Critical Errors Section */}
                    {criticalErrors.length > 0 && (
                        <div className="bg-red-50/50 border border-red-100 rounded-[48px] p-10 space-y-10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black text-red-900 tracking-tight">Critical Errors Detected ({criticalErrors.length})</h3>
                                    <p className="text-sm font-bold text-red-700/60 leading-tight">Please resolve these before finalizing the ingestion.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {criticalErrors.map((err, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-red-50 space-y-4 shadow-sm group hover:border-red-200 transition-all">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{err.row ? `Row ${err.row}` : `Column: '${err.column}'`}</p>
                                            <h4 className="text-sm font-black text-gray-800 leading-tight">{err.type}</h4>
                                        </div>
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{err.expected}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side column: Schema Mapping */}
                <div className="col-span-4 space-y-8">
                    <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-10 space-y-8">
                        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Schema Mapping</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">SYSTEM FIELD: PATIENT ID</label>
                                <div className="relative group">
                                    <select className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] px-6 py-4 font-bold text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer">
                                        <option>{mapping.patient_id}</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">SYSTEM FIELD: RISK SCORE</label>
                                <div className="relative group">
                                    <select className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] px-6 py-4 font-bold text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer">
                                        <option>{mapping.risk_score}</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SYSTEM FIELD: DOB</label>
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        AUTO-COMPUTED
                                    </span>
                                </div>
                                <div className="relative group">
                                    <select className="w-full bg-green-50 border-2 border-green-100 rounded-[24px] px-6 py-4 font-bold text-sm text-green-700 hover:bg-green-100 focus:outline-none transition-all appearance-none cursor-pointer">
                                        <option>Age inferred</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent History Table */}
            <div className="space-y-8 pt-4">
                <div className="flex justify-between items-center px-4">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Recent Ingestion History</h2>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Full Audit Trail →</button>
                </div>
                <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50">
                                <th className="pb-8 pl-4">BATCH IDENTITY</th>
                                <th className="pb-8">TIMESTAMP</th>
                                <th className="pb-8 text-center">RECORDS</th>
                                <th className="pb-8 text-center">STATUS</th>
                                <th className="pb-8 text-right pr-4">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400 text-sm font-bold">No uploads found.</td>
                                </tr>
                            ) : history.map((batch) => (
                                <tr key={batch.id} className="group hover:bg-gray-50/50 transition-all cursor-default">
                                    <td className="py-8 pl-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-blue-500 transition-colors">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <span className="font-black text-gray-700 text-sm">{batch.filename}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 font-bold text-gray-400 text-xs uppercase tracking-tight">
                                        {new Date(batch.uploaded_at).toLocaleString()}
                                    </td>
                                    <td className="py-8 text-center font-black text-gray-700 text-sm">
                                        {batch.records_processed?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest shadow-sm ${
                                            batch.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td className="py-8 text-right pr-4">
                                        {batch.status === 'SUCCESS' ? (
                                            <button className="text-gray-300 hover:text-blue-600 transition-colors p-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </button>
                                        ) : (
                                            <button className="text-gray-300 hover:text-red-500 transition-colors p-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </button>
                                        )}
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
