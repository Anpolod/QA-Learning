export const meta = {
  name: 'generate-glossary',
  description: 'Define ~177 core QA glossary terms (concise definition + category) in parallel batches',
  phases: [{ title: 'Define', detail: 'one agent per ~30-term batch' }],
}

const TERMS = ["acceptance criteria", "acceptance test-driven development (ATDD)", "acceptance testing", "action", "Agile", "ambiguity", "anomaly", "assertion", "attribute", "attribute selector", "auto-waiting", "baseURL", "black-box test technique", "black-box testing", "boolean", "boundary", "boundary value", "boundary value analysis", "branch", "bug lifecycle", "checklist", "CI integration", "CI/CD pipeline", "class", "codegen", "combinatorial explosion", "condition", "confirmation testing", "contract testing", "coverage", "coverage item", "critical path", "CSS selector", "data-driven testing", "data-testid", "decision table", "defect", "defect clustering", "defect density", "defect prevention", "defect report", "Definition of Done", "deliverables", "DOM", "driver.quit()", "dynamic testing", "edge case", "encapsulation", "entry criteria", "environment", "environment variable", "equivalence partition", "equivalence partitioning", "error", "event", "exhaustive testing", "exit criteria", "expected result", "expected vs actual", "expected vs actual result", "expected_conditions", "experience-based test technique", "explicit wait", "exploratory testing", "failure", "Faker", "fixture", "fixtures", "flakiness", "flaky test", "foreign key", "functional testing", "Given/When/Then", "guard condition", "hallucination", "HTTP status code", "idempotency", "IEEE 829", "impact analysis", "index", "inheritance", "invalid partition", "INVEST", "JSON schema validation", "locator", "maintainability", "negative testing", "non-functional testing", "off-by-one", "off-by-one error", "OpenAPI/Swagger", "Page Object Model", "parameter", "parametrization", "pass rate", "payload", "pesticide paradox", "positive testing", "precondition", "priority", "priority (P1/P2/P3)", "Quality Assurance", "Quality Control", "regression", "regression testing", "release recommendation", "reproducibility", "request", "residual risk", "responsive layout", "REST", "retries", "review", "risk and mitigation", "risk-based testing", "root cause", "rule", "scope", "scope (in/out)", "Scrum", "SELECT", "session-based test management", "severity", "shift-left", "single responsibility", "smoke test", "specificity", "sprint", "stack trace", "StaleElementReferenceException", "state", "state transition diagram", "state transition table", "state transition testing", "static analysis", "static testing", "steps to reproduce", "string", "synthetic data", "test automation", "test basis", "test case", "test case design", "test completion", "test condition", "test coverage", "test data", "test execution", "test execution tool", "test isolation", "test isolation / order dependence", "test level", "test object", "test plan", "test planning", "test pyramid", "test scenario", "test strategy", "test summary report", "testability", "Testing", "testware", "trace viewer", "traceability", "traceability matrix", "transition", "V-Model", "valid partition", "validation", "verification", "W3C WebDriver protocol", "Waterfall", "WebDriver", "WebDriverWait", "white-box test technique", "white-box testing", "workflow"]
const CATEGORIES = [
  'Fundamentals', 'Test Types', 'Test Design', 'Documentation',
  'Process & Agile', 'Automation', 'API & Web', 'SQL & Data', 'Tools & CI', 'AI for QA'
]

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['terms'],
  properties: {
    terms: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['term', 'definition', 'category'],
        properties: {
          term: { type: 'string', description: 'the exact term string as given' },
          definition: { type: 'string', description: '1-2 sentence accurate, beginner-friendly QA definition' },
          category: { type: 'string', enum: CATEGORIES },
        },
      },
    },
  },
}

const BATCH = 30
const batches = []
for (let i = 0; i < TERMS.length; i += BATCH) batches.push(TERMS.slice(i, i + BATCH))

function promptFor(batch) {
  return `You are an ISTQB-certified QA engineer writing a software-testing glossary for beginner-to-job-ready students.

Define EACH of these terms with a concise, accurate definition (1-2 sentences, plain English, no fluff) and assign ONE category from: ${CATEGORIES.join(', ')}.

Terms (return the EXACT term string for each, do not rename):
${batch.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Rules:
- Definitions must be technically correct and match ISTQB / industry usage.
- Keep each definition self-contained; don't say "see X".
- Pick the single best-fit category.
- Return one object per term, same order, exact term strings.`
}

phase('Define')
log(`Defining ${TERMS.length} terms in ${batches.length} batches`)

const results = await parallel(
  batches.map((b, idx) => () =>
    agent(promptFor(b), { label: `defs:${idx + 1}`, phase: 'Define', schema: SCHEMA })
  )
)

const defs = results.filter(Boolean).flatMap((r) => r.terms || [])
return { requested: TERMS.length, defined: defs.length, terms: defs }
