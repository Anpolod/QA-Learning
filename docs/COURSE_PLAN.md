# Course Plan

This document defines the learning structure for the Interactive QA Manual, QA Automation, and AI for QA platform.

All learner-facing course content must be written in English.

## Learning Loop

Each topic follows this loop:

Topic -> Theory -> Example -> Interactive Practice -> Homework -> Quiz -> Progress.

The purpose is to help students move from concept understanding to practical QA portfolio work.

## Manual QA Course Structure

Manual QA teaches software testing fundamentals, documentation, test design, API basics, SQL basics, tools, and Agile workflow.

Recommended full course topics:

1. QA / QC / Testing basics
2. What is software testing
3. Software Development Life Cycle (SDLC)
4. Software Testing Life Cycle (STLC)
5. Types of testing
6. Functional testing
7. Non-functional testing
8. Smoke testing
9. Sanity testing
10. Regression testing
11. Retesting
12. Exploratory testing
13. Usability testing
14. Compatibility testing
15. Cross-browser testing
16. Mobile testing basics
17. Web testing basics
18. Requirements analysis
19. Test scenarios
20. Test cases
21. Checklists
22. Bug reports
23. Bug life cycle
24. Test plan
25. Test strategy
26. Test design techniques
27. Equivalence partitioning
28. Boundary value analysis
29. Decision table testing
30. State transition testing
31. Pairwise testing
32. API testing basics
33. REST API basics
34. Postman basics
35. HTTP methods
36. HTTP status codes
37. JSON basics
38. SQL basics for QA
39. SELECT queries
40. Filtering data
41. JOIN basics
42. Git basics for QA
43. Jira basics
44. Agile / Scrum basics
45. QA documentation
46. Test summary report
47. Final Manual QA project

MVP seed lessons:

- QA / QC / Testing basics
- SDLC and STLC
- Bug reports

## QA Automation Course Structure

QA Automation teaches programming foundations, selectors, browser automation, test architecture, API automation, reporting, and CI/CD.

Recommended full course topics:

1. Programming basics for QA
2. Python or JavaScript basics
3. Variables
4. Data types
5. Conditions
6. Loops
7. Functions
8. Classes and OOP basics
9. Working with files
10. Error handling
11. HTML basics
12. CSS basics
13. DOM basics
14. Browser DevTools
15. XPath selectors
16. CSS selectors
17. Selenium basics
18. Playwright basics
19. Browser automation
20. Locators
21. Assertions
22. Waiting strategies
23. Page Object Model
24. Fixtures
25. Test data
26. Test structure
27. API automation
28. Playwright API testing
29. Selenium test examples
30. Reports
31. Allure reports
32. Screenshots and videos
33. Debugging failed tests
34. CI/CD basics
35. GitHub Actions
36. Docker basics
37. Environment variables
38. Test configuration
39. Parallel test execution
40. Final Automation QA project

MVP seed lessons:

- Programming basics for QA
- Playwright basics
- Page Object Model

## AI for QA Course Structure

AI for QA teaches responsible use of AI in test analysis, test generation, automation help, debugging, documentation, and verification.

Recommended full course topics:

1. What is AI in QA
2. How QA engineers can use AI
3. AI for requirements analysis
4. AI for generating test cases
5. AI for generating checklists
6. AI for generating bug reports
7. AI for test design techniques
8. AI for API testing
9. AI for SQL query help
10. AI for XPath and CSS selectors
11. AI for automation scripts
12. AI for Playwright tests
13. AI for Selenium tests
14. AI for debugging failed tests
15. AI for code review
16. AI for test data generation
17. AI for mock data
18. AI for test documentation
19. AI for test summary reports
20. AI agents in QA workflow
21. Risks and limits of AI in QA
22. How to verify AI-generated tests
23. Prompt engineering for QA
24. Final AI QA project

MVP seed lessons:

- What is AI in QA
- AI for generating test cases
- How to verify AI-generated tests

## Lesson Structure

Every lesson should include:

- Title
- Short description
- Learning goals
- Theory explanation
- Key terms
- Real-world example
- Step-by-step explanation
- Common mistakes
- Practical use case
- Summary
- Slides
- Examples
- Interactive practice
- Homework
- Quiz
- AI Assistant support

Example lesson content pattern:

```text
Title: Bug reports
Short description: Learn how to document software defects clearly.
Learning goals: Identify useful bug report fields and explain expected vs actual results.
Theory: A bug report is a communication artifact that helps a team reproduce, prioritize, and fix a defect.
Real-world example: A checkout button does not submit an order in Safari.
Interactive practice: Analyze a weak bug report and improve it.
Homework: Write a bug report for a failed login flow.
Quiz: 10-15 questions about bug report fields and quality.
```

## Homework Structure

Each homework item must include:

- Clear task description
- Expected result
- Text submission field
- Optional file upload placeholder
- AI homework checking option
- Teacher/admin review status

Good homework example:

```text
Task: Write three test cases for a login form.
Expected result: Each test case must include preconditions, steps, expected result, and priority.
```

## Quiz Structure

Each lesson quiz should include:

- 10-15 questions for full production content
- Single choice questions
- Multiple choice questions
- True/false questions
- Practical scenario questions
- Score calculation
- Wrong answer explanations
- Retry support
- Saved quiz attempt

MVP seed quizzes may start with 10 questions per lesson.

## Final Projects

### Manual QA Final Project

Students must:

- Analyze a demo website
- Create a checklist
- Create test cases
- Create bug reports
- Create a test summary report

### Automation QA Final Project

Students must:

- Create Playwright tests
- Test a login flow
- Test form validation
- Test an API endpoint
- Generate a report
- Explain how tests would run in CI

### AI for QA Final Project

Students must:

- Use AI to analyze requirements
- Generate test cases with AI
- Verify AI output manually
- Improve AI-generated tests
- Automate part of the tests
- Create a final QA report

## Progress Logic

Progress is tracked per user and lesson.

Tracked fields:

- `opened`
- `completed`
- `quiz_completed`
- `homework_submitted`
- `updated_at`

Progress rules:

- Opening a lesson marks it as opened.
- Submitting homework marks homework as submitted.
- Submitting a quiz marks quiz as completed.
- A perfect quiz score can mark the lesson as completed.
- Dashboard progress should calculate totals from database lessons, not hardcoded values.
- Certificate readiness should require lessons, quizzes, homework, and approved final projects.

Recommended future progress additions:

- Per-course progress
- Per-module progress
- Best quiz score
- Homework approval percentage
- Final project approval status
