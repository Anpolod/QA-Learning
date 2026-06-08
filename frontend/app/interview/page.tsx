import { BadgeCheck, BookOpenCheck, BriefcaseBusiness, MessageSquareText, Target } from "lucide-react";

type InterviewTopic = {
  title: string;
  focus: string;
  questions: {
    question: string;
    strongAnswer: string;
    practice: string;
  }[];
};

const topics: InterviewTopic[] = [
  {
    title: "QA Foundations",
    focus: "Core vocabulary, QA mindset, and risk-based thinking.",
    questions: [
      {
        question: "What is the difference between QA, QC, and testing?",
        strongAnswer:
          "QA improves the process that creates quality, QC evaluates the product quality, and testing is one QC activity that finds information about product risk.",
        practice: "Give one example of a QA activity and one example of a testing activity from a sprint."
      },
      {
        question: "Why is software testing important?",
        strongAnswer:
          "Testing reduces uncertainty before release by checking critical user flows, finding defects, validating requirements, and giving stakeholders evidence for decisions.",
        practice: "Explain testing value without saying that testers guarantee a bug-free product."
      },
      {
        question: "What is a defect, error, failure, and root cause?",
        strongAnswer:
          "An error is a human mistake, a defect is the flaw introduced into the product, a failure is incorrect behavior observed during execution, and a root cause is the deeper reason the problem happened.",
        practice: "Use a checkout validation bug to connect all four terms."
      }
    ]
  },
  {
    title: "SDLC and STLC",
    focus: "How QA work fits into delivery and release flow.",
    questions: [
      {
        question: "What are the main STLC phases?",
        strongAnswer:
          "Requirement analysis, test planning, test design, test environment setup, test execution, defect tracking, retesting, regression, and test closure.",
        practice: "Name one deliverable from each phase."
      },
      {
        question: "When should QA start testing work?",
        strongAnswer:
          "QA should start as early as possible during requirement analysis, before code is ready, because many defects can be prevented by clarifying assumptions and risks early.",
        practice: "Describe what you would ask during a story refinement meeting."
      },
      {
        question: "What are entry and exit criteria?",
        strongAnswer:
          "Entry criteria define what must be ready before testing starts. Exit criteria define the conditions for finishing testing or recommending release.",
        practice: "Create entry and exit criteria for a login feature."
      }
    ]
  },
  {
    title: "Test Design",
    focus: "Scenarios, cases, coverage, and test techniques.",
    questions: [
      {
        question: "What is the difference between a test scenario and a test case?",
        strongAnswer:
          "A scenario is a high-level user situation or flow to test. A test case is detailed and includes preconditions, steps, data, and expected results.",
        practice: "Turn 'user resets password' into two scenarios and one detailed test case."
      },
      {
        question: "How do equivalence partitioning and boundary value analysis work?",
        strongAnswer:
          "Equivalence partitioning groups inputs expected to behave similarly. Boundary value analysis checks values at and around edges where defects are common.",
        practice: "Apply both techniques to an age field that accepts 18 through 65."
      },
      {
        question: "What is a decision table?",
        strongAnswer:
          "A decision table maps combinations of conditions to expected actions, making complex business rules easier to cover without missing important combinations.",
        practice: "Draft a decision table for free shipping based on country, cart total, and membership."
      },
      {
        question: "What is a traceability matrix?",
        strongAnswer:
          "A traceability matrix connects requirements to scenarios, test cases, defects, and execution status so the team can see coverage and impact of changes.",
        practice: "Explain how you would use it when a requirement changes."
      }
    ]
  },
  {
    title: "QA Documentation",
    focus: "Checklists, test plans, test cases, bug reports, and summary reports.",
    questions: [
      {
        question: "What makes a good test case?",
        strongAnswer:
          "It has a clear objective, preconditions, reliable test data, precise steps, observable expected results, priority, and enough detail for another tester to execute it.",
        practice: "Improve a vague expected result like 'works correctly'."
      },
      {
        question: "When would you use a checklist instead of detailed test cases?",
        strongAnswer:
          "Use a checklist for exploratory, smoke, regression, or repeated lightweight checks where experienced testers need coverage guidance without heavy step-by-step scripts.",
        practice: "Create five smoke checklist items for a course catalog."
      },
      {
        question: "What should a test plan include?",
        strongAnswer:
          "Objective, scope, out-of-scope areas, approach, environments, test data, roles, schedule, risks, entry criteria, exit criteria, and deliverables.",
        practice: "Name three risks for testing payments."
      },
      {
        question: "What makes a bug report useful?",
        strongAnswer:
          "A useful bug report is reproducible, factual, specific, prioritized by impact, and includes environment, steps, actual result, expected result, and evidence.",
        practice: "Rewrite 'button broken' as a professional bug title."
      }
    ]
  },
  {
    title: "Testing Types",
    focus: "Functional, non-functional, smoke, sanity, regression, retesting, usability, and compatibility.",
    questions: [
      {
        question: "What is the difference between smoke and sanity testing?",
        strongAnswer:
          "Smoke testing checks whether a build is stable enough for deeper testing. Sanity testing checks whether a specific change or fix behaves reasonably.",
        practice: "Give one smoke check and one sanity check after a login bug fix."
      },
      {
        question: "What is the difference between regression testing and retesting?",
        strongAnswer:
          "Retesting verifies that a specific defect was fixed. Regression testing checks that recent changes did not break existing functionality.",
        practice: "Explain why both can be needed after fixing checkout."
      },
      {
        question: "What non-functional testing types do you know?",
        strongAnswer:
          "Performance, security, usability, accessibility, reliability, compatibility, localization, scalability, and maintainability-related checks.",
        practice: "Pick three non-functional risks for a learning platform."
      }
    ]
  },
  {
    title: "API and Web Testing",
    focus: "HTTP, REST, Postman, JSON, status codes, and browser behavior.",
    questions: [
      {
        question: "What do common HTTP methods mean?",
        strongAnswer:
          "GET reads data, POST creates or submits data, PUT replaces a resource, PATCH updates part of a resource, and DELETE removes a resource.",
        practice: "Choose methods for login, update profile, and delete homework draft."
      },
      {
        question: "How do you test an API endpoint?",
        strongAnswer:
          "Check status code, response schema, required fields, validation, authorization, negative cases, boundary data, error messages, headers, and side effects in the system.",
        practice: "List negative API tests for registration."
      },
      {
        question: "What is the difference between 400, 401, 403, 404, and 500?",
        strongAnswer:
          "400 means bad request, 401 unauthenticated, 403 authenticated but forbidden, 404 not found, and 500 server-side failure.",
        practice: "Map each status code to a realistic user profile API case."
      }
    ]
  },
  {
    title: "SQL, Git, Jira, and Agile",
    focus: "Daily tools expected from a manual QA engineer.",
    questions: [
      {
        question: "Why does a QA engineer need basic SQL?",
        strongAnswer:
          "SQL helps verify stored data, prepare test data, investigate defects, and confirm backend state when UI behavior is not enough evidence.",
        practice: "Explain when you would use SELECT and JOIN during testing."
      },
      {
        question: "How do QA engineers use Git?",
        strongAnswer:
          "QA engineers use Git to read changes, switch branches, run test builds, review test automation, and understand what changed before regression testing.",
        practice: "Describe how a changed branch can affect your test scope."
      },
      {
        question: "What information should QA add to a Jira ticket?",
        strongAnswer:
          "QA should add test notes, questions, acceptance criteria gaps, linked test cases, found defects, retest results, and release risk comments.",
        practice: "Write a short QA comment for a story with unclear validation rules."
      }
    ]
  },
  {
    title: "Automation Basics",
    focus: "Selectors, assertions, waits, test structure, and maintainability.",
    questions: [
      {
        question: "What makes a good locator?",
        strongAnswer:
          "A good locator is stable, readable, close to user intent, and resistant to visual or layout changes. Test IDs, roles, labels, and accessible names are often better than brittle XPath.",
        practice: "Compare CSS class, XPath by index, and data-testid for a login button."
      },
      {
        question: "Why are assertions important in automation?",
        strongAnswer:
          "Assertions turn actions into checks. Without assertions, a script may click through the app without proving the expected behavior happened.",
        practice: "Add three assertions to an automated login test."
      },
      {
        question: "How do you reduce flaky tests?",
        strongAnswer:
          "Use stable locators, meaningful waits, isolated test data, clear assertions, independent tests, controlled environment setup, and good failure evidence.",
        practice: "Name two reasons a UI test may pass locally but fail in CI."
      }
    ]
  },
  {
    title: "AI for QA",
    focus: "Using AI responsibly for analysis, test generation, and review.",
    questions: [
      {
        question: "How can QA engineers use AI safely?",
        strongAnswer:
          "Use AI for drafts, brainstorming, edge cases, summaries, and test data ideas, but verify output against requirements, product behavior, privacy rules, and QA judgment.",
        practice: "Name two things you must never paste into an AI tool."
      },
      {
        question: "How do you verify AI-generated test cases?",
        strongAnswer:
          "Check requirement coverage, assumptions, expected results, duplicates, missing negative cases, realistic data, and whether each case is executable.",
        practice: "Create a review checklist for AI-generated registration tests."
      },
      {
        question: "What are the risks of AI in QA?",
        strongAnswer:
          "AI may invent requirements, miss product context, expose confidential data, produce shallow cases, or create false confidence if the output is not reviewed.",
        practice: "Give an example of a hallucinated requirement."
      }
    ]
  }
];

const totals = {
  topics: topics.length,
  questions: topics.reduce((sum, topic) => sum + topic.questions.length, 0)
};

const prepCards = [
  {
    title: "Answer structure",
    body: "Definition, context, example, risk, and conclusion.",
    Icon: BookOpenCheck
  },
  {
    title: "Evidence mindset",
    body: "Tie answers to requirements, expected results, and user impact.",
    Icon: Target
  },
  {
    title: "Hiring signal",
    body: "Show how you think, not only what terms you memorized.",
    Icon: BriefcaseBusiness
  }
];

export default function InterviewPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="border-b border-slate-200 pb-6">
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-coral">
          <MessageSquareText className="h-4 w-4" />
          Mock interview
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-bold text-ink">QA interview question bank by topic</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Practice popular manual QA, automation, API, documentation, Agile, and AI-for-QA questions with answer anchors and short drills.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold text-ink">{totals.topics}</p>
              <p className="text-sm text-slate-500">topic groups</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold text-ink">{totals.questions}</p>
              <p className="text-sm text-slate-500">questions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {prepCards.map(({ title, body, Icon }) => (
          <article key={title} className="rounded-lg border border-slate-200 bg-white p-5">
            <Icon className="h-5 w-5 text-mint" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 space-y-5">
        {topics.map((topic) => (
          <article key={topic.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">{topic.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{topic.focus}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                <BadgeCheck className="h-3.5 w-3.5 text-mint" />
                {topic.questions.length} questions
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {topic.questions.map((item, index) => (
                <details key={item.question} className="rounded-md border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-ink">
                    {index + 1}. {item.question}
                  </summary>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_280px]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-coral">Strong answer anchor</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.strongAnswer}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice drill</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.practice}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
