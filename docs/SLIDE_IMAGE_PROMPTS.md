# Slide Image Prompt Plan

## Current Status

The project already uses exported PNG decks from `docs/slides` for many lesson slides. After re-running the asset import, 58 current course topics still have no slide images attached.

Use this document to generate missing visual slide decks with NotebookLM, GPT Image, or another image/deck tool.

## Recommended Output Format

For each topic, generate:

- 5 PNG slides.
- 16:9 aspect ratio.
- English text only.
- Clean educational QA course style.
- Clear title on each slide.
- Minimal text, strong visual metaphor.
- No fake company logos.
- No real API keys, credentials, private data, or copyrighted UI.

Suggested file naming:

```text
Slide_01.png
Slide_02.png
Slide_03.png
Slide_04.png
Slide_05.png
```

Suggested folder naming:

```text
backend/uploads/course-slides/<topic-slug>/
```

## Master Prompt

Use this prompt with NotebookLM or GPT Image for each topic by replacing `{TOPIC}`, `{COURSE}`, and `{MODULE}`.

```text
Create a 5-slide educational visual deck for a QA learning platform.

Course: {COURSE}
Module: {MODULE}
Topic: {TOPIC}

Requirements:
- English text only.
- 16:9 slide format.
- Clean modern educational style for software QA students.
- Use practical software testing visuals: browser windows, API panels, database tables, checklists, test reports, code editors, bug reports, workflows, diagrams, and QA artifacts when relevant.
- Each slide must have a clear title and one concise teaching point.
- Avoid dense paragraphs.
- Avoid real brand logos, real credentials, real API keys, and private data.
- Make the deck useful for beginners who want to become job-ready QA engineers.

Slide structure:
1. Topic overview and why it matters.
2. Key concept or mental model.
3. Practical workflow or example.
4. Common mistake or risk.
5. Summary checklist or takeaways.
```

## Missing Topics

### Manual QA / Testing Types

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Smoke testing
Use a release build dashboard, critical path checklist, and pass/fail visual metaphor.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Sanity testing
Use a focused bug-fix verification scene, changed feature area, and quick confidence check visual metaphor.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Regression testing
Use a before/after release workflow, unchanged features, and safety net visual metaphor.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Retesting
Use a bug report, fixed build, and verification loop visual metaphor.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Exploratory testing
Use a tester exploring a product map, notes, risks, and session-based testing visual metaphor.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Usability testing
Use user journey, friction points, form errors, and accessibility-friendly interface visuals.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Cross-browser testing
Use multiple browser windows, layout differences, responsive screens, and compatibility matrix visuals.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Testing Types
Topic: Web testing basics
Use browser UI, forms, links, network requests, cookies, and user flow visuals.
Follow the Master Prompt requirements.
```

### Manual QA / QA Documentation

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: QA Documentation
Topic: Test plan
Use scope, risks, schedule, environments, responsibilities, and exit criteria visuals.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: QA Documentation
Topic: Test strategy
Use high-level testing approach, risk levels, test types, automation/manual split, and release quality gates visuals.
Follow the Master Prompt requirements.
```

### Manual QA / Test Design Techniques

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Test Design Techniques
Topic: Decision table testing
Use business rules, condition/action tables, checkout discount rules, and expected outcomes visuals.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Test Design Techniques
Topic: State transition testing
Use account status changes, order lifecycle, valid/invalid transitions, and state machine visuals.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Test Design Techniques
Topic: Pairwise testing
Use combinations of browser, device, user role, and payment method with reduced test set visuals.
Follow the Master Prompt requirements.
```

### Manual QA / Technical Skills

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Technical Skills for Manual QA
Topic: JSON basics
Use JSON object, arrays, keys, values, API response, and validation visuals.
Follow the Master Prompt requirements.
```

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: Manual QA
Module: Technical Skills for Manual QA
Topic: Jira basics
Use issue board, bug ticket, status workflow, priority, assignee, and QA comments visuals.
Follow the Master Prompt requirements.
```

### QA Automation / Programming Foundations

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: QA Automation
Module: Programming Foundations
Topic: {TOPIC}
Use a code editor, simple JavaScript or Python-like pseudocode, test data, and automation-friendly examples.
Follow the Master Prompt requirements.
```

Topics:

- Programming basics for QA
- Python or JavaScript basics
- Variables
- Data types
- Conditions
- Loops
- Functions
- Classes and OOP basics
- Working with files
- Error handling

### QA Automation / Web and Selector Foundations

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: QA Automation
Module: Web and Selector Foundations
Topic: {TOPIC}
Use browser DevTools, DOM tree, highlighted elements, selectors, forms, buttons, and test automation visuals.
Follow the Master Prompt requirements.
```

Topics:

- HTML basics
- CSS basics
- DOM basics
- Browser DevTools
- XPath selectors
- CSS selectors

### QA Automation / Browser Automation

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: QA Automation
Module: Browser Automation
Topic: Selenium basics
Use browser automation, WebDriver flow, locators, actions, assertions, and test execution visuals.
Follow the Master Prompt requirements.
```

### QA Automation / Automation Architecture

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: QA Automation
Module: Automation Architecture
Topic: {TOPIC}
Use test project structure, Page Object Model, fixtures, test data, API setup, and maintainable automation architecture visuals.
Follow the Master Prompt requirements.
```

Topics:

- Page Object Model
- Fixtures
- Test data
- Test structure
- API automation
- Selenium test examples

### QA Automation / Reports, CI, and Scaling

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: QA Automation
Module: Reports, CI, and Scaling
Topic: {TOPIC}
Use CI pipeline, terminal output, test reports, screenshots, parallel workers, and release feedback visuals.
Follow the Master Prompt requirements.
```

Topics:

- Reports
- Allure reports
- Screenshots and videos
- Parallel test execution

### AI for QA / AI Foundations

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: AI for QA
Module: AI Foundations for QA
Topic: {TOPIC}
Use AI assistant, QA engineer review, prompt/context/output flow, risk checks, and human validation visuals.
Follow the Master Prompt requirements.
```

Topics:

- What is AI in QA
- Risks and limits of AI in QA
- Prompt engineering for QA

### AI for QA / AI for Manual QA

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: AI for QA
Module: AI for Manual QA
Topic: {TOPIC}
Use requirements, generated QA artifacts, human review checklist, corrections, and traceability visuals.
Follow the Master Prompt requirements.
```

Topics:

- AI for requirements analysis
- AI for generating test cases
- AI for generating checklists
- AI for test design techniques

### AI for QA / AI for Technical QA

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: AI for QA
Module: AI for Technical QA
Topic: {TOPIC}
Use AI-assisted code review, selector debugging, API checks, automation scripts, failed test diagnostics, and human verification visuals.
Follow the Master Prompt requirements.
```

Topics:

- AI for API testing
- AI for XPath and CSS selectors
- AI for automation scripts
- AI for Selenium tests
- AI for debugging failed tests
- AI for code review

### AI for QA / AI QA Workflow

Use this same prompt pattern for each topic below:

```text
Create a 5-slide educational visual deck for a QA learning platform.
Course: AI for QA
Module: AI QA Workflow
Topic: {TOPIC}
Use prompt input, generated data, review gates, test evidence, and responsible AI workflow visuals.
Follow the Master Prompt requirements.
```

Topics:

- AI for test data generation
- AI for mock data
- How to verify AI-generated tests

## After Generating Images

1. Put generated PNG files into:

```text
backend/uploads/course-slides/<topic-slug>/
```

2. Add the deck mapping to:

```text
backend/app/seed/import_slide_assets.py
```

3. Run:

```bash
docker compose exec backend python -m app.seed.import_slide_assets
```

4. Verify lesson pages in the browser.
