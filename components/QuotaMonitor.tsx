import React, { useState, useEffect } from 'react';
import { quotaLogger, QuotaSummary } from '../services/quotaLogger';

const QuotaMonitor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<QuotaSummary | null>(null);
  const [todaySummary, setTodaySummary] = useState<QuotaSummary | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen]);

  const refreshStats = () => {
    const allTimeSummary = quotaLogger.getSummary();
    const todayLogs = quotaLogger.getTodayLogs();
    const todayStats = quotaLogger.getSummary(todayLogs);
    const warningMsg = quotaLogger.getRateLimitWarning();

    setSummary(allTimeSummary);
    setTodaySummary(todayStats);
    setWarning(warningMsg);
  };

  const handleDownloadTxt = () => {
    quotaLogger.downloadLogs();
  };

  const handleDownloadJson = () => {
    quotaLogger.downloadLogsJSON();
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all quota logs? This cannot be undone.')) {
      quotaLogger.clearLogs();
      refreshStats();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 z-50"
        title="View Quota Usage"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
        <span className="text-sm font-medium">Quota</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            <h2 className="text-xl font-bold">API Quota Monitor</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning Banner */}
        {warning && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <p className="text-yellow-800 text-sm font-medium">{warning}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Today's Stats */}
          {todaySummary && todaySummary.totalRequests > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-orange-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Today's Usage
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Requests" value={todaySummary.totalRequests} color="blue" />
                <StatCard label="Success" value={todaySummary.successfulRequests} color="green" />
                <StatCard label="Failed" value={todaySummary.failedRequests} color="red" />
                <StatCard label="Rate Limited" value={todaySummary.rateLimitedRequests} color="yellow" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <StatCard label="Total Tokens" value={todaySummary.totalTokens.toLocaleString()} color="purple" />
                <StatCard label="Total Cost" value={`$${todaySummary.totalCost.toFixed(4)}`} color="green" />
              </div>
            </div>
          )}

          {/* All-Time Stats */}
          {summary && summary.totalRequests > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                All-Time Statistics
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-800">{summary.totalRequests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.totalRequests > 0 
                        ? ((summary.successfulRequests / summary.totalRequests) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Tokens</p>
                    <p className="text-lg font-bold text-slate-800">{summary.totalTokens.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">
                      Prompt: {summary.totalPromptTokens.toLocaleString()} | Output: {summary.totalOutputTokens.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Cost</p>
                    <p className="text-lg font-bold text-green-600">${summary.totalCost.toFixed(4)}</p>
                    <p className="text-xs text-slate-500">
                      Avg: ${(summary.totalCost / summary.totalRequests).toFixed(4)}/request
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Avg Processing Time</p>
                  <p className="text-lg font-bold text-slate-800">{summary.averageProcessingTime.toFixed(0)}ms</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    First Request: {summary.firstRequest ? new Date(summary.firstRequest).toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Last Request: {summary.lastRequest ? new Date(summary.lastRequest).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Data */}
          {(!summary || summary.totalRequests === 0) && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-300 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <p className="text-slate-500 font-medium">No quota data yet</p>
              <p className="text-slate-400 text-sm">Process some files to see usage statistics</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTxt}
              className="text-sm bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              disabled={!summary || summary.totalRequests === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download TXT
            </button>
            <button
              onClick={handleDownloadJson}
              className="text-sm bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              disabled={!summary || summary.totalRequests === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download JSON
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshStats}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleClearLogs}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              disabled={!summary || summary.totalRequests === 0}
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`border rounded-lg p-3 ${colorClasses[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default QuotaMonitor;
