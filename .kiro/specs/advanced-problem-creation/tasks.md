# Implementation Plan: Advanced Problem Creation System

- [x] 1. Update database schema with advanced problem features


  - Add new enums (ProblemType, ValidationStrategy, ProblemStatus, TestCaseVisibility) to Prisma schema
  - Add advanced fields to Problem model (problemType, validationStrategy, floatingPointEpsilon, enablePartialScoring, maxSourceSize, allowedLanguages, hints, examples, languageTimeLimits, languageMemoryLimits, status)
  - Add enhanced fields to TestCase model (visibility, timeLimit, memoryLimit, description, groupId)
  - Create TestCaseGroup model with relationships
  - Create CustomChecker model with relationships
  - Create TestCaseResult model for detailed submission feedback
  - Update Submission model with score and enhanced fields
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 5.1, 7.1_



- [ ] 2. Implement validation service for multiple strategies
  - Create ValidationService class with interface for all validation strategies
  - Implement exactMatch validation method
  - Implement ignoreWhitespace validation method
  - Implement tokenBased validation method
  - Implement floatingPoint validation method with epsilon tolerance
  - Implement customChecker validation method with checker execution
  - Add validation result types and error handling
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ] 3. Implement custom checker compiler and executor service
  - Create CheckerCompilerService class
  - Implement checker compilation for C++ checkers
  - Implement checker compilation for Python checkers
  - Implement checker executor with sandboxing
  - Add checker validation and syntax checking
  - Implement checker timeout and resource limits


  - Add error handling for compilation and runtime errors
  - _Requirements: 1.2, 1.3, 5.5_

- [ ] 4. Enhance problem service with advanced features
  - Update createProblem method to accept advanced configuration
  - Add support for test case groups in problem creation
  - Add support for custom checker in problem creation
  - Implement problem validation logic (check test cases, groups, dependencies)
  - Add language-specific time and memory limits support
  - Implement hints and examples storage
  - Add problem status management (DRAFT, PUBLISHED, ARCHIVED)
  - _Requirements: 1.1, 2.1, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.5, 5.4_

- [ ] 5. Implement test case group management
  - Create TestCaseGroupService class
  - Implement createGroup method with validation
  - Implement updateGroup method
  - Implement deleteGroup method with cascade handling
  - Implement group dependency validation (prevent circular dependencies)
  - Add group reordering functionality
  - Implement getGroupsByProblem method
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 6. Enhance judge service with partial scoring and group evaluation
  - Update judgeSubmission method to support validation strategies
  - Implement partial scoring calculation based on test case weights
  - Implement group-based evaluation logic
  - Add support for group dependencies (skip dependent groups if prerequisite fails)
  - Implement detailed test case result storage
  - Update verdict determination logic for partial scoring
  - Add execution time and memory tracking per test case
  - _Requirements: 2.6, 5.3, 7.3, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Implement problem testing with reference solutions
  - Create ProblemTestService class
  - Implement testProblem method to run reference solution against all test cases
  - Add reference solution execution and result comparison
  - Implement test result aggregation and reporting
  - Add validation to prevent publishing problems without passing reference solution
  - Create API endpoint for problem testing
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Implement problem cloning functionality
  - Add cloneProblem method to ProblemService
  - Implement deep copy of problem data (description, test cases, groups, checker)
  - Generate unique slug for cloned problem
  - Set cloned problem status to DRAFT
  - Copy all test cases with proper ordering
  - Copy test case groups and maintain relationships
  - Copy custom checker if present
  - Create API endpoint for problem cloning
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9. Implement test case batch import functionality
  - Create TestCaseImportService class
  - Implement CSV import parser
  - Implement JSON import parser
  - Implement ZIP import handler (for large test cases)



  - Add validation for imported test case data
  - Implement bulk test case creation
  - Create API endpoint for test case import
  - _Requirements: 2.3_

- [ ] 10. Create enhanced problem creation form UI
  - Update problem creation page component structure
  - Add problem type selector (STANDARD, INTERACTIVE, OUTPUT_ONLY)
  - Add validation strategy selector component
  - Add epsilon input for floating point validation
  - Add custom checker editor with syntax highlighting
  - Add language restrictions multi-select
  - Add max source size input
  - Add partial scoring toggle
  - Update form submission to include all advanced fields
  - _Requirements: 1.1, 1.2, 1.4, 3.1, 3.4, 4.6, 5.1, 5.4_

- [ ] 11. Create performance constraints configuration UI
  - Add time limit input with millisecond precision
  - Add memory limit input in megabytes
  - Create language-specific limits editor component
  - Add table/form for setting per-language time limits
  - Add table/form for setting per-language memory limits
  - Implement validation for constraint values
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 12. Create test case manager UI component
  - Create TestCaseManager component with tabs for groups and test cases
  - Implement test case list with visibility badges
  - Add test case form with all fields (input, output, visibility, points, group)
  - Implement drag-and-drop reordering for test cases
  - Add test case delete confirmation
  - Add test case summary panel (total, by visibility, total points)
  - Implement test case search and filtering
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 13. Create test case group manager UI component
  - Create TestCaseGroupManager component
  - Implement group list with expand/collapse
  - Add group creation form (name, description, points, dependencies)
  - Implement group editing and deletion
  - Add group dependency selector (dropdown of other groups)
  - Implement drag-and-drop reordering for groups
  - Show test cases assigned to each group
  - Add validation for circular dependencies in UI
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 14. Create test case import UI component
  - Create TestCaseImporter component with file upload
  - Add format selector (CSV, JSON, ZIP)
  - Implement file upload handler
  - Add import preview before confirmation
  - Show import progress indicator
  - Display import results (success count, errors)
  - Add CSV/JSON format documentation
  - _Requirements: 2.3_

- [ ] 15. Create custom checker editor UI component
  - Create CustomCheckerEditor component with code editor
  - Integrate Monaco Editor or CodeMirror for syntax highlighting
  - Add language selector for checker (C++, Python)
  - Implement checker validation button
  - Show validation results (syntax errors, warnings)
  - Add checker template selector with examples
  - Display checker documentation and API reference
  - _Requirements: 1.2, 1.3, 5.5_

- [ ] 16. Create problem tester UI component
  - Create ProblemTester component
  - Add reference solution upload form (code + language)
  - Implement test run button
  - Show test execution progress
  - Display test results table (test case, verdict, time, memory)
  - Highlight failing test cases
  - Show diff for failed test cases
  - Add publish validation warning if tests fail
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 17. Create examples and hints editor UI component
  - Create ExamplesEditor component
  - Add example form (input, output, explanation)
  - Implement markdown editor for explanations
  - Add example reordering
  - Create HintsEditor component
  - Add hint form with markdown support
  - Implement hint reordering
  - Add LaTeX support for mathematical expressions
  - _Requirements: 4.4, 4.5, 4.6_

- [ ] 18. Implement detailed submission results display
  - Create DetailedSubmissionResults component
  - Display overall verdict and score
  - Show test case results table with verdict, time, memory
  - Display input/output for SAMPLE visibility test cases
  - Show only verdict for HIDDEN test cases
  - Implement group results section with score breakdown
  - Add execution statistics (avg time, max memory)
  - Show partial score progress bar
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 19. Update API routes for advanced problem features
  - Update POST /api/admin/problems to accept advanced configuration
  - Update PUT /api/admin/problems/:id to accept advanced configuration
  - Create POST /api/admin/problems/:id/test endpoint
  - Create POST /api/admin/problems/:id/clone endpoint
  - Create POST /api/admin/problems/:id/checker/validate endpoint
  - Create POST /api/admin/problems/:id/checker/compile endpoint
  - Create GET /api/admin/problems/:id/test-cases endpoint
  - Create POST /api/admin/problems/:id/test-cases/import endpoint
  - Create GET /api/submissions/:id/detailed-results endpoint
  - _Requirements: All requirements_

- [ ] 20. Implement problem import/export functionality
  - Create ProblemImportExportService class
  - Implement Polygon XML format parser
  - Implement DOMjudge problem package parser
  - Add problem package validation
  - Implement data mapping from external formats to internal schema
  - Create export functionality for Polygon format
  - Create export functionality for DOMjudge format
  - Create API endpoints for import/export
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 21. Create problem import/export UI
  - Create ProblemImporter component with file upload
  - Add format selector (Polygon, DOMjudge)
  - Show import validation results
  - Display import preview with problem details
  - Add import confirmation step
  - Create ProblemExporter component
  - Add export format selector
  - Implement download handler for exported files
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 22. Implement database migration script
  - Create Prisma migration for new schema changes
  - Write data migration script for existing problems
  - Set default values for new fields on existing problems
  - Migrate existing test cases to new structure
  - Set first test case of each problem to SAMPLE visibility
  - Test migration on development database
  - Create rollback script for migration
  - _Requirements: All requirements_

- [ ] 23. Add validation and error handling
  - Implement ProblemValidationError class
  - Add validation for test case points (must sum to expected total if required)
  - Validate group dependencies (no circular dependencies)
  - Validate custom checker syntax before saving
  - Add validation for epsilon value (must be positive)
  - Implement CheckerError class for checker-specific errors
  - Implement ImportError class for import-specific errors
  - Add comprehensive error messages for all validation failures
  - _Requirements: 1.3, 1.4, 7.4, 10.4_

- [ ] 24. Implement security measures for custom checkers
  - Add checker code sanitization
  - Implement checker execution sandboxing using Docker containers
  - Set strict time limits for checker execution (5 seconds max)
  - Set strict memory limits for checker execution
  - Validate checker code for malicious patterns
  - Add audit logging for checker compilation and execution
  - Implement rate limiting for checker operations
  - _Requirements: 1.2, 1.3, 5.5_

- [ ] 25. Add caching for performance optimization
  - Implement Redis caching for compiled checkers
  - Cache problem configurations for active problems
  - Cache validation strategy configurations
  - Add cache invalidation on problem updates
  - Implement cache warming for frequently accessed problems
  - Add cache hit/miss metrics
  - _Requirements: All requirements (performance optimization)_

- [ ] 26. Update problem list and detail pages
  - Add problem status badge (DRAFT, PUBLISHED, ARCHIVED) to problem list
  - Add validation strategy indicator to problem details
  - Show partial scoring indicator if enabled
  - Display allowed languages if restricted
  - Show test case count and visibility breakdown
  - Add problem testing status indicator
  - Update problem edit page with all new fields
  - _Requirements: 4.1, 4.2, 4.3, 5.4_

- [ ] 27. Create admin documentation for advanced features
  - Write documentation for validation strategies
  - Create custom checker writing guide with examples
  - Document test case group usage and best practices
  - Add problem import/export format specifications
  - Create troubleshooting guide for common issues
  - Add video tutorials for complex features
  - Document API endpoints with examples
  - _Requirements: 1.2, 4.6, 5.5, 10.1, 10.2_

- [ ] 28. Write comprehensive tests
- [ ] 28.1 Write unit tests for ValidationService
  - Test each validation strategy independently
  - Test edge cases (empty output, special characters, unicode)
  - Test floating point comparison with various epsilon values
  - Test custom checker execution and error handling
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ] 28.2 Write unit tests for ProblemService
  - Test problem creation with all configurations
  - Test problem validation logic
  - Test problem cloning
  - Test slug generation and uniqueness
  - _Requirements: 4.1, 4.2, 4.3, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 28.3 Write unit tests for JudgeService
  - Test partial scoring calculation
  - Test group-based evaluation
  - Test verdict determination
  - Test performance limit enforcement
  - _Requirements: 2.6, 7.3, 7.5, 8.1, 8.4, 8.5_

- [ ] 28.4 Write integration tests for problem creation flow
  - Test end-to-end problem creation with all features
  - Test problem with custom checker submission
  - Test problem with test case groups submission
  - Test problem testing with reference solution
  - _Requirements: All requirements_

- [ ] 28.5 Write integration tests for submission evaluation
  - Test submission with exact match validation
  - Test submission with floating point validation
  - Test submission with custom checker
  - Test submission with partial scoring
  - Test submission with group dependencies
  - _Requirements: 1.1, 1.4, 1.5, 2.6, 7.3, 7.4, 7.5_
