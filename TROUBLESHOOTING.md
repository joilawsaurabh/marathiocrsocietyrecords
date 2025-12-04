# Troubleshooting Guide: Marathi OCR Pro

## Error 503: Model Overloaded

### Error Message
```json
{
  "error": {
    "code": 503,
    "message": "The model is overloaded. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
```

---

## Root Cause Analysis

### 1. **Google Gemini API Rate Limiting**
The error occurs when the Gemini API (`gemini-3-pro-preview` model) receives too many requests and cannot handle the current load. This is a server-side issue from Google's infrastructure.

**Why it happens in this application:**
- The application uses `gemini-3-pro-preview`, which is a preview/experimental model
- Preview models typically have lower capacity and stricter rate limits
- The OCR prompt is extremely detailed and token-intensive (large system instructions + multiple images)
- Processing multiple images in a single batch increases the load

### 2. **High Token Usage Per Request**
Each OCR request in this application includes:
- Multiple high-resolution images (base64 encoded)
- Extensive system instructions (~2000+ tokens)
- Complex JSON schema for structured output
- Detailed prompt with forensic OCR instructions

**Token breakdown per request:**
- System instruction: ~2,000 tokens
- Per-image data: ~1,000-5,000 tokens (depending on resolution)
- Prompt text: ~1,500 tokens
- **Total for 3 images**: ~10,000-20,000 input tokens

### 3. **API Quota Limits**
Google Gemini API has several quota types:
- **Requests Per Minute (RPM)**: Limited number of API calls per minute
- **Tokens Per Minute (TPM)**: Limited number of tokens processed per minute
- **Requests Per Day (RPD)**: Daily request cap
- **Preview Model Restrictions**: Lower limits for experimental models

---

## Solutions & Workarounds

### Immediate Solutions (Quick Fixes)

#### 1. **Wait and Retry**
The simplest solution when you encounter this error:
```
⏱️ Wait 30-60 seconds before retrying
```
- The error is temporary and usually resolves within 1-2 minutes
- The API automatically recovers when server load decreases

#### 2. **Process Fewer Images Per Batch**
Instead of uploading 5-10 images at once:
```
✅ Upload 1-3 images per batch
✅ Wait 30 seconds between batches
```

#### 3. **Retry During Off-Peak Hours**
Try processing during:
- Late night (11 PM - 6 AM IST)
- Early morning (6 AM - 9 AM IST)
- Weekends

---

### Medium-Term Solutions (Code Changes)

#### 1. **Implement Automatic Retry Logic**
Add exponential backoff retry mechanism in `services/geminiService.ts`:

```typescript
const performOCRWithRetry = async (
  files: UploadedFile[], 
  maxRetries = 3
): Promise<OCRRecord[]> => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await performOCR(files);
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 503 error
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Attempt ${attempt} failed. Retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If it's not a 503, throw immediately
      throw error;
    }
  }
  
  throw lastError;
};
```

#### 2. **Switch to Stable Model**
Replace `gemini-3-pro-preview` with a stable model:

```typescript
// In geminiService.ts, line ~150
const response = await ai.models.generateContent({
  model: 'gemini-1.5-pro',  // ✅ Stable model with higher quota
  // OR
  model: 'gemini-1.5-flash', // ✅ Faster, cheaper, higher quota
  // ...
});
```

**Model Comparison:**
| Model | Speed | Quota | Cost | Best For |
|-------|-------|-------|------|----------|
| `gemini-3-pro-preview` | Slow | Low ⚠️ | High | Experimental features |
| `gemini-1.5-pro` | Medium | High ✅ | Medium | Production OCR |
| `gemini-1.5-flash` | Fast | Very High ✅ | Low | High-volume processing |

#### 3. **Batch Processing with Delays**
Add delays between API calls:

```typescript
const processBatchWithDelay = async (files: UploadedFile[]) => {
  const results: OCRRecord[] = [];
  
  for (const file of files) {
    const result = await performOCR([file]); // Process one at a time
    results.push(...result);
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
};
```

#### 4. **Reduce Image Resolution**
Compress images before sending to reduce token usage:

```typescript
const compressImage = async (file: File, maxWidth = 1024): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

---

### Long-Term Solutions (Architecture Changes)

#### 1. **Implement Request Queue**
Create a queue system to manage API calls:
- Queue all OCR requests
- Process one request at a time
- Show queue position to users
- Automatically retry failed requests

#### 2. **Use Google Cloud Project with Higher Quotas**
- Create a Google Cloud project
- Enable Gemini API with billing
- Request quota increase from Google
- Use service account authentication

#### 3. **Implement Caching**
Cache OCR results to avoid re-processing:
```typescript
const cacheKey = `ocr_${fileHash}`;
const cached = localStorage.getItem(cacheKey);
if (cached) return JSON.parse(cached);
```

#### 4. **Add Rate Limiting UI**
Show users their rate limit status:
- Requests remaining this minute
- Estimated wait time
- Disable "Process" button when limit reached

---

## Prevention Checklist

✅ **Before Processing:**
- [ ] Upload 3 or fewer images per batch
- [ ] Wait 30 seconds between batches
- [ ] Check if you've processed many images recently
- [ ] Consider processing during off-peak hours

✅ **In Code:**
- [ ] Implement retry logic with exponential backoff
- [ ] Switch to `gemini-1.5-pro` or `gemini-1.5-flash`
- [ ] Add delays between batch requests
- [ ] Compress images before upload

✅ **For Production:**
- [ ] Set up Google Cloud project with billing
- [ ] Request quota increase
- [ ] Implement request queue
- [ ] Add rate limit monitoring

---

## Error Handling in UI

Update `App.tsx` to show user-friendly error messages:

```typescript
catch (err: any) {
  let errorMessage = "An unexpected error occurred during processing.";
  
  if (err.message?.includes('503') || err.message?.includes('overloaded')) {
    errorMessage = "⚠️ The AI service is currently overloaded. Please wait 30-60 seconds and try again with fewer images.";
  } else if (err.message?.includes('quota')) {
    errorMessage = "⚠️ API quota exceeded. Please try again later or reduce the number of images.";
  } else if (err.message?.includes('API Key')) {
    errorMessage = "⚠️ API key is missing or invalid. Please check your .env.local file.";
  }
  
  setError(errorMessage);
  setStatus(ProcessingStatus.ERROR);
}
```

---

## Quick Reference

### When you see "503 Model Overloaded":

1. ⏱️ **Wait 60 seconds**
2. 📉 **Reduce images** (try 1-2 instead of 5+)
3. 🔄 **Retry** the request
4. 🌙 **Try off-peak hours** if it persists
5. 💻 **Switch model** to `gemini-1.5-flash` for higher quota

### Emergency Contact
If the error persists for >1 hour:
- Check [Google Cloud Status](https://status.cloud.google.com/)
- Review your [API quota](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
- Contact Google Cloud Support

---

## Additional Resources

- [Gemini API Quotas Documentation](https://ai.google.dev/gemini-api/docs/quota)
- [Error Handling Best Practices](https://ai.google.dev/gemini-api/docs/error-handling)
- [Rate Limiting Strategies](https://cloud.google.com/apis/design/errors)

---

**Last Updated:** November 24, 2025
