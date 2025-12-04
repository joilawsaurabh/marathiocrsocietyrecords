
import React, { useState, useCallback, useEffect } from 'react';
import { UploadedFile, OCRRecord, ProcessingStatus, ExportRow } from './types';
import { performOCR } from './services/geminiService';
import FileUploader from './components/FileUploader';
import OCRResultCard from './components/OCRResultCard';
import JsonPreview from './components/JsonPreview';
import ExportGrid from './components/ExportGrid';
import QuotaMonitor from './components/QuotaMonitor';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<OCRRecord[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [totalSessionCost, setTotalSessionCost] = useState(0);
  
  // State for the accumulated master list - persistence logic
  const [masterGridData, setMasterGridData] = useState<ExportRow[]>(() => {
    try {
      const saved = localStorage.getItem('ocr_master_grid');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load master grid from local storage", e);
      return [];
    }
  });

  // Auto-save to localStorage whenever masterGridData changes
  useEffect(() => {
    try {
      localStorage.setItem('ocr_master_grid', JSON.stringify(masterGridData));
    } catch (e) {
      console.error("Failed to save master grid to local storage", e);
    }
  }, [masterGridData]);

  const handleFilesSelected = useCallback((newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset state on new file add if we were in a success/error state
    if (status === ProcessingStatus.SUCCESS || status === ProcessingStatus.ERROR) {
       setStatus(ProcessingStatus.IDLE);
       setResults([]);
       setError(null);
    }
  }, [status]);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setStatus(ProcessingStatus.IDLE);
    setError(null);
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) return;

    setStatus(ProcessingStatus.PROCESSING);
    setError(null);

    try {
      const ocrRecords = await performOCR(files);
      // Assign temporary IDs to keep track of updates
      const recordsWithIds = ocrRecords.map(r => ({ ...r, id: Math.random().toString(36).substr(2, 9) }));
      
      // Update total cost
      const batchCost = recordsWithIds.reduce((sum, rec) => sum + (rec.estimated_cost || 0), 0);
      setTotalSessionCost(prev => prev + batchCost);

      setResults(recordsWithIds);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleRecordUpdate = (updatedRecord: OCRRecord) => {
      setResults(prev => prev.map(r => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const addToMasterGrid = () => {
      const newRows: ExportRow[] = results.map(r => {
          const transfers = r.transfers ? r.transfers.map(t => t.text) : [];
          
          // "Still Today" logic: The last transfer name. If no transfers, then original owner.
          let stillToday = r.original_owner.text;
          if (transfers.length > 0) {
              stillToday = transfers[transfers.length - 1];
          }

          return {
              id: r.id || Math.random().toString(36),
              fileName: r.file_name,
              flatNumber: r.flat_number.text,
              originalOwner: r.original_owner.text,
              transfer1: transfers[0] || '',
              transfer2: transfers[1] || '',
              transfer3: transfers[2] || '',
              transfer4: transfers[3] || '',
              transfer5: transfers[4] || '',
              transfer6: transfers[5] || '',
              stillToday: stillToday
          };
      });

      setMasterGridData(prev => [...prev, ...newRows]);
      
      // Clear current batch so user can start fresh without clearing master list
      handleReset(); 
  };

  const handleClearMasterGrid = () => {
    if (window.confirm("Are you sure you want to clear the entire Master Grid history? This action cannot be undone.")) {
      setMasterGridData([]);
      localStorage.removeItem('ocr_master_grid');
    }
  };

  // Helper to find original file for a record (naive matching by name)
  const getOriginalFile = (fileName: string) => {
    return files.find(f => f.file.name === fileName);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
               </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Marathi <span className="text-orange-600">OCR</span> Pro
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Cost</span>
              <span className="text-sm font-mono font-bold text-green-600">${totalSessionCost.toFixed(5)}</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                Powered by Gemini 3.0 Pro
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-32">
        
        {/* Intro / Upload Section */}
        {status === ProcessingStatus.IDLE && results.length === 0 && (
            <div className="space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Convert Handwritten Marathi to Digital Text
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Upload your handwritten documents (letters, notes, records) and get structured digital data instantly.
                    </p>
                </div>

                <FileUploader onFilesSelected={handleFilesSelected} />

                {/* Selected Files Grid */}
                {files.length > 0 && (
                    <div className="mt-8">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Selected Files ({files.length})
                            </h3>
                            <button 
                                onClick={handleReset}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {files.map((file) => (
                                <div key={file.id} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white">
                                    <div className="aspect-square relative bg-slate-100">
                                        <img 
                                            src={file.previewUrl} 
                                            alt="preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                        <button 
                                            onClick={() => removeFile(file.id)}
                                            className="absolute top-1 right-1 bg-white/90 hover:bg-white text-slate-500 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-2 text-xs text-slate-600 truncate bg-white border-t border-slate-100">
                                        {file.file.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleProcessFiles}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 active:scale-95 flex items-center space-x-2"
                            >
                                <span>Extract Text</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Loading State */}
        {status === ProcessingStatus.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative w-20 h-20">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">Processing Handwritten Text</h3>
                    <p className="text-slate-500">Analyzing Devanagari script... this may take a moment.</p>
                </div>
            </div>
        )}

        {/* Error State */}
        {status === ProcessingStatus.ERROR && (
             <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Processing Failed</h3>
                <p className="text-red-700 mb-6">{error}</p>
                <button 
                    onClick={() => setStatus(ProcessingStatus.IDLE)}
                    className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                    Try Again
                </button>
             </div>
        )}

        {/* Results State */}
        {status === ProcessingStatus.SUCCESS && results.length > 0 && (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Verification</h2>
                    <button 
                        onClick={handleReset}
                        className="text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Cancel Batch
                    </button>
                </div>

                <div className="space-y-6">
                    {results.map((record, index) => (
                        <OCRResultCard 
                            key={record.id || index} 
                            record={record} 
                            originalFile={getOriginalFile(record.file_name)} 
                            onRecordUpdate={handleRecordUpdate}
                        />
                    ))}
                </div>

                {/* Action to Collect Data */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-orange-900">Batch Verification Complete?</h3>
                        <p className="text-orange-700 text-sm max-w-md mx-auto">
                            If you have verified and edited the records above, click below to add them to the cumulative Master Grid and clear the current view for the next batch.
                        </p>
                    </div>
                    <button
                        onClick={addToMasterGrid}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-10 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                        </svg>
                        Collect & Add to Master Grid
                    </button>
                </div>

                <JsonPreview data={results} />
            </div>
        )}

        {/* Always show Master Grid if data exists */}
        <ExportGrid data={masterGridData} onClear={handleClearMasterGrid} />

      </main>

      {/* Quota Monitor - Floating Button */}
      <QuotaMonitor />
    </div>
  );
};

export default App;
