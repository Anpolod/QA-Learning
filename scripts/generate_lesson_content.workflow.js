export const meta = {
  name: 'generate-lesson-content',
  description: 'Author real QA course content (theory, example, task, homework, quiz) for all 111 lessons, one agent per module',
  phases: [{ title: 'Generate', detail: 'one agent per module writes a content JSON file' }],
}

const DIR = '/Users/andriipolodiienko/Documents/dev/projects/QA Education/qa-learning-platform/backend/app/seed/content'

const MODULES = [
  { slug: 'm01_qa_foundations', course: 'Manual QA', module: 'QA Foundations',
    lessons: ['QA / QC / Testing basics', 'What is software testing', 'Software Development Life Cycle - SDLC', 'Software Testing Life Cycle - STLC'] },
  { slug: 'm02_testing_types', course: 'Manual QA', module: 'Testing Types',
    lessons: ['Types of testing', 'Functional testing', 'Non-functional testing', 'Smoke testing', 'Sanity testing', 'Regression testing', 'Retesting', 'Exploratory testing', 'Usability testing', 'Compatibility testing', 'Cross-browser testing', 'Mobile testing basics', 'Web testing basics'] },
  { slug: 'm03_qa_documentation', course: 'Manual QA', module: 'QA Documentation',
    lessons: ['Requirements analysis', 'Test scenarios', 'Test cases', 'Checklists', 'Bug reports', 'Bug life cycle', 'Test plan', 'Test strategy'] },
  { slug: 'm04_test_design', course: 'Manual QA', module: 'Test Design Techniques',
    lessons: ['Test design techniques', 'Equivalence partitioning', 'Boundary value analysis', 'Decision table testing', 'State transition testing', 'Pairwise testing'] },
  { slug: 'm05_technical_skills', course: 'Manual QA', module: 'Technical Skills for Manual QA',
    lessons: ['API testing basics', 'REST API basics', 'Postman basics', 'HTTP methods', 'HTTP status codes', 'JSON basics', 'SQL basics for QA', 'SELECT queries', 'Filtering data', 'JOIN basics', 'Git basics for QA', 'Jira basics', 'Agile / Scrum basics', 'QA documentation', 'Test summary report', 'Final Manual QA project'] },
  { slug: 'm06_programming_foundations', course: 'QA Automation', module: 'Programming Foundations',
    lessons: ['Programming basics for QA', 'Python or JavaScript basics', 'Variables', 'Data types', 'Conditions', 'Loops', 'Functions', 'Classes and OOP basics', 'Working with files', 'Error handling'] },
  { slug: 'm07_web_selectors', course: 'QA Automation', module: 'Web and Selector Foundations',
    lessons: ['HTML basics', 'CSS basics', 'DOM basics', 'Browser DevTools', 'XPath selectors', 'CSS selectors'] },
  { slug: 'm08_browser_automation', course: 'QA Automation', module: 'Browser Automation',
    lessons: ['Selenium basics', 'Playwright basics', 'Browser automation', 'Locators', 'Assertions', 'Waiting strategies'] },
  { slug: 'm09_automation_architecture', course: 'QA Automation', module: 'Automation Architecture',
    lessons: ['Page Object Model', 'Fixtures', 'Test data', 'Test structure', 'API automation', 'Playwright API testing', 'Selenium test examples'] },
  { slug: 'm10_reports_ci_scaling', course: 'QA Automation', module: 'Reports, CI, and Scaling',
    lessons: ['Reports', 'Allure reports', 'Screenshots and videos', 'Debugging failed tests', 'CI/CD basics', 'GitHub Actions', 'Docker basics', 'Environment variables', 'Test configuration', 'Parallel test execution', 'Final Automation QA project'] },
  { slug: 'm11_ai_foundations', course: 'AI for QA', module: 'AI Foundations for QA',
    lessons: ['What is AI in QA', 'How QA engineers can use AI', 'Risks and limits of AI in QA', 'Prompt engineering for QA'] },
  { slug: 'm12_ai_manual', course: 'AI for QA', module: 'AI for Manual QA',
    lessons: ['AI for requirements analysis', 'AI for generating test cases', 'AI for generating checklists', 'AI for generating bug reports', 'AI for test design techniques', 'AI for test documentation', 'AI for test summary reports'] },
  { slug: 'm13_ai_technical', course: 'AI for QA', module: 'AI for Technical QA',
    lessons: ['AI for API testing', 'AI for SQL query help', 'AI for XPath and CSS selectors', 'AI for automation scripts', 'AI for Playwright tests', 'AI for Selenium tests', 'AI for debugging failed tests', 'AI for code review'] },
  { slug: 'm14_ai_workflow', course: 'AI for QA', module: 'AI QA Workflow',
    lessons: ['AI for test data generation', 'AI for mock data', 'AI agents in QA workflow', 'How to verify AI-generated tests', 'Final AI QA project'] },
]

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'lessonCount', 'titles'],
  properties: {
    file: { type: 'string', description: 'absolute path of the JSON file written' },
    lessonCount: { type: 'integer' },
    titles: { type: 'array', items: { type: 'string' }, description: 'lesson titles written, in order' },
  },
}

function promptFor(m) {
  const file = `${DIR}/${m.slug}.json`
  return `You are a senior QA engineer and instructional designer writing real course content for a QA learning platform.

Course: "${m.course}". Module: "${m.module}".
Write substantive, accurate, beginner-to-job-ready content IN ENGLISH for EACH of these ${m.lessons.length} lessons (keep the titles EXACTLY as given, same order):
${m.lessons.map((t, i) => `${i + 1}. ${t}`).join('\n')}

For EVERY lesson produce a JSON object with these exact keys (all strings unless noted):
- "title": the exact lesson title from the list above.
- "short_description": one sentence, what the lesson covers.
- "learning_goals": 3-4 concrete goals, written as a short paragraph or newline-separated lines (real goals, not "understand the concept").
- "theory": the core teaching content. 3-6 short paragraphs of REAL explanation specific to THIS topic — definitions, why it matters, how it works, when to use it. No filler like "is an essential QA topic". Use concrete detail (real terms, real examples, real numbers/codes where relevant, e.g. HTTP 404, boundary value 0/1/max).
- "key_terms": 5-8 genuine domain terms for this topic, comma-separated.
- "real_world_example": a concrete on-the-job scenario specific to this topic (a real situation a QA would face).
- "step_by_step": a numbered, practical how-to a learner can follow for this topic (use newline-separated numbered steps).
- "common_mistakes": 3-5 real mistakes beginners make on THIS specific topic.
- "practical_use_case": where/when this is used day-to-day in a QA role.
- "summary": 2-3 sentence recap of the key takeaways.
- "example": a fully worked, concrete example for this topic (for automation/technical topics include a real, correct code snippet in a fenced code block; for manual topics include a filled-in artifact such as a real test case, bug report, or checklist). Make it specific and copy-usable.
- "interactive": a short hands-on task prompt for the learner about this topic.
- "expected_answer": a strong model answer / answer guide for that interactive task.
- "homework": a realistic homework assignment for this topic.
- "expected_result": what a good homework submission should contain.
- "quiz": an array of EXACTLY 4 questions. Each is an object: {"question": string, "answers": [4 strings], "correct_index": integer 0-3}. Questions must test real understanding of THIS topic, with plausible distractors. Vary the correct_index across the 4 questions.

Quality bar: a real student should learn the topic from this. Technical facts must be correct. For "Final ... project" lessons, the content should describe a realistic capstone project (deliverables, scope, acceptance criteria) rather than a normal lesson.

Output: write a SINGLE valid JSON file — a JSON array of the ${m.lessons.length} lesson objects, in the given order — to this absolute path using the Write tool:
${file}

The file must be strictly valid JSON (double quotes, properly escaped newlines inside strings, no trailing commas, no comments, no markdown around it). After writing, return the summary (file path, lessonCount, titles in order). Do not print the full content back.`
}

phase('Generate')
log(`Authoring content for ${MODULES.length} modules / ${MODULES.reduce((n, m) => n + m.lessons.length, 0)} lessons`)

const results = await parallel(
  MODULES.map((m) => () =>
    agent(promptFor(m), { label: `write:${m.slug}`, phase: 'Generate', agentType: 'general-purpose', schema: SUMMARY_SCHEMA })
  )
)

const ok = results.filter(Boolean)
return {
  modules: MODULES.length,
  filesWritten: ok.length,
  lessonsWritten: ok.reduce((n, r) => n + (r.lessonCount || 0), 0),
  perModule: ok.map((r) => ({ file: r.file, count: r.lessonCount })),
}
