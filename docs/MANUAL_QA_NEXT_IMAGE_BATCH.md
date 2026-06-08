# Manual QA Next Image Batch

## Target Topics

This batch covers the next Manual QA topics without slide images:

- State transition testing -> `state-transition-testing`
- Pairwise testing -> `pairwise-testing`
- JSON basics -> `json-basics`
- Jira basics -> `jira-basics`

Generated files should be copied as:

```text
backend/uploads/course-slides/<slug>/Slide_01.png
```

Then run:

```bash
docker compose exec backend python -m app.seed.import_slide_assets
docker compose exec backend python -m app.seed.report_missing_slide_images
```

## Prompts

### State Transition Testing

```text
Create one 16:9 educational slide image for a QA learning platform.

Course: Manual QA
Module: Test Design Techniques
Topic: State transition testing

Slide title text: "State Transition Testing"
Subtitle text: "Test valid and invalid paths between states"

Visual concept: an order lifecycle state machine diagram with states: Draft, Submitted, Paid, Shipped, Cancelled, Refunded. Show arrows for valid transitions and red blocked arrows for invalid transitions. Include a small QA test case panel with Current state, Action, Expected next state.

Style: Clean modern educational style, professional QA training slide, light background, teal and coral accents, crisp readable English text only. No real logos, no credentials, no API keys, no private data. Minimal text, strong visual metaphor, suitable for beginner QA students.
```

### Pairwise Testing

```text
Create one 16:9 educational slide image for a QA learning platform.

Course: Manual QA
Module: Test Design Techniques
Topic: Pairwise testing

Slide title text: "Pairwise Testing"
Subtitle text: "Reduce combinations while keeping strong coverage"

Visual concept: a testing matrix with parameters Browser, Device, User Role, Payment Method. Show many possible combinations fading into a smaller optimized pairwise set. Include a QA checklist panel: Choose factors, Select values, Generate pairs, Review risk.

Style: Clean modern educational style, professional QA training slide, light background, teal and coral accents, crisp readable English text only. No real logos, no credentials, no API keys, no private data. Minimal text, strong visual metaphor, suitable for beginner QA students.
```

### JSON Basics

```text
Create one 16:9 educational slide image for a QA learning platform.

Course: Manual QA
Module: Technical Skills for Manual QA
Topic: JSON basics

Slide title text: "JSON Basics"
Subtitle text: "Read API data as keys, values, objects, and arrays"

Visual concept: an API response viewer showing clean JSON with highlighted object braces, arrays, keys, strings, numbers, booleans, and null. Add a QA validation panel with Status, User ID, Email, Active flag, Error message.

Style: Clean modern educational style, professional QA training slide, light background, teal and coral accents, crisp readable English text only. No real logos, no credentials, no API keys, no private data. Minimal text, strong visual metaphor, suitable for beginner QA students.
```

### Jira Basics

```text
Create one 16:9 educational slide image for a QA learning platform.

Course: Manual QA
Module: Technical Skills for Manual QA
Topic: Jira basics

Slide title text: "Jira Basics"
Subtitle text: "Track bugs, tasks, status, priority, and team ownership"

Visual concept: a generic issue board, not real Jira branding, with columns To Do, In Progress, Ready for Retest, Done. Show a bug ticket card with fields Summary, Steps, Severity, Priority, Assignee, Evidence. Include a QA comment bubble.

Style: Clean modern educational style, professional QA training slide, light background, teal and coral accents, crisp readable English text only. No real logos, no credentials, no API keys, no private data. Minimal text, strong visual metaphor, suitable for beginner QA students.
```
