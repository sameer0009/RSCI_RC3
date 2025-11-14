# Design Document: Advanced Problem Creation System

## Overview

This design enhances the existing problem creation system with advanced validation strategies, comprehensive test case management, performance constraints, and sophisticated problem configurations. The system will support multiple validation methods, test case grouping, partial scoring, custom checkers, and problem import/export capabilities.

The design builds upon the existing Prisma schema and problem creation infrastructure while adding new models, services, and UI components to support advanced features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Enhanced Problem Creation Form                       │   │
│  │  - Validation Strategy Selector                       │   │
│  │  - Test Case Manager with Groups                      │   │
│  │  - Custom Checker Editor                              │   │
│  │  - Performance Constraints Config                     │   │
│  │  - Problem Testing Interface                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Enhanced Problem Routes                              │   │
│  │  - POST /admin/problems (with advanced config)        │   │
│  │  - PUT /admin/problems/:id (with validation)          │   │
│  │  - POST /admin/problems/:id/test                      │   │
│  │  - POST /admin/problems/import                        │   │
│  │  - POST /admin/problems/:id/clone                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Enhanced Problem Service                             │   │
│  │  - Validation Strategy Handler                        │   │
│  │  - Test Case Group Manager                            │   │
│  │  - Custom Checker Validator                           │   │
│  │  - Problem Import/Export Service                      │   │
│  │  - Reference Solution Tester                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Enhanced Judge Service                               │   │
│  │  - Multi-Strategy Output Validator                    │   │
│  │  - Custom Checker Executor                            │   │
│  │  - Partial Scoring Calculator                         │   │
│  │  - Group-Based Evaluation                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Enhanced Prisma Models                               │   │
│  │  - Problem (with validation config)                   │   │
│  │  - TestCase (with groups and weights)                 │   │
│  │  - TestCaseGroup                                      │   │
│  │  - CustomChecker                                      │   │
│  │  - SubmissionResult (detailed feedback)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema Extensions

#### Enhanced Problem Model
```prisma
model Problem {
  id                    String              @id @default(uuid())
  title                 String
  slug                  String              @unique
  description           String              @db.Text
  inputFormat           String              @db.Text
  outputFormat          String              @db.Text
  constraints           String              @db.Text
  difficulty            Difficulty
  topics                String[]
  
  // Enhanced fields
  problemType           ProblemType         @default(STANDARD)
  validationStrategy    ValidationStrategy  @default(EXACT_MATCH)
  floatingPointEpsilon  Float?
  enablePartialScoring  Boolean             @default(false)
  maxSourceSize         Int                 @default(65536) // bytes
  allowedLanguages      String[]            // empty = all allowed
  hints                 Json?               // Array of hint objects
  examples              Json?               // Array of example objects with explanations
  
  // Performance constraints
  timeLimit             Int                 @default(2000)
  memoryLimit           Int                 @default(256)
  languageTimeLimits    Json?               // Language-specific time limits
  languageMemoryLimits  Json?               // Language-specific memory limits
  
  // Status and metadata
  status                ProblemStatus       @default(DRAFT)
  acceptanceRate        Float               @default(0)
  totalSubmissions      Int                 @default(0)
  acceptedSubmissions   Int                 @default(0)
  createdBy             String
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  creator               User                @relation(fields: [createdBy], references: [id])
  testCases             TestCase[]
  testCaseGroups        TestCaseGroup[]
  customChecker         CustomChecker?
  submissions           Submission[]
  contests              Contest[]           @relation("ContestProblems")
  
  @@index([slug])
  @@index([difficulty])
  @@index([status])
  @@index([createdBy])
}

enum ProblemType {
  STANDARD      // Normal input/output
  INTERACTIVE   // Interactive with interactor program
  OUTPUT_ONLY   // Users upload output files
}

enum ValidationStrategy {
  EXACT_MATCH           // Exact string comparison
  IGNORE_WHITESPACE     // Trim and normalize whitespace
  TOKEN_BASED           // Compare tokens, ignore whitespace
  FLOATING_POINT        // Compare with epsilon tolerance
  CUSTOM_CHECKER        // Use custom checker program
}

enum ProblemStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### Enhanced TestCase Model
```prisma
model TestCase {
  id              String          @id @default(uuid())
  problemId       String
  groupId         String?
  input           String          @db.Text
  expectedOutput  String          @db.Text
  
  // Enhanced fields
  visibility      TestCaseVisibility @default(HIDDEN)
  points          Int             @default(10)
  orderIndex      Int
  timeLimit       Int?            // Override problem time limit
  memoryLimit     Int?            // Override problem memory limit
  description     String?         // Internal description for admins
  
  createdAt       DateTime        @default(now())
  
  problem         Problem         @relation(fields: [problemId], references: [id], onDelete: Cascade)
  group           TestCaseGroup?  @relation(fields: [groupId], references: [id], onDelete: SetNull)
  results         TestCaseResult[]
  
  @@index([problemId])
  @@index([groupId])
  @@index([visibility])
}

enum TestCaseVisibility {
  SAMPLE        // Visible to all users
  HIDDEN        // Hidden, only verdict shown
  STRESS        // For stress testing, not counted in score
}
```

#### New TestCaseGroup Model
```prisma
model TestCaseGroup {
  id              String      @id @default(uuid())
  problemId       String
  name            String
  description     String?     @db.Text
  points          Int         @default(0)  // Total points for group
  orderIndex      Int
  dependsOnGroup  String?     // ID of group that must pass first
  
  problem         Problem     @relation(fields: [problemId], references: [id], onDelete: Cascade)
  testCases       TestCase[]
  
  @@index([problemId])
}
```

#### New CustomChecker Model
```prisma
model CustomChecker {
  id              String      @id @default(uuid())
  problemId       String      @unique
  language        String      // cpp, python, etc.
  code            String      @db.Text
  compiledPath    String?     // Path to compiled checker
  isCompiled      Boolean     @default(false)
  lastCompiled    DateTime?
  
  problem         Problem     @relation(fields: [problemId], references: [id], onDelete: Cascade)
  
  @@index([problemId])
}
```

#### Enhanced Submission Model
```prisma
model Submission {
  id                String          @id @default(uuid())
  userId            String
  problemId         String
  contestId         String?
  code              String          @db.Text
  language          String
  
  // Enhanced fields
  verdict           Verdict         @default(Pending)
  score             Float           @default(0)  // For partial scoring
  maxScore          Float           @default(100)
  executionTime     Int             @default(0)
  memoryUsed        Int             @default(0)
  testCasesPassed   Int             @default(0)
  totalTestCases    Int             @default(0)
  
  submittedAt       DateTime        @default(now())
  evaluatedAt       DateTime?
  
  user              User            @relation(fields: [userId], references: [id])
  problem           Problem         @relation(fields: [problemId], references: [id])
  contest           Contest?        @relation(fields: [contestId], references: [id])
  testCaseResults   TestCaseResult[]
  
  @@index([userId])
  @@index([problemId])
  @@index([contestId])
  @@index([verdict])
  @@index([submittedAt])
}
```

#### New TestCaseResult Model
```prisma
model TestCaseResult {
  id              String      @id @default(uuid())
  submissionId    String
  testCaseId      String
  verdict         Verdict
  executionTime   Int         @default(0)
  memoryUsed      Int         @default(0)
  output          String?     @db.Text  // Actual output (for visible tests)
  errorMessage    String?     @db.Text
  points          Float       @default(0)
  
  submission      Submission  @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  testCase        TestCase    @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  
  @@index([submissionId])
  @@index([testCaseId])
}
```

### 2. Backend Services

#### Enhanced Problem Service

```typescript
interface CreateProblemData {
  // Basic fields
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  topics: string[];
  
  // Advanced fields
  problemType?: ProblemType;
  validationStrategy?: ValidationStrategy;
  floatingPointEpsilon?: number;
  enablePartialScoring?: boolean;
  maxSourceSize?: number;
  allowedLanguages?: string[];
  hints?: Array<{ text: string; order: number }>;
  examples?: Array<{ input: string; output: string; explanation: string }>;
  
  // Performance
  timeLimit?: number;
  memoryLimit?: number;
  languageTimeLimits?: Record<string, number>;
  languageMemoryLimits?: Record<string, number>;
  
  // Test cases
  testCases: Array<{
    input: string;
    expectedOutput: string;
    visibility: TestCaseVisibility;
    points: number;
    groupId?: string;
    timeLimit?: number;
    memoryLimit?: number;
  }>;
  
  // Test case groups
  testCaseGroups?: Array<{
    name: string;
    description?: string;
    points: number;
    orderIndex: number;
    dependsOnGroup?: string;
  }>;
  
  // Custom checker
  customChecker?: {
    language: string;
    code: string;
  };
}

class EnhancedProblemService {
  async createProblem(data: CreateProblemData, createdBy: string): Promise<Problem>;
  async updateProblem(id: string, data: Partial<CreateProblemData>): Promise<Problem>;
  async cloneProblem(id: string, createdBy: string): Promise<Problem>;
  async testProblem(id: string, referenceSolution: { code: string; language: string }): Promise<TestResult>;
  async validateCustomChecker(checker: { language: string; code: string }): Promise<ValidationResult>;
  async importProblem(format: 'polygon' | 'domjudge', data: any): Promise<Problem>;
  async exportProblem(id: string, format: 'polygon' | 'domjudge'): Promise<any>;
}
```

#### Validation Service

```typescript
interface ValidationConfig {
  strategy: ValidationStrategy;
  epsilon?: number;
  customChecker?: CustomChecker;
}

interface ValidationResult {
  isCorrect: boolean;
  message?: string;
  details?: any;
}

class ValidationService {
  async validateOutput(
    expected: string,
    actual: string,
    config: ValidationConfig
  ): Promise<ValidationResult>;
  
  private exactMatch(expected: string, actual: string): boolean;
  private ignoreWhitespace(expected: string, actual: string): boolean;
  private tokenBased(expected: string, actual: string): boolean;
  private floatingPoint(expected: string, actual: string, epsilon: number): boolean;
  private async customChecker(
    input: string,
    expected: string,
    actual: string,
    checker: CustomChecker
  ): Promise<ValidationResult>;
}
```

#### Enhanced Judge Service

```typescript
interface JudgeConfig {
  problemId: string;
  code: string;
  language: string;
  testCases: TestCase[];
  validationConfig: ValidationConfig;
  enablePartialScoring: boolean;
  testCaseGroups?: TestCaseGroup[];
}

interface JudgeResult {
  verdict: Verdict;
  score: number;
  maxScore: number;
  executionTime: number;
  memoryUsed: number;
  testCaseResults: Array<{
    testCaseId: string;
    verdict: Verdict;
    executionTime: number;
    memoryUsed: number;
    output?: string;
    points: number;
  }>;
  groupResults?: Array<{
    groupId: string;
    passed: number;
    total: number;
    score: number;
  }>;
}

class EnhancedJudgeService {
  async judgeSubmission(config: JudgeConfig): Promise<JudgeResult>;
  private async executeCode(code: string, language: string, input: string, limits: Limits): Promise<ExecutionResult>;
  private async validateTestCase(testCase: TestCase, output: string, config: ValidationConfig): Promise<ValidationResult>;
  private calculatePartialScore(results: TestCaseResult[], groups?: TestCaseGroup[]): number;
}
```

#### Custom Checker Compiler Service

```typescript
class CheckerCompilerService {
  async compileChecker(checker: CustomChecker): Promise<{ success: boolean; path?: string; error?: string }>;
  async executeChecker(
    checkerPath: string,
    input: string,
    expectedOutput: string,
    actualOutput: string
  ): Promise<{ isCorrect: boolean; message?: string }>;
}
```

### 3. Frontend Components

#### Enhanced Problem Creation Form

```typescript
interface ProblemFormData {
  // Basic info
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  
  // Advanced config
  problemType: 'STANDARD' | 'INTERACTIVE' | 'OUTPUT_ONLY';
  validationStrategy: ValidationStrategy;
  floatingPointEpsilon?: number;
  enablePartialScoring: boolean;
  maxSourceSize: number;
  allowedLanguages: string[];
  
  // Performance
  timeLimit: number;
  memoryLimit: number;
  languageTimeLimits: Record<string, number>;
  languageMemoryLimits: Record<string, number>;
  
  // Test cases
  testCases: TestCaseData[];
  testCaseGroups: TestCaseGroupData[];
  
  // Custom checker
  customChecker?: {
    language: string;
    code: string;
  };
  
  // Examples and hints
  examples: ExampleData[];
  hints: HintData[];
}

// Component structure
<ProblemCreationForm>
  <BasicInfoSection />
  <AdvancedConfigSection>
    <ValidationStrategySelector />
    <PerformanceConstraints />
    <LanguageRestrictions />
  </AdvancedConfigSection>
  <TestCaseManager>
    <TestCaseGroupManager />
    <TestCaseList />
    <TestCaseImporter />
  </TestCaseManager>
  <CustomCheckerEditor />
  <ExamplesAndHints />
  <ProblemTester />
</ProblemCreationForm>
```

#### Validation Strategy Selector Component

```typescript
<ValidationStrategySelector
  value={validationStrategy}
  onChange={setValidationStrategy}
  onConfigChange={setValidationConfig}
>
  <option value="EXACT_MATCH">Exact Match</option>
  <option value="IGNORE_WHITESPACE">Ignore Whitespace</option>
  <option value="TOKEN_BASED">Token-Based</option>
  <option value="FLOATING_POINT">Floating Point</option>
  <option value="CUSTOM_CHECKER">Custom Checker</option>
</ValidationStrategySelector>

{validationStrategy === 'FLOATING_POINT' && (
  <EpsilonInput value={epsilon} onChange={setEpsilon} />
)}

{validationStrategy === 'CUSTOM_CHECKER' && (
  <CustomCheckerEditor
    language={checkerLanguage}
    code={checkerCode}
    onChange={setCheckerCode}
    onValidate={validateChecker}
  />
)}
```

#### Test Case Manager Component

```typescript
<TestCaseManager>
  <TestCaseGroupList
    groups={testCaseGroups}
    onAdd={addGroup}
    onEdit={editGroup}
    onDelete={deleteGroup}
    onReorder={reorderGroups}
  />
  
  <TestCaseList
    testCases={testCases}
    groups={testCaseGroups}
    onAdd={addTestCase}
    onEdit={editTestCase}
    onDelete={deleteTestCase}
    onReorder={reorderTestCases}
  />
  
  <TestCaseImporter
    onImport={importTestCases}
    formats={['csv', 'json', 'zip']}
  />
  
  <TestCaseSummary
    total={testCases.length}
    byVisibility={visibilityBreakdown}
    totalPoints={totalPoints}
  />
</TestCaseManager>
```

#### Problem Tester Component

```typescript
<ProblemTester problemId={problemId}>
  <ReferenceSolutionUploader
    onUpload={uploadReferenceSolution}
    languages={['cpp', 'python', 'java', 'javascript']}
  />
  
  <TestRunner
    onRun={runTests}
    loading={testing}
  />
  
  <TestResults
    results={testResults}
    showDetails={true}
  />
</ProblemTester>
```

## Data Models

### Validation Strategy Configuration

```typescript
type ValidationStrategyConfig = 
  | { type: 'EXACT_MATCH' }
  | { type: 'IGNORE_WHITESPACE' }
  | { type: 'TOKEN_BASED' }
  | { type: 'FLOATING_POINT'; epsilon: number }
  | { type: 'CUSTOM_CHECKER'; checkerId: string };
```

### Test Case Group Structure

```typescript
interface TestCaseGroup {
  id: string;
  problemId: string;
  name: string;
  description?: string;
  points: number;
  orderIndex: number;
  dependsOnGroup?: string;
  testCases: TestCase[];
}
```

### Detailed Submission Result

```typescript
interface DetailedSubmissionResult {
  submissionId: string;
  verdict: Verdict;
  score: number;
  maxScore: number;
  executionTime: number;
  memoryUsed: number;
  testCaseResults: Array<{
    testCaseId: string;
    orderIndex: number;
    visibility: TestCaseVisibility;
    verdict: Verdict;
    executionTime: number;
    memoryUsed: number;
    input?: string;  // Only for SAMPLE visibility
    expectedOutput?: string;  // Only for SAMPLE visibility
    actualOutput?: string;  // Only for SAMPLE visibility
    points: number;
    maxPoints: number;
  }>;
  groupResults?: Array<{
    groupId: string;
    groupName: string;
    passed: number;
    total: number;
    score: number;
    maxScore: number;
  }>;
}
```

## Error Handling

### Validation Errors

```typescript
class ProblemValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Examples:
// - Missing required test cases
// - Invalid custom checker syntax
// - Circular group dependencies
// - Invalid epsilon value
// - Test case points don't sum to 100 (when required)
```

### Custom Checker Errors

```typescript
class CheckerError extends Error {
  constructor(
    public type: 'COMPILATION' | 'RUNTIME' | 'TIMEOUT',
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

### Import/Export Errors

```typescript
class ImportError extends Error {
  constructor(
    public format: string,
    public message: string,
    public missingFields?: string[]
  ) {
    super(message);
  }
}
```

## Testing Strategy

### Unit Tests

1. **Validation Service Tests**
   - Test each validation strategy independently
   - Test edge cases (empty output, special characters, etc.)
   - Test floating point comparison with various epsilon values
   - Test custom checker execution

2. **Problem Service Tests**
   - Test problem creation with all configurations
   - Test problem cloning
   - Test problem validation
   - Test import/export functionality

3. **Judge Service Tests**
   - Test partial scoring calculation
   - Test group-based evaluation
   - Test verdict determination
   - Test performance limit enforcement

### Integration Tests

1. **End-to-End Problem Creation**
   - Create problem with all advanced features
   - Submit reference solution
   - Verify test results

2. **Submission Evaluation Flow**
   - Submit code to problem with custom checker
   - Verify detailed results
   - Test partial scoring
   - Test group dependencies

### Manual Testing Scenarios

1. Create problem with floating point validation
2. Create problem with custom checker
3. Create problem with test case groups and dependencies
4. Import problem from Polygon format
5. Clone existing problem and modify
6. Test problem with reference solutions

## Performance Considerations

### Database Optimization

- Index on `Problem.status` for filtering published problems
- Index on `TestCase.visibility` for quick filtering
- Index on `TestCaseGroup.problemId` for group queries
- Use database transactions for problem creation with multiple test cases

### Caching Strategy

- Cache compiled custom checkers
- Cache problem configurations for active problems
- Cache validation strategy configurations

### Scalability

- Limit maximum number of test cases per problem (e.g., 100)
- Limit maximum test case input/output size (e.g., 10MB)
- Implement pagination for test case management
- Use background jobs for problem import/export

## Security Considerations

### Custom Checker Security

- Sandbox custom checker execution
- Limit checker execution time (e.g., 5 seconds)
- Limit checker memory usage
- Validate checker code for malicious patterns
- Run checkers in isolated containers

### Input Validation

- Sanitize all problem text fields
- Validate test case data sizes
- Prevent SQL injection in search queries
- Validate file uploads for import

### Access Control

- Only admins can create/edit problems
- Only admins can see hidden test cases
- Validate user permissions for all operations
- Audit log for problem modifications

## Migration Strategy

### Database Migration

1. Add new columns to existing `Problem` table
2. Add new columns to existing `TestCase` table
3. Create new `TestCaseGroup` table
4. Create new `CustomChecker` table
5. Create new `TestCaseResult` table
6. Update foreign key relationships
7. Migrate existing test cases to new structure

### Backward Compatibility

- Default validation strategy to `EXACT_MATCH` for existing problems
- Default problem type to `STANDARD`
- Default test case visibility to `HIDDEN` (except first test case as `SAMPLE`)
- Maintain existing API endpoints while adding new ones

### Data Migration Script

```typescript
async function migrateExistingProblems() {
  const problems = await prisma.problem.findMany({
    include: { testCases: true }
  });
  
  for (const problem of problems) {
    await prisma.problem.update({
      where: { id: problem.id },
      data: {
        problemType: 'STANDARD',
        validationStrategy: 'EXACT_MATCH',
        enablePartialScoring: false,
        status: 'PUBLISHED',
        maxSourceSize: 65536,
        allowedLanguages: []
      }
    });
    
    // Update first test case to be SAMPLE
    if (problem.testCases.length > 0) {
      await prisma.testCase.update({
        where: { id: problem.testCases[0].id },
        data: { visibility: 'SAMPLE' }
      });
    }
  }
}
```

## API Endpoints

### New/Enhanced Endpoints

```
POST   /api/admin/problems
  - Enhanced with advanced configuration
  
PUT    /api/admin/problems/:id
  - Enhanced with advanced configuration
  
POST   /api/admin/problems/:id/test
  - Test problem with reference solution
  
POST   /api/admin/problems/:id/clone
  - Clone existing problem
  
POST   /api/admin/problems/import
  - Import problem from external format
  
GET    /api/admin/problems/:id/export
  - Export problem to external format
  
POST   /api/admin/problems/:id/checker/validate
  - Validate custom checker code
  
POST   /api/admin/problems/:id/checker/compile
  - Compile custom checker
  
GET    /api/admin/problems/:id/test-cases
  - Get all test cases (admin only)
  
POST   /api/admin/problems/:id/test-cases/import
  - Batch import test cases
  
GET    /api/submissions/:id/detailed-results
  - Get detailed submission results with test case breakdown
```

## Implementation Phases

### Phase 1: Database Schema and Basic Validation
- Update Prisma schema
- Implement validation service
- Add validation strategy selector to UI

### Phase 2: Test Case Management
- Implement test case groups
- Add test case manager UI
- Implement batch import

### Phase 3: Custom Checkers
- Implement custom checker model
- Add checker compiler service
- Add checker editor UI

### Phase 4: Partial Scoring and Groups
- Implement partial scoring logic
- Add group-based evaluation
- Update submission results UI

### Phase 5: Problem Testing and Import/Export
- Implement problem tester
- Add import/export functionality
- Add problem cloning

## Future Enhancements

- Interactive problem support with interactor programs
- Output-only problem support
- Multi-language problem statements
- Problem difficulty rating based on solve statistics
- Automated test case generation
- Plagiarism detection for submissions
- Editorial and solution explanations
- Problem tags and categorization
- Problem recommendations based on user history
