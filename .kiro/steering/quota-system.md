# Quota Logging System Guidelines

## System Overview

The quota logging system automatically tracks all Gemini API usage, providing real-time monitoring, cost tracking, and rate limit warnings.

## Architecture

```
User Action (Upload & Process)
        ↓
App.tsx (handleProcessFiles)
        ↓
geminiService.performOCR()
        ↓
    ┌───────────────┐
    │ Gemini API    │
    └───────────────┘
        ↓
    Success/Error
        ↓
quotaLogger.logSuccess() or logError()
        ↓
localStorage (persistent storage)
        ↓
QuotaMonitor UI (display)
```

## Key Components

### 1. quotaLogger.ts
**Purpose**: Core logging service  
**Location**: `services/quotaLogger.ts`  
**Responsibilities**:
- Log API calls (success/error)
- Calculate statistics
- Export logs (TXT/JSON)
- Detect rate limits
- Manage localStorage

### 2. QuotaMonitor.tsx
**Purpose**: User interface for quota monitoring  
**Location**: `components/QuotaMonitor.tsx`  
**Features**:
- Floating "Quota" button
- Statistics dashboard
- Download logs
- Clear logs
- Warning banner

### 3. geminiService.ts Integration
**Purpose**: Automatic logging of API calls  
**Location**: `services/geminiService.ts`  
**Integration Points**:
- Line 3: Import quotaLogger
- Line 150: Start timer
- Line 180: Log success
- Line 195: Log error

## Usage Guidelines

### When to Log

**Always log**:
- ✅ Every Gemini API call
- ✅ Success with token counts
- ✅ Errors with messages
- ✅ Rate limit events

**Never log**:
- ❌ API keys
- ❌ File contents
- ❌ OCR results
- ❌ Personal data

### Log Entry Format

```typescript
interface QuotaLogEntry {
  timestamp: string;           // ISO 8601
  sessionId: string;           // Browser session
  model: string;               // Gemini model name
  filesProcessed: number;      // Image count
  promptTokens: number;        // Input tokens
  outputTokens: number;        // Output tokens
  totalTokens: number;         // Sum
  estimatedCost: number;       // USD
  status: string;              // success/error/rate_limited
  errorMessage?: string;       // If failed
  processingTimeMs: number;    // Duration
}
```

### Adding Logging to New API Calls

```typescript
// Template for new API integrations
const callNewAPI = async () => {
  const startTime = Date.now();
  const modelName = 'gemini-model-name';
  
  try {
    const response = await api.call();
    
    // Extract token counts from response
    const promptTokens = response.usageMetadata?.promptTokenCount || 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    
    // Calculate cost
    const cost = calculateCost(promptTokens, outputTokens);
    
    // Log success
    quotaLogger.logSuccess({
      model: modelName,
      filesProcessed: fileCount,
      promptTokens,
      outputTokens,
      estimatedCost: cost,
      processingTimeMs: Date.now() - startTime
    });
    
    return response;
    
  } catch (error: any) {
    // Log error
    quotaLogger.logError({
      model: modelName,
      filesProcessed: fileCount,
      errorMessage: error.message || String(error),
      processingTimeMs: Date.now() - startTime
    });
    
    throw error;
  }
};
```

## Storage Management

### localStorage Keys

```typescript
// Structured logs (JSON array)
'gemini_quota_logs'        // Last 1,000 entries

// Text logs (plain text)
'gemini_file_logs'         // Last 10,000 lines

// Session tracking
'gemini_session_id'        // Current session ID (sessionStorage)
```

### Storage Limits

- **Structured logs**: 1,000 entries (~500KB)
- **Text logs**: 10,000 lines (~2MB)
- **Total**: ~2.5MB (well within 5-10MB browser limit)

### Automatic Cleanup

```typescript
// In quotaLogger.ts
const trimmedLogs = logs.slice(-1000); // Keep last 1,000
const trimmedLines = lines.slice(-10000); // Keep last 10,000
```

## Rate Limit Detection

### Detection Logic

```typescript
// Check error message for rate limit indicators
const isRateLimited = 
  errorMessage.includes('503') || 
  errorMessage.includes('overloaded') ||
  errorMessage.includes('quota') ||
  errorMessage.includes('rate limit');
```

### Warning Triggers

1. **Recent Activity**: >10 requests in last 60 seconds
2. **Today's Rate Limits**: Any rate_limited status today

### User Warnings

```typescript
// Warning messages
"⚠️ You've hit rate limits X time(s) today. Consider reducing batch size."
"⚠️ High request frequency detected. You may hit rate limits soon."
```

## Cost Tracking

### Pricing Constants

```typescript
// Update these if Gemini pricing changes
const PRICE_PER_1M_INPUT_TOKENS = 3.50;   // USD
const PRICE_PER_1M_OUTPUT_TOKENS = 10.50; // USD
```

### Cost Calculation

```typescript
const inputCost = (promptTokens / 1000000) * PRICE_PER_1M_INPUT_TOKENS;
const outputCost = (outputTokens / 1000000) * PRICE_PER_1M_OUTPUT_TOKENS;
const totalCost = inputCost + outputCost;
```

### Cost Distribution

```typescript
// For batch processing, distribute cost evenly
const costPerRecord = totalCost / records.length;

// Attach to each record
const recordsWithCost = records.map(r => ({
  ...r,
  estimated_cost: costPerRecord
}));
```

## Statistics Calculation

### Summary Metrics

```typescript
interface QuotaSummary {
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
```

### Calculation Logic

```typescript
const getSummary = (logs: QuotaLogEntry[]): QuotaSummary => {
  return {
    totalRequests: logs.length,
    successfulRequests: logs.filter(l => l.status === 'success').length,
    failedRequests: logs.filter(l => l.status === 'error').length,
    rateLimitedRequests: logs.filter(l => l.status === 'rate_limited').length,
    totalPromptTokens: logs.reduce((sum, l) => sum + l.promptTokens, 0),
    totalOutputTokens: logs.reduce((sum, l) => sum + l.outputTokens, 0),
    totalTokens: logs.reduce((sum, l) => sum + l.totalTokens, 0),
    totalCost: logs.reduce((sum, l) => sum + l.estimatedCost, 0),
    averageProcessingTime: logs.reduce((sum, l) => sum + l.processingTimeMs, 0) / logs.length,
    firstRequest: logs[0]?.timestamp || '',
    lastRequest: logs[logs.length - 1]?.timestamp || ''
  };
};
```

## Export Formats

### TXT Format

```
=== QUOTA USAGE SUMMARY ===
Generated: 2024-11-24T10:00:00.000Z
Total Requests: 45
Successful: 42
Failed: 1
Rate Limited: 2
Total Tokens: 765,000
Total Cost: $3.2475
...

=== DETAILED LOGS ===
timestamp | session | status | model | files=X | tokens=X | cost=$X | time=Xms
...
```

### JSON Format

```json
{
  "summary": {
    "totalRequests": 45,
    "successfulRequests": 42,
    ...
  },
  "logs": [
    {
      "timestamp": "2024-11-24T10:00:00.000Z",
      "sessionId": "session_...",
      ...
    }
  ],
  "exportedAt": "2024-11-24T15:00:00.000Z"
}
```

## UI Integration

### Floating Button

```typescript
// Always rendered in App.tsx
<QuotaMonitor />

// Positioned bottom-right
className="fixed bottom-4 right-4 ... z-50"
```

### Modal Dashboard

```typescript
// Opens on button click
const [isOpen, setIsOpen] = useState(false);

// Sections:
// 1. Today's Usage
// 2. All-Time Statistics
// 3. Warning Banner (conditional)
// 4. Action Buttons (Download, Clear, Refresh)
```

## Troubleshooting

### Logs Not Appearing

**Check**:
1. Browser console for errors
2. localStorage is enabled
3. Not in private/incognito mode
4. quotaLogger is imported in geminiService

**Fix**:
```typescript
// Verify import
import { quotaLogger } from './quotaLogger';

// Verify logging calls exist
quotaLogger.logSuccess({...});
quotaLogger.logError({...});
```

### Incorrect Costs

**Check**:
1. Pricing constants are up-to-date
2. usageMetadata is returned by API
3. Token counts are not zero

**Fix**:
```typescript
// Update pricing in geminiService.ts
const PRICE_PER_1M_INPUT_TOKENS = 3.50;  // Check current pricing
const PRICE_PER_1M_OUTPUT_TOKENS = 10.50;

// Verify token extraction
const promptTokens = response.usageMetadata?.promptTokenCount || 0;
const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
```

### Storage Full

**Check**:
1. localStorage size
2. Number of log entries

**Fix**:
```typescript
// Reduce retention limits in quotaLogger.ts
const trimmedLogs = logs.slice(-500);  // Reduce from 1,000 to 500
const trimmedLines = lines.slice(-5000); // Reduce from 10,000 to 5,000
```

## Best Practices

### For Users

1. **Monitor Daily**: Check quota usage at end of each day
2. **Download Weekly**: Export logs for record-keeping
3. **Set Budgets**: Track spending against daily/weekly budgets
4. **Heed Warnings**: Slow down when rate limit warnings appear

### For Developers

1. **Always Log**: Every API call must be logged
2. **Handle Errors**: Catch and log all errors
3. **Test Logging**: Verify logs appear after API calls
4. **Update Pricing**: Check Gemini pricing quarterly
5. **Monitor Storage**: Ensure cleanup logic works

### For Optimization

1. **Analyze Patterns**: Use logs to identify expensive operations
2. **Optimize Prompts**: Reduce token usage based on logs
3. **Batch Efficiently**: Find optimal batch size from logs
4. **Switch Models**: Compare costs across different models

## Future Enhancements

### Planned Features

- [ ] Chart visualizations (daily usage trends)
- [ ] Budget alerts (email/push notifications)
- [ ] CSV export for Excel analysis
- [ ] Predictive rate limit warnings
- [ ] Multi-user quota tracking
- [ ] Cloud backup of logs

### Implementation Notes

```typescript
// Chart visualization example
import { LineChart } from 'recharts';

const data = logs.map(log => ({
  date: new Date(log.timestamp).toLocaleDateString(),
  cost: log.estimatedCost,
  tokens: log.totalTokens
}));

<LineChart data={data}>
  <Line dataKey="cost" stroke="#f97316" />
  <Line dataKey="tokens" stroke="#3b82f6" />
</LineChart>
```

## Documentation References

- **User Guide**: QUOTA_QUICK_START.md
- **Technical Docs**: QUOTA_LOGGING.md
- **Troubleshooting**: TROUBLESHOOTING.md
- **Architecture**: SYSTEM_ARCHITECTURE.md
- **Testing**: TESTING_CHECKLIST.md

## Changelog

### 2024-11-24
- Initial quota logging system implementation
- Automatic logging for all Gemini API calls
- Real-time dashboard with statistics
- Export functionality (TXT/JSON)
- Rate limit detection and warnings
- localStorage persistence
- Zero performance impact (<1ms overhead)
