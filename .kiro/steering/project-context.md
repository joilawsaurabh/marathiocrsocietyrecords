# Marathi OCR Pro - Project Context

## Project Overview

Marathi OCR Pro is a web application that converts handwritten Marathi documents into digital text using Google's Gemini AI. The application specializes in forensic-level OCR with stroke-by-stroke analysis of Devanagari script.

## Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API (@google/genai 1.30.0)
- **Styling**: Tailwind CSS (utility classes)
- **Storage**: Browser localStorage for quota logs and master grid data

## Key Features

1. **Forensic OCR**: Detailed handwritten Marathi text recognition
2. **Quota Monitoring**: Real-time API usage tracking and cost monitoring
3. **Batch Processing**: Process multiple images at once
4. **Export Options**: JSON and grid export for processed data
5. **Rate Limit Protection**: Automatic detection and warnings

## Project Structure

```
marathi-ocr-pro-v2/
├── components/          # React components
│   ├── FileUploader.tsx
│   ├── OCRResultCard.tsx
│   ├── JsonPreview.tsx
│   ├── ExportGrid.tsx
│   └── QuotaMonitor.tsx
├── services/           # Business logic
│   ├── geminiService.ts
│   └── quotaLogger.ts
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
└── index.tsx          # Application entry point
```

## Important Conventions

### Component Patterns
- Use functional components with hooks
- Props interfaces defined inline or in types.ts
- State management with useState and useEffect
- Tailwind CSS for styling (no CSS modules)

### Service Layer
- All API calls go through services/
- Error handling at service level
- Automatic logging for quota tracking

### Type Safety
- All components have proper TypeScript types
- No `any` types unless absolutely necessary
- Interfaces defined in types.ts for shared types

## API Integration

### Gemini API
- Model: `gemini-3-pro-preview` (can be changed to `gemini-1.5-pro` or `gemini-1.5-flash`)
- API Key: Stored in `.env.local` as `GEMINI_API_KEY`
- Pricing: $3.50/1M input tokens, $10.50/1M output tokens

### Rate Limits
- Preview models have lower quotas
- Implement delays between batches
- Monitor quota usage via QuotaMonitor component

## Development Guidelines

### Code Style
- Use descriptive variable names
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Comment complex logic, especially OCR prompt engineering

### Testing
- Manual testing via browser
- Check quota logs after each batch
- Verify cost calculations
- Test rate limit warnings

### Performance
- Optimize image sizes before upload
- Use React.memo for expensive components
- Lazy load components when appropriate
- Monitor bundle size with Vite

## Common Tasks

### Adding a New Feature
1. Define types in types.ts
2. Create service functions if needed
3. Build UI components
4. Integrate with App.tsx
5. Test thoroughly
6. Update documentation

### Modifying OCR Prompt
- Edit `services/geminiService.ts`
- Update system instructions and prompt text
- Test with various handwriting samples
- Monitor token usage changes

### Changing AI Model
- Update model name in `geminiService.ts`
- Update pricing constants if needed
- Test thoroughly for quality differences
- Update documentation

## Known Issues & Limitations

1. **Rate Limits**: Preview model has strict limits
2. **Cost**: OCR is token-intensive (~15k-25k tokens per batch)
3. **Accuracy**: Depends on handwriting quality
4. **Browser Storage**: Limited to ~5-10MB for logs

## Future Enhancements

- [ ] Chart visualizations for quota usage
- [ ] CSV export for Excel
- [ ] Budget alerts
- [ ] Cloud backup of logs
- [ ] Multi-language support
- [ ] Batch retry logic with exponential backoff

## Resources

- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## Contact & Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Review QUOTA_LOGGING.md for quota issues
3. Check browser console for errors
4. Review Gemini API status page
