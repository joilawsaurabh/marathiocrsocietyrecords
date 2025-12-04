import React, { useState } from 'react';
import { OCRRecord } from '../types';

interface JsonPreviewProps {
  data: OCRRecord[];
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
        <span className="text-slate-300 text-sm font-mono">output.json</span>
        <button
          onClick={handleCopy}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-green-400">
        {jsonString}
      </pre>
    </div>
  );
};

export default JsonPreview;