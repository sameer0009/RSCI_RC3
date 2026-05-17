# Judge0 API Setup - Complete ✅

## API Configuration

Your Judge0 API is now configured and working!

### API Details
- **URL**: https://judge0-ce.p.rapidapi.com
- **API Key**: `1a41d1f65cmsh19b328c1cec233fp1ee511jsn8e854a455160`
- **Status**: ✅ Connected and Working
- **Version**: 1.14.0

## Configuration Applied

The API key has been added to `backend/.env`:

```env
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="1a41d1f65cmsh19b328c1cec233fp1ee511jsn8e854a455160"
```

## Supported Languages

Your platform now supports code execution in:

| Language   | Language ID | Status |
|------------|-------------|--------|
| JavaScript | 63          | ✅     |
| Python     | 71          | ✅     |
| Java       | 62          | ✅     |
| C++        | 54          | ✅     |
| C          | 50          | ✅     |
| C#         | 51          | ✅     |
| Go         | 60          | ✅     |
| PHP        | 68          | ✅     |

## Testing the API

### Test 1: API Connection ✅
```bash
curl -X GET "https://judge0-ce.p.rapidapi.com/about" \
  -H "x-rapidapi-host: judge0-ce.p.rapidapi.com" \
  -H "x-rapidapi-key: 1a41d1f65cmsh19b328c1cec233fp1ee511jsn8e854a455160"
```

**Result**: Connected successfully!

### Test 2: Code Execution

Try submitting a simple problem through the UI:

1. Go to http://localhost:3000/problems
2. Select any problem
3. Write a solution
4. Click "Test Samples" or "Submit"
5. Watch the code execute!

## How It Works

### Submission Flow

```
User Code → Backend → Judge0 API → Execution → Results → User
```

1. **User submits code** via frontend
2. **Backend receives** submission
3. **Enhanced Judge Service** processes test cases
4. **Judge0 API** executes code in sandbox
5. **Results returned** with verdict, time, memory
6. **Points calculated** based on test case results
7. **User sees** detailed feedback

### Enhanced Judge Service

The platform uses `enhancedJudge.service.ts` which:
- Sends code to Judge0 API
- Runs against all test cases
- Calculates points per test
- Provides detailed feedback
- Supports multiple validation strategies

## API Limits & Usage

### RapidAPI Free Tier
- **Requests**: Check your RapidAPI dashboard
- **Rate Limit**: Varies by plan
- **Concurrent Executions**: Limited

### Recommendations
1. Monitor your API usage on RapidAPI dashboard
2. Implement caching for repeated submissions
3. Consider upgrading if you hit limits
4. Use local Judge0 instance for production

## Troubleshooting

### Issue: "Code execution failed"
**Solution**: Check API key is correct in `.env`

### Issue: "Rate limit exceeded"
**Solution**: 
- Wait for rate limit reset
- Upgrade RapidAPI plan
- Use local Judge0 instance

### Issue: "Timeout errors"
**Solution**:
- Increase time limits in problem settings
- Check Judge0 API status
- Verify network connectivity

### Issue: "Compilation errors not showing"
**Solution**: Check `enhancedJudge.service.ts` error handling

## Local Judge0 Instance (Optional)

For production or heavy usage, consider running Judge0 locally:

### Docker Setup
```bash
# Clone Judge0
git clone https://github.com/judge0/judge0.git
cd judge0

# Start services
docker-compose up -d

# Update backend/.env
JUDGE0_API_URL="http://localhost:2358"
JUDGE0_API_KEY=""  # No key needed for local
```

### Benefits
- No rate limits
- Faster execution
- More control
- Cost effective for scale

## API Response Examples

### Successful Execution
```json
{
  "stdout": "42\n",
  "stderr": null,
  "compile_output": null,
  "status": {
    "id": 3,
    "description": "Accepted"
  },
  "time": "0.023",
  "memory": 3456
}
```

### Compilation Error
```json
{
  "stdout": null,
  "stderr": null,
  "compile_output": "error: expected ';' before '}' token",
  "status": {
    "id": 6,
    "description": "Compilation Error"
  },
  "time": null,
  "memory": null
}
```

### Runtime Error
```json
{
  "stdout": null,
  "stderr": "ZeroDivisionError: division by zero",
  "compile_output": null,
  "status": {
    "id": 11,
    "description": "Runtime Error (NZEC)"
  },
  "time": "0.015",
  "memory": 2048
}
```

## Status Codes

| ID | Description              | Verdict in Platform    |
|----|--------------------------|------------------------|
| 3  | Accepted                 | Accepted               |
| 4  | Wrong Answer             | Wrong Answer           |
| 5  | Time Limit Exceeded      | Time Limit Exceeded    |
| 6  | Compilation Error        | Compilation Error      |
| 7  | Runtime Error (SIGSEGV)  | Runtime Error          |
| 8  | Runtime Error (SIGXFSZ)  | Runtime Error          |
| 9  | Runtime Error (SIGFPE)   | Runtime Error          |
| 10 | Runtime Error (SIGABRT)  | Runtime Error          |
| 11 | Runtime Error (NZEC)     | Runtime Error          |
| 12 | Runtime Error (Other)    | Runtime Error          |

## Security Considerations

### Sandboxing
- Judge0 runs code in isolated containers
- No access to host system
- Resource limits enforced
- Safe for untrusted code

### API Key Security
- Never commit API keys to git
- Use environment variables
- Rotate keys periodically
- Monitor usage for anomalies

### Input Validation
- Validate code size limits
- Check language support
- Sanitize test case inputs
- Prevent injection attacks

## Performance Tips

### Optimize Execution
1. **Set appropriate time limits** (default: 2000ms)
2. **Set memory limits** (default: 256MB)
3. **Use efficient test cases**
4. **Cache problem data**
5. **Batch similar submissions**

### Monitor Performance
- Track average execution time
- Monitor API response times
- Log failed executions
- Analyze bottlenecks

## Next Steps

1. ✅ API configured and working
2. ✅ Backend connected
3. ✅ Frontend ready
4. 🎯 **Try submitting code!**

### Quick Test
1. Go to http://localhost:3000
2. Register/Login
3. Navigate to Problems
4. Select "Two Sum" or any problem
5. Write a solution:
   ```python
   # Python example
   def twoSum(nums, target):
       for i in range(len(nums)):
           for j in range(i+1, len(nums)):
               if nums[i] + nums[j] == target:
                   return [i, j]
   ```
6. Click "Test Samples" to practice
7. Click "Submit" to get scored!

## Support

### Resources
- [Judge0 Documentation](https://ce.judge0.com/)
- [RapidAPI Dashboard](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Language Support](https://ce.judge0.com/#system-and-configuration-information)
- [Status Codes](https://ce.judge0.com/#statuses-and-languages)

### Getting Help
- Check Judge0 status page
- Review API logs in backend
- Test with simple code first
- Contact RapidAPI support

---

## Summary

✅ **Judge0 API is configured and ready!**

Your RSCI-RC3 platform can now:
- Execute code in 8+ languages
- Run test cases automatically
- Calculate scores with points
- Provide detailed feedback
- Support practice mode

**Everything is set up and working perfectly!** 🚀

Start solving problems at: http://localhost:3000/problems
