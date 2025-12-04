
import React from 'react';
import { ExportRow } from '../types';

interface ExportGridProps {
  data: ExportRow[];
  onClear: () => void;
}

const ExportGrid: React.FC<ExportGridProps> = ({ data, onClear }) => {
  if (data.length === 0) return null;

  const downloadCSV = () => {
    const headers = [
      "Flat Number",
      "Original Owner",
      "Transfer 1",
      "Transfer 2",
      "Transfer 3",
      "Transfer 4",
      "Transfer 5",
      "Transfer 6",
      "Still Today (Current Owner)"
    ];

    const rows = data.map(row => [
      `"${row.flatNumber}"`,
      `"${row.originalOwner}"`,
      `"${row.transfer1}"`,
      `"${row.transfer2}"`,
      `"${row.transfer3}"`,
      `"${row.transfer4}"`,
      `"${row.transfer5}"`,
      `"${row.transfer6}"`,
      `"${row.stillToday}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `master_ocr_grid_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-12 border-t-2 border-slate-200 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <span className="bg-slate-800 text-white p-1.5 rounded mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M19.125 15h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" />
                    </svg>
                </span>
                Master Grid (Accumulated)
            </h2>
            <p className="text-slate-500 text-sm mt-1">
                Data from all batches collected here. Append more files above to grow this list.
            </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onClear}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 px-4 py-2.5 rounded-lg shadow-sm flex items-center text-sm font-medium transition-all hover:text-red-600 hover:border-red-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Clear History
            </button>
            <button 
                onClick={downloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow flex items-center text-sm font-medium transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download CSV
            </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Flat No</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Original Owner</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer 1</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer 2</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer 3</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer 4</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer 5</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer 6</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50">Still Today</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 font-marathi">
            {data.map((row, index) => (
              <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-orange-50 transition-colors'}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.flatNumber}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{row.originalOwner}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.transfer1}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.transfer2}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.transfer3}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.transfer4}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.transfer5}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{row.transfer6}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-800 bg-green-50 border-l border-green-100">
                    {row.stillToday}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExportGrid;
