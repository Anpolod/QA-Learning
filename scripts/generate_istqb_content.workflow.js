export const meta = {
  name: 'generate-istqb-content',
  description: 'Author ISTQB CTFL Foundation course content (theory/example/task/homework/quiz) for all modules, one agent per module',
  phases: [{ title: 'Generate', detail: 'one agent per ISTQB module writes a content JSON file' }],
}

const DIR = '/Users/andriipolodiienko/Documents/dev/projects/QA Education/qa-learning-platform/backend/app/seed/content'

const MODULES = [
  { slug: 'istqb_1_fundamentals', module: 'Fundamentals of Testing',
    lessons: ['What is testing', 'Why is testing necessary', 'Testing principles', 'Test activities, testware and roles', 'Essential skills and good practices in testing'] },
  { slug: 'istqb_2_sdlc', module: 'Testing Throughout the SDLC',
    lessons: ['SDLC models and testing', 'Test levels', 'Test types', 'Maintenance testing', 'Testing and DevOps'] },
  { slug: 'istqb_3_static', module: 'Static Testing',
    lessons: ['Static testing basics', 'Feedback and the review process', 'Review techniques'] },
  { slug: 'istqb_4_techniques', module: 'Test Analysis and Design',
    lessons: ['Test techniques overview', 'Equivalence Partitioning', 'Boundary Value Analysis', 'Decision Table Testing', 'State Transition Testing', 'Statement and Branch coverage', 'Experience-based test techniques', 'Collaboration-based test approaches'] },
  { slug: 'istqb_5_managing', module: 'Managing the Test Activities',
    lessons: ['Test planning and estimation', 'Risk management in testing', 'Test monitoring, control and completion', 'Configuration management', 'Defect management'] },
  { slug: 'istqb_6_tools', module: 'Test Tools',
    lessons: ['Tool support for testing', 'Benefits and risks of test automation'] },
  { slug: 'istqb_7_exam', module: 'Exam Preparation',
    lessons: ['ISTQB exam format and K-levels', 'Mock exam: questions and answers'] },
]

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'lessonCount', 'titles'],
  properties: {
    file: { type: 'string' },
    lessonCount: { type: 'integer' },
    titles: { type: 'array', items: { type: 'string' } },
  },
}

function promptFor(m) {
  const file = `${DIR}/${m.slug}.json`
  const examNote = m.slug === 'istqb_7_exam'
    ? `\n\nThis is the EXAM PREP module. "ISTQB exam format and K-levels" must cover: 40 multiple-choice questions, 65% pass mark, 60 minutes, K-levels K1/K2/K3 and what each demands. "Mock exam: questions and answers" must put 8-10 realistic ISTQB-style questions in the "quiz" array (instead of 4-5), each with a clear explanation in the answer set, mirroring real exam phrasing.`
    : ''
  return `You are an ISTQB-certified test engineer and trainer writing course content for the ISTQB Certified Tester Foundation Level (CTFL v4.0) syllabus.

Module: "${m.module}".
Write accurate, exam-aligned content IN ENGLISH for EACH of these ${m.lessons.length} lessons (keep titles EXACTLY, same order):
${m.lessons.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Content must match the official CTFL v4.0 syllabus terminology and definitions. Where the syllabus uses specific terms (e.g. test object, test basis, test condition, test case, coverage item, confirmation testing, regression testing, verification vs validation, K-levels), use them correctly.

For EVERY lesson produce a JSON object with these exact keys:
- "section": the string "istqb"  (REQUIRED, exactly this value, on every lesson).
- "title": the exact lesson title from the list.
- "short_description": one sentence.
- "learning_goals": 3-4 concrete goals phrased like ISTQB learning objectives (reference the relevant K-level where natural, e.g. "(K2) Explain ...").
- "theory": the core teaching content, 3-6 short paragraphs of REAL, syllabus-accurate explanation specific to THIS topic. Define terms precisely. No filler.
- "key_terms": 5-8 official ISTQB glossary terms for this topic, comma-separated.
- "real_world_example": a concrete project scenario showing the concept in practice.
- "step_by_step": numbered practical steps to apply the concept (newline-separated).
- "common_mistakes": 3-5 real misconceptions, including ones the ISTQB exam likes to test.
- "practical_use_case": where this applies on the job and how it appears on the exam.
- "summary": 2-3 sentence recap.
- "example": a fully worked, concrete example. For test-technique lessons (Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition, Statement/Branch coverage) include a real worked derivation: show the input/rules, the partitions/boundaries/table/states, the resulting test cases, and the coverage achieved. Use a fenced code block or table where helpful.
- "interactive": a short hands-on task prompt for this topic.
- "expected_answer": a strong model answer for that task.
- "homework": a realistic assignment.
- "expected_result": what a good submission contains.
- "quiz": an array of 5 ISTQB-exam-style multiple-choice questions (single correct answer). Each: {"question": string, "answers": [4 strings], "correct_index": integer 0-3}. Use realistic exam phrasing and plausible distractors. Vary the correct_index.${examNote}

Quality bar: a learner should be able to pass the corresponding CTFL exam questions after studying this. Facts must be syllabus-correct.

Output: write a SINGLE valid JSON array of the ${m.lessons.length} lesson objects, in order, to this absolute path with the Write tool:
${file}

Strictly valid JSON (double quotes, escaped newlines in strings, no trailing commas, no markdown wrapper). After writing, return the summary. Do not print the full content back.`
}

phase('Generate')
log(`Authoring ISTQB content for ${MODULES.length} modules / ${MODULES.reduce((n, m) => n + m.lessons.length, 0)} lessons`)

const results = await parallel(
  MODULES.map((m) => () =>
    agent(promptFor(m), { label: `istqb:${m.slug}`, phase: 'Generate', agentType: 'general-purpose', schema: SUMMARY_SCHEMA })
  )
)

const ok = results.filter(Boolean)
return {
  modules: MODULES.length,
  filesWritten: ok.length,
  lessonsWritten: ok.reduce((n, r) => n + (r.lessonCount || 0), 0),
  perModule: ok.map((r) => ({ file: r.file, count: r.lessonCount })),
}
