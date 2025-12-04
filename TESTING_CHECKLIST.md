# Quota Logging System - Testing Checklist

Use this checklist to verify that the quota logging system is working correctly.

## ✅ Pre-Testing Setup

- [ ] Application is running (`npm run dev`)
- [ ] Browser is open at http://localhost:3000
- [ ] API key is set in `.env.local`
- [ ] Browser console is open (F12) to check for errors

## 🧪 Test 1: Basic Logging

### Steps:
1. Upload 1-2 images
2. Click "Extract Text"
3. Wait for processing to complete

### Expected Results:
- [ ] Processing completes successfully
- [ ] No errors in browser console
- [ ] "Quota" button appears in bottom-right corner

## 🧪 Test 2: View Statistics

### Steps:
1. Click the "Quota" button in bottom-right corner
2. Review the dashboard

### Expected Results:
- [ ] Modal opens with statistics
- [ ] "Today's Usage" section shows:
  - [ ] Requests: 1
  - [ ] Success: 1
  - [ ] Failed: 0
  - [ ] Rate Limited: 0
  - [ ] Total Tokens: >0
  - [ ] Total Cost: >$0
- [ ] "All-Time Statistics" section shows same data
- [ ] No warning banner appears

## 🧪 Test 3: Multiple Requests

### Steps:
1. Close the quota modal
2. Process 2-3 more batches of images
3. Open quota modal again

### Expected Results:
- [ ] Request count increased
- [ ] Token count increased
- [ ] Cost increased
- [ ] All requests show as "Success"
- [ ] Statistics are accurate

## 🧪 Test 4: Download Logs (TXT)

### Steps:
1. In quota modal, click "Download TXT"
2. Open the downloaded file

### Expected Results:
- [ ] File downloads successfully
- [ ] Filename format: `gemini-quota-log-YYYY-MM-DD.txt`
- [ ] File contains:
  - [ ] Summary section with statistics
  - [ ] Detailed logs section
  - [ ] Each request logged with timestamp, status, tokens, cost
- [ ] Data matches dashboard statistics

## 🧪 Test 5: Download Logs (JSON)

### Steps:
1. In quota modal, click "Download JSON"
2. Open the downloaded file in a text editor

### Expected Results:
- [ ] File downloads successfully
- [ ] Filename format: `gemini-quota-log-YYYY-MM-DD.json`
- [ ] File is valid JSON (no syntax errors)
- [ ] Contains:
  - [ ] `summary` object with statistics
  - [ ] `logs` array with all entries
  - [ ] `exportedAt` timestamp
- [ ] Data matches dashboard statistics

## 🧪 Test 6: Persistence

### Steps:
1. Note the current statistics (requests, cost, etc.)
2. Close the browser tab
3. Reopen http://localhost:3000
4. Click "Quota" button

### Expected Results:
- [ ] Statistics are preserved
- [ ] Request count matches previous value
- [ ] Cost matches previous value
- [ ] All logs are still present

## 🧪 Test 7: Session Tracking

### Steps:
1. Note the current session ID (visible in downloaded logs)
2. Close browser completely
3. Reopen browser and go to http://localhost:3000
4. Process 1 image
5. Download logs and check session ID

### Expected Results:
- [ ] New session ID is different from previous
- [ ] Old logs still present with old session ID
- [ ] New log has new session ID

## 🧪 Test 8: Error Logging

### Steps:
1. Stop the dev server (Ctrl+C)
2. Try to process images (will fail)
3. Restart dev server
4. Open quota modal

### Expected Results:
- [ ] Failed request is logged
- [ ] "Failed" count increased
- [ ] Error message is captured
- [ ] Cost is $0 for failed request
- [ ] Tokens are 0 for failed request

## 🧪 Test 9: Rate Limit Detection (Simulated)

**Note:** This test requires triggering an actual rate limit, which may not be possible in testing. Skip if you can't trigger a real 503 error.

### Steps:
1. Process many batches quickly (10+ in 1 minute)
2. Wait for a 503 error
3. Open quota modal

### Expected Results:
- [ ] "Rate Limited" count increased
- [ ] Warning banner appears at top of modal
- [ ] Warning message mentions rate limits
- [ ] Rate limited request logged with status "RATE_LIMITED"

## 🧪 Test 10: Refresh Statistics

### Steps:
1. Open quota modal
2. Note current statistics
3. Close modal
4. Process 1 more batch
5. Open modal
6. Click "Refresh" button

### Expected Results:
- [ ] Statistics update immediately
- [ ] New request appears in counts
- [ ] No page reload required

## 🧪 Test 11: Clear Logs

### Steps:
1. Open quota modal
2. Note current statistics (should have data)
3. Click "Clear Logs" button
4. Confirm the action

### Expected Results:
- [ ] Confirmation dialog appears
- [ ] After confirming, statistics reset to zero
- [ ] "No quota data yet" message appears
- [ ] Download buttons are disabled
- [ ] Logs are permanently deleted

## 🧪 Test 12: UI Responsiveness

### Steps:
1. Open quota modal
2. Try different screen sizes (resize browser)
3. Test on mobile view (responsive mode in DevTools)

### Expected Results:
- [ ] Modal is centered on screen
- [ ] Content is readable at all sizes
- [ ] Buttons are accessible
- [ ] No horizontal scrolling
- [ ] Statistics cards stack properly on mobile

## 🧪 Test 13: No Data State

### Steps:
1. Clear all logs (if not already done)
2. Open quota modal

### Expected Results:
- [ ] "No quota data yet" message displays
- [ ] Icon shows empty state
- [ ] Download buttons are disabled
- [ ] Clear button is disabled
- [ ] No errors in console

## 🧪 Test 14: Cost Calculation

### Steps:
1. Process 1 batch of 3 images
2. Note the token counts from quota modal
3. Calculate expected cost manually:
   - Input cost = (prompt_tokens / 1,000,000) × $3.50
   - Output cost = (output_tokens / 1,000,000) × $10.50
   - Total = Input cost + Output cost
4. Compare with displayed cost

### Expected Results:
- [ ] Displayed cost matches manual calculation (±$0.0001)
- [ ] Cost is reasonable (typically $0.05-$0.15 per batch)

## 🧪 Test 15: Browser Compatibility

### Steps:
Repeat Tests 1-3 in different browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

### Expected Results:
- [ ] Works in all browsers
- [ ] No console errors
- [ ] localStorage works correctly
- [ ] Downloads work correctly

## 🐛 Common Issues & Solutions

### Issue: Quota button doesn't appear
**Solution:** 
- Check browser console for errors
- Verify `QuotaMonitor` is imported in `App.tsx`
- Refresh the page

### Issue: Statistics show 0 despite processing
**Solution:**
- Check browser console for logging errors
- Verify `quotaLogger` is imported in `geminiService.ts`
- Check if localStorage is enabled

### Issue: Downloads don't work
**Solution:**
- Check browser's download settings
- Verify pop-up blocker isn't blocking downloads
- Try different browser

### Issue: Logs don't persist
**Solution:**
- Check if in private/incognito mode
- Verify localStorage is enabled
- Check browser storage quota

### Issue: Costs seem wrong
**Solution:**
- Verify pricing constants in `geminiService.ts`
- Check if Gemini pricing has changed
- Ensure `usageMetadata` is returned by API

## 📊 Test Results Summary

Date: _______________
Tester: _______________

| Test | Status | Notes |
|------|--------|-------|
| 1. Basic Logging | ☐ Pass ☐ Fail | |
| 2. View Statistics | ☐ Pass ☐ Fail | |
| 3. Multiple Requests | ☐ Pass ☐ Fail | |
| 4. Download TXT | ☐ Pass ☐ Fail | |
| 5. Download JSON | ☐ Pass ☐ Fail | |
| 6. Persistence | ☐ Pass ☐ Fail | |
| 7. Session Tracking | ☐ Pass ☐ Fail | |
| 8. Error Logging | ☐ Pass ☐ Fail | |
| 9. Rate Limit Detection | ☐ Pass ☐ Fail ☐ Skip | |
| 10. Refresh Statistics | ☐ Pass ☐ Fail | |
| 11. Clear Logs | ☐ Pass ☐ Fail | |
| 12. UI Responsiveness | ☐ Pass ☐ Fail | |
| 13. No Data State | ☐ Pass ☐ Fail | |
| 14. Cost Calculation | ☐ Pass ☐ Fail | |
| 15. Browser Compatibility | ☐ Pass ☐ Fail | |

**Overall Status:** ☐ All Tests Passed ☐ Some Tests Failed

**Critical Issues Found:**
_______________________________________
_______________________________________
_______________________________________

**Non-Critical Issues Found:**
_______________________________________
_______________________________________
_______________________________________

**Recommendations:**
_______________________________________
_______________________________________
_______________________________________

---

## ✅ Sign-Off

Once all tests pass, the quota logging system is ready for production use.

**Tested By:** _______________
**Date:** _______________
**Signature:** _______________

---

**Last Updated:** November 24, 2025
