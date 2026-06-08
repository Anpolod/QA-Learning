from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.entities import Homework, Lesson, LessonExample, LessonInteractiveTask, LessonSlide, Quiz, QuizAnswer, QuizQuestion


LESSON_CONTENT = {
    "QA / QC / Testing basics": {
        "short_description": "Learn the difference between Quality Assurance, Quality Control, and software testing.",
        "learning_goals": "\n".join(
            [
                "Explain what QA, QC, and testing mean.",
                "Describe how QA prevents defects and how QC detects them.",
                "Identify testing activities in a real software workflow.",
                "Use basic QA vocabulary in clear English.",
            ]
        ),
        "theory": (
            "Quality Assurance is the process-focused part of quality. QA improves how a team builds software so fewer "
            "defects are introduced. Examples include defining test processes, reviewing requirements, improving release "
            "criteria, and making sure the team has clear quality standards.\n\n"
            "Quality Control is product-focused. QC checks the actual product and confirms whether it meets expectations. "
            "Examples include executing test cases, reviewing a build, checking a bug fix, or validating a release candidate.\n\n"
            "Testing is one of the main QC activities. A tester compares actual behavior with expected behavior and collects "
            "evidence. Testing does not add quality by itself; it reveals information about product risk. Good QA engineers "
            "use that information to help the team make better decisions."
        ),
        "key_terms": (
            "Quality: how well a product satisfies user and business expectations.\n"
            "QA: process activities that prevent defects.\n"
            "QC: product checks that detect defects.\n"
            "Testing: evaluating software behavior against expectations.\n"
            "Defect: a mismatch between expected and actual behavior.\n"
            "Risk: the chance that a product issue can hurt users or the business."
        ),
        "real_world_example": (
            "A team is building a login page. QA asks for clear acceptance criteria before development starts. QC happens "
            "when the tester checks the finished login page. Testing happens when the tester enters valid and invalid "
            "credentials, checks error messages, and reports any mismatch."
        ),
        "step_by_step": (
            "1. Read the product requirement.\n"
            "2. Identify the expected behavior.\n"
            "3. Think about product risks.\n"
            "4. Design checks that reveal those risks.\n"
            "5. Execute the checks and collect evidence.\n"
            "6. Report results clearly to the team.\n"
            "7. Suggest process improvements when the same type of defect appears repeatedly."
        ),
        "common_mistakes": (
            "Mistake 1: Saying QA and testing are the same thing. Testing is part of QC, while QA is broader.\n"
            "Mistake 2: Testing without expected results. A check is weak if you do not know what should happen.\n"
            "Mistake 3: Reporting opinions instead of evidence. Good QA communication includes steps, data, screenshots, logs, or clear observations.\n"
            "Mistake 4: Thinking QA owns quality alone. Quality is a team responsibility."
        ),
        "practical_use_case": (
            "Use this concept during onboarding to explain your role. For example: 'I help prevent defects by clarifying "
            "requirements, and I help detect defects by testing the product before release.'"
        ),
        "summary": (
            "QA prevents defects by improving the process. QC detects defects by checking the product. Testing is a QC "
            "activity that gives the team evidence about product quality and release risk."
        ),
        "slides": [
            ("QA, QC, and Testing", "QA improves the process, QC checks the product, and testing evaluates behavior against expectations."),
            ("QA Is Preventive", "QA reduces future defects through standards, reviews, risk analysis, and better workflows."),
            ("QC Is Detective", "QC finds issues in the product by executing checks and reviewing actual behavior."),
            ("Testing Gives Evidence", "Testing answers practical questions: what works, what fails, and how risky the build is."),
            ("Team Quality Mindset", "A QA engineer does not own quality alone; they help the whole team see risk clearly."),
        ],
        "example": (
            "Requirement: A user must see an error after entering an invalid password.\n\n"
            "QA activity: Ask whether the error text is defined in the acceptance criteria.\n"
            "QC activity: Check the implemented login form.\n"
            "Testing activity: Enter a valid email and invalid password, then compare the actual error with the expected error."
        ),
        "interactive": (
            "Classify these activities as QA, QC, or Testing:\n"
            "1. Reviewing acceptance criteria before development.\n"
            "2. Executing a login test case.\n"
            "3. Checking a release build against a smoke checklist.\n"
            "4. Improving the bug report template after repeated unclear reports."
        ),
        "expected_answer": (
            "1. QA.\n2. Testing.\n3. QC.\n4. QA.\n"
            "The key idea is whether the activity improves the process, checks the product, or executes a specific behavior check."
        ),
        "homework": (
            "Choose a familiar feature, such as login, checkout, search, or profile editing. Write 3 QA activities, "
            "3 QC activities, and 3 testing activities for that feature."
        ),
        "expected_result": "A structured list with 9 activities total and a short explanation for each category.",
        "quiz": [
            ("What is the main focus of Quality Assurance?", ["Improving the process to prevent defects", "Only clicking through the app", "Writing production code", "Replacing developers"], 0),
            ("What is the main focus of Quality Control?", ["Checking the product to detect defects", "Planning company hiring", "Skipping tests", "Designing logos"], 0),
            ("Which activity is closest to testing?", ["Executing a login scenario and comparing actual behavior with expected behavior", "Creating a company roadmap", "Choosing office equipment", "Writing sales copy"], 0),
            ("Why do testers need expected results?", ["To know whether actual behavior is correct", "To make testing slower", "To avoid writing bug reports", "To replace requirements"], 0),
            ("A defect is best described as...", ["A mismatch between expected and actual behavior", "Any user request", "A new feature idea", "A test environment"], 0),
            ("Which statement is correct?", ["Quality is a team responsibility", "Only QA owns quality", "Only developers own quality", "Users should find all defects"], 0),
            ("What does testing provide to the team?", ["Evidence about product behavior and risk", "A guarantee that no defects exist", "A replacement for requirements", "A design system"], 0),
            ("Which activity is preventive?", ["Reviewing requirements before development starts", "Finding a bug after release", "Ignoring unclear acceptance criteria", "Deleting failed tests"], 0),
            ("Which activity is product-focused?", ["Checking a release candidate against a checklist", "Changing the team process", "Planning sprint ceremonies", "Writing hiring guidelines"], 0),
            ("What is a common beginner mistake?", ["Treating QA and testing as exactly the same thing", "Using evidence in bug reports", "Reading requirements", "Asking clarifying questions"], 0),
        ],
    },
    "What is software testing": {
        "short_description": "Understand software testing as a risk-based investigation of product behavior.",
        "learning_goals": "\n".join(
            [
                "Define software testing in practical terms.",
                "Explain expected result, actual result, and test evidence.",
                "Understand why exhaustive testing is impossible.",
                "Use risk to choose what to test first.",
            ]
        ),
        "theory": (
            "Software testing is the process of evaluating a product to learn how it behaves and whether that behavior "
            "matches expectations. A test is useful when it has a clear condition, an expected result, an actual result, "
            "and evidence.\n\n"
            "Testing is not only about finding bugs. It also confirms working behavior, reveals unclear requirements, "
            "shows release risk, and builds confidence. However, testing can never prove that a product has no defects. "
            "Modern software has too many combinations of data, devices, browsers, permissions, integrations, and user paths.\n\n"
            "A professional tester chooses tests based on risk. High-risk areas include money flows, authentication, data "
            "privacy, user-critical paths, recently changed features, complex business rules, and integrations."
        ),
        "key_terms": (
            "Expected result: what should happen.\n"
            "Actual result: what really happens.\n"
            "Test condition: the situation or rule being checked.\n"
            "Test data: values used during testing.\n"
            "Evidence: screenshots, logs, videos, API responses, database records, or clear notes.\n"
            "Risk-based testing: choosing tests based on possible impact and likelihood."
        ),
        "real_world_example": (
            "A checkout page was changed yesterday. The highest-risk checks are payment submission, order creation, "
            "price calculation, discounts, and confirmation emails. A low-risk check might be a text color that did not change."
        ),
        "step_by_step": (
            "1. Understand the feature and its users.\n"
            "2. Identify what should happen.\n"
            "3. Choose test data.\n"
            "4. Execute the action.\n"
            "5. Compare actual and expected behavior.\n"
            "6. Save evidence.\n"
            "7. Communicate the result."
        ),
        "common_mistakes": (
            "Mistake 1: Testing randomly without a goal.\n"
            "Mistake 2: Trying to test everything with equal priority.\n"
            "Mistake 3: Forgetting test data.\n"
            "Mistake 4: Reporting a bug without evidence.\n"
            "Mistake 5: Assuming a passed test means there are no defects anywhere."
        ),
        "practical_use_case": "Use risk-based testing when time is limited before a release.",
        "summary": "Software testing investigates product behavior, compares actual results with expectations, and gives the team evidence about risk.",
        "slides": [
            ("Testing Is Investigation", "Testing explores product behavior and answers: what works, what fails, and what is risky?"),
            ("Expected vs Actual", "A useful test compares what should happen with what really happens."),
            ("Evidence Matters", "Screenshots, logs, API responses, and clear notes make testing results trustworthy."),
            ("You Cannot Test Everything", "Prioritize by user impact, business impact, complexity, and recent changes."),
            ("Risk Guides Testing", "Start with critical paths, money flows, authentication, data, and integrations."),
        ],
        "example": (
            "Feature: Password reset.\n"
            "Expected result: A registered user receives a reset email after entering their account email.\n"
            "Actual result: No email arrives after 10 minutes.\n"
            "Evidence: screenshot of request, test email inbox, timestamp, and network response."
        ),
        "interactive": "Given a checkout release with only 30 minutes to test, list the first 5 checks you would run and explain why.",
        "expected_answer": "A strong answer prioritizes payment, order creation, price calculation, confirmation, and login/session behavior because these carry high user and business risk.",
        "homework": "Pick one feature and write 5 test ideas. For each idea, include expected result, test data, and evidence you would collect.",
        "expected_result": "Five clear test ideas with expected results, relevant test data, and evidence notes.",
        "quiz": [
            ("What is software testing primarily used for?", ["Learning about product behavior and risk", "Guaranteeing zero defects", "Replacing development", "Avoiding requirements"], 0),
            ("What is an expected result?", ["What should happen", "What actually happened", "A random idea", "A database table"], 0),
            ("What is an actual result?", ["What really happens during the test", "What the tester hopes will happen", "The sprint goal", "The design file"], 0),
            ("Why is exhaustive testing impossible?", ["There are too many combinations and paths", "Testing tools are illegal", "Users dislike testing", "Requirements are always perfect"], 0),
            ("What should guide testing when time is limited?", ["Risk", "Alphabetical order", "Personal preference only", "Random clicking"], 0),
            ("Which area is usually high risk?", ["Payment flow", "Unused footer color", "Placeholder text in an old page", "Internal demo label"], 0),
            ("Which item is good evidence?", ["Screenshot plus steps and test data", "I think it is broken", "No notes", "A vague message"], 0),
            ("What can a passed test prove?", ["That one checked condition worked in that context", "That the whole product has no bugs", "That requirements are complete", "That no more testing is needed"], 0),
            ("What is test data?", ["Values used during testing", "A project logo", "The tester's laptop", "A meeting title"], 0),
            ("Which is a weak testing approach?", ["Testing randomly without a goal", "Testing critical paths first", "Collecting logs", "Using expected results"], 0),
        ],
    },
}

LESSON_CONTENT["Software Development Life Cycle - SDLC"] = {
    "short_description": "Learn how software moves from idea to release and where QA contributes in each phase.",
    "learning_goals": "\n".join(
        [
            "Name the common SDLC phases.",
            "Explain QA involvement before, during, and after development.",
            "Identify QA artifacts connected to SDLC phases.",
            "Understand why early QA involvement reduces defects.",
        ]
    ),
    "theory": (
        "The Software Development Life Cycle describes how a product idea becomes working software. Common phases include "
        "planning, requirements, design, development, testing, deployment, and maintenance.\n\n"
        "QA should not appear only after development is finished. QA contributes early by reviewing requirements, asking "
        "clarifying questions, identifying risks, and preparing test ideas. During development, QA can refine test cases, "
        "prepare data, review builds, and collaborate with developers. After release, QA monitors feedback, verifies fixes, "
        "and helps improve the process.\n\n"
        "Early QA involvement is valuable because defects are cheaper to prevent than to fix late. A missing requirement "
        "caught during planning may take minutes to clarify. The same issue found in production may require emergency fixes, "
        "customer support, data correction, and trust recovery."
    ),
    "key_terms": (
        "SDLC: Software Development Life Cycle.\n"
        "Requirement: a description of expected product behavior or constraint.\n"
        "Design: planned structure, UI, or technical solution.\n"
        "Development: implementation of the feature.\n"
        "Deployment: releasing software to users or an environment.\n"
        "Maintenance: supporting and improving software after release."
    ),
    "real_world_example": (
        "A product owner requests a discount feature. During requirements review, QA asks what happens if a discount code "
        "is expired, already used, or combined with another promotion. These questions prevent missing logic before code is written."
    ),
    "step_by_step": (
        "1. Planning: understand the business goal.\n"
        "2. Requirements: review acceptance criteria and ask questions.\n"
        "3. Design: identify risky flows and dependencies.\n"
        "4. Development: prepare test cases and data.\n"
        "5. Testing: execute checks and report defects.\n"
        "6. Deployment: support smoke testing and release checks.\n"
        "7. Maintenance: verify fixes and learn from production issues."
    ),
    "common_mistakes": (
        "Mistake 1: Waiting until the end to involve QA.\n"
        "Mistake 2: Treating requirements as automatically complete.\n"
        "Mistake 3: Ignoring deployment and maintenance testing.\n"
        "Mistake 4: Testing only the happy path."
    ),
    "practical_use_case": "Use SDLC thinking to decide what QA should do before a feature is ready for formal testing.",
    "summary": "SDLC explains the product delivery journey. QA adds value throughout that journey, especially by catching risk early.",
    "slides": [
        ("SDLC Overview", "Software moves through planning, requirements, design, development, testing, deployment, and maintenance."),
        ("QA Starts Early", "QA reviews requirements and risks before code is written."),
        ("Requirements Shape Tests", "Clear acceptance criteria become stronger scenarios, test cases, and checklists."),
        ("Testing Supports Release", "Testing gives evidence about whether the build is ready for users."),
        ("Maintenance Closes the Loop", "Production feedback and defect trends improve the next development cycle."),
    ],
    "example": (
        "Requirement: Users can apply one discount code during checkout.\n\n"
        "QA questions during SDLC: Can expired codes be applied? Can the same code be used twice? What happens if the cart is empty? "
        "Should discounts work for subscriptions? What message should users see for invalid codes?"
    ),
    "interactive": "Place these QA activities into SDLC phases: requirement review, smoke test after deployment, test case design, bug retest, production issue analysis.",
    "expected_answer": "Requirement review: requirements. Test case design: design/development. Bug retest: testing. Smoke test after deployment: deployment. Production issue analysis: maintenance.",
    "homework": "Choose a feature and describe what QA should do in each SDLC phase from planning to maintenance.",
    "expected_result": "A phase-by-phase QA plan with practical activities and at least two risk-based questions.",
    "quiz": [
        ("What does SDLC describe?", ["The process of turning an idea into working software", "Only the testing phase", "Only database design", "Only bug reporting"], 0),
        ("When should QA ideally get involved?", ["During requirements and planning, not only at the end", "Only after production release", "Only after all bugs are fixed", "Never"], 0),
        ("Which QA activity fits requirements review?", ["Asking clarifying questions about expected behavior", "Ignoring acceptance criteria", "Deploying without checks", "Deleting test evidence"], 0),
        ("Why is early QA involvement useful?", ["Defects are cheaper to prevent early", "It removes the need for testing", "It guarantees no bugs", "It replaces developers"], 0),
        ("Which phase includes releasing software?", ["Deployment", "Planning", "Design", "Requirements"], 0),
        ("Which phase supports production feedback?", ["Maintenance", "Initial planning only", "Logo design", "Hiring"], 0),
        ("What can requirements become?", ["Scenarios, test cases, and checklists", "Only invoices", "Only passwords", "Only screenshots"], 0),
        ("Which is a QA risk question?", ["What happens if the discount code is expired?", "What color is the office wall?", "Who owns the keyboard?", "How many chairs are in the room?"], 0),
        ("Which mistake is common?", ["Waiting until the end to involve QA", "Reviewing requirements", "Preparing test data", "Running smoke tests"], 0),
        ("What does testing provide during release?", ["Evidence about build readiness", "A guarantee of perfection", "A replacement for deployment", "A product roadmap"], 0),
    ],
}

LESSON_CONTENT["Software Testing Life Cycle - STLC"] = {
    "short_description": "Learn the structured testing workflow from requirement analysis to test closure.",
    "learning_goals": "\n".join(
        [
            "Name the main STLC phases.",
            "Explain what QA produces in each phase.",
            "Connect test planning, design, execution, and closure.",
            "Understand why STLC makes testing traceable.",
        ]
    ),
    "theory": (
        "The Software Testing Life Cycle is the structured workflow used to plan, design, execute, and close testing. "
        "Common STLC phases include requirement analysis, test planning, test design, test environment setup, test execution, "
        "defect reporting, retesting, regression testing, and test closure.\n\n"
        "STLC turns testing from random activity into a repeatable process. It helps QA engineers answer important questions: "
        "What are we testing? Why are we testing it? What test data do we need? Which tests passed? Which defects are open? "
        "What is the release risk?\n\n"
        "Good STLC practice creates traceability. Requirements connect to scenarios, scenarios connect to test cases, test "
        "cases connect to execution results, and defects connect to evidence."
    ),
    "key_terms": (
        "STLC: Software Testing Life Cycle.\n"
        "Test planning: defining scope, approach, resources, and schedule.\n"
        "Test design: creating scenarios, cases, checklists, and data.\n"
        "Test execution: running checks and recording results.\n"
        "Retesting: checking whether a fixed defect is resolved.\n"
        "Regression testing: checking that existing behavior still works after changes.\n"
        "Test closure: summarizing results and lessons learned."
    ),
    "real_world_example": (
        "For a new registration feature, QA analyzes requirements, writes test cases for valid and invalid registration, "
        "prepares email test data, executes tests, reports defects, retests fixes, runs regression around login, and writes a summary."
    ),
    "step_by_step": (
        "1. Analyze requirements and risks.\n"
        "2. Define test scope and priorities.\n"
        "3. Create scenarios, cases, checklists, and data.\n"
        "4. Prepare the test environment.\n"
        "5. Execute tests and record results.\n"
        "6. Report defects with evidence.\n"
        "7. Retest fixes and run regression.\n"
        "8. Prepare a test summary report."
    ),
    "common_mistakes": (
        "Mistake 1: Starting execution before understanding requirements.\n"
        "Mistake 2: Not tracking which tests were executed.\n"
        "Mistake 3: Retesting only the bug and skipping related regression.\n"
        "Mistake 4: Ending testing without a summary of remaining risk."
    ),
    "practical_use_case": "Use STLC to organize your work during a sprint or release cycle.",
    "summary": "STLC makes testing planned, traceable, and useful for release decisions.",
    "slides": [
        ("STLC Overview", "STLC structures testing from requirement analysis to closure."),
        ("Plan Before You Execute", "Scope, priorities, data, and environment should be clear before deep testing starts."),
        ("Design Traceable Tests", "Connect requirements to scenarios, cases, checklists, and expected results."),
        ("Execution Creates Evidence", "Record passed tests, failed tests, defects, and supporting evidence."),
        ("Closure Communicates Risk", "A test summary explains what was tested, what failed, and what risk remains."),
    ],
    "example": (
        "Registration STLC flow:\n"
        "Requirement analysis: identify email/password rules.\n"
        "Planning: prioritize valid registration, validation, duplicates, and confirmation email.\n"
        "Design: create test cases and data.\n"
        "Execution: run tests and report defects.\n"
        "Closure: summarize pass rate, defects, and remaining risk."
    ),
    "interactive": "Create a mini STLC plan for testing a password reset feature. Include at least 5 phases.",
    "expected_answer": "A strong plan includes requirement analysis, planning, test design, environment/data setup, execution, defect reporting, retesting/regression, and summary.",
    "homework": "Write an STLC checklist for testing a new user registration feature.",
    "expected_result": "A checklist grouped by STLC phases with clear activities and deliverables.",
    "quiz": [
        ("What does STLC stand for?", ["Software Testing Life Cycle", "Software Team Login Checklist", "System Testing Legal Contract", "Sprint Technical Learning Course"], 0),
        ("Which phase comes before test design?", ["Requirement analysis", "Test closure", "Production marketing", "Invoice review"], 0),
        ("What is test execution?", ["Running checks and recording results", "Only writing code", "Only drawing UI", "Only creating a roadmap"], 0),
        ("What is retesting?", ["Checking whether a fixed defect is resolved", "Testing unrelated features only", "Skipping the bug", "Deleting the report"], 0),
        ("What is regression testing?", ["Checking existing behavior after changes", "Testing only the new logo", "Replacing requirements", "Changing passwords"], 0),
        ("Why is traceability useful?", ["It connects requirements, tests, results, and defects", "It hides test evidence", "It removes planning", "It blocks communication"], 0),
        ("What should test closure include?", ["Summary of results and remaining risk", "Only a screenshot", "No status", "A random note"], 0),
        ("Which is a common mistake?", ["Executing before understanding requirements", "Planning test data", "Recording results", "Reporting defects"], 0),
        ("What is a test environment?", ["The setup where tests are executed", "A company party", "A bug title", "A user role only"], 0),
        ("What does STLC help QA communicate?", ["What was tested, what failed, and what risk remains", "Only personal opinions", "Only UI colors", "Only team vacations"], 0),
    ],
}

LESSON_CONTENT["SDLC and STLC"] = {
    **LESSON_CONTENT["Software Testing Life Cycle - STLC"],
    "short_description": "Compare the software delivery life cycle with the testing life cycle.",
    "summary": "SDLC describes the full product delivery process. STLC describes the structured testing workflow inside that process.",
}


def _replace_quiz(db: Session, quiz: Quiz, questions: list[tuple[str, list[str], int]]) -> None:
    existing_question_ids = list(db.scalars(select(QuizQuestion.id).where(QuizQuestion.quiz_id == quiz.id)).all())
    if existing_question_ids:
        db.execute(delete(QuizAnswer).where(QuizAnswer.question_id.in_(existing_question_ids)))
        db.execute(delete(QuizQuestion).where(QuizQuestion.id.in_(existing_question_ids)))
    for question_text, answers, correct_index in questions:
        question = QuizQuestion(
            quiz_id=quiz.id,
            question=question_text,
            question_type="single",
            explanation=f"Correct answer: {answers[correct_index]}",
        )
        db.add(question)
        db.flush()
        for index, answer in enumerate(answers):
            db.add(QuizAnswer(question_id=question.id, answer_text=answer, is_correct=index == correct_index))


def enrich_manual_foundations() -> None:
    db = SessionLocal()
    try:
        updated = 0
        for title, content in LESSON_CONTENT.items():
            lesson = db.scalar(select(Lesson).where(Lesson.title == title))
            if not lesson:
                continue
            for field in [
                "short_description",
                "learning_goals",
                "theory",
                "key_terms",
                "real_world_example",
                "step_by_step",
                "common_mistakes",
                "practical_use_case",
                "summary",
            ]:
                setattr(lesson, field, content[field])

            slides = list(
                db.scalars(
                    select(LessonSlide).where(LessonSlide.lesson_id == lesson.id).order_by(LessonSlide.order_index)
                ).all()
            )
            seeded_slides = [slide for slide in slides if slide.title.startswith(f"{lesson.title}: Slide ")]
            for slide, (slide_title, slide_body) in zip(seeded_slides, content["slides"]):
                slide.title = slide_title
                slide.body = slide_body

            example = db.scalar(select(LessonExample).where(LessonExample.lesson_id == lesson.id))
            if example:
                example.title = "Practical workplace example"
                example.content = content["example"]
            else:
                db.add(LessonExample(lesson_id=lesson.id, title="Practical workplace example", content=content["example"]))

            task = db.scalar(select(LessonInteractiveTask).where(LessonInteractiveTask.lesson_id == lesson.id))
            if task:
                task.task_type = "analysis"
                task.prompt = content["interactive"]
                task.expected_answer = content["expected_answer"]
            else:
                db.add(
                    LessonInteractiveTask(
                        lesson_id=lesson.id,
                        task_type="analysis",
                        prompt=content["interactive"],
                        expected_answer=content["expected_answer"],
                    )
                )

            homework = db.scalar(select(Homework).where(Homework.lesson_id == lesson.id))
            if homework:
                homework.task_description = content["homework"]
                homework.expected_result = content["expected_result"]
            else:
                db.add(
                    Homework(
                        lesson_id=lesson.id,
                        task_description=content["homework"],
                        expected_result=content["expected_result"],
                    )
                )

            quiz = db.scalar(select(Quiz).where(Quiz.lesson_id == lesson.id))
            if not quiz:
                quiz = Quiz(lesson_id=lesson.id, title=f"{lesson.title} Quiz")
                db.add(quiz)
                db.flush()
            _replace_quiz(db, quiz, content["quiz"])
            updated += 1
        db.commit()
        print(f"enriched_lessons={updated}")
    finally:
        db.close()


if __name__ == "__main__":
    enrich_manual_foundations()
