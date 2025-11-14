# Requirements Document

## Introduction

This feature enhances the coding platform's problem creation system to support advanced checking parameters, comprehensive test case management, and more sophisticated problem configurations. The system will enable administrators to create complex coding problems with multiple validation strategies, custom checker functions, performance constraints, and detailed test case management.

## Glossary

- **Problem Creation System**: The administrative interface and backend services that allow creation and management of coding problems
- **Test Case**: A single input-output pair used to validate a user's code submission
- **Checker Function**: Custom validation logic that determines if a submission's output is correct
- **Validation Strategy**: The method used to compare expected output with actual output (exact match, custom checker, floating point comparison, etc.)
- **Performance Constraints**: Time and memory limits applied to code execution
- **Test Case Visibility**: Classification of test cases as sample (visible to users), hidden, or stress tests
- **Partial Scoring**: Awarding points based on the number of test cases passed rather than all-or-nothing
- **Judge System**: The backend service that executes and evaluates code submissions

## Requirements

### Requirement 1

**User Story:** As an admin, I want to configure advanced validation strategies for problems, so that I can create problems with flexible output checking beyond exact string matching

#### Acceptance Criteria

1. WHEN creating or editing a problem, THE Problem Creation System SHALL provide options to select from multiple validation strategies including exact match, ignore whitespace, custom checker, floating point comparison, and token-based comparison
2. WHERE custom checker validation is selected, THE Problem Creation System SHALL allow the admin to write custom checker code in supported languages
3. WHEN a custom checker is provided, THE Problem Creation System SHALL validate the checker syntax before saving the problem
4. WHERE floating point comparison is selected, THE Problem Creation System SHALL allow the admin to specify an epsilon value for precision tolerance
5. WHEN token-based comparison is selected, THE Problem Creation System SHALL ignore differences in whitespace and line breaks while comparing tokens

### Requirement 2

**User Story:** As an admin, I want to manage test cases with different visibility levels and weights, so that I can create comprehensive problem validation with sample, hidden, and stress test cases

#### Acceptance Criteria

1. WHEN adding a test case, THE Problem Creation System SHALL allow the admin to specify visibility as sample, hidden, or stress test
2. WHEN adding a test case, THE Problem Creation System SHALL allow the admin to assign a point weight to each test case
3. THE Problem Creation System SHALL support batch import of test cases from CSV or JSON files
4. WHEN managing test cases, THE Problem Creation System SHALL display a summary showing total test cases, point distribution, and visibility breakdown
5. THE Problem Creation System SHALL allow the admin to reorder test cases by drag-and-drop or numeric ordering
6. WHEN a problem has weighted test cases, THE Judge System SHALL calculate partial scores based on passed test cases

### Requirement 3

**User Story:** As an admin, I want to set advanced performance constraints and limits, so that I can create problems that test algorithmic efficiency and resource management

#### Acceptance Criteria

1. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to set time limits per test case with millisecond precision
2. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to set memory limits in megabytes
3. THE Problem Creation System SHALL allow different time and memory limits for different programming languages
4. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to set a maximum source code size limit
5. WHERE performance constraints are specified, THE Judge System SHALL enforce these limits during code execution and return appropriate verdicts for violations

### Requirement 4

**User Story:** As an admin, I want to add detailed problem metadata and constraints, so that users have clear understanding of problem requirements and expectations

#### Acceptance Criteria

1. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to specify input format with detailed descriptions
2. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to specify output format with detailed descriptions
3. THE Problem Creation System SHALL allow the admin to add constraint descriptions with mathematical notation support
4. THE Problem Creation System SHALL allow the admin to add multiple example explanations with step-by-step walkthroughs
5. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to add hints that can be revealed progressively
6. THE Problem Creation System SHALL support markdown formatting for all text fields including LaTeX for mathematical expressions

### Requirement 5

**User Story:** As an admin, I want to configure interactive and special problem types, so that I can create diverse problem formats beyond standard input-output problems

#### Acceptance Criteria

1. WHEN creating a problem, THE Problem Creation System SHALL allow the admin to select problem type as standard, interactive, or output-only
2. WHERE interactive problem type is selected, THE Problem Creation System SHALL allow the admin to provide an interactor program
3. WHERE output-only problem type is selected, THE Problem Creation System SHALL allow users to upload output files instead of code
4. THE Problem Creation System SHALL allow the admin to enable or disable specific programming languages for each problem
5. WHEN a problem uses special judging, THE Problem Creation System SHALL provide templates and documentation for custom judge programs

### Requirement 6

**User Story:** As an admin, I want to validate and test problems before publishing, so that I can ensure all test cases work correctly and the problem is solvable

#### Acceptance Criteria

1. WHEN creating a problem, THE Problem Creation System SHALL provide a test mode to run sample solutions against test cases
2. THE Problem Creation System SHALL allow the admin to upload reference solutions in multiple languages
3. WHEN testing a problem, THE Problem Creation System SHALL execute reference solutions against all test cases and display results
4. IF any test case fails with the reference solution, THE Problem Creation System SHALL highlight the failing test case and show the difference
5. THE Problem Creation System SHALL prevent publishing a problem until at least one reference solution passes all test cases

### Requirement 7

**User Story:** As an admin, I want to organize test cases into groups, so that I can structure validation by subtasks or difficulty levels

#### Acceptance Criteria

1. WHEN managing test cases, THE Problem Creation System SHALL allow the admin to create test case groups with names and descriptions
2. THE Problem Creation System SHALL allow the admin to assign test cases to specific groups
3. WHEN a problem has test case groups, THE Problem Creation System SHALL display group-based scoring breakdown to users after submission
4. THE Problem Creation System SHALL allow the admin to set dependencies between groups where passing one group is required to attempt another
5. WHEN calculating scores, THE Judge System SHALL aggregate points by group and apply group-level scoring rules

### Requirement 8

**User Story:** As a user, I want to see detailed feedback on my submissions, so that I can understand which test cases passed or failed and improve my solution

#### Acceptance Criteria

1. WHEN a submission is evaluated, THE Judge System SHALL return verdict information for each test case including status, execution time, and memory usage
2. WHERE test cases are visible (sample tests), THE Judge System SHALL show input, expected output, and actual output for failed cases
3. WHERE test cases are hidden, THE Judge System SHALL show only the verdict without revealing input or output
4. WHEN partial scoring is enabled, THE Judge System SHALL display the score breakdown by test case or group
5. THE Judge System SHALL provide aggregate statistics including total passed, total failed, and overall score percentage

### Requirement 9

**User Story:** As an admin, I want to clone and modify existing problems, so that I can create problem variations efficiently

#### Acceptance Criteria

1. WHEN viewing a problem in admin panel, THE Problem Creation System SHALL provide a clone option
2. WHEN cloning a problem, THE Problem Creation System SHALL copy all problem data including description, test cases, and configuration
3. THE Problem Creation System SHALL append a suffix to the cloned problem title and slug to ensure uniqueness
4. WHEN cloning a problem, THE Problem Creation System SHALL set the cloned problem status to draft
5. THE Problem Creation System SHALL allow the admin to modify any aspect of the cloned problem before publishing

### Requirement 10

**User Story:** As an admin, I want to import problems from standard formats, so that I can migrate problems from other platforms or share problem sets

#### Acceptance Criteria

1. THE Problem Creation System SHALL support importing problems from Polygon XML format
2. THE Problem Creation System SHALL support importing problems from DOMjudge problem package format
3. WHEN importing a problem, THE Problem Creation System SHALL validate the package structure and content
4. IF the import package is invalid, THE Problem Creation System SHALL display specific error messages indicating what is missing or incorrect
5. WHEN importing a problem, THE Problem Creation System SHALL map imported data to the platform's problem schema including test cases, checkers, and metadata
