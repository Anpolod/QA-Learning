# QA Learning Platform - Business Requirements

## 1. Project Goal

Create an online learning platform for QA education that helps students learn Manual QA, QA Automation, and AI for QA through structured lessons, practical examples, interactive tasks, homework, quizzes, progress tracking, final projects, and mock interview preparation.

The platform should guide a beginner toward job-ready QA skills.

## 2. Business Problem

Beginner QA students often learn from scattered materials and lack a clear practical path. Common gaps include:

- structured QA curriculum;
- realistic QA artifacts;
- homework with clear expected results;
- knowledge checks;
- mock interview preparation;
- guidance on using AI in QA work;
- visible progress and motivation.

## 3. Target Audience

Primary users:

- beginner QA students;
- people transitioning into IT;
- junior manual QA engineers;
- manual QA engineers moving toward automation;
- QA specialists who want to use AI in their workflow.

Secondary users:

- teachers;
- mentors;
- platform administrators.

## 4. Product Value

The platform should provide a practical learning loop:

```text
Course -> Module -> Lesson -> Theory -> Examples -> Slides -> Practice -> Homework -> Quiz -> Progress -> Final Project -> Interview Prep
```

Students should understand what they have completed, what remains, which skills they have practiced, and how ready they are for final projects or interviews.

## 5. Core Business Functions

The platform must support three learning tracks:

- Manual QA;
- QA Automation;
- AI for QA.

Each track should include:

- courses;
- modules;
- lessons;
- slides;
- practical examples;
- interactive tasks;
- homework;
- quizzes;
- final projects;
- progress tracking.

## 6. Learning Content Requirements

All student-facing learning content should be written in English.

Each lesson should include:

- title;
- short description;
- learning goals;
- theory explanation;
- key terms;
- real-world example;
- step-by-step explanation;
- common mistakes;
- practical use case;
- summary;
- slides;
- examples;
- interactive practice;
- homework;
- quiz.

The platform should include practical QA artifacts such as:

- checklists;
- traceability matrices;
- test plans;
- test cases;
- bug reports;
- test summary reports;
- AI prompts for QA tasks.

## 7. Mock Interview Requirements

The platform should provide a dedicated mock interview section.

The interview section should include popular QA interview questions grouped by topic:

- QA Foundations;
- SDLC and STLC;
- Test Design;
- QA Documentation;
- Testing Types;
- API and Web Testing;
- SQL, Git, Jira, and Agile;
- Automation Basics;
- AI for QA.

Each interview question should include:

- question;
- strong answer anchor;
- practice drill.

## 8. Student Requirements

A student should be able to:

- register an account;
- log in;
- be redirected to the dashboard after successful login;
- browse courses;
- open modules and lessons;
- view lesson slides;
- read examples;
- complete interactive practice;
- submit homework;
- pass quizzes;
- track learning progress;
- submit final projects;
- prepare for interviews;
- use the AI Assistant.

## 9. Admin Requirements

An administrator should be able to:

- manage courses;
- manage modules;
- manage lessons;
- manage slides;
- add and edit examples;
- create homework;
- create quiz questions;
- view student progress;
- review homework;
- review final projects;
- manage AI settings;
- view AI usage;
- generate AI images;
- attach generated images to learning content.

## 10. AI Assistant Requirements

The AI Assistant should help students:

- explain lesson topics;
- generate additional examples;
- generate practice tasks;
- generate extra quizzes;
- check homework;
- get help with automation QA.

AI requests must go through the backend. The frontend must not call OpenAI, OpenRouter, or other AI providers directly.

## 11. Progress Tracking Requirements

The platform should track:

- opened lessons;
- completed lessons;
- completed quizzes;
- submitted homework;
- final project submissions;
- certificate readiness;
- gamification progress.

The dashboard should show:

- current progress;
- recommended next lesson;
- completed lessons count;
- completed quizzes count;
- submitted homework count;
- AI usage;
- final project status.

## 12. Gamification Requirements

The platform should support:

- XP;
- levels;
- ranks;
- achievements;
- leaderboard;
- streak days.

Gamification should motivate students to complete lessons, quizzes, homework, and final projects.

## 13. Final Project Requirements

Each learning track should include a final project:

- Manual QA Final Project;
- Automation QA Final Project;
- AI QA Final Project.

Final projects should validate practical readiness. Administrators should be able to review submissions and assign a status.

## 14. Non-Functional Requirements

The platform should:

- run in a web browser;
- work on desktop and mobile layouts;
- support local launch with Docker Compose;
- expose backend API documentation;
- use PostgreSQL for persistent data;
- keep API keys out of frontend code;
- keep AI provider calls backend-only;
- have a clear project structure;
- support future course expansion.

## 15. Success Criteria

The project is successful when:

- students can complete the full flow from registration to final project;
- lessons contain theory, slides, examples, and practice;
- realistic QA artifacts are available;
- the mock interview section works;
- dashboard and progress tracking work;
- administrators can manage learning content;
- AI Assistant works through the backend;
- the project runs locally with Docker Compose.
