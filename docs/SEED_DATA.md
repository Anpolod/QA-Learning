# Seed Data

This document explains how seed data is structured for the QA Learning Platform.

Seed data must be written in English.

## Seed Script

Seed entrypoint:

```text
backend/app/seed/seed_data.py
```

Run with Docker:

```bash
docker compose exec backend python -m app.seed.seed_data
```

Run locally:

```bash
cd backend
python -m app.seed.seed_data
```

## Seeded Users

Demo users:

```text
admin@example.com / Password123
student@example.com / Password123
```

Rules:

- Use safe demo credentials only.
- Do not seed real personal data.
- Do not seed real API keys.

## Course Structure

Seed creates three course sections:

```text
Manual QA
QA Automation
AI for QA
```

Each course has:

- title
- section key
- description
- at least one module
- MVP lessons
- final project

## Module Structure

Each seeded course starts with a foundation module.

Example:

```text
Course: Manual QA
Module: Manual QA Foundations
Description: Learn software testing fundamentals, test design, documentation, API basics, SQL, Git, Jira, and Agile.
```

Future seed expansion should add multiple modules per course, such as:

- Fundamentals
- Documentation
- Test Design
- API and SQL
- Tools and Agile
- Final Project

## Lesson Structure

Each seeded lesson includes:

- title
- short description
- learning goals
- theory
- key terms
- real-world example
- step-by-step explanation
- common mistakes
- practical use case
- summary
- order index

Current helper:

```python
lesson_payload(title, description)
```

This helper creates a complete lesson content block from a title and course description.

## Slides Structure

Each MVP lesson is seeded with 5 slides.

Fields:

- lesson ID
- title
- body
- order index
- image URL

Example:

```text
Title: Bug reports: Slide 1
Body: Key point 1: apply Bug reports through examples and practice.
```

Production content should expand slides to 5-10 per lesson with clearer learning steps.

## Slide Asset Import

The repository can use exported PNG slide decks from `docs/slides` as lesson visuals.

Expected asset flow:

1. Extract each zip deck into `backend/uploads/course-slides/<deck-slug>/`.
2. Run the import script:

```bash
cd backend
python -m app.seed.import_slide_assets
```

With Docker Compose:

```bash
docker compose exec backend python -m app.seed.import_slide_assets
```

The script updates `LessonSlide.image_url` for matching seeded lessons. It only updates seed-style slides whose titles follow this pattern:

```text
<Lesson title>: Slide <number>
```

This avoids overwriting custom admin-created slides.

## Homework Structure

Each lesson has one homework item.

Fields:

- lesson ID
- task description
- expected result
- allow file upload

Example:

```text
Task: Create a practical QA artifact for Bug reports.
Expected result: A concise, structured answer with expected results and evidence.
```

## Quiz Structure

Each lesson has one quiz.

MVP seed:

- 10 questions per lesson
- 3 answer options per question
- 1 correct answer
- explanation for wrong answers

Fields:

- quiz title
- question text
- question type
- explanation
- answer text
- is correct

Production quizzes should include:

- single choice
- multiple choice
- true/false
- scenario questions

## Examples Structure

Each lesson includes at least one example.

Fields:

- lesson ID
- title
- content

Example:

```text
Title: Real QA example
Content: A team releases a checkout page. QA checks critical flows, documents issues, and helps the team understand release risk.
```

## Interactive Task Structure

Each lesson includes one interactive task.

Fields:

- lesson ID
- task type
- prompt
- expected answer

Example:

```text
Task type: analysis
Prompt: Review a short requirement and identify one testing risk related to Bug reports.
Expected answer: A clear risk with a matching test idea.
```

## Final Projects

Seed creates one final project for each course:

### Manual QA Final Project

Requirements:

```text
Analyze a demo website, create checklist, test cases, bug reports, and a test summary report.
```

### QA Automation Final Project

Requirements:

```text
Create Playwright tests for login, form validation, API endpoints, reports, and GitHub Actions.
```

### AI for QA Final Project

Requirements:

```text
Use AI to analyze requirements, generate tests, verify output, improve tests, and create a QA report.
```

## Seeded Course Catalog

The main seed script creates the full topic catalog from the project prompt. Each seeded lesson receives the complete learning flow structure: theory, 5 slides, 1 practical example, 1 interactive task, 1 homework task, and 1 quiz with 10 questions.

Manual QA seeds 47 topics across these modules:

- QA Foundations.
- Testing Types.
- QA Documentation.
- Test Design Techniques.
- Technical Skills for Manual QA.

QA Automation seeds 40 topics across these modules:

- Programming Foundations.
- Web and Selector Foundations.
- Browser Automation.
- Automation Architecture.
- Reports, CI, and Scaling.

AI for QA seeds 24 topics across these modules:

- AI Foundations for QA.
- AI for Manual QA.
- AI for Technical QA.
- AI QA Workflow.

For very early development, teams may temporarily seed only the first few lessons from each course, but the main seed script should stay aligned with the full course catalog.

## Seed Data Expansion Rules

When adding seed content:

- Keep all content in English.
- Make lessons practical and beginner-friendly.
- Include realistic QA examples.
- Include evidence-based tasks.
- Include useful quiz explanations.
- Avoid vague filler content.
- Keep seed script idempotent where practical.
- Do not delete user-generated data during normal seed runs unless explicitly intended.
