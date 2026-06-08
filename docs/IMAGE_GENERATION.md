# GPT Image Generation

This document describes GPT Image generation for educational QA content.

Image generation is an admin/course creator feature. It must run through the backend only.

## How Image Generation Works

Flow:

1. Admin enters a prompt in the frontend.
2. Admin selects image target type, style, and size.
3. Frontend sends prompt metadata to backend.
4. Backend loads lesson/module context.
5. Backend enhances the prompt for educational clarity.
6. Backend calls OpenAI GPT Image.
7. Backend stores the image file in uploads.
8. Backend saves metadata in `AiGeneratedImage`.
9. Frontend displays preview and image history.
10. Admin can attach the image to course content.

The frontend must never call OpenAI directly.

## Admin Panel Usage

Admin image generation UI should support:

- prompt textarea
- image type selector
- style selector
- size selector
- generate button
- regenerate button
- preview
- history
- attach to slide
- future attach targets for lesson cover, example, quiz, homework, and interactive task

Current practical workflow:

1. Open admin panel.
2. Generate an image for a lesson.
3. Preview the generated image.
4. Attach the generated image to a selected slide.
5. Open the lesson page and verify the slide image renders.

## Supported Image Types

Supported `targetType` values:

```text
lesson_cover
slide_image
diagram
workflow
bug_example
ui_mockup
quiz_image
homework_image
interactive_task_image
```

Use cases:

- `lesson_cover`: visual for lesson start
- `slide_image`: illustration for slide-style content
- `diagram`: SDLC, STLC, bug lifecycle, testing pyramid
- `workflow`: QA process flow
- `bug_example`: screenshot-like defect example
- `ui_mockup`: realistic UI for testing practice
- `quiz_image`: visual question material
- `homework_image`: homework visual material
- `interactive_task_image`: practice task visual

## Supported Styles

Supported `style` values:

```text
clean_educational
modern_flat
minimal_diagram
isometric
realistic_ui_mockup
dark_tech
friendly_learning
```

Style guidance:

- Use `clean_educational` for most beginner lessons.
- Use `minimal_diagram` for SDLC, STLC, bug lifecycle, and workflows.
- Use `realistic_ui_mockup` for bug examples and UI testing tasks.
- Use `dark_tech` sparingly for automation and AI topics.

## Backend Endpoint

Endpoint:

```http
POST /api/ai/images/generate
```

Request:

```json
{
  "prompt": "Bug lifecycle diagram",
  "lessonId": "1",
  "targetType": "diagram",
  "style": "minimal_diagram",
  "size": "1024x1024"
}
```

Response:

```json
{
  "imageUrl": "/uploads/ai-images/example.png",
  "imageId": "generated-id",
  "prompt": "Bug lifecycle diagram",
  "targetType": "diagram",
  "style": "minimal_diagram"
}
```

## Storage Logic

MVP storage:

```text
backend/uploads/ai-images/
```

The backend mounts uploads at:

```text
/uploads
```

Example public image URL:

```text
/uploads/ai-images/image-id.png
```

Future storage providers can replace local storage:

- Amazon S3
- Cloudflare R2
- Google Cloud Storage
- Azure Blob Storage

Keep storage logic isolated enough that replacing local files does not require frontend changes.

## AiGeneratedImage Model

Fields:

```text
id
user_id
lesson_id
prompt
enhanced_prompt
image_url
target_type
style
provider
model
created_at
```

Purpose:

- track generated images
- show admin history
- support later attachment workflows
- support audit/cost analysis

## Limits

Image generation has separate limits from text AI:

```env
AI_DAILY_IMAGE_LIMIT_PER_USER=10
AI_DAILY_IMAGE_LIMIT_ADMIN=100
```

The backend must check limits before calling the image provider.

## Validation

Validate:

- prompt is not empty
- prompt length is reasonable
- lesson ID is valid or safely handled
- target type is one of supported values
- style is one of supported values
- size is one of supported values
- user is allowed to generate images
- user/admin has not exceeded daily image limit

Supported sizes:

```text
1024x1024
1024x1536
1536x1024
```

## Prompt Enhancement

The backend should enhance prompts with:

- course section
- module title
- lesson title
- selected target type
- selected style
- educational purpose

Example user prompt:

```text
Bug lifecycle diagram
```

Enhanced prompt:

```text
Create a clean educational diagram explaining the bug lifecycle for beginner QA students.
Include stages: New, Assigned, In Progress, Fixed, Retest, Verified, Closed, Reopened.
Use minimal diagram style, clear arrows, readable labels, and no decorative clutter.
```

## Prompt Examples

### SDLC Diagram

```text
Create a minimal educational SDLC diagram for beginner QA students, showing planning, design, development, testing, release, and maintenance.
```

### Bug Example

```text
Create a realistic UI mockup showing a checkout form validation bug where the error message is missing after invalid card input.
```

### API Testing Visual

```text
Create a clean workflow diagram showing a QA engineer sending a GET request, checking status code 200, validating JSON fields, and documenting evidence.
```

### Automation Concept

```text
Create a friendly learning illustration of Playwright tests running in a browser with locators, assertions, and a report summary.
```
