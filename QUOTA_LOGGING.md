# Quota Logging System

## Overview

The Quota Logging System automatically tracks all Gemini API usage in your Marathi OCR Pro application. It monitors token consumption, costs, processing times, and rate limit events to help you optimize API usage and avoid quota issues.

## Features

### 📊 Automatic Logging
- **Every API call** is automatically logged (success or failure)
- **Token usage** tracked (prompt tokens + output tokens)
- **Cost calculation** based on current Gemini pricing
- **Processing time** measurement
- **Error tracking** including rate limit events

### 📈 Real-Time Monitoring
- **Today's usage** statistics
- **All-time statistics** across all sessions
- **Rate limit warnings** when approaching limits
- **Success rate** tracking

### 💾 Data Persistence
- Logs stored in **browser localStorage**
- Survives page refreshes
- Keeps last **1,000 structured entries**
- Keeps last **10,000 log lines** for file export

### 📥 Export Options
- **Download as TXT**: Human-readable log file with summary
- **Download as JSON**: Structured data for analysis
- Automatic filename with date

## How It Works

### 1. Automatic Integration

The quota logger is automatically integrated into `geminiService.ts`:

```typescript
// Before API call
const startTime = Date.now();

try {
  // Make API call
  const response = await ai.models.generateContent({...});
  
  // Log success
  quotaLogger.logSuccess({
    model: 'gemini-3-pro-preview',
    filesProcessed: 3,
    promptTokens: 15000,
    outputTokens: 2000,
    estimatedCost: 0.0735,
    processingTimeMs: 4500
  });
  
} catch (error) {
  // Log failure
  quotaLogger.logError({
    model: 'gemini-3-pro-preview',
    filesProcessed: 3,
    errorMessage: error.message,
    processingTimeMs: 1200
  });
}
```

### 2. Log Entry Format

Each log entry contains:

```typescript
{
  timestamp: "2025-11-24T10:30:45.123Z",
  sessionId: "session_1732445445123_abc123",
  model: "gemini-3-pro-preview",
  filesProcessed: 3,
  promptTokens: 15000,
  outputTokens: 2000,
  totalTokens: 17000,
  estimatedCost: 0.0735,
  status: "success" | "error" | "rate_limited",
  errorMessage?: "The model is overloaded...",
  processingTimeMs: 4500
}
```

### 3. Text Log Format

When exported as TXT, logs are formatted as:

```
=== QUOTA USAGE SUMMARY ===
Generated: 2025-11-24T10:35:00.000Z
Total Requests: 45
Successful: 42
Failed: 1
Rate Limited: 2
Total Tokens: 765,000 (Prompt: 675,000, Output: 90,000)
Total Cost: $3.2475
Average Processing Time: 4250ms
First Request: 2025-11-24T08:00:00.000Z
Last Request: 2025-11-24T10:30:00.000Z

=== DETAILED LOGS ===

2025-11-24T08:00:15.123Z | session_abc123 | SUCCESS | gemini-3-pro-preview | files=3 | prompt_tokens=15000 | output_tokens=2000 | total_tokens=17000 | cost=$0.073500 | time=4500ms

2025-11-24T08:05:30.456Z | session_abc123 | RATE_LIMITED | gemini-3-pro-preview | files=5 | prompt_tokens=0 | output_tokens=0 | total_tokens=0 | cost=$0.000000 | time=1200ms | error="The model is overloaded. Please try again later."
```

## Using the Quota Monitor UI

### Opening the Monitor

Click the **"Quota"** button in the bottom-right corner of the screen.

### Dashboard Sections

#### 1. Today's Usage
- **Requests**: Total API calls today
- **Success**: Successful requests
- **Failed**: Failed requests (non-rate-limit errors)
- **Rate Limited**: Requests blocked by rate limits
- **Total Tokens**: All tokens used today
- **Total Cost**: Money spent today

#### 2. All-Time Statistics
- **Total Requests**: Lifetime API calls
- **Success Rate**: Percentage of successful requests
- **Total Tokens**: Breakdown of prompt vs output tokens
- **Total Cost**: Lifetime spending + average per request
- **Avg Processing Time**: How long requests take
- **First/Last Request**: Date range of logs

#### 3. Warning Banner
Appears when:
- You've hit rate limits today
- High request frequency detected (>10 requests/minute)

### Actions

#### Download TXT
Downloads a human-readable log file:
- Filename: `gemini-quota-log-2025-11-24.txt`
- Contains summary + detailed logs
- Good for sharing or archiving

#### Download JSON
Downloads structured data:
- Filename: `gemini-quota-log-2025-11-24.json`
- Contains summary + all log entries
- Good for analysis in Excel/Python

#### Refresh
Reloads statistics from storage

#### Clear Logs
Permanently deletes all logs (requires confirmation)

## Programmatic Usage

### Get Today's Logs
```typescript
import { quotaLogger } from './services/quotaLogger';

const todayLogs = quotaLogger.getTodayLogs();
console.log(`Made ${todayLogs.length} requests today`);
```

### Get Summary Statistics
```typescript
const summary = quotaLogger.getSummary();
console.log(`Total cost: $${summary.totalCost.toFixed(4)}`);
console.log(`Success rate: ${(summary.successfulRequests / summary.totalRequests * 100).toFixed(1)}%`);
```

### Check Rate Limit Status
```typescript
const warning = quotaLogger.getRateLimitWarning();
if (warning) {
  alert(warning); // Show warning to user
}

if (quotaLogger.isApproachingRateLimit()) {
  // Disable "Process" button temporarily
  setCanProcess(false);
}
```

### Get Logs by Date Range
```typescript
const startDate = new Date('2025-11-20');
const endDate = new Date('2025-11-24');
const logs = quotaLogger.getLogsByDateRange(startDate, endDate);
```

### Get Current Session Logs
```typescript
const sessionLogs = quotaLogger.getSessionLogs();
console.log(`This session: ${sessionLogs.length} requests`);
```

## Cost Calculation

Costs are calculated based on Gemini pricing:

```typescript
// Pricing (per 1M tokens)
const PRICE_PER_1M_INPUT_TOKENS = $3.50;
const PRICE_PER_1M_OUTPUT_TOKENS = $10.50;

// Example calculation
const inputCost = (15000 / 1000000) * 3.50 = $0.0525
const outputCost = (2000 / 1000000) * 10.50 = $0.0210
const totalCost = $0.0735
```

**Note**: Prices may change. Update constants in `geminiService.ts` if needed.

## Storage Limits

### localStorage Limits
- **Structured logs**: Last 1,000 entries (~500KB)
- **File logs**: Last 10,000 lines (~2MB)
- **Total storage**: ~2.5MB (well within 5-10MB browser limit)

### Automatic Cleanup
Old logs are automatically removed when limits are reached (FIFO - First In, First Out).

## Rate Limit Detection

The system automatically detects rate limit errors by checking for:
- HTTP status code `503`
- Error messages containing "overloaded"
- Error messages containing "quota"
- Error messages containing "rate limit"

These are logged with status `rate_limited` for easy filtering.

## Best Practices

### 1. Monitor Daily
Check your quota usage at the end of each day:
- Review "Today's Usage" section
- Download logs for record-keeping
- Identify patterns in rate limit events

### 2. Set Budgets
Based on your logs, set daily/weekly budgets:
```typescript
const todaySummary = quotaLogger.getSummary(quotaLogger.getTodayLogs());
const DAILY_BUDGET = 1.00; // $1 per day

if (todaySummary.totalCost > DAILY_BUDGET) {
  alert('Daily budget exceeded!');
}
```

### 3. Optimize Based on Data
Use logs to optimize:
- **High token usage?** → Reduce prompt length or image resolution
- **Frequent rate limits?** → Add delays between batches
- **Long processing times?** → Switch to faster model (gemini-1.5-flash)

### 4. Export Regularly
Download logs weekly for:
- Accounting/billing records
- Performance analysis
- Debugging issues

### 5. Clear Old Logs
Clear logs monthly to:
- Free up storage space
- Keep data relevant
- Start fresh tracking

## Troubleshooting

### Logs Not Appearing
1. Check browser console for errors
2. Verify localStorage is enabled
3. Try clearing browser cache
4. Check if in private/incognito mode (localStorage may be disabled)

### Incorrect Costs
1. Verify pricing constants in `geminiService.ts`
2. Check if Gemini pricing has changed
3. Ensure `usageMetadata` is returned by API

### Storage Full
1. Download logs for backup
2. Clear old logs
3. Reduce retention limits in `quotaLogger.ts`

## Privacy & Security

### Data Storage
- All logs stored **locally** in browser
- **No data sent** to external servers
- Logs **never leave** your device

### Sensitive Information
Logs do NOT contain:
- API keys
- File contents
- OCR results
- Personal information

Logs only contain:
- Timestamps
- Token counts
- Costs
- Error messages (generic)

### Sharing Logs
When sharing logs:
- Review for any sensitive error messages
- Redact session IDs if needed
- Use JSON export for easier redaction

## API Reference

### quotaLogger.logSuccess()
```typescript
quotaLogger.logSuccess({
  model: string,
  filesProcessed: number,
  promptTokens: number,
  outputTokens: number,
  estimatedCost: number,
  processingTimeMs: number
});
```

### quotaLogger.logError()
```typescript
quotaLogger.logError({
  model: string,
  filesProcessed: number,
  errorMessage: string,
  processingTimeMs: number
});
```

### quotaLogger.getAllLogs()
```typescript
const logs: QuotaLogEntry[] = quotaLogger.getAllLogs();
```

### quotaLogger.getTodayLogs()
```typescript
const logs: QuotaLogEntry[] = quotaLogger.getTodayLogs();
```

### quotaLogger.getSessionLogs()
```typescript
const logs: QuotaLogEntry[] = quotaLogger.getSessionLogs();
```

### quotaLogger.getSummary()
```typescript
const summary: QuotaSummary = quotaLogger.getSummary(logs?);
```

### quotaLogger.downloadLogs()
```typescript
quotaLogger.downloadLogs(filename?: string);
```

### quotaLogger.downloadLogsJSON()
```typescript
quotaLogger.downloadLogsJSON(filename?: string);
```

### quotaLogger.clearLogs()
```typescript
quotaLogger.clearLogs();
```

### quotaLogger.isApproachingRateLimit()
```typescript
const approaching: boolean = quotaLogger.isApproachingRateLimit();
```

### quotaLogger.getRateLimitWarning()
```typescript
const warning: string | null = quotaLogger.getRateLimitWarning();
```

## Future Enhancements

Potential improvements:
- [ ] Chart visualizations (daily usage trends)
- [ ] Email alerts for budget thresholds
- [ ] Export to CSV for Excel analysis
- [ ] Integration with Google Cloud billing API
- [ ] Predictive rate limit warnings
- [ ] Multi-user quota tracking
- [ ] Cloud backup of logs

---

**Last Updated:** November 24, 2025
