/**
 * Quota Logger Service
 * Tracks and logs all Gemini API usage including tokens, costs, and rate limits
 */

export interface QuotaLogEntry {
  timestamp: string;
  sessionId: string;
  model: string;
  filesProcessed: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  status: 'success' | 'error' | 'rate_limited';
  errorMessage?: string;
  processingTimeMs: number;
}

export interface QuotaSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  totalPromptTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  averageProcessingTime: number;
  firstRequest: string;
  lastRequest: string;
}

class QuotaLogger {
  private readonly STORAGE_KEY = 'gemini_quota_logs';
  private readonly SESSION_KEY = 'gemini_session_id';
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    const existingSession = sessionStorage.getItem(this.SESSION_KEY);
    if (existingSession) {
      this.sessionId = existingSession;
    } else {
      this.sessionId = this.generateSessionId();
      sessionStorage.setItem(this.SESSION_KEY, this.sessionId);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log a successful API call
   */
  logSuccess(data: {
    model: string;
    filesProcessed: number;
    promptTokens: number;
    outputTokens: number;
    estimatedCost: number;
    processingTimeMs: number;
  }): void {
    const entry: QuotaLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      model: data.model,
      filesProcessed: data.filesProcessed,
      promptTokens: data.promptTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.promptTokens + data.outputTokens,
      estimatedCost: data.estimatedCost,
      status: 'success',
      processingTimeMs: data.processingTimeMs,
    };

    this.saveEntry(entry);
    this.exportToFile(entry);
  }

  /**
   * Log a failed API call
   */
  logError(data: {
    model: string;
    filesProcessed: number;
    errorMessage: string;
    processingTimeMs: number;
  }): void {
    const isRateLimited = 
      data.errorMessage.includes('503') || 
      data.errorMessage.includes('overloaded') ||
      data.errorMessage.includes('quota') ||
      data.errorMessage.includes('rate limit');

    const entry: QuotaLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      model: data.model,
      filesProcessed: data.filesProcessed,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
      status: isRateLimited ? 'rate_limited' : 'error',
      errorMessage: data.errorMessage,
      processingTimeMs: data.processingTimeMs,
    };

    this.saveEntry(entry);
    this.exportToFile(entry);
  }

  /**
   * Save entry to localStorage
   */
  private saveEntry(entry: QuotaLogEntry): void {
    try {
      const logs = this.getAllLogs();
      logs.push(entry);
      
      // Keep only last 1000 entries to prevent storage overflow
      const trimmedLogs = logs.slice(-1000);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to save quota log:', error);
    }
  }

  /**
   * Export entry to downloadable log file
   */
  private exportToFile(entry: QuotaLogEntry): void {
    try {
      const logLine = this.formatLogLine(entry);
      
      // Append to existing logs in localStorage for file export
      const fileLogsKey = 'gemini_file_logs';
      const existingFileLogs = localStorage.getItem(fileLogsKey) || '';
      const updatedFileLogs = existingFileLogs + logLine + '\n';
      
      // Keep only last 10000 lines
      const lines = updatedFileLogs.split('\n');
      const trimmedLines = lines.slice(-10000).join('\n');
      
      localStorage.setItem(fileLogsKey, trimmedLines);
    } catch (error) {
      console.error('Failed to export log to file:', error);
    }
  }

  /**
   * Format a single log entry as a line
   */
  private formatLogLine(entry: QuotaLogEntry): string {
    const parts = [
      entry.timestamp,
      entry.sessionId,
      entry.status.toUpperCase(),
      entry.model,
      `files=${entry.filesProcessed}`,
      `prompt_tokens=${entry.promptTokens}`,
      `output_tokens=${entry.outputTokens}`,
      `total_tokens=${entry.totalTokens}`,
      `cost=$${entry.estimatedCost.toFixed(6)}`,
      `time=${entry.processingTimeMs}ms`,
    ];

    if (entry.errorMessage) {
      parts.push(`error="${entry.errorMessage}"`);
    }

    return parts.join(' | ');
  }

  /**
   * Get all logs from storage
   */
  getAllLogs(): QuotaLogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to retrieve quota logs:', error);
      return [];
    }
  }

  /**
   * Get logs for current session
   */
  getSessionLogs(): QuotaLogEntry[] {
    return this.getAllLogs().filter(log => log.sessionId === this.sessionId);
  }

  /**
   * Get logs for a specific date range
   */
  getLogsByDateRange(startDate: Date, endDate: Date): QuotaLogEntry[] {
    return this.getAllLogs().filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  /**
   * Get logs for today
   */
  getTodayLogs(): QuotaLogEntry[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getLogsByDateRange(today, tomorrow);
  }

  /**
   * Get summary statistics
   */
  getSummary(logs?: QuotaLogEntry[]): QuotaSummary {
    const logsToAnalyze = logs || this.getAllLogs();
    
    if (logsToAnalyze.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rateLimitedRequests: 0,
        totalPromptTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        averageProcessingTime: 0,
        firstRequest: '',
        lastRequest: '',
      };
    }

    const summary: QuotaSummary = {
      totalRequests: logsToAnalyze.length,
      successfulRequests: logsToAnalyze.filter(l => l.status === 'success').length,
      failedRequests: logsToAnalyze.filter(l => l.status === 'error').length,
      rateLimitedRequests: logsToAnalyze.filter(l => l.status === 'rate_limited').length,
      totalPromptTokens: logsToAnalyze.reduce((sum, l) => sum + l.promptTokens, 0),
      totalOutputTokens: logsToAnalyze.reduce((sum, l) => sum + l.outputTokens, 0),
      totalTokens: logsToAnalyze.reduce((sum, l) => sum + l.totalTokens, 0),
      totalCost: logsToAnalyze.reduce((sum, l) => sum + l.estimatedCost, 0),
      averageProcessingTime: logsToAnalyze.reduce((sum, l) => sum + l.processingTimeMs, 0) / logsToAnalyze.length,
      firstRequest: logsToAnalyze[0].timestamp,
      lastRequest: logsToAnalyze[logsToAnalyze.length - 1].timestamp,
    };

    return summary;
  }

  /**
   * Download logs as a text file
   */
  downloadLogs(filename?: string): void {
    const logs = this.getAllLogs();
    const fileLogsKey = 'gemini_file_logs';
    let content = localStorage.getItem(fileLogsKey) || '';
    
    // If no file logs exist, generate from structured logs
    if (!content && logs.length > 0) {
      content = '=== GEMINI API QUOTA USAGE LOG ===\n\n';
      content += logs.map(log => this.formatLogLine(log)).join('\n');
    }
    
    // Add summary at the top
    const summary = this.getSummary();
    const summaryText = `
=== QUOTA USAGE SUMMARY ===
Generated: ${new Date().toISOString()}
Total Requests: ${summary.totalRequests}
Successful: ${summary.successfulRequests}
Failed: ${summary.failedRequests}
Rate Limited: ${summary.rateLimitedRequests}
Total Tokens: ${summary.totalTokens.toLocaleString()} (Prompt: ${summary.totalPromptTokens.toLocaleString()}, Output: ${summary.totalOutputTokens.toLocaleString()})
Total Cost: $${summary.totalCost.toFixed(4)}
Average Processing Time: ${summary.averageProcessingTime.toFixed(0)}ms
First Request: ${summary.firstRequest}
Last Request: ${summary.lastRequest}

=== DETAILED LOGS ===
`;

    const fullContent = summaryText + '\n' + content;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `gemini-quota-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download logs as JSON
   */
  downloadLogsJSON(filename?: string): void {
    const logs = this.getAllLogs();
    const summary = this.getSummary();
    
    const data = {
      summary,
      logs,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `gemini-quota-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('gemini_file_logs');
  }

  /**
   * Check if rate limit might be approaching (heuristic)
   */
  isApproachingRateLimit(): boolean {
    const recentLogs = this.getLogsByDateRange(
      new Date(Date.now() - 60000), // Last minute
      new Date()
    );
    
    // If more than 10 requests in the last minute, warn user
    return recentLogs.length >= 10;
  }

  /**
   * Get rate limit warning message
   */
  getRateLimitWarning(): string | null {
    const todayLogs = this.getTodayLogs();
    const rateLimitedToday = todayLogs.filter(l => l.status === 'rate_limited').length;
    
    if (rateLimitedToday > 0) {
      return `⚠️ You've hit rate limits ${rateLimitedToday} time(s) today. Consider reducing batch size or waiting between requests.`;
    }
    
    if (this.isApproachingRateLimit()) {
      return `⚠️ High request frequency detected. You may hit rate limits soon. Consider adding delays between batches.`;
    }
    
    return null;
  }
}

// Export singleton instance
export const quotaLogger = new QuotaLogger();
