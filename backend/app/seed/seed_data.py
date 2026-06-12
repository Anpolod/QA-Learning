import os

from app.database.session import Base, SessionLocal, engine
from app.auth.security import hash_password
from app.models.entities import (
    Course,
    FinalProject,
    Homework,
    Lesson,
    LessonExample,
    LessonInteractiveTask,
    LessonSlide,
    Module,
    Quiz,
    QuizAnswer,
    QuizQuestion,
    User,
    UserProfile,
)


def lesson_payload(title: str, description: str) -> dict[str, str]:
    return {
        "title": title,
        "short_description": description,
        "learning_goals": "Understand the concept, identify where it is used, and apply it in a practical QA task.",
        "theory": f"{title} is an essential QA topic. In real teams, QA engineers use it to reduce product risk and make release decisions with better evidence.",
        "key_terms": "quality, risk, requirement, expected result, actual result, evidence",
        "real_world_example": "A team releases a checkout page. QA checks critical flows, documents issues, and helps the team understand release risk.",
        "step_by_step": "Read the requirement, identify risk, design checks, execute tests, document results, communicate findings.",
        "common_mistakes": "Testing without clear expected results, skipping edge cases, and writing vague bug reports.",
        "practical_use_case": "Create a small QA artifact for a login or checkout flow.",
        "summary": f"Use {title} to make testing structured, clear, and useful for the whole team.",
    }


COURSE_BLUEPRINTS = [
    {
        "title": "Manual QA",
        "section": "manual",
        "description": "Learn software testing fundamentals, test design, documentation, API basics, SQL, Git, Jira, and Agile.",
        "final_project": "Analyze a demo website, create checklist, test cases, bug reports, and a test summary report.",
        "modules": [
            {
                "title": "QA Foundations",
                "description": "Build the core vocabulary and process understanding required for manual QA work.",
                "lessons": [
                    "QA / QC / Testing basics",
                    "What is software testing",
                    "Software Development Life Cycle - SDLC",
                    "Software Testing Life Cycle - STLC",
                ],
            },
            {
                "title": "Testing Types",
                "description": "Understand common testing types and when to use them in real projects.",
                "lessons": [
                    "Types of testing",
                    "Functional testing",
                    "Non-functional testing",
                    "Smoke testing",
                    "Sanity testing",
                    "Regression testing",
                    "Retesting",
                    "Exploratory testing",
                    "Usability testing",
                    "Compatibility testing",
                    "Cross-browser testing",
                    "Mobile testing basics",
                    "Web testing basics",
                ],
            },
            {
                "title": "QA Documentation",
                "description": "Create practical QA artifacts that make testing work clear and repeatable.",
                "lessons": [
                    "Requirements analysis",
                    "Test scenarios",
                    "Test cases",
                    "Checklists",
                    "Bug reports",
                    "Bug life cycle",
                    "Test plan",
                    "Test strategy",
                ],
            },
            {
                "title": "Test Design Techniques",
                "description": "Apply structured techniques to find meaningful test cases and edge cases.",
                "lessons": [
                    "Test design techniques",
                    "Equivalence partitioning",
                    "Boundary value analysis",
                    "Decision table testing",
                    "State transition testing",
                    "Pairwise testing",
                ],
            },
            {
                "title": "Technical Skills for Manual QA",
                "description": "Practice the API, SQL, Git, Jira, and Agile basics expected from job-ready QA engineers.",
                "lessons": [
                    "API testing basics",
                    "REST API basics",
                    "Postman basics",
                    "HTTP methods",
                    "HTTP status codes",
                    "JSON basics",
                    "SQL basics for QA",
                    "SELECT queries",
                    "Filtering data",
                    "JOIN basics",
                    "Git basics for QA",
                    "Jira basics",
                    "Agile / Scrum basics",
                    "QA documentation",
                    "Test summary report",
                    "Final Manual QA project",
                ],
            },
        ],
    },
    {
        "title": "QA Automation",
        "section": "automation",
        "description": "Learn programming foundations, selectors, Playwright, Selenium, reports, CI/CD, Docker, and test architecture.",
        "final_project": "Create Playwright tests for login, form validation, API endpoints, reports, and GitHub Actions.",
        "modules": [
            {
                "title": "Programming Foundations",
                "description": "Learn the programming concepts needed to start writing reliable automated tests.",
                "lessons": [
                    "Programming basics for QA",
                    "Python or JavaScript basics",
                    "Variables",
                    "Data types",
                    "Conditions",
                    "Loops",
                    "Functions",
                    "Classes and OOP basics",
                    "Working with files",
                    "Error handling",
                ],
            },
            {
                "title": "Web and Selector Foundations",
                "description": "Understand the web page structure and selectors used by browser automation tools.",
                "lessons": [
                    "HTML basics",
                    "CSS basics",
                    "DOM basics",
                    "Browser DevTools",
                    "XPath selectors",
                    "CSS selectors",
                ],
            },
            {
                "title": "Browser Automation",
                "description": "Practice Selenium and Playwright fundamentals through realistic UI test examples.",
                "lessons": [
                    "Selenium basics",
                    "Playwright basics",
                    "Browser automation",
                    "Locators",
                    "Assertions",
                    "Waiting strategies",
                ],
            },
            {
                "title": "Automation Architecture",
                "description": "Structure automated tests so they are maintainable, readable, and easier to debug.",
                "lessons": [
                    "Page Object Model",
                    "Fixtures",
                    "Test data",
                    "Test structure",
                    "API automation",
                    "Playwright API testing",
                    "Selenium test examples",
                ],
            },
            {
                "title": "Reports, CI, and Scaling",
                "description": "Run automated tests with useful reports, configuration, Docker, CI/CD, and parallel execution.",
                "lessons": [
                    "Reports",
                    "Allure reports",
                    "Screenshots and videos",
                    "Debugging failed tests",
                    "CI/CD basics",
                    "GitHub Actions",
                    "Docker basics",
                    "Environment variables",
                    "Test configuration",
                    "Parallel test execution",
                    "Final Automation QA project",
                ],
            },
        ],
    },
    {
        "title": "AI for QA",
        "section": "ai_for_qa",
        "description": "Use AI for requirements analysis, test generation, debugging, documentation, and responsible QA workflows.",
        "final_project": "Use AI to analyze requirements, generate tests, verify output, improve tests, and create a QA report.",
        "modules": [
            {
                "title": "AI Foundations for QA",
                "description": "Learn what AI can do for QA and how to use it safely.",
                "lessons": [
                    "What is AI in QA",
                    "How QA engineers can use AI",
                    "Risks and limits of AI in QA",
                    "Prompt engineering for QA",
                ],
            },
            {
                "title": "AI for Manual QA",
                "description": "Use AI to support requirements analysis, test design, documentation, and reporting.",
                "lessons": [
                    "AI for requirements analysis",
                    "AI for generating test cases",
                    "AI for generating checklists",
                    "AI for generating bug reports",
                    "AI for test design techniques",
                    "AI for test documentation",
                    "AI for test summary reports",
                ],
            },
            {
                "title": "AI for Technical QA",
                "description": "Use AI for API, SQL, selectors, automation drafts, debugging, and code review.",
                "lessons": [
                    "AI for API testing",
                    "AI for SQL query help",
                    "AI for XPath and CSS selectors",
                    "AI for automation scripts",
                    "AI for Playwright tests",
                    "AI for Selenium tests",
                    "AI for debugging failed tests",
                    "AI for code review",
                ],
            },
            {
                "title": "AI QA Workflow",
                "description": "Build practical, responsible workflows that combine AI speed with human QA judgment.",
                "lessons": [
                    "AI for test data generation",
                    "AI for mock data",
                    "AI agents in QA workflow",
                    "How to verify AI-generated tests",
                    "Final AI QA project",
                ],
            },
        ],
    },
]


EXTRA_LESSON_EXAMPLES: dict[str, list[dict[str, str]]] = {
    "Requirements analysis": [
        {
            "title": "Traceability matrix: registration flow",
            "content": (
                "Requirement ID | Requirement | Test scenario | Test cases | Priority | Status\n"
                "REQ-REG-01 | User can create an account with valid email and password | Successful registration | TC-REG-001, TC-REG-002 | High | Covered\n"
                "REQ-REG-02 | Email must be unique | Duplicate email validation | TC-REG-003 | High | Covered\n"
                "REQ-REG-03 | Password must follow security rules | Password validation | TC-REG-004, TC-REG-005 | Medium | Covered\n"
                "REQ-REG-04 | User sees a clear error when the server is unavailable | Service error handling | TC-REG-006 | Medium | Needs review\n\n"
                "How to use it: update the matrix when requirements change, when test cases are added, or when a defect proves that coverage is missing."
            ),
        },
        {
            "title": "Requirement review checklist",
            "content": (
                "1. Is the requirement testable with a clear expected result?\n"
                "2. Are business rules, validation rules, and edge cases stated?\n"
                "3. Are roles, permissions, supported platforms, and data limits clear?\n"
                "4. Are error messages, empty states, and loading states described?\n"
                "5. Are analytics, emails, notifications, or integrations involved?\n"
                "6. What risks should be clarified before test design starts?"
            ),
        },
    ],
    "Test scenarios": [
        {
            "title": "Scenario map: checkout",
            "content": (
                "Feature: Checkout\n"
                "- Guest user completes checkout with card payment.\n"
                "- Logged-in user applies a valid promo code.\n"
                "- User edits shipping address before payment.\n"
                "- Payment provider declines the transaction.\n"
                "- Cart item becomes unavailable during checkout.\n"
                "- User refreshes the page after payment authorization.\n\n"
                "Tip: scenarios stay high-level. Detailed steps, data, and expected results belong in test cases."
            ),
        }
    ],
    "Test cases": [
        {
            "title": "Positive test case: login with valid credentials",
            "content": (
                "ID: TC-LOGIN-001\n"
                "Priority: High\n"
                "Preconditions: User account exists and is active.\n"
                "Test data: email=student@example.com, password=Password123\n\n"
                "Steps:\n"
                "1. Open the login page.\n"
                "2. Enter the valid email.\n"
                "3. Enter the valid password.\n"
                "4. Click Login.\n\n"
                "Expected result: The user is authenticated, redirected to the dashboard, and the dashboard shows the user's learning progress."
            ),
        },
        {
            "title": "Negative test case: invalid password",
            "content": (
                "ID: TC-LOGIN-002\n"
                "Priority: High\n"
                "Preconditions: User account exists.\n"
                "Test data: email=student@example.com, password=WrongPassword\n\n"
                "Steps:\n"
                "1. Open the login page.\n"
                "2. Enter the valid email.\n"
                "3. Enter an invalid password.\n"
                "4. Click Login.\n\n"
                "Expected result: The user stays on the login page, no session is created, and a clear error message explains that credentials are invalid."
            ),
        },
        {
            "title": "Boundary test case: password length",
            "content": (
                "ID: TC-REG-004\n"
                "Priority: Medium\n"
                "Rule: Password must be at least 8 characters.\n\n"
                "Data set:\n"
                "- 7 characters: rejected with validation message.\n"
                "- 8 characters: accepted when all other password rules pass.\n"
                "- 9 characters: accepted when all other password rules pass.\n\n"
                "Expected result: The boundary is enforced exactly at 8 characters."
            ),
        },
    ],
    "Checklists": [
        {
            "title": "Smoke checklist: web release",
            "content": (
                "- Application opens without server errors.\n"
                "- Login and logout work for a standard user.\n"
                "- Main navigation links open the expected pages.\n"
                "- Course catalog loads courses and modules.\n"
                "- Lesson page loads theory, examples, practice, homework, and quiz links.\n"
                "- Form validation appears for required fields.\n"
                "- Critical API calls return successful responses.\n"
                "- No blocking console errors appear in the main user flow."
            ),
        },
        {
            "title": "Cross-browser checklist",
            "content": (
                "- Layout is usable on Chrome, Safari, and Firefox.\n"
                "- Text does not overlap at common desktop and mobile widths.\n"
                "- Buttons, links, dropdowns, and modals are keyboard-accessible.\n"
                "- Images and icons load correctly.\n"
                "- Date, number, upload, and password fields behave consistently.\n"
                "- Browser-specific issues are logged with browser version and device details."
            ),
        },
    ],
    "Bug reports": [
        {
            "title": "Bug report: checkout button stays disabled",
            "content": (
                "ID: BUG-CHECKOUT-014\n"
                "Title: Checkout button remains disabled after valid shipping data is entered\n"
                "Environment: Safari 17, macOS, staging\n"
                "Severity: Major\n"
                "Priority: High\n\n"
                "Steps to reproduce:\n"
                "1. Add any product to the cart.\n"
                "2. Open Checkout.\n"
                "3. Fill all required shipping fields with valid data.\n"
                "4. Select card payment.\n\n"
                "Actual result: Checkout button remains disabled.\n"
                "Expected result: Checkout button becomes enabled when all required fields are valid.\n"
                "Evidence: Screenshot, browser console log, and request payload attached.\n"
                "Notes: Reproduces 3/3 times on Safari, not reproduced on Chrome."
            ),
        },
        {
            "title": "Bug report quality checklist",
            "content": (
                "- Title is specific and describes the failed behavior.\n"
                "- Environment includes build, browser, OS, device, and test account when relevant.\n"
                "- Steps are numbered and reproducible.\n"
                "- Actual and expected results are separate.\n"
                "- Severity explains user or business impact.\n"
                "- Evidence is attached: screenshot, video, logs, request/response, or database state.\n"
                "- The report avoids blame and focuses on observable facts."
            ),
        },
    ],
    "Test plan": [
        {
            "title": "Test plan: profile settings release",
            "content": (
                "Scope: Profile view, edit profile, password change, avatar upload, notification settings.\n"
                "Out of scope: Billing settings, admin permissions, marketing emails.\n\n"
                "Test approach:\n"
                "- Smoke testing for critical profile flows.\n"
                "- Functional test cases for validation, save, cancel, and error states.\n"
                "- Compatibility checks on Chrome, Safari, Firefox, and mobile viewport.\n"
                "- Regression checks for login, dashboard, and account menu.\n\n"
                "Entry criteria: Requirements approved, staging build deployed, test accounts ready.\n"
                "Exit criteria: No open critical or major defects, high-priority cases passed, known risks documented.\n"
                "Risks: File upload limits, stale profile cache, email notification provider failures."
            ),
        },
        {
            "title": "Test plan checklist",
            "content": (
                "- Objective and release context are clear.\n"
                "- Scope and out-of-scope areas are explicit.\n"
                "- Test levels, types, environments, and data are listed.\n"
                "- Roles and responsibilities are assigned.\n"
                "- Entry, suspension, resumption, and exit criteria are defined.\n"
                "- Risks, assumptions, dependencies, and deliverables are documented."
            ),
        },
    ],
    "Test strategy": [
        {
            "title": "Strategy example: risk-based testing",
            "content": (
                "For a learning platform, test effort should prioritize authentication, paid access, course progress, homework submission, and admin content editing.\n\n"
                "High-risk areas get detailed test cases, regression coverage, and automation candidates. Medium-risk areas get checklist coverage and exploratory charters. Low-risk content pages get smoke checks and visual review.\n\n"
                "This strategy keeps QA effort connected to user impact instead of treating every screen as equally risky."
            ),
        }
    ],
    "Software Testing Life Cycle - STLC": [
        {
            "title": "STLC deliverables example",
            "content": (
                "Requirement analysis: clarified requirements, risks, traceability matrix draft.\n"
                "Test planning: test plan, scope, estimates, environments, entry and exit criteria.\n"
                "Test design: scenarios, test cases, checklists, test data.\n"
                "Environment setup: accounts, builds, integrations, data reset plan.\n"
                "Execution: test results, bug reports, retest notes.\n"
                "Closure: test summary report, open risks, lessons learned."
            ),
        }
    ],
    "Test summary report": [
        {
            "title": "Test summary report: example structure",
            "content": (
                "Release: Profile settings v1.4\n"
                "Testing period: 3 days\n"
                "Scope tested: profile edit, password change, avatar upload, notification preferences.\n"
                "Cases executed: 48 planned, 46 executed, 42 passed, 4 failed, 2 blocked.\n"
                "Defects: 1 critical fixed, 2 major open with workaround, 3 minor accepted.\n"
                "Recommendation: Conditional release after fixing avatar upload validation or disabling avatar upload for this release.\n"
                "Open risks: Safari upload behavior and notification provider timeout."
            ),
        }
    ],
    "AI for generating test cases": [
        {
            "title": "AI prompt for test cases",
            "content": (
                "Prompt:\n"
                "You are a QA engineer. Generate test cases for user registration. Include positive, negative, boundary, and security-focused cases. Use columns: ID, priority, preconditions, steps, test data, expected result. Do not invent requirements; list assumptions separately.\n\n"
                "Human review checklist:\n"
                "- Are all requirements covered?\n"
                "- Are expected results precise?\n"
                "- Are edge cases realistic?\n"
                "- Are assumptions separated from facts?\n"
                "- Are duplicate or low-value cases removed?"
            ),
        }
    ],
    "AI for generating checklists": [
        {
            "title": "AI prompt for checklist generation",
            "content": (
                "Prompt:\n"
                "Create a practical QA checklist for testing a web checkout flow. Group checks by cart, shipping, payment, confirmation, error handling, accessibility, and mobile. Keep every item observable and testable.\n\n"
                "Review rule: AI can draft the checklist, but a QA engineer must compare it against real requirements, analytics events, payment provider behavior, and known production risks."
            ),
        }
    ],
    "AI for generating bug reports": [
        {
            "title": "AI prompt for improving a bug report",
            "content": (
                "Prompt:\n"
                "Rewrite this rough bug note as a professional bug report with title, environment, severity, priority, preconditions, steps to reproduce, actual result, expected result, evidence, and notes. Keep only facts from the note and mark missing information as To clarify.\n\n"
                "Rough note: Login sometimes fails after password reset in Safari. User sees spinner forever. Console has 500 on /api/auth/login."
            ),
        }
    ],
}


def add_extra_lesson_examples(db, lesson: Lesson) -> None:
    examples = EXTRA_LESSON_EXAMPLES.get(lesson.title, [])
    for example in examples:
        exists = (
            db.query(LessonExample)
            .filter(LessonExample.lesson_id == lesson.id, LessonExample.title == example["title"])
            .first()
        )
        if not exists:
            db.add(LessonExample(lesson_id=lesson.id, title=example["title"], content=example["content"]))


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin_password = os.getenv("ADMIN_PASSWORD", "Password123")
            admin = User(email="admin@example.com", password_hash=hash_password(admin_password), role="admin")
            db.add(admin)
            db.flush()
        else:
            # Do not reset an existing admin's password on re-seed (preserves a changed password).
            admin.role = "admin"
        if not db.query(UserProfile).filter(UserProfile.user_id == admin.id).first():
            db.add(UserProfile(user_id=admin.id, full_name="Admin User", goal="Manage QA learning content"))

        student = db.query(User).filter(User.email == "student@example.com").first()
        if not student:
            student = User(email="student@example.com", password_hash=hash_password("Password123"), role="student")
            db.add(student)
            db.flush()
        else:
            student.password_hash = hash_password("Password123")
            student.role = "student"
        if not db.query(UserProfile).filter(UserProfile.user_id == student.id).first():
            db.add(UserProfile(user_id=student.id, full_name="Demo Student"))

        for course_blueprint in COURSE_BLUEPRINTS:
            course = db.query(Course).filter(Course.section == course_blueprint["section"]).first()
            if not course:
                course = Course(
                    title=course_blueprint["title"],
                    section=course_blueprint["section"],
                    description=course_blueprint["description"],
                )
                db.add(course)
                db.flush()
            else:
                course.title = course_blueprint["title"]
                course.description = course_blueprint["description"]
            for module_index, module_blueprint in enumerate(course_blueprint["modules"], start=1):
                module = (
                    db.query(Module)
                    .filter(Module.course_id == course.id, Module.title == module_blueprint["title"])
                    .first()
                )
                if not module:
                    module = Module(
                        course_id=course.id,
                        title=module_blueprint["title"],
                        description=module_blueprint["description"],
                        order_index=module_index,
                    )
                    db.add(module)
                    db.flush()
                else:
                    module.description = module_blueprint["description"]
                    module.order_index = module_index
                for lesson_index, lesson_title in enumerate(module_blueprint["lessons"], start=1):
                    payload = lesson_payload(lesson_title, module_blueprint["description"])
                    lesson = db.query(Lesson).filter(Lesson.module_id == module.id, Lesson.title == lesson_title).first()
                    if not lesson:
                        lesson = Lesson(module_id=module.id, order_index=lesson_index, **payload)
                        db.add(lesson)
                        db.flush()
                    else:
                        lesson.order_index = lesson_index
                        for field, value in payload.items():
                            setattr(lesson, field, value)
                    if not db.query(LessonSlide).filter(LessonSlide.lesson_id == lesson.id).count():
                        for slide_index in range(1, 6):
                            db.add(
                                LessonSlide(
                                    lesson_id=lesson.id,
                                    title=f"{lesson_title}: Slide {slide_index}",
                                    body=f"Key point {slide_index}: apply {lesson_title} through examples and practice.",
                                    order_index=slide_index,
                                )
                            )
                    if not db.query(LessonExample).filter(LessonExample.lesson_id == lesson.id).count():
                        db.add(LessonExample(lesson_id=lesson.id, title="Real QA example", content=lesson.real_world_example))
                    add_extra_lesson_examples(db, lesson)
                    if not db.query(LessonInteractiveTask).filter(LessonInteractiveTask.lesson_id == lesson.id).count():
                        db.add(
                            LessonInteractiveTask(
                                lesson_id=lesson.id,
                                task_type="analysis",
                                prompt=f"Review a short requirement and identify one testing risk related to {lesson_title}.",
                                expected_answer="A clear risk with a matching test idea.",
                            )
                        )
                    if not db.query(Homework).filter(Homework.lesson_id == lesson.id).first():
                        db.add(
                            Homework(
                                lesson_id=lesson.id,
                                task_description=f"Create a practical QA artifact for {lesson_title}.",
                                expected_result="A concise, structured answer with expected results and evidence.",
                            )
                        )
                    quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson.id).first()
                    if not quiz:
                        quiz = Quiz(lesson_id=lesson.id, title=f"{lesson_title} Quiz")
                        db.add(quiz)
                        db.flush()
                    if not db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).count():
                        for q_index in range(1, 11):
                            question = QuizQuestion(
                                quiz_id=quiz.id,
                                question=f"Question {q_index}: What is the best QA action for {lesson_title}?",
                                question_type="single",
                                explanation=(
                                    "The best answer is the one that is specific, evidence-based, "
                                    "and connected to user risk."
                                ),
                            )
                            db.add(question)
                            db.flush()
                            db.add_all(
                                [
                                    QuizAnswer(
                                        question_id=question.id,
                                        answer_text="Use clear expected results and document evidence.",
                                        is_correct=True,
                                    ),
                                    QuizAnswer(
                                        question_id=question.id,
                                        answer_text="Test randomly without notes.",
                                        is_correct=False,
                                    ),
                                    QuizAnswer(
                                        question_id=question.id,
                                        answer_text="Skip edge cases until production.",
                                        is_correct=False,
                                    ),
                                ]
                            )
            final_project = db.query(FinalProject).filter(FinalProject.course_id == course.id).first()
            if not final_project:
                db.add(
                    FinalProject(
                        course_id=course.id,
                        title=f"{course_blueprint['title']} Final Project",
                        requirements=course_blueprint["final_project"],
                    )
                )
            else:
                final_project.title = f"{course_blueprint['title']} Final Project"
                final_project.requirements = course_blueprint["final_project"]
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
