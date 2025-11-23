# Enhanced Scoring System

## Overview

The RSCI-RC3 platform now features a comprehensive point-based scoring system that provides:

- **Weighted Test Cases**: Each test case can have different point values
- **Test Case Categories**: Organize tests into Sample, Hidden, and Stress categories
- **Partial Scoring**: Get points for passing individual test cases
- **Test Case Groups**: Group related tests together with collective scoring
- **Practice Mode**: Test against sample cases before submitting

## Key Features

### 1. Point-Based Scoring

Every test case is assigned a point value (default: 10 points). Your submission score is calculated as:

```
Score = (Points Earned / Total Points) × 100%
```

**Benefits:**
- More granular feedback on solution quality
- Partial credit for partially correct solutions
- Ability to weight important test cases higher

### 2. Test Case Visibility Levels

#### SAMPLE (Visible)
- Shown to users in problem description
- Users can see input, expected output, and their output
- Typically worth fewer points
- Great for understanding the problem

#### HIDDEN
- Not visible to users
- Only verdict (Accepted/Wrong Answer) is shown
- Main test cases for evaluation
- Prevents hardcoding solutions

#### STRESS
- Performance and edge case tests
- Not counted in final score
- Used for stress testing solutions
- Helps identify optimization issues

### 3. Test Case Groups

Organize test cases into logical groups:

**Example Groups:**
- **Basic Tests** (30 points): Simple cases to verify basic logic
- **Edge Cases** (30 points): Boundary conditions, empty inputs
- **Performance Tests** (40 points): Large inputs, time complexity checks

**Benefits:**
- Clear feedback on which category failed
- Progressive difficulty
- Better problem organization

### 4. Practice Mode

Before submitting, users can:
- Run code against sample test cases
- See detailed output and errors
- Debug without penalty
- Build confidence before submission

## For Problem Creators

### Setting Up Test Cases

1. **Navigate to Test Case Management**
   - Go to Admin → Problems
   - Select your problem
   - Click "Manage Test Cases"

2. **Add Test Cases**
   ```
   Visibility: SAMPLE | HIDDEN | STRESS
   Points: 10 (or custom value)
   Input: <test input>
   Expected Output: <expected output>
   Description: Optional description for admins
   ```

3. **Create Groups (Optional)**
   ```
   Group Name: Basic Tests
   Description: Simple test cases
   Total Points: 30
   ```

### Best Practices

#### Point Distribution
```
Sample Tests:     10-20% of total points
Basic Tests:      30-40% of total points
Edge Cases:       20-30% of total points
Performance:      20-30% of total points
```

#### Test Case Count
- **Easy Problems**: 5-10 test cases
- **Medium Problems**: 10-20 test cases
- **Hard Problems**: 15-30 test cases

#### Sample Test Cases
- Include 2-3 sample cases
- Cover basic functionality
- Show different input formats
- Worth 5-10 points each

#### Hidden Test Cases
- Cover all edge cases
- Test boundary conditions
- Include large inputs
- Worth 10-20 points each

### Example Setup

**Problem: Two Sum**

```
Sample Tests (20 points):
├─ Test 1: Basic case [2,7,11,15], target=9 → [0,1] (10 pts)
└─ Test 2: Different positions [3,2,4], target=6 → [1,2] (10 pts)

Basic Tests (30 points):
├─ Test 3: Negative numbers (10 pts)
├─ Test 4: Zero in array (10 pts)
└─ Test 5: Duplicate numbers (10 pts)

Edge Cases (30 points):
├─ Test 6: Minimum array size (10 pts)
├─ Test 7: Large numbers (10 pts)
└─ Test 8: No solution case (10 pts)

Performance Tests (20 points):
├─ Test 9: Large array (10,000 elements) (10 pts)
└─ Test 10: Maximum constraints (10 pts)
```

## For Users

### Understanding Your Score

When you submit a solution, you'll see:

```
Verdict: Accepted / Wrong Answer / TLE / etc.
Score: 85.5%
Points: 85 / 100
Test Cases Passed: 8 / 10
Execution Time: 245ms
Memory Used: 1024KB
```

### Test Results Breakdown

#### Sample Tests Tab
- See all sample test results
- View your output vs expected
- Debug compilation/runtime errors
- No submission required

#### Submission Tab
- Overall verdict and score
- Points earned
- Test cases passed
- Performance metrics
- Group-wise breakdown (if groups exist)

### Scoring Examples

**Example 1: Partial Success**
```
Total Test Cases: 10
Passed: 7
Failed: 3

Points Distribution:
✓ Sample Tests: 20/20 (all passed)
✓ Basic Tests: 30/30 (all passed)
✗ Edge Cases: 10/30 (1 of 3 passed)
✗ Performance: 0/20 (TLE on both)

Final Score: 60/100 = 60%
```

**Example 2: Full Success**
```
Total Test Cases: 10
Passed: 10
Failed: 0

Points: 100/100
Score: 100%
Verdict: Accepted
```

## Validation Strategies

The system supports multiple output comparison methods:

### EXACT_MATCH
- Character-by-character comparison
- Use for string problems with specific formatting

### IGNORE_WHITESPACE (Default)
- Normalizes whitespace
- Trims lines
- Best for most problems

### TOKEN_BASED
- Compares space-separated tokens
- Ignores extra whitespace
- Good for numeric outputs

### FLOATING_POINT
- Compares with epsilon tolerance (default: 1e-6)
- Use for problems with decimal outputs
- Handles floating-point precision issues

### CUSTOM_CHECKER
- Use custom checker program
- For complex validation logic
- Interactive problems

## API Endpoints

### Run Sample Tests
```http
POST /api/submissions/sample-tests
Content-Type: application/json

{
  "problemId": "uuid",
  "code": "solution code",
  "language": "python"
}

Response:
{
  "success": true,
  "data": {
    "results": [
      {
        "testCaseId": "uuid",
        "verdict": "Accepted",
        "executionTime": 45,
        "memoryUsed": 512,
        "output": "actual output",
        "points": 10,
        "maxPoints": 10,
        "visibility": "SAMPLE"
      }
    ]
  }
}
```

### Submit Solution
```http
POST /api/submissions
Content-Type: application/json

{
  "problemId": "uuid",
  "code": "solution code",
  "language": "python"
}

Response:
{
  "success": true,
  "data": {
    "submission": {
      "id": "uuid",
      "verdict": "Pending",
      "score": 0,
      "points": 0
    }
  }
}
```

### Get Submission Result
```http
GET /api/submissions/:id

Response:
{
  "success": true,
  "data": {
    "submission": {
      "verdict": "Accepted",
      "score": 100,
      "points": 100,
      "testCasesPassed": 10,
      "totalTestCases": 10,
      "executionTime": 245,
      "memoryUsed": 1024
    }
  }
}
```

## Database Schema

### TestCase Model
```prisma
model TestCase {
  id             String
  problemId      String
  groupId        String?
  input          String
  expectedOutput String
  visibility     TestCaseVisibility  // SAMPLE | HIDDEN | STRESS
  points         Int                 // Point value
  orderIndex     Int                 // Display order
  timeLimit      Int?                // Override problem time limit
  memoryLimit    Int?                // Override problem memory limit
  description    String?             // Admin notes
}
```

### TestCaseGroup Model
```prisma
model TestCaseGroup {
  id          String
  problemId   String
  name        String
  description String?
  points      Int        // Total points for group
  orderIndex  Int
  testCases   TestCase[]
}
```

### TestCaseResult Model
```prisma
model TestCaseResult {
  id            String
  submissionId  String
  testCaseId    String
  verdict       Verdict
  executionTime Int
  memoryUsed    Int
  output        String?  // For visible tests
  errorMessage  String?
  points        Float    // Points earned
}
```

## Migration Guide

### Updating Existing Problems

Run the migration script:

```bash
cd backend
npx prisma db execute --file prisma/migrations/20241116_enhanced_scoring.sql
```

This will:
- Set default visibility based on `isPublic` flag
- Assign default points (10) to all test cases
- Set default order indices
- Enable partial scoring for all problems

### Manual Updates

For fine-tuned control:

1. **Update Test Case Points**
   ```sql
   UPDATE "TestCase"
   SET points = 20
   WHERE "problemId" = 'your-problem-id'
   AND visibility = 'SAMPLE';
   ```

2. **Create Test Case Groups**
   ```sql
   INSERT INTO "TestCaseGroup" (id, "problemId", name, points, "orderIndex")
   VALUES (gen_random_uuid(), 'problem-id', 'Basic Tests', 30, 1);
   ```

3. **Assign Tests to Groups**
   ```sql
   UPDATE "TestCase"
   SET "groupId" = 'group-id'
   WHERE id IN ('test-id-1', 'test-id-2');
   ```

## Tips for Success

### For Problem Creators
1. Start with sample tests to explain the problem
2. Add basic tests for core functionality
3. Include edge cases for boundary conditions
4. Add performance tests for optimization
5. Balance point distribution fairly
6. Test your test cases thoroughly

### For Users
1. Read sample tests carefully
2. Use "Test Samples" before submitting
3. Debug with custom inputs
4. Check time/memory constraints
5. Aim for 100% but partial credit is valuable
6. Learn from failed test categories

## Future Enhancements

Planned features:
- [ ] Subtask dependencies (must pass A to attempt B)
- [ ] Dynamic scoring based on difficulty
- [ ] Test case hints after failed attempts
- [ ] Batch test case upload (CSV/JSON)
- [ ] Test case generation tools
- [ ] Interactive problem support
- [ ] Custom checker templates

## Support

For issues or questions:
- Check the documentation
- Review example problems
- Contact admin support
- Submit feedback

---

**Version**: 1.0.0  
**Last Updated**: November 16, 2024
