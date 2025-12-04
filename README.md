# Marathi OCR Pro - Handwritten Text Recognition

A powerful OCR application for converting handwritten Marathi society records documents into digital text using Google's Gemini AI.

## Features

- 📝 **Forensic OCR**: Advanced handwritten Marathi text recognition
- 🎯 **High Accuracy**: Stroke-level analysis with multiple alternatives
- 📊 **Quota Monitoring**: Built-in API usage tracking and cost monitoring
- 💾 **Export Options**: JSON and grid export for processed data
- 🔄 **Batch Processing**: Process multiple images at once
- ⚠️ **Rate Limit Protection**: Automatic detection and warnings

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Quota Monitoring System

This application includes a comprehensive quota logging system that tracks:
- API usage and token consumption
- Cost per request and total spending
- Success/failure rates
- Rate limit events
- Processing times

### Quick Start
1. Click the **"Quota"** button in the bottom-right corner
2. View today's usage and all-time statistics
3. Download logs for record-keeping
4. Monitor rate limit warnings

### Documentation
- **[Quick Start Guide](QUOTA_QUICK_START.md)** - User-friendly introduction
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solutions for common errors
- **[Technical Documentation](QUOTA_LOGGING.md)** - Complete API reference
- **[System Summary](QUOTA_SYSTEM_SUMMARY.md)** - Implementation overview

## Troubleshooting

### Error 503: Model Overloaded
If you see "The model is overloaded" error:
1. Wait 30-60 seconds before retrying
2. Process fewer images per batch (1-3 instead of 5+)
3. Check the [Troubleshooting Guide](TROUBLESHOOTING.md) for detailed solutions

### Rate Limits
- Monitor your usage with the Quota button
- Add delays between batches if you see warnings
- Consider switching to `gemini-1.5-flash` for higher quotas

## Project Structure

```
├── components/          # React components
│   ├── FileUploader.tsx
│   ├── OCRResultCard.tsx
│   ├── QuotaMonitor.tsx    # Quota monitoring UI
│   └── ...
├── services/           # Business logic
│   ├── geminiService.ts    # Gemini API integration
│   └── quotaLogger.ts      # Quota tracking service
├── TROUBLESHOOTING.md      # Error solutions
├── QUOTA_LOGGING.md        # Technical docs
└── QUOTA_QUICK_START.md    # User guide
```

## Cost Tracking

The application automatically calculates costs based on:
- Input tokens: $3.50 per 1M tokens
- Output tokens: $10.50 per 1M tokens

View real-time costs in the Quota Monitor dashboard.

## License

MIT License - See LICENSE file for details.
