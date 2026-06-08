# AI Assistant

This document describes the AI Assistant used in the QA Learning Platform.

The assistant is a core feature. It is not optional.

## Goals

The AI Assistant helps students:

- understand QA concepts in simpler language
- get extra examples
- practice with additional tasks
- generate extra quiz questions
- improve homework submissions
- debug automation problems
- learn responsible AI use in QA

The assistant must be friendly, beginner-friendly, and practical. It should teach students how to think, not only provide final answers.

## Supported Modes

The backend supports these modes:

```text
explain
generate_task
generate_quiz
check_homework
automation_help
```

The response type maps to:

```text
explain -> explanation
generate_task -> task
generate_quiz -> quiz
check_homework -> feedback
automation_help -> code_help
```

## Explain Mode

Purpose: explain the current lesson topic in simple terms.

Useful for:

- beginner summaries
- analogies
- step-by-step explanations
- examples
- clarifying key terms

Example prompt:

```text
Explain regression testing in simple words with one real QA example.
```

Expected behavior:

- Use lesson context.
- Keep answer concise unless the student asks for depth.
- Use clear English.

## Generate Task Mode

Purpose: create extra practice tasks for the current lesson.

Example prompt:

```text
Generate 5 practice tasks for writing bug reports.
```

Expected behavior:

- Return practical tasks students can complete.
- Include realistic QA scenarios.
- Avoid tasks unrelated to the current lesson.

Persistence:

- Generated task responses should be saved in `AiGeneratedTask`.

## Generate Quiz Mode

Purpose: generate extra quizzes beyond the default stored quiz.

Example prompt:

```text
Generate a 5-question quiz about API status codes.
```

Preferred response format:

```json
{
  "questions": [
    {
      "type": "single",
      "question": "Which HTTP status code means Not Found?",
      "options": ["200", "201", "404", "500"],
      "correctAnswer": "404",
      "explanation": "404 means the requested resource was not found."
    }
  ]
}
```

Expected behavior:

- Prefer structured JSON.
- Include single, multiple, true/false, and scenario questions when useful.
- Include explanations.

Persistence:

- Generated quiz responses should be saved in `AiGeneratedQuiz`.

## Check Homework Mode

Purpose: help students improve homework.

Example prompt:

```text
Check this homework and guide me without simply replacing my work.
```

Expected behavior:

- Give feedback.
- Explain what is missing.
- Suggest improvements.
- Avoid simply doing the full assignment for the student.

Recommended structure:

```text
What is good:
- ...

What to improve:
- ...

Next step:
- ...
```

## Automation Help Mode

Purpose: help with QA automation topics.

Supported topics:

- XPath selectors
- CSS selectors
- Playwright tests
- Selenium tests
- Page Object Model
- assertions
- waits
- failed test debugging
- API automation

Example prompt:

```text
Why does this Playwright locator fail, and how can I make it stable?
```

Expected behavior:

- Explain the cause.
- Provide clean code examples when needed.
- Prefer stable locators.
- Mention verification steps.

## Backend Endpoint Structure

Endpoint:

```http
POST /api/ai/chat
```

Request:

```json
{
  "message": "Explain this topic",
  "lessonId": "1",
  "mode": "explain"
}
```

Response:

```json
{
  "answer": "Regression testing checks that existing features still work after changes.",
  "type": "explanation"
}
```

Backend flow:

1. Validate request.
2. Check daily usage limit.
3. Load lesson context.
4. Build system/user prompt.
5. Select provider.
6. Call OpenAI or OpenRouter.
7. Save chat session and messages.
8. Save generated task/quiz artifact when relevant.
9. Save usage log.
10. Return response.

## Frontend UI Behavior

The lesson page includes a floating AI Assistant button.

The assistant sidebar should provide:

- message history
- quick actions
- mode selector
- loading state
- error state
- copy answer button
- clear chat button
- structured quiz rendering when JSON is returned

Quick actions:

- Explain this topic
- Give me more examples
- Generate practice task
- Generate extra quiz
- Check my homework
- Help with automation

## Database Models

AI chat and usage models:

- `AiChatSession`
- `AiChatMessage`
- `AiGeneratedTask`
- `AiGeneratedQuiz`
- `AiHomeworkFeedback`
- `AiUsageLog`

Important fields:

```text
AiChatSession:
- user_id
- lesson_id
- created_at

AiChatMessage:
- session_id
- role
- content
- created_at

AiUsageLog:
- user_id
- lesson_id
- mode
- provider
- model
- request_type
- created_at
```

## Usage Limits

Text AI usage is limited by:

```env
AI_DAILY_LIMIT_PER_USER=50
```

Image usage is limited separately:

```env
AI_DAILY_IMAGE_LIMIT_PER_USER=10
AI_DAILY_IMAGE_LIMIT_ADMIN=100
```

When a limit is reached, the backend should return a clear 429 error.

## Safety Rules

- Never expose API keys to frontend.
- All AI requests must go through backend.
- Do not ask the model to reveal secrets.
- Do not store API keys in database unless encrypted and intentionally designed later.
- For homework, guide students instead of replacing their work.
- For generated tests, remind students to verify AI output.
- Avoid very long answers unless requested.
- Keep assistant output in English.
