# Quota Logging - Quick Start Guide

## 🚀 What You Get

Your application now automatically tracks **every API call** to Gemini, including:
- ✅ Token usage (input + output)
- ✅ Cost per request
- ✅ Processing time
- ✅ Success/failure status
- ✅ Rate limit events

## 📍 Where to Find It

Look for the **"Quota"** button in the **bottom-right corner** of your screen:

```
┌─────────────────────────────────────┐
│                                     │
│   Your Application                  │
│                                     │
│                                     │
│                                     │
│                          ┌────────┐ │
│                          │ Quota  │ │ ← Click here!
│                          └────────┘ │
└─────────────────────────────────────┘
```

## 🎯 Quick Actions

### View Today's Usage
1. Click the **Quota** button
2. See "Today's Usage" section at the top
3. Check: Requests, Success, Failed, Rate Limited, Tokens, Cost

### Download Logs
1. Click the **Quota** button
2. Scroll to bottom
3. Click **"Download TXT"** for readable logs
4. Or **"Download JSON"** for data analysis

### Check Rate Limit Status
- If you see a **yellow warning banner** at the top → You're approaching limits!
- Recommended action: Wait 1-2 minutes before next batch

## 📊 Understanding the Stats

### Today's Usage Dashboard

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Requests   │   Success   │   Failed    │Rate Limited │
│     12      │     10      │      0      │      2      │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────────────────┬─────────────────────────────┐
│    Total Tokens         │       Total Cost            │
│      204,000            │        $0.8925              │
└─────────────────────────┴─────────────────────────────┘
```

**What it means:**
- **Requests**: How many times you clicked "Extract Text" today
- **Success**: Requests that completed successfully
- **Failed**: Requests that failed (not rate limits)
- **Rate Limited**: Requests blocked because API was overloaded
- **Total Tokens**: Amount of data processed (higher = more cost)
- **Total Cost**: Money spent today on API calls

### All-Time Statistics

Shows your usage since you started using the app:
- **Total Requests**: Lifetime API calls
- **Success Rate**: What % of requests succeed
- **Total Tokens**: All tokens ever used
- **Total Cost**: All money spent
- **Avg Processing Time**: How long requests typically take

## ⚠️ Warning Messages

### "You've hit rate limits X time(s) today"
**What it means:** The API rejected your requests because it was overloaded

**What to do:**
1. Wait 30-60 seconds before trying again
2. Process fewer images per batch (1-3 instead of 5+)
3. Try during off-peak hours (late night/early morning)

### "High request frequency detected"
**What it means:** You're making requests too quickly (>10 per minute)

**What to do:**
1. Add 5-10 second delays between batches
2. Process smaller batches
3. The system will automatically slow down

## 💡 Pro Tips

### Tip 1: Monitor Your Budget
Set a daily budget and check it regularly:
- Example: If your budget is $1/day
- Check "Today's Usage" → "Total Cost"
- Stop processing if you exceed budget

### Tip 2: Download Logs Weekly
Keep records for accounting:
1. Every Friday, click **Quota** button
2. Click **"Download TXT"**
3. Save file to your records folder
4. Use for expense tracking

### Tip 3: Optimize Based on Data
After a week of usage:
1. Click **Quota** button
2. Check "Avg Processing Time"
3. If >5 seconds → Consider switching to faster model
4. Check "Rate Limited" count
5. If >5 → Add delays between batches

### Tip 4: Clear Old Logs Monthly
Keep storage clean:
1. Download logs for backup (see Tip 2)
2. Click **"Clear Logs"** button
3. Start fresh tracking for new month

## 🔍 Reading the Log File

When you download logs as TXT, you'll see:

```
=== QUOTA USAGE SUMMARY ===
Generated: 2025-11-24T10:35:00.000Z
Total Requests: 45
Successful: 42
Failed: 1
Rate Limited: 2
Total Tokens: 765,000
Total Cost: $3.2475
...

=== DETAILED LOGS ===
2025-11-24T08:00:15.123Z | SUCCESS | files=3 | tokens=17000 | cost=$0.073500 | time=4500ms
2025-11-24T08:05:30.456Z | RATE_LIMITED | files=5 | error="The model is overloaded..."
```

**How to read each line:**
- **Timestamp**: When the request happened
- **Status**: SUCCESS, RATE_LIMITED, or ERROR
- **files=X**: How many images were processed
- **tokens=X**: How much data was processed
- **cost=$X**: How much it cost
- **time=Xms**: How long it took

## 🆘 Common Issues

### "I don't see the Quota button"
- Refresh the page
- Check bottom-right corner
- Make sure you're on the main app page

### "My logs are empty"
- You need to process at least one batch first
- Click "Extract Text" on some images
- Then check Quota button again

### "Download buttons are disabled"
- This means you have no logs yet
- Process some files first
- Then download will be enabled

### "I cleared logs by accident"
- Unfortunately, they can't be recovered
- This is why we recommend downloading weekly backups
- Start fresh and set a reminder to backup regularly

## 📈 Success Metrics

Track these weekly:

**Week 1:**
- Total Requests: ___
- Success Rate: ___%
- Total Cost: $___
- Rate Limited: ___

**Week 2:**
- Total Requests: ___
- Success Rate: ___%
- Total Cost: $___
- Rate Limited: ___

**Goal:** 
- Success Rate > 95%
- Rate Limited < 5 per week
- Cost within budget

## 🎓 Learning from Your Data

### If Success Rate < 90%
- Check error messages in logs
- Verify API key is correct
- Check internet connection
- Review TROUBLESHOOTING.md

### If Rate Limited > 10/day
- You're processing too fast
- Add 10-second delays between batches
- Process 1-2 images at a time
- Try off-peak hours

### If Cost > Expected
- Check "Avg tokens per request"
- Consider reducing image resolution
- Use shorter prompts (requires code change)
- Switch to cheaper model (gemini-1.5-flash)

### If Processing Time > 10 seconds
- Switch to faster model (gemini-1.5-flash)
- Reduce image resolution
- Process fewer images per batch

## 📞 Need Help?

1. Check **TROUBLESHOOTING.md** for detailed solutions
2. Check **QUOTA_LOGGING.md** for technical details
3. Review your downloaded logs for patterns
4. Check [Google Cloud Status](https://status.cloud.google.com/)

---

**Remember:** The quota logger runs automatically. You don't need to do anything special - just use your app normally and check the stats when needed!

**Last Updated:** November 24, 2025
