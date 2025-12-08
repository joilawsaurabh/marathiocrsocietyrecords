# Coding Standards - Marathi OCR Pro

## TypeScript Standards

### Type Definitions
```typescript
// ✅ Good: Explicit interface
interface OCRRecord {
  file_name: string;
  document_type: string;
  flat_number: LineData;
  original_owner: LineData;
  transfers: LineData[];
  estimated_cost?: number;
}

// ❌ Bad: Using any
const data: any = response.data;
```

### Function Signatures
```typescript
// ✅ Good: Clear types and return type
const performOCR = async (files: UploadedFile[]): Promise<OCRRecord[]> => {
  // implementation
};

// ❌ Bad: No return type
const performOCR = async (files: UploadedFile[]) => {
  // implementation
};
```

## React Component Standards

### Component Structure
```typescript
// ✅ Good: Props interface, functional component
interface QuotaMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuotaMonitor: React.FC<QuotaMonitorProps> = ({ isOpen, onClose }) => {
  // hooks
  const [data, setData] = useState<QuotaData | null>(null);
  
  // effects
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // handlers
  const handleClick = () => {
    // logic
  };
  
  // render
  return <div>...</div>;
};

export default QuotaMonitor;
```

### State Management
```typescript
// ✅ Good: Typed state
const [records, setRecords] = useState<OCRRecord[]>([]);
const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);

// ❌ Bad: Untyped state
const [records, setRecords] = useState([]);
const [status, setStatus] = useState('idle');
```

### Event Handlers
```typescript
// ✅ Good: Proper event typing
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // logic
};

// ❌ Bad: Any type
const handleChange = (e: any) => {
  setValue(e.target.value);
};
```

## Styling Standards

### Tailwind CSS Classes
```typescript
// ✅ Good: Organized, readable classes
<button className="
  bg-orange-600 hover:bg-orange-700 
  text-white font-semibold 
  py-3 px-8 
  rounded-full shadow-md 
  transition-all duration-200
">
  Extract Text
</button>

// ❌ Bad: Long single line
<button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-all duration-200">
```

### Conditional Classes
```typescript
// ✅ Good: Template literal with clear conditions
<div className={`
  p-4 rounded-lg border
  ${isActive ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
`}>

// ❌ Bad: Hard to read
<div className={isActive ? 'p-4 rounded-lg border border-red-500 bg-red-50' : 'p-4 rounded-lg border border-slate-200 bg-white'}>
```

## Service Layer Standards

### Error Handling
```typescript
// ✅ Good: Proper error handling with logging
try {
  const response = await api.call();
  quotaLogger.logSuccess({...});
  return response;
} catch (error: any) {
  quotaLogger.logError({
    errorMessage: error.message || String(error),
    ...
  });
  console.error("API Error:", error);
  throw error;
}

// ❌ Bad: Silent failure
try {
  const response = await api.call();
  return response;
} catch (error) {
  return null;
}
```

### Async/Await
```typescript
// ✅ Good: Async/await with proper error handling
const fetchData = async (): Promise<Data> => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch: ${error.message}`);
  }
};

// ❌ Bad: Promise chains
const fetchData = () => {
  return apiCall()
    .then(response => response.data)
    .catch(error => console.log(error));
};
```

## Naming Conventions

### Variables
```typescript
// ✅ Good: Descriptive names
const uploadedFiles: UploadedFile[] = [];
const isProcessing: boolean = false;
const totalCost: number = 0;

// ❌ Bad: Unclear names
const files = [];
const flag = false;
const x = 0;
```

### Functions
```typescript
// ✅ Good: Verb-based, descriptive
const handleFileUpload = () => {};
const calculateTotalCost = () => {};
const validateInput = () => {};

// ❌ Bad: Unclear purpose
const doStuff = () => {};
const process = () => {};
const update = () => {};
```

### Components
```typescript
// ✅ Good: PascalCase, descriptive
const FileUploader = () => {};
const OCRResultCard = () => {};
const QuotaMonitor = () => {};

// ❌ Bad: Unclear or wrong case
const fileuploader = () => {};
const Card = () => {};
const component1 = () => {};
```

## Comments & Documentation

### Component Documentation
```typescript
/**
 * QuotaMonitor Component
 * 
 * Displays API usage statistics and quota information.
 * Allows users to download logs and monitor rate limits.
 * 
 * @example
 * <QuotaMonitor />
 */
const QuotaMonitor: React.FC = () => {
  // implementation
};
```

### Complex Logic
```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate cost per record by distributing total cost evenly
// This ensures each record shows its proportional API cost
const costPerRecord = totalCost / records.length;

// ❌ Bad: Obvious comment
// Divide total cost by number of records
const costPerRecord = totalCost / records.length;
```

### TODO Comments
```typescript
// ✅ Good: Actionable TODO
// TODO: Add retry logic with exponential backoff for rate limit errors
// See TROUBLESHOOTING.md section 2.1 for implementation details

// ❌ Bad: Vague TODO
// TODO: fix this later
```

## File Organization

### Import Order
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { GoogleGenAI } from '@google/genai';

// 3. Local imports - types
import { OCRRecord, UploadedFile } from '../types';

// 4. Local imports - components
import FileUploader from './components/FileUploader';

// 5. Local imports - services
import { performOCR } from './services/geminiService';
import { quotaLogger } from './services/quotaLogger';
```

### Export Patterns
```typescript
// ✅ Good: Named exports for utilities
export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
};

// ✅ Good: Default export for components
const QuotaMonitor: React.FC = () => {
  // implementation
};

export default QuotaMonitor;
```

## Performance Best Practices

### Memoization
```typescript
// ✅ Good: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// ✅ Good: Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Conditional Rendering
```typescript
// ✅ Good: Early return
if (!data) {
  return <LoadingSpinner />;
}

return <DataDisplay data={data} />;

// ❌ Bad: Nested ternaries
return data ? <DataDisplay data={data} /> : loading ? <LoadingSpinner /> : <ErrorMessage />;
```

## Testing Considerations

### Testable Code
```typescript
// ✅ Good: Pure function, easy to test
export const calculateCost = (
  promptTokens: number,
  outputTokens: number
): number => {
  const inputCost = (promptTokens / 1000000) * 3.50;
  const outputCost = (outputTokens / 1000000) * 10.50;
  return inputCost + outputCost;
};

// ❌ Bad: Side effects, hard to test
const calculateCost = () => {
  const tokens = getTokensFromGlobalState();
  updateCostInDatabase(tokens);
  return tokens.cost;
};
```

## Security Best Practices

### API Keys
```typescript
// ✅ Good: Environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("API Key is missing");
}

// ❌ Bad: Hardcoded
const apiKey = "AIzaSy_EXAMPLE_KEY_DO_NOT_HARDCODE";
```

### User Input
```typescript
// ✅ Good: Validate and sanitize
const handleInput = (value: string) => {
  const sanitized = value.trim();
  if (sanitized.length === 0) {
    return; // Reject empty input
  }
  processInput(sanitized);
};

// ❌ Bad: No validation
const handleInput = (value: string) => {
  processInput(value);
};
```

## Git Commit Messages

```
✅ Good:
feat: Add quota monitoring dashboard
fix: Resolve white text visibility issue in forms
docs: Update troubleshooting guide with rate limit solutions
refactor: Extract cost calculation into utility function

❌ Bad:
update
fix bug
changes
wip
```

## Code Review Checklist

Before submitting code:
- [ ] TypeScript types are explicit and correct
- [ ] No `any` types without justification
- [ ] Components follow single responsibility principle
- [ ] Error handling is comprehensive
- [ ] Quota logging is integrated for API calls
- [ ] Tailwind classes are organized and readable
- [ ] Comments explain WHY, not WHAT
- [ ] No console.logs in production code (except errors)
- [ ] No hardcoded values (use constants or env vars)
- [ ] Imports are organized
- [ ] Code is formatted consistently
