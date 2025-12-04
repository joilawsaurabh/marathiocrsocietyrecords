
import React, { useState, useEffect, useRef } from 'react';
import { OCRRecord, UploadedFile } from '../types';

interface OCRResultCardProps {
  record: OCRRecord;
  originalFile?: UploadedFile;
  onRecordUpdate: (updatedRecord: OCRRecord) => void;
}

const OCRResultCard: React.FC<OCRResultCardProps> = ({ record, originalFile, onRecordUpdate }) => {
  const [copied, setCopied] = useState(false);
  
  // State for editable fields
  const [flatNumber, setFlatNumber] = useState('');
  const [originalOwner, setOriginalOwner] = useState('');
  const [transfers, setTransfers] = useState<string[]>([]);

  // Keep track of alternatives for display in the edit modal
  const [ownerAlts, setOwnerAlts] = useState<string[]>([]);
  const [transferAlts, setTransferAlts] = useState<string[][]>([]);

  // Bounding Boxes State
  const [flatNumberBox, setFlatNumberBox] = useState<number[] | undefined>(undefined);
  const [ownerBox, setOwnerBox] = useState<number[] | undefined>(undefined);
  const [transferBoxes, setTransferBoxes] = useState<(number[] | undefined)[]>([]);

  // Active Highlight State
  const [activeBox, setActiveBox] = useState<number[] | undefined>(undefined);

  // Zoom Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(100); // Percentage

  // Lens / Magnifier State
  const [isLensMode, setIsLensMode] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensBackgroundPos, setLensBackgroundPos] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);

  // Refs for image manipulation
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize state from props
  useEffect(() => {
    if (record) {
        setFlatNumber(record.flat_number?.text || '');
        setFlatNumberBox(record.flat_number?.box_2d);
        
        setOriginalOwner(record.original_owner?.text || '');
        setOwnerAlts(record.original_owner?.alternatives || []);
        setOwnerBox(record.original_owner?.box_2d);

        setTransfers(record.transfers ? record.transfers.map(t => t.text) : []);
        setTransferAlts(record.transfers ? record.transfers.map(t => t.alternatives || []) : []);
        setTransferBoxes(record.transfers ? record.transfers.map(t => t.box_2d) : []);
    }
  }, [record]);

  // Sync changes back to parent whenever local state changes
  const updateParent = (
    newFlat: string, 
    newOwner: string, 
    newTransfers: string[]
  ) => {
    const updatedRecord: OCRRecord = {
        ...record,
        flat_number: { ...record.flat_number, text: newFlat },
        original_owner: { ...record.original_owner, text: newOwner },
        transfers: newTransfers.map((t, i) => ({
            text: t,
            alternatives: transferAlts[i] || [],
            box_2d: transferBoxes[i]
        }))
    };
    onRecordUpdate(updatedRecord);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

  const handleFlatChange = (val: string) => {
      setFlatNumber(val);
      updateParent(val, originalOwner, transfers);
  }

  const handleOwnerChange = (val: string) => {
      setOriginalOwner(val);
      updateParent(flatNumber, val, transfers);
  }

  const handleTransferChange = (index: number, newVal: string) => {
    const newTransfers = [...transfers];
    newTransfers[index] = newVal;
    setTransfers(newTransfers);
    updateParent(flatNumber, originalOwner, newTransfers);
  };

  const handleAddTransfer = () => {
      const newTransfers = [...transfers, ''];
      setTransfers(newTransfers);
      setTransferAlts([...transferAlts, []]);
      setTransferBoxes([...transferBoxes, undefined]);
      updateParent(flatNumber, originalOwner, newTransfers);
  }

  const handleRemoveTransfer = (index: number) => {
      const newTransfers = [...transfers];
      newTransfers.splice(index, 1);
      setTransfers(newTransfers);

      const newAlts = [...transferAlts];
      newAlts.splice(index, 1);
      setTransferAlts(newAlts);

      const newBoxes = [...transferBoxes];
      newBoxes.splice(index, 1);
      setTransferBoxes(newBoxes);
      
      updateParent(flatNumber, originalOwner, newTransfers);
  }

  const handleCopyFullText = () => {
    const lines = [
      `Sr No: ${flatNumber}`,
      `Original Owner: ${originalOwner}`,
      ...transfers.map((t, i) => `Transfer ${i + 2}: ${t}`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openModal = () => {
    setZoom(100);
    setIsModalOpen(true);
    setIsLensMode(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 50, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 50, 50));
  const handleResetZoom = () => setZoom(100);

  // Lens Logic
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLensMode || !imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Check if mouse is inside image
    if (x < 0 || y < 0 || x > width || y > height) {
        setShowLens(false);
        return;
    }

    setShowLens(true);
    
    // Position the lens div near cursor
    setLensPos({ x: e.clientX, y: e.clientY });

    // Calculate background position (percentage for scaling)
    const xPerc = (x / width) * 100;
    const yPerc = (y / height) * 100;

    setLensBackgroundPos({ x: xPerc, y: yPerc });
  };

  const handleImageMouseLeave = () => {
      setShowLens(false);
  };


  // Reusable Field Renderer with Alternatives
  const renderField = (
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    alternatives?: string[],
    onDelete?: () => void,
    boundingBox?: number[]
  ) => {
    const isActive = JSON.stringify(activeBox) === JSON.stringify(boundingBox) && boundingBox !== undefined;
    
    return (
    <div 
        className={`mb-6 bg-slate-50 p-3 rounded-lg border transition-colors duration-200 ${
            isActive 
            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/50 shadow-md' 
            : 'border-slate-100'
        }`}
    >
      <div className="flex justify-between items-center mb-1">
        <label className={`block text-xs font-bold uppercase tracking-wider ${isActive ? 'text-red-600' : 'text-slate-500'}`}>
            {label}
        </label>
        {onDelete && (
            <button onClick={onDelete} className="text-red-400 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                </svg>
            </button>
        )}
      </div>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setActiveBox(boundingBox)}
        className={`w-full p-2 border rounded text-lg font-marathi text-slate-900 outline-none ${
            isActive 
            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white' 
            : 'border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
        }`}
      />
      {alternatives && alternatives.length > 0 && (
        <div className="mt-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-1">
            AI Combinations & Phonetic Variants
          </span>
          <div className="flex flex-wrap gap-1.5">
            {alternatives.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => onChange(alt)}
                className="px-2 py-1 text-sm bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50 text-slate-700 rounded shadow-sm transition-all font-marathi"
                title="Click to use this variation"
              >
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )};

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
           <div>
             <h3 className="font-medium text-slate-800">{record.file_name}</h3>
             <div className="flex items-center space-x-2">
                 <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                   {record.document_type || 'Document'}
                 </span>
                 {record.estimated_cost !== undefined && (
                     <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-mono">
                        ${record.estimated_cost.toFixed(5)}
                     </span>
                 )}
             </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={openModal}
                className="text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50 hover:text-orange-600 transition-colors"
            >
                Verify & Edit
            </button>
            <button
                onClick={handleCopyFullText}
                className="text-slate-400 hover:text-orange-600 transition-colors p-2"
                title="Copy All Text"
            >
                {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1-1.125-1.125v-3.375m11.25 0V7.5a2.25 2.25 0 0 0-2.25-2.25H7.5a2.25 2.25 0 0 0-2.25 2.25v3.375m11.25 0H5.625" />
                    </svg>
                )}
            </button>
        </div>
      </div>

      {/* Card Content Preview */}
      <div className="flex flex-col sm:flex-row">
         {/* Thumbnail */}
         <div 
            className="w-full sm:w-1/3 bg-slate-100 border-b sm:border-b-0 sm:border-r border-slate-100 relative group cursor-zoom-in min-h-[200px]"
            onClick={openModal}
         >
             {originalFile ? (
                 <>
                    <img 
                        src={originalFile.previewUrl} 
                        alt="Document Thumbnail" 
                        className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-3 py-1 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                            Click to Zoom & Verify
                        </span>
                    </div>
                 </>
             ) : (
                 <div className="flex items-center justify-center h-full text-slate-400 text-sm">No Image</div>
             )}
         </div>

         {/* Quick Text Preview */}
         <div className="w-full sm:w-2/3 p-4 space-y-3">
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Sr No</div>
                <div className="text-lg font-semibold text-slate-800">{flatNumber}</div>
            </div>
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Original Owner</div>
                <div className="text-lg font-marathi text-slate-900">{originalOwner}</div>
            </div>
            <div>
                 <div className="text-xs font-bold text-slate-400 uppercase">Transfers ({transfers.length})</div>
                 {transfers.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                        {transfers.slice(0, 2).map((t, i) => (
                            <li key={i} className="text-base font-marathi text-slate-700 truncate border-l-2 border-orange-200 pl-2">
                                {t}
                            </li>
                        ))}
                        {transfers.length > 2 && (
                            <li className="text-xs text-slate-500 italic pl-2">+ {transfers.length - 2} more</li>
                        )}
                    </ul>
                 ) : (
                     <div className="text-sm text-slate-400 italic">No transfers detected</div>
                 )}
            </div>
         </div>
      </div>
    </div>

    {/* Full Screen Zoom & Edit Modal */}
    {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col h-screen">
            {/* Modal Toolbar */}
            <div className="flex-none h-16 bg-slate-800 px-6 flex items-center justify-between border-b border-slate-700 shadow-md z-20">
                <div className="flex items-center space-x-4">
                    <h2 className="text-white font-medium text-lg">{record.file_name}</h2>
                    {record.estimated_cost !== undefined && (
                         <span className="text-green-400 text-xs font-mono bg-slate-700 px-2 py-1 rounded">Cost: ${record.estimated_cost.toFixed(5)}</span>
                    )}
                    <div className="h-6 w-px bg-slate-600"></div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setIsLensMode(!isLensMode)}
                            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all ${
                                isLensMode 
                                ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300/30' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                            </svg>
                            {isLensMode ? 'Lens Active' : 'Enable Lens'}
                        </button>

                        <div className="w-px h-4 bg-slate-600 mx-2"></div>

                        <button onClick={handleZoomOut} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full" title="Zoom Out">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" /></svg>
                        </button>
                        <span className="text-slate-300 text-sm w-12 text-center">{zoom}%</span>
                        <button onClick={handleZoomIn} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full" title="Zoom In">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                        </button>
                        <button onClick={handleResetZoom} className="text-xs text-slate-400 hover:text-white underline ml-2">Reset</button>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Modal Body: Split View */}
            <div className="flex-grow flex overflow-hidden">
                
                {/* Left: Image Viewer */}
                <div 
                    className={`flex-grow bg-slate-900 overflow-auto flex items-center justify-center relative p-8 ${isLensMode ? 'cursor-crosshair' : 'cursor-default'}`}
                    ref={imageContainerRef}
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={handleImageMouseLeave}
                >
                    {originalFile && (
                        <div 
                            style={{ 
                                width: `${zoom}%`, 
                                minWidth: '100%',
                                maxWidth: zoom > 100 ? 'none' : '100%',
                                transition: 'width 0.2s ease-out' 
                            }} 
                            className="relative shadow-2xl"
                        >
                            <img 
                                ref={imageRef}
                                src={originalFile.previewUrl} 
                                alt="Zoomed Document" 
                                className="w-full h-full block"
                            />
                            
                            {/* SVG Overlay for Bounding Boxes */}
                            <svg 
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                viewBox="0 0 1000 1000"
                                preserveAspectRatio="none"
                            >
                                {/* Draw all faint boxes for context (exclude active box) */}
                                {[flatNumberBox, ownerBox, ...transferBoxes].filter(Boolean).map((box, idx) => {
                                    const isActiveBox = activeBox && box && 
                                        box[0] === activeBox[0] && 
                                        box[1] === activeBox[1] && 
                                        box[2] === activeBox[2] && 
                                        box[3] === activeBox[3];
                                    
                                    if (isActiveBox) return null;

                                    return (
                                        <rect 
                                            key={`ctx-${idx}`}
                                            x={box![1]} 
                                            y={box![0]} 
                                            width={box![3] - box![1]} 
                                            height={box![2] - box![0]} 
                                            fill="none" 
                                            stroke="rgba(59, 130, 246, 0.4)"
                                            strokeWidth="2"
                                            vectorEffect="non-scaling-stroke"
                                            strokeDasharray="4 2"
                                        />
                                    )
                                })}

                                {/* Draw active highlight box if exists */}
                                {activeBox && (
                                    <rect 
                                        x={activeBox[1]} 
                                        y={activeBox[0]} 
                                        width={activeBox[3] - activeBox[1]} 
                                        height={activeBox[2] - activeBox[0]} 
                                        fill="rgba(220, 38, 38, 0.2)" 
                                        stroke="#dc2626" 
                                        strokeWidth="4"
                                        vectorEffect="non-scaling-stroke"
                                        className="transition-all duration-200 ease-out drop-shadow-lg"
                                        rx="5" // Rounded corners for "dialog" box feel
                                    />
                                )}
                            </svg>

                            {/* Lens Magnifier Element */}
                            {isLensMode && showLens && (
                                <div 
                                    className="fixed w-48 h-48 border-4 border-white rounded-full shadow-2xl overflow-hidden pointer-events-none z-50 bg-no-repeat bg-slate-900"
                                    style={{
                                        top: lensPos.y - 96, // Center the 192px circle (48 * 4 = 192px roughly)
                                        left: lensPos.x - 96,
                                        backgroundImage: `url(${originalFile.previewUrl})`,
                                        backgroundSize: `${zoom * 3}%`, // 3x Magnification of current zoom
                                        backgroundPosition: `${lensBackgroundPos.x}% ${lensBackgroundPos.y}%`,
                                        boxShadow: '0 0 0 4px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <div className="absolute inset-0 border border-black/10 rounded-full"></div>
                                    {/* Crosshair for precision */}
                                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Editor Sidebar */}
                <div className="w-full md:w-[450px] flex-none bg-white border-l border-slate-200 flex flex-col shadow-xl z-10">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700">Data Verification</h3>
                        <p className="text-xs text-slate-500">Focus on a field to see the <span className="text-red-600 font-bold">Red Dialog Highlight</span> on the image.</p>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-5 space-y-2">
                        {renderField("Flat Number (Sr. No)", flatNumber, handleFlatChange, [], undefined, flatNumberBox)}
                        {renderField("Original Owner (Line 1)", originalOwner, handleOwnerChange, ownerAlts, undefined, ownerBox)}
                        
                        <div className="pt-4 border-t border-slate-100 mt-6 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-700 text-sm uppercase">Transfers</h4>
                                <button 
                                    onClick={handleAddTransfer}
                                    className="text-xs flex items-center text-orange-600 font-medium hover:bg-orange-50 px-2 py-1 rounded"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                                    </svg>
                                    Add Line
                                </button>
                            </div>
                            <div className="space-y-2">
                                {transfers.map((t, i) => (
                                    <React.Fragment key={i}>
                                        {renderField(
                                            `Transfer ${i + 2}`, 
                                            t, 
                                            (val) => handleTransferChange(i, val),
                                            transferAlts[i] || [],
                                            () => handleRemoveTransfer(i),
                                            transferBoxes[i]
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                         <button 
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
                         >
                             Done Verifying
                         </button>
                    </div>
                </div>

            </div>
        </div>
    )}
    </>
  );
};

export default OCRResultCard;
