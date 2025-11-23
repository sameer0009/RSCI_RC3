# Quick Start: Enhanced Scoring System

## For Users

### Solving a Problem with the New System

1. **Navigate to a Problem**
   ```
   Problems → Select any problem
   ```

2. **Review Sample Test Cases**
   - Look for point values next to each example
   - Understand the input/output format
   - Note the total points available

3. **Write Your Solution**
   - Use the Monaco code editor
   - Select your preferred language

4. **Test with Samples (Recommended)**
   ```
   Click [Test Samples] button
   ```
   - See results for all sample test cases
   - View your actual output
   - Check execution time and memory
   - Debug any errors
   - **No penalty for testing!**

5. **Run Custom Tests (Optional)**
   ```
   Click [Run] button
   ```
   - Enter custom input
   - Test edge cases
   - Verify your logic

6. **Submit Your Solution**
   ```
   Click [Submit] button
   ```
   - Wait for evaluation (10-30 seconds)
   - View detailed results

7. **Understand Your Score**
   ```
   Verdict: Accepted
   Score: 85.5%
   Points: 85 / 100
   Test Cases: 8 / 10
   Time: 245ms
   Memory: 1024KB
   ```

### Example Workflow

```
1. Read problem ✓
2. Check samples (3 tests, 30 points) ✓
3. Write solution ✓
4. Test Samples → All pass! ✓
5. Submit → 85% (missed 2 edge cases)
6. Fix edge cases
7. Test Samples → Still pass
8. Submit → 100% Accepted! ✓
```

## For Problem Creators (Admins)

### Creating a Problem with Enhanced Scoring

#### Step 1: Create the Problem
```
Admin → Problems → Create Problem
```
Fill in:
- Title, description, difficulty
- Input/output format
- Constraints
- Topics

#### Step 2: Add Test Cases
```
Admin → Problems → [Your Problem] → Manage Test Cases
```

**Add Sample Test Cases (Visible)**
```
Click [+ Add Test Case]

Visibility: SAMPLE
Points: 10
Input: 2 3
Expected Output: 5
Description: Basic addition
```

Add 2-3 sample cases (20-30 points total)

**Add Hidden Test Cases**
```
Click [+ Add Test Case]

Visibility: HIDDEN
Points: 15
Input: 100 200
Expected Output: 300
Description: Larger numbers
```

Add 5-10 hidden cases (70-80 points total)

#### Step 3: Organize into Groups (Optional)
```
Click [+ Add Group]

Group Name: Basic Tests
Description: Simple test cases
Total Points: 30
```

Then assign test cases to groups by editing them.

#### Step 4: Verify Point Distribution
```
Total Test Cases: 10
Total Points: 100

Sample Tests: 20 points (20%)
Basic Tests: 30 points (30%)
Edge Cases: 30 points (30%)
Performance: 20 points (20%)
```

#### Step 5: Test Your Problem
- Submit a correct solution → Should get 100%
- Submit a partial solution → Should get partial credit
- Submit a wrong solution → Should fail appropriately

### Example Problem Setup

**Problem: Two Sum**

```
Sample Tests (20 points):
├─ Test 1: [2,7,11,15], target=9 → [0,1] (10 pts) [SAMPLE]
└─ Test 2: [3,2,4], target=6 → [1,2] (10 pts) [SAMPLE]

Basic Tests (30 points):
├─ Test 3: Negative numbers (10 pts) [HIDDEN]
├─ Test 4: Zero in array (10 pts) [HIDDEN]
└─ Test 5: Duplicate numbers (10 pts) [HIDDEN]

Edge Cases (30 points):
├─ Test 6: Minimum size (10 pts) [HIDDEN]
├─ Test 7: Large numbers (10 pts) [HIDDEN]
└─ Test 8: No solution (10 pts) [HIDDEN]

Performance (20 points):
├─ Test 9: 10,000 elements (10 pts) [HIDDEN]
└─ Test 10: Maximum constraints (10 pts) [HIDDEN]

Total: 10 test cases, 100 points
```

## Running the Migration

### Apply Database Changes

```bash
cd backend
npx prisma db execute --file prisma/migrations/20241116_enhanced_scoring.sql
```

This will:
- Set visibility for existing test cases
- Assign default points (10 per test)
- Enable partial scoring
- Set default validation strategies

### Verify Migration

```bash
npx prisma studio
```

Check:
- TestCase table has `visibility` and `points` fields
- All test cases have points > 0
- Problems have `enablePartialScoring = true`

## Testing the System

### Test as a User

1. **Go to any problem**
2. **Click "Test Samples"**
   - Should see results for sample tests
   - Should show points earned
   - Should display output

3. **Click "Submit"**
   - Should evaluate all tests
   - Should show score percentage
   - Should show points earned

### Test as an Admin

1. **Create a new problem**
2. **Add test cases with different points**
3. **Create test case groups**
4. **Submit a solution**
5. **Verify scoring is correct**

## Common Issues & Solutions

### Issue: Test cases don't show points
**Solution**: Run the migration script to set default points

### Issue: Sample tests not visible
**Solution**: Set visibility to "SAMPLE" in test case management

### Issue: Score always 0 or 100
**Solution**: Enable partial scoring in problem settings

### Issue: Can't create test case groups
**Solution**: Ensure you're logged in as admin

### Issue: Submission stuck on "Pending"
**Solution**: Check Judge0 API configuration and connectivity

## Best Practices

### For Users
1. Always test samples before submitting
2. Use custom run for edge cases
3. Read point distribution to prioritize
4. Learn from partial scores

### For Admins
1. Balance point distribution fairly
2. Include 2-3 sample tests
3. Cover all edge cases
4. Test your test cases
5. Use descriptive group names

## Quick Reference

### Test Case Visibility
- **SAMPLE**: Visible to users, shows output
- **HIDDEN**: Only verdict shown
- **STRESS**: Not counted in score

### Validation Strategies
- **IGNORE_WHITESPACE**: Default, most flexible
- **EXACT_MATCH**: Strict character matching
- **TOKEN_BASED**: Compare space-separated tokens
- **FLOATING_POINT**: For decimal outputs
- **CUSTOM_CHECKER**: Advanced validation

### Point Distribution Guidelines
```
Easy Problem:    5-10 test cases, 100 points
Medium Problem:  10-20 test cases, 100 points
Hard Problem:    15-30 test cases, 100 points

Sample:     10-20% of points
Basic:      30-40% of points
Edge:       20-30% of points
Performance: 20-30% of points
```

## Next Steps

### For Users
1. Try solving a problem with the new system
2. Use "Test Samples" to practice
3. Aim for 100% but learn from partial scores
4. Check the leaderboard for rankings

### For Admins
1. Update existing problems with point values
2. Create test case groups for organization
3. Add more sample tests for clarity
4. Monitor user feedback

## Getting Help

### Documentation
- Full Guide: `docs/ENHANCED_SCORING_SYSTEM.md`
- UI Guide: `docs/UI_ENHANCEMENTS.md`
- Implementation: `ENHANCED_SCORING_IMPLEMENTATION.md`

### Support
- Check existing problems for examples
- Review sample test cases
- Contact admin for assistance
- Submit feedback for improvements

## Success Tips

### Maximize Your Score
1. Read the problem carefully
2. Test with samples first
3. Think about edge cases
4. Optimize for time/memory
5. Submit when confident

### Create Great Problems
1. Clear problem statement
2. Good sample tests
3. Comprehensive test coverage
4. Fair point distribution
5. Helpful descriptions

---

**Ready to start?** Head to the Problems page and try the new enhanced scoring system!

**Version**: 1.0.0  
**Last Updated**: November 16, 2024
