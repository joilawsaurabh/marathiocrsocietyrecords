# OCR & Gemini API Guidelines

## OCR Prompt Engineering

### Current Prompt Strategy

The application uses a detailed forensic OCR approach with:
1. **Bottom-up reconstruction**: Stroke → Alphabet → Word
2. **Multiple alternatives**: Visual + phonetic variations
3. **Structured output**: JSON schema with bounding boxes

### Prompt Structure

```
1. Context Setting
   - Number of images
   - Document type (Marathi property records)

2. Task Definition
   - Forensic OCR with slow-thinking approach
   - Stroke-level analysis

3. Execution Protocol
   - Step 1: Alphabet-level decomposition
   - Step 2: Spatial merging (superscript handling)
   - Step 3: Stroke-based alternatives (5 options)
   - Step 4: Phonetic & contextual expansion (6 options)

4. Output Requirements
   - JSON format with specific schema
   - Bounding boxes for each field
   - Alternatives list

5. System Instructions
   - Role definition
   - Verification protocol
   - Strict constraints
```

### Modifying the Prompt

When updating the OCR prompt in `services/geminiService.ts`:

1. **Test incrementally**: Change one aspect at a time
2. **Monitor token usage**: Check if changes increase cost
3. **Validate output**: Ensure JSON schema compliance
4. **Document changes**: Update this file with rationale

### Common Prompt Adjustments

#### Increase Accuracy
```typescript
// Add more specific character distinctions
- **CRITICAL DISTINCTION**: 'Na' (न) vs 'La' (ल).
    - 'Na' (न) typically has a loop on the left and a straight connector.
    - 'La' (ल) has a "3" shape or a double curve starting from the vertical bar.
```

#### Reduce Token Usage
```typescript
// Simplify instructions, remove examples
// Before: Long examples with multiple cases
// After: Concise rules without examples
```

#### Add New Field Types
```typescript
// Update responseSchema
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    // ... existing fields
    new_field: {
      type: Type.STRING,
      description: "Description of new field"
    }
  }
};
```

## Gemini API Best Practices

### Model Selection

| Model | Use Case | Speed | Cost | Quota |
|-------|----------|-------|------|-------|
| `gemini-3-pro-preview` | Experimental features | Slow | High | Low ⚠️ |
| `gemini-1.5-pro` | Production OCR | Medium | Medium | High ✅ |
| `gemini-1.5-flash` | High-volume processing | Fast | Low | Very High ✅ |

**Recommendation**: Use `gemini-1.5-pro` for production

### Configuration Parameters

```typescript
config: {
  systemInstruction: "...", // Role and constraints
  responseMimeType: "application/json", // Force JSON output
  responseSchema: schema, // Structured output schema
  temperature: 0.2, // Low for consistency (0.0-1.0)
}
```

#### Temperature Guidelines
- **0.0-0.3**: Deterministic, consistent (recommended for OCR)
- **0.4-0.7**: Balanced creativity and consistency
- **0.8-1.0**: Creative, varied (not recommended for OCR)

### Token Optimization

#### Image Optimization
```typescript
// Compress images before sending
const compressImage = async (file: File, maxWidth = 1024): Promise<File> => {
  // Resize to max width while maintaining aspect ratio
  // Use JPEG compression at 85% quality
  // Reduces tokens by 50-70%
};
```

#### Prompt Optimization
```typescript
// ❌ Bad: Verbose prompt
"Please carefully analyze the image and extract all the text you can find, making sure to identify each character accurately..."

// ✅ Good: Concise prompt
"Extract text with character-level accuracy."
```

### Error Handling

#### Rate Limit Errors (503)
```typescript
if (error.message?.includes('503') || error.message?.includes('overloaded')) {
  // Log as rate_limited
  quotaLogger.logError({
    status: 'rate_limited',
    errorMessage: error.message
  });
  
  // Suggest retry after delay
  throw new Error('Rate limit hit. Wait 30-60 seconds and retry.');
}
```

#### API Key Errors
```typescript
if (!process.env.GEMINI_API_KEY) {
  throw new Error("API Key is missing. Check .env.local file.");
}
```

#### Invalid Response
```typescript
const jsonText = response.text;
if (!jsonText) {
  throw new Error("No response text received from model.");
}

try {
  const records = JSON.parse(jsonText);
} catch (parseError) {
  throw new Error(`Invalid JSON response: ${parseError.message}`);
}
```

## Cost Management

### Current Pricing (as of Nov 2024)
- Input tokens: $3.50 per 1M tokens
- Output tokens: $10.50 per 1M tokens

### Typical Token Usage
- **Per image**: 5,000-8,000 input tokens
- **Per batch (3 images)**: 15,000-25,000 input tokens
- **Output**: 2,000-3,000 tokens per batch

### Cost Calculation
```typescript
const PRICE_PER_1M_INPUT_TOKENS = 3.50;
const PRICE_PER_1M_OUTPUT_TOKENS = 10.50;

const inputCost = (promptTokens / 1000000) * PRICE_PER_1M_INPUT_TOKENS;
const outputCost = (outputTokens / 1000000) * PRICE_PER_1M_OUTPUT_TOKENS;
const totalCost = inputCost + outputCost;
```

### Cost Optimization Strategies

1. **Reduce Image Size**
   - Resize to 1024px max width
   - Use JPEG compression
   - Savings: 50-70% token reduction

2. **Simplify Prompt**
   - Remove unnecessary examples
   - Use concise language
   - Savings: 10-20% token reduction

3. **Batch Efficiently**
   - Process 2-3 images per batch (optimal)
   - Don't exceed 5 images per batch
   - Reason: Better error recovery, easier debugging

4. **Use Faster Model**
   - Switch to `gemini-1.5-flash`
   - Savings: 50% cost reduction
   - Trade-off: Slightly lower accuracy

## Quality Assurance

### Validation Checklist

After OCR processing:
- [ ] All fields populated (no empty strings)
- [ ] Bounding boxes present and valid
- [ ] Alternatives list has 10+ items
- [ ] JSON structure matches schema
- [ ] Cost calculation is reasonable ($0.05-$0.15 per batch)

### Common Issues

#### Issue: Empty Alternatives
**Cause**: Model didn't generate alternatives  
**Solution**: Strengthen prompt instructions for alternatives

#### Issue: Missing Bounding Boxes
**Cause**: Model didn't detect text regions  
**Solution**: Improve image quality or adjust prompt

#### Issue: Incorrect Character Recognition
**Cause**: Similar-looking characters confused  
**Solution**: Add more character distinctions to prompt

#### Issue: High Token Usage
**Cause**: Large images or verbose prompt  
**Solution**: Compress images, simplify prompt

## Testing OCR Changes

### Test Process

1. **Baseline Test**
   ```typescript
   // Process 3 sample images
   // Record: accuracy, tokens, cost, time
   ```

2. **Make Change**
   ```typescript
   // Update prompt or configuration
   ```

3. **Comparison Test**
   ```typescript
   // Process same 3 images
   // Compare: accuracy, tokens, cost, time
   ```

4. **Validation**
   ```typescript
   // Ensure improvements without regressions
   ```

### Test Images

Keep a set of standard test images:
- **Easy**: Clear handwriting, good lighting
- **Medium**: Average handwriting, normal conditions
- **Hard**: Poor handwriting, low quality scan

### Metrics to Track

- **Accuracy**: % of correctly recognized characters
- **Token Usage**: Input + output tokens
- **Cost**: Total cost per batch
- **Processing Time**: Milliseconds per batch
- **Success Rate**: % of successful API calls

## Devanagari Script Specifics

### Character Challenges

Common confusions in Marathi OCR:
- न (Na) vs ल (La) - Loop vs curve
- प (Pa) vs य (Ya) vs ष (Sha) - Stomach curves
- म (Ma) vs भ (Bha) - Loop connectivity
- त (Ta) vs ट (Ta) - Similar shapes
- ग (Ga) vs म (Ma) - Geometry

### Matra (Vowel Signs)

- ा (aa) - Vertical line after consonant
- ि (i) - Before consonant
- ी (ii) - After consonant
- ु (u) - Below consonant
- ू (uu) - Below consonant
- े (e) - Above consonant
- ै (ai) - Above consonant
- ो (o) - After consonant
- ौ (au) - After consonant

### Half Consonants

- Formed by removing the inherent 'a' sound
- Indicated by halant (्) symbol
- Example: क् + त = क्त (kta)

## Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Devanagari Unicode Chart](https://unicode.org/charts/PDF/U0900.pdf)
- [Marathi Grammar Reference](https://en.wikipedia.org/wiki/Marathi_grammar)
- [OCR Best Practices](https://ai.google.dev/gemini-api/docs/vision)

## Changelog

Track significant changes to OCR implementation:

### 2024-11-24
- Initial forensic OCR prompt with stroke-level analysis
- 11 alternatives per field (5 visual + 6 phonetic)
- Bounding box detection for all fields
- Cost: ~$0.07-$0.12 per 3-image batch
