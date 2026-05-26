from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

# ─── Grade Tracker ────────────────────────────────────────────────────────────

COURSE_GRADES = [
    {
        'email': 'alex@university.edu',
        'courses': [
            {
                'course_name': 'CS401 — Advanced Algorithms',
                'target_grade': 'A',
                'assessments': [
                    {'name': 'Assignment 1', 'score': 88, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Assignment 2', 'score': 91, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 76, 'max_score': 100, 'weight': 35, 'type': 'midterm'},
                    {'name': 'Assignment 3', 'score': 95, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                ],
            },
            {
                'course_name': 'MATH201 — Linear Algebra',
                'target_grade': 'A-',
                'assessments': [
                    {'name': 'Quiz 1', 'score': 18, 'max_score': 20, 'weight': 5, 'type': 'quiz'},
                    {'name': 'Quiz 2', 'score': 17, 'max_score': 20, 'weight': 5, 'type': 'quiz'},
                    {'name': 'Midterm', 'score': 82, 'max_score': 100, 'weight': 40, 'type': 'midterm'},
                ],
            },
            {
                'course_name': 'CS301 — Operating Systems',
                'target_grade': 'B+',
                'assessments': [
                    {'name': 'Lab 1', 'score': 45, 'max_score': 50, 'weight': 8, 'type': 'assignment'},
                    {'name': 'Lab 2', 'score': 48, 'max_score': 50, 'weight': 8, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 68, 'max_score': 100, 'weight': 30, 'type': 'midterm'},
                ],
            },
        ],
    },
    {
        'email': 'maya@university.edu',
        'courses': [
            {
                'course_name': 'DS201 — Data Science Fundamentals',
                'target_grade': 'A',
                'assessments': [
                    {'name': 'Project 1', 'score': 94, 'max_score': 100, 'weight': 20, 'type': 'project'},
                    {'name': 'Midterm', 'score': 89, 'max_score': 100, 'weight': 30, 'type': 'midterm'},
                    {'name': 'Project 2', 'score': 91, 'max_score': 100, 'weight': 25, 'type': 'project'},
                ],
            },
            {
                'course_name': 'STAT301 — Probability & Statistics',
                'target_grade': 'A-',
                'assessments': [
                    {'name': 'Assignment 1', 'score': 85, 'max_score': 100, 'weight': 15, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 78, 'max_score': 100, 'weight': 35, 'type': 'midterm'},
                ],
            },
        ],
    },
    {
        'email': 'jordan@university.edu',
        'courses': [
            {
                'course_name': 'SE401 — Software Engineering Capstone',
                'target_grade': 'A',
                'assessments': [
                    {'name': 'Sprint 1 Demo', 'score': 92, 'max_score': 100, 'weight': 15, 'type': 'project'},
                    {'name': 'Sprint 2 Demo', 'score': 95, 'max_score': 100, 'weight': 15, 'type': 'project'},
                    {'name': 'Design Document', 'score': 88, 'max_score': 100, 'weight': 20, 'type': 'assignment'},
                ],
            },
            {
                'course_name': 'CS401 — Advanced Algorithms',
                'target_grade': 'A-',
                'assessments': [
                    {'name': 'Assignment 1', 'score': 84, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 79, 'max_score': 100, 'weight': 35, 'type': 'midterm'},
                ],
            },
        ],
    },
    {
        'email': 'priya@university.edu',
        'courses': [
            {
                'course_name': 'MATH301 — Real Analysis',
                'target_grade': 'A+',
                'assessments': [
                    {'name': 'Problem Set 1', 'score': 98, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Problem Set 2', 'score': 96, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 94, 'max_score': 100, 'weight': 30, 'type': 'midterm'},
                    {'name': 'Problem Set 3', 'score': 99, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                ],
            },
            {
                'course_name': 'MATH201 — Linear Algebra',
                'target_grade': 'A',
                'assessments': [
                    {'name': 'Quiz 1', 'score': 20, 'max_score': 20, 'weight': 5, 'type': 'quiz'},
                    {'name': 'Midterm', 'score': 91, 'max_score': 100, 'weight': 40, 'type': 'midterm'},
                    {'name': 'Quiz 2', 'score': 19, 'max_score': 20, 'weight': 5, 'type': 'quiz'},
                ],
            },
        ],
    },
    {
        'email': 'omar@university.edu',
        'courses': [
            {
                'course_name': 'EE301 — Signals & Systems',
                'target_grade': 'B+',
                'assessments': [
                    {'name': 'Lab 1', 'score': 38, 'max_score': 50, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 71, 'max_score': 100, 'weight': 35, 'type': 'midterm'},
                    {'name': 'Lab 2', 'score': 42, 'max_score': 50, 'weight': 10, 'type': 'assignment'},
                ],
            },
            {
                'course_name': 'MATH301 — Differential Equations',
                'target_grade': 'A-',
                'assessments': [
                    {'name': 'Assignment 1', 'score': 88, 'max_score': 100, 'weight': 15, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 83, 'max_score': 100, 'weight': 35, 'type': 'midterm'},
                ],
            },
        ],
    },
    {
        'email': 'emma@university.edu',
        'courses': [
            {
                'course_name': 'BUS201 — Business Strategy',
                'target_grade': 'A',
                'assessments': [
                    {'name': 'Case Study 1', 'score': 91, 'max_score': 100, 'weight': 20, 'type': 'assignment'},
                    {'name': 'Midterm Presentation', 'score': 88, 'max_score': 100, 'weight': 25, 'type': 'midterm'},
                ],
            },
            {
                'course_name': 'DS101 — Intro to Data Science',
                'target_grade': 'A',
                'assessments': [
                    {'name': 'Homework 1', 'score': 95, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Homework 2', 'score': 92, 'max_score': 100, 'weight': 10, 'type': 'assignment'},
                    {'name': 'Midterm', 'score': 87, 'max_score': 100, 'weight': 30, 'type': 'midterm'},
                ],
            },
        ],
    },
]

# ─── Resources ────────────────────────────────────────────────────────────────

RESOURCES = [
    {
        'title': 'Dynamic Programming Patterns — Ultimate Cheat Sheet',
        'description': 'Covers all classic DP patterns: 0/1 knapsack, unbounded knapsack, LCS, LIS, matrix chain, partition, interval DP. Includes time/space complexity for each.',
        'url': 'https://leetcode.com/discuss/study-guide/1490172/Dynamic-programming-patterns',
        'content': '',
        'category': 'cheatsheet',
        'tags': ['algorithms', 'dynamic-programming', 'cs401', 'leetcode'],
        'email': 'alex@university.edu',
    },
    {
        'title': 'Python for Data Science — Pandas & NumPy Reference',
        'description': 'Comprehensive reference for Pandas DataFrames and NumPy arrays. Covers data loading, cleaning, transformation, groupby, merging, and vectorized operations.',
        'url': '',
        'content': '## Pandas Quick Reference\n\n### Loading Data\n```python\ndf = pd.read_csv("data.csv")\ndf.head(5)\ndf.info()\ndf.describe()\n```\n\n### Filtering\n```python\ndf[df["col"] > 5]\ndf.query("col > 5 and other == True")\n```\n\n### GroupBy\n```python\ndf.groupby("category").agg({"value": ["mean", "sum", "count"]})\n```',
        'category': 'notes',
        'tags': ['python', 'pandas', 'numpy', 'data-science', 'ds201'],
        'email': 'maya@university.edu',
    },
    {
        'title': 'Git & GitHub Workflow for Team Projects',
        'description': 'A practical guide to using Git in collaborative software projects. Covers branching strategies, PR workflows, merge conflicts, rebasing, and CI/CD integration.',
        'url': 'https://www.atlassian.com/git/tutorials',
        'content': '',
        'category': 'tutorial',
        'tags': ['git', 'github', 'workflow', 'se401', 'version-control'],
        'email': 'jordan@university.edu',
    },
    {
        'title': 'Real Analysis — Epsilon-Delta Proof Strategies',
        'description': 'Step-by-step walkthrough of constructing epsilon-delta proofs for limits, continuity, and uniform continuity. Includes solved examples for all common function types.',
        'url': '',
        'content': '## Epsilon-Delta Proof Template\n\n**Goal:** Show lim(x→a) f(x) = L\n\n**Strategy:**\n1. Write the definition: For all ε > 0, find δ > 0 such that |x - a| < δ ⟹ |f(x) - L| < ε\n2. Work backwards from |f(x) - L| < ε to find what δ should be\n3. State δ explicitly, then verify forward\n\n**Common trick:** Bound |x - a| < 1 first, derive bounds on other factors, then set δ = min(1, ε/M)',
        'category': 'notes',
        'tags': ['math301', 'real-analysis', 'proofs', 'epsilon-delta', 'calculus'],
        'email': 'priya@university.edu',
    },
    {
        'title': 'Excalidraw — Free Collaborative Whiteboard',
        'description': 'Perfect for drawing algorithms, system diagrams, UML, and math proofs together in real time. No sign-up required. Export as SVG or PNG.',
        'url': 'https://excalidraw.com',
        'content': '',
        'category': 'tool',
        'tags': ['tool', 'whiteboard', 'collaboration', 'diagrams'],
        'email': 'emma@university.edu',
    },
    {
        'title': '3Blue1Brown — Essence of Linear Algebra',
        'description': 'The best visual introduction to linear algebra on YouTube. 16-video series covering vectors, matrices, determinants, eigenvalues with stunning geometric animations.',
        'url': 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
        'content': '',
        'category': 'video',
        'tags': ['linear-algebra', 'math201', 'visualisation', '3b1b', 'youtube'],
        'email': 'luca@university.edu',
    },
    {
        'title': 'UML Class Diagram Reference — CMPUT 301',
        'description': 'Complete reference for UML class diagrams as required in CMPUT 301. Covers associations, aggregation, composition, inheritance, interfaces, and multiplicity notation.',
        'url': '',
        'content': '## UML Class Diagram Notation\n\n| Symbol | Meaning |\n|--------|--------|\n| → | Dependency |\n| ─── | Association |\n| ◇─── | Aggregation (has-a, weak) |\n| ◆─── | Composition (owns-a, strong) |\n| ──▷ | Inheritance (is-a) |\n| ···▷ | Interface implementation |\n\n**Multiplicity:** 1, 0..1, *, 1..*, n..m',
        'category': 'cheatsheet',
        'tags': ['cmput301', 'uml', 'software-engineering', 'design-patterns'],
        'email': 'sarah@university.edu',
    },
    {
        'title': 'MIT OpenCourseWare — Introduction to Algorithms (6.006)',
        'description': 'Free lecture notes, problem sets, and exams from MIT 6.006. Covers sorting, hashing, dynamic programming, graphs, and shortest paths. Invaluable for CS401.',
        'url': 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
        'content': '',
        'category': 'article',
        'tags': ['algorithms', 'cs401', 'mit', 'free-course', 'sorting', 'graphs'],
        'email': 'alex@university.edu',
    },
    {
        'title': 'Signals & Systems — Fourier Transform Cheat Sheet',
        'description': 'All the Fourier transform pairs and properties you need for EE301 in one page. Includes DTFT, DFT, Z-transform, and Laplace transform tables.',
        'url': '',
        'content': '## Fourier Transform Pairs\n\n| Signal | Transform |\n|--------|----------|\n| δ(t) | 1 |\n| 1 | 2πδ(ω) |\n| e^(jω₀t) | 2πδ(ω−ω₀) |\n| cos(ω₀t) | π[δ(ω−ω₀)+δ(ω+ω₀)] |\n| rect(t/τ) | τ·sinc(ωτ/2π) |\n\n## Properties\n- Linearity: F{af+bg} = aF+bG\n- Time shift: F{f(t−t₀)} = e^(−jωt₀)F(ω)\n- Frequency shift: F{e^(jω₀t)f(t)} = F(ω−ω₀)',
        'category': 'cheatsheet',
        'tags': ['ee301', 'fourier', 'signals', 'electrical-engineering'],
        'email': 'omar@university.edu',
    },
    {
        'title': 'How to Read a CS Research Paper',
        'description': 'A structured approach to reading and critically evaluating academic papers. Covers the three-pass method, how to identify contributions, evaluate experiments, and take useful notes.',
        'url': 'https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf',
        'content': '',
        'category': 'article',
        'tags': ['research', 'grad-research', 'paper-reading', 'academic'],
        'email': 'sarah@university.edu',
    },
    {
        'title': 'Pomodoro Timer — StudySync Recommended',
        'description': 'Clean, distraction-free Pomodoro timer with customizable intervals and session tracking. Works offline and integrates with most calendar apps.',
        'url': 'https://pomofocus.io',
        'content': '',
        'category': 'tool',
        'tags': ['productivity', 'pomodoro', 'time-management', 'focus'],
        'email': 'maya@university.edu',
    },
    {
        'title': 'Big-O Complexity Cheat Sheet',
        'description': 'Time and space complexity for all major data structures and algorithms — sorting, searching, trees, heaps, graphs, and hash tables. Essential interview prep.',
        'url': 'https://www.bigocheatsheet.com',
        'content': '',
        'category': 'cheatsheet',
        'tags': ['big-o', 'complexity', 'algorithms', 'cs401', 'interview'],
        'email': 'jordan@university.edu',
    },
]

# ─── Tutor Listings ───────────────────────────────────────────────────────────

TUTOR_LISTINGS = [
    {
        'email': 'alex@university.edu',
        'subjects': ['CS401', 'CS301', 'Algorithms', 'Dynamic Programming'],
        'bio': 'Third-year CS student with strong background in algorithms and systems. I have TAed CS201 informally and love breaking down complex problems into simple steps. Specialise in LeetCode-style problem solving and technical interview prep.',
        'availability': 'Weekday evenings (6–9pm), Saturday mornings',
    },
    {
        'email': 'priya@university.edu',
        'subjects': ['MATH201', 'MATH301', 'STAT201', 'Linear Algebra', 'Real Analysis'],
        'bio': 'Mathematics major with a passion for proofs and pure math. I can help with anything from calculus through real analysis and abstract algebra. Patient, methodical, and good at tailoring explanations to your level.',
        'availability': 'Flexible — mornings and weekends work best',
    },
    {
        'email': 'maya@university.edu',
        'subjects': ['DS201', 'STAT301', 'Python', 'Pandas', 'Machine Learning basics'],
        'bio': 'Data Science student with hands-on project experience in Python, Pandas, and sklearn. Great at helping with data wrangling, EDA, and building your first ML models. Also happy to help with stats concepts.',
        'availability': 'Afternoons Tuesday/Thursday, Sunday afternoons',
    },
    {
        'email': 'sarah@university.edu',
        'subjects': ['COGS301', 'Research Methods', 'Academic Writing', 'LaTeX'],
        'bio': 'PhD-track cognitive science student. Can help with research methodology, reading academic papers, writing literature reviews, and formatting papers in LaTeX. Also good at PSYC courses.',
        'availability': 'By appointment — message me and we\'ll find a time',
    },
    {
        'email': 'omar@university.edu',
        'subjects': ['EE301', 'EE401', 'Circuits', 'Signal Processing', 'MATLAB'],
        'bio': 'Third-year EE student with strong math and circuit fundamentals. Can tutor analog/digital circuits, signals & systems, and help with MATLAB. Working on an autonomous drone project so robotics questions welcome too.',
        'availability': 'Weekday evenings, Saturday afternoons',
    },
]

# ─── Tutoring Requests ────────────────────────────────────────────────────────

TUTORING_REQUESTS = [
    # (requester_email, tutor_email, message, status)
    ('luca@university.edu', 'alex@university.edu',
     'Hi Alex! I am a first-year CS student really struggling with the dynamic programming unit in CS201. Your profile sounds perfect — would you be able to help me understand the coin change and knapsack problems?',
     'accepted'),
    ('emma@university.edu', 'priya@university.edu',
     'Hi Priya! I have a MATH201 final coming up in 3 weeks and eigenvalues/eigenvectors are not clicking for me at all. Would you be open to a couple of sessions?',
     'accepted'),
    ('jordan@university.edu', 'maya@university.edu',
     'Hey Maya, I am trying to add a data analysis component to my SE capstone and could use help structuring a pandas pipeline. Would you have 1–2 hours this week?',
     'pending'),
    ('luca@university.edu', 'priya@university.edu',
     'Hi Priya! I see you tutor MATH201 — I need help with vector spaces and linear transformations before the midterm next week. Are you available?',
     'pending'),
    ('emma@university.edu', 'maya@university.edu',
     'Hi Maya! I am taking DS101 and just started the NumPy unit — would love some help with array operations and broadcasting. Could we set something up?',
     'accepted'),
    ('luca@university.edu', 'omar@university.edu',
     'Hi Omar! I am considering switching to EE and wanted to ask some questions about the program, plus I have a physics circuits assignment that I am stuck on. Would you mind chatting?',
     'declined'),
]

# ─── Study Plans ──────────────────────────────────────────────────────────────

STUDY_PLANS = [
    {
        'email': 'alex@university.edu',
        'goal': 'Prepare for CS401 final exam — master all graph algorithms and dynamic programming patterns',
        'week_offset': 0,
        'plan': [
            {'day': 'Monday',    'subject': 'CS401',  'duration_min': 90,  'task': 'Review BFS/DFS and their applications — flood fill, cycle detection, topological sort', 'priority': 'high'},
            {'day': 'Tuesday',   'subject': 'MATH201', 'duration_min': 60,  'task': 'Practice eigenvalue decomposition problems — 3 past exam questions', 'priority': 'medium'},
            {'day': 'Wednesday', 'subject': 'CS401',  'duration_min': 120, 'task': 'Dynamic programming deep dive — coin change, knapsack, LCS variants', 'priority': 'high'},
            {'day': 'Thursday',  'subject': 'CS301',  'duration_min': 60,  'task': 'Review process scheduling algorithms and memory management concepts', 'priority': 'medium'},
            {'day': 'Friday',    'subject': 'CS401',  'duration_min': 90,  'task': 'Shortest path algorithms — Dijkstra, Bellman-Ford, Floyd-Warshall with proofs', 'priority': 'high'},
            {'day': 'Saturday',  'subject': 'CS401',  'duration_min': 150, 'task': 'Full past exam simulation — timed, closed notes, then review every mistake', 'priority': 'high'},
            {'day': 'Sunday',    'subject': 'MATH201', 'duration_min': 45,  'task': 'Complete linear algebra problem set 4 — focus on transformation matrices', 'priority': 'low'},
        ],
    },
    {
        'email': 'maya@university.edu',
        'goal': 'Complete DS201 project and catch up on STAT301 lectures before midterm',
        'week_offset': 0,
        'plan': [
            {'day': 'Monday',    'subject': 'DS201',  'duration_min': 90,  'task': 'Data cleaning pipeline — handle missing values and outliers in project dataset', 'priority': 'high'},
            {'day': 'Tuesday',   'subject': 'STAT301', 'duration_min': 60,  'task': 'Catch up on probability distributions lecture — binomial, Poisson, normal', 'priority': 'high'},
            {'day': 'Wednesday', 'subject': 'DS201',  'duration_min': 120, 'task': 'EDA and feature engineering — build visualisation dashboard for project', 'priority': 'high'},
            {'day': 'Thursday',  'subject': 'STAT301', 'duration_min': 60,  'task': 'Practice hypothesis testing problems — t-test, chi-square, ANOVA', 'priority': 'medium'},
            {'day': 'Friday',    'subject': 'DS201',  'duration_min': 90,  'task': 'Model selection and evaluation — cross-validation, precision/recall curves', 'priority': 'high'},
            {'day': 'Saturday',  'subject': 'DS201',  'duration_min': 120, 'task': 'Write up project report — methodology, results, and limitations sections', 'priority': 'high'},
            {'day': 'Sunday',    'subject': 'STAT301', 'duration_min': 45,  'task': 'Review and organise lecture notes into study guide for midterm', 'priority': 'low'},
        ],
    },
    {
        'email': 'priya@university.edu',
        'goal': 'Maintain A+ in Real Analysis and prepare to TA MATH201 next semester',
        'week_offset': 0,
        'plan': [
            {'day': 'Monday',    'subject': 'MATH301', 'duration_min': 90,  'task': 'Work through Chapter 7 — sequences and series convergence theorems', 'priority': 'high'},
            {'day': 'Tuesday',   'subject': 'MATH201', 'duration_min': 60,  'task': 'Review teaching materials for linear maps and kernel/image — prepare examples', 'priority': 'medium'},
            {'day': 'Wednesday', 'subject': 'MATH301', 'duration_min': 90,  'task': 'Problem set 4 — uniform convergence and Weierstrass M-test problems', 'priority': 'high'},
            {'day': 'Thursday',  'subject': 'MATH201', 'duration_min': 45,  'task': 'Write practice problems for eigenvectors unit — at least 5 varied examples', 'priority': 'low'},
            {'day': 'Friday',    'subject': 'MATH301', 'duration_min': 90,  'task': 'Metric spaces and topology — open/closed sets, compactness, Heine-Borel', 'priority': 'high'},
            {'day': 'Saturday',  'subject': 'MATH301', 'duration_min': 120, 'task': 'Read ahead: Chapter 9 intro and solve the first 3 exercises independently', 'priority': 'medium'},
            {'day': 'Sunday',    'subject': 'MATH201', 'duration_min': 60,  'task': 'Attend study group and help review eigenvalues with two students', 'priority': 'medium'},
        ],
    },
    {
        'email': 'alex@university.edu',
        'goal': 'Interview prep sprint — LeetCode medium/hard problems every day',
        'week_offset': -7,
        'plan': [
            {'day': 'Monday',    'subject': 'CS401',  'duration_min': 90,  'task': 'Array and string manipulation — sliding window and two pointer patterns', 'priority': 'high'},
            {'day': 'Tuesday',   'subject': 'CS401',  'duration_min': 90,  'task': 'Tree traversals — recursive and iterative BFS/DFS, lowest common ancestor', 'priority': 'high'},
            {'day': 'Wednesday', 'subject': 'CS401',  'duration_min': 90,  'task': 'Backtracking — N-queens, permutations, subsets, word search', 'priority': 'high'},
            {'day': 'Thursday',  'subject': 'CS301',  'duration_min': 45,  'task': 'System design basics — load balancing, caching, database sharding overview', 'priority': 'medium'},
            {'day': 'Friday',    'subject': 'CS401',  'duration_min': 90,  'task': 'Graph algorithms — union-find, Kruskal MST, Prim MST, bipartite check', 'priority': 'high'},
            {'day': 'Saturday',  'subject': 'CS401',  'duration_min': 60,  'task': 'Mock interview simulation — 2 medium problems, 45 min each, then debrief', 'priority': 'high'},
            {'day': 'Sunday',    'subject': 'CS301',  'duration_min': 30,  'task': 'Rest day — light review only, skim OS concepts flashcards', 'priority': 'low'},
        ],
    },
]

# ─── Wiki Pages ───────────────────────────────────────────────────────────────

WIKI_PAGES = [
    {
        'community_slug': 'cs401-algorithms',
        'pages': [
            {
                'slug': 'exam-topics',
                'title': 'Final Exam Topics & Checklist',
                'content': '# Final Exam Topics — CS401\n\nUse this checklist to track your preparation. Check off each topic as you feel confident.\n\n## Sorting & Searching\n- [ ] Comparison-based lower bound (Ω(n log n))\n- [ ] Merge sort, heap sort, quicksort — time/space complexity\n- [ ] Linear-time sorting: counting sort, radix sort, bucket sort\n- [ ] Binary search and variants (rotated array, first/last occurrence)\n\n## Graph Algorithms\n- [ ] BFS — shortest path in unweighted graphs, level-order traversal\n- [ ] DFS — cycle detection, topological sort, SCC (Kosaraju/Tarjan)\n- [ ] Dijkstra\'s algorithm — priority queue implementation\n- [ ] Bellman-Ford — negative edge weights, negative cycle detection\n- [ ] Floyd-Warshall — all-pairs shortest paths\n- [ ] Prim\'s and Kruskal\'s MST algorithms\n\n## Dynamic Programming\n- [ ] Memoisation vs tabulation\n- [ ] 0/1 Knapsack and unbounded knapsack\n- [ ] Longest Common Subsequence (LCS)\n- [ ] Longest Increasing Subsequence (LIS) — O(n²) and O(n log n)\n- [ ] Coin change (min coins and number of ways)\n- [ ] Matrix chain multiplication\n- [ ] Edit distance (Levenshtein)\n\n## Data Structures\n- [ ] Binary heaps — insert, extract-min, heapify\n- [ ] Union-Find (Disjoint Set Union) — path compression, union by rank\n- [ ] Segment trees — range query, point update\n- [ ] Tries — insert, search, prefix search\n\n## Tips from Past Students\n> Practice deriving time complexity from scratch — don\'t just memorise it. The exam often asks for justification.\n\n> Know how to trace through algorithms on a small example. Draw the state at each step.\n',
                'author_email': 'alex@university.edu',
            },
            {
                'slug': 'dp-patterns',
                'title': 'Dynamic Programming Pattern Guide',
                'content': '# Dynamic Programming Patterns\n\nA pattern-based approach to recognising and solving DP problems.\n\n## Pattern 1 — 0/1 Knapsack\n\n**Recognise when:** You have items with weight and value, a capacity constraint, and each item can be used at most once.\n\n**State:** `dp[i][w]` = max value using first `i` items with weight limit `w`\n\n**Transition:**\n```\ndp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + value[i])\n```\n\n**Problems:** 0/1 Knapsack, Partition Equal Subset Sum, Target Sum\n\n---\n\n## Pattern 2 — Unbounded Knapsack\n\n**Recognise when:** Same as above but items can be reused infinitely.\n\n**Transition:**\n```\ndp[w] = max(dp[w], dp[w - weight[i]] + value[i])  # iterate items in outer loop\n```\n\n**Problems:** Coin Change (min coins), Coin Change II (count ways), Integer Break\n\n---\n\n## Pattern 3 — Longest Common Subsequence\n\n**State:** `dp[i][j]` = LCS length of `s1[0..i]` and `s2[0..j]`\n\n**Transition:**\n```\nif s1[i] == s2[j]: dp[i][j] = dp[i-1][j-1] + 1\nelse: dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n```\n\n**Problems:** LCS, Edit Distance, Shortest Common Supersequence, Distinct Subsequences\n\n---\n\n## Pattern 4 — LIS (O(n log n))\n\nUse patience sorting with binary search. Maintain a `tails` array where `tails[i]` is the smallest tail of increasing subsequences of length `i+1`.\n\n```python\nimport bisect\ndef lis_length(nums):\n    tails = []\n    for n in nums:\n        pos = bisect.bisect_left(tails, n)\n        if pos == len(tails):\n            tails.append(n)\n        else:\n            tails[pos] = n\n    return len(tails)\n```\n',
                'author_email': 'jordan@university.edu',
            },
            {
                'slug': 'resources',
                'title': 'Recommended Resources',
                'content': '# CS401 Resource List\n\nCurated by the community — add your favourites!\n\n## Textbooks\n- **CLRS** (Introduction to Algorithms, 4th ed.) — the bible. Chapters 15 (DP), 22–25 (Graphs) are most relevant\n- **Algorithm Design** by Kleinberg & Tardos — great for flow networks and NP-completeness intuition\n\n## Online Judges\n- **LeetCode** — best for DP and graph problems. Filter by tag + medium/hard\n- **Codeforces** — best for competitive programming style problems\n- **CSES Problem Set** — curated list of classic problems, roughly ordered by difficulty\n\n## Video Lectures\n- MIT 6.006 (OpenCourseWare) — lectures by Srini Devadas, excellent production quality\n- Abdul Bari\'s Algorithm playlist on YouTube — very clear explanations with diagrams\n- NeetCode on YouTube — LeetCode patterns explained concisely\n\n## Visualisers\n- **VisuAlgo** (visualgo.net) — animate sorting, graph, and DP algorithms step by step\n- **Algorithm Visualizer** (algorithm-visualizer.org) — run and visualise your own code\n\n## Flashcard Decks\n- Anki deck for algorithm complexity — search "Big-O Anki" on AnkiWeb\n',
                'author_email': 'maya@university.edu',
            },
        ],
    },
    {
        'community_slug': 'machine-learning',
        'pages': [
            {
                'slug': 'getting-started',
                'title': 'Getting Started with ML',
                'content': '# Getting Started with Machine Learning\n\nWelcome to the ML community wiki! This page helps you find the right starting point based on your background.\n\n## Prerequisites\n\n- **Linear Algebra:** Vectors, matrices, eigenvalues. Watch 3Blue1Brown\'s Essence of Linear Algebra series.\n- **Calculus:** Partial derivatives and the chain rule. You need these to understand backpropagation.\n- **Probability:** Bayes\' theorem, probability distributions, expectation. Khan Academy is sufficient.\n- **Python:** Comfortable with NumPy arrays and pandas DataFrames.\n\n## Recommended Learning Path\n\n### Beginner (0–3 months)\n1. Andrew Ng\'s Machine Learning Specialisation (Coursera) — free to audit\n2. Fast.ai Practical Deep Learning — top-down approach, very project-focused\n3. Scikit-learn official tutorials — learn the standard ML workflow\n\n### Intermediate (3–9 months)\n1. Deep Learning Specialisation (Coursera) — CNNs, RNNs, transformers\n2. CS231n (Stanford) — computer vision, excellent lecture notes\n3. CS224n (Stanford) — NLP with deep learning\n\n### Advanced (9+ months)\n1. Read papers on arXiv and Papers With Code\n2. Reproduce a paper from scratch\n3. Contribute to open-source (Hugging Face, PyTorch)\n\n## Essential Libraries\n\n| Library | Use Case |\n|---------|----------|\n| NumPy | Array math |\n| Pandas | Data manipulation |\n| Matplotlib/Seaborn | Visualisation |\n| Scikit-learn | Classical ML |\n| PyTorch | Deep learning |\n| Transformers (HF) | Pre-trained models |\n',
                'author_email': 'sarah@university.edu',
            },
            {
                'slug': 'paper-reading-guide',
                'title': 'How to Read ML Papers',
                'content': '# How to Read Machine Learning Papers\n\nReading research papers is a skill that takes practice. Here\'s our community\'s guide.\n\n## The Three-Pass Method\n\n### Pass 1 — Survey (5–10 min)\n- Read title, abstract, introduction, and conclusion\n- Glance at figures and tables\n- **Goal:** Decide if the paper is worth your time and identify the main claim\n\n### Pass 2 — Understand (30–60 min)\n- Read the full paper except proofs\n- Pay attention to experimental setup and results\n- Note any claims you don\'t believe or don\'t understand\n- **Goal:** Summarise the paper\'s contribution in 2–3 sentences\n\n### Pass 3 — Reproduce (several hours)\n- Understand every detail well enough to re-implement it\n- Verify every assumption in the proofs\n- **Goal:** Identify both strengths and weaknesses of the work\n\n## Key Questions to Ask\n\n1. **What problem does this solve?** Is it a new problem or a better solution to an existing one?\n2. **What is the key idea?** Can you explain it in one sentence?\n3. **How is it evaluated?** Are the baselines fair? Is the evaluation realistic?\n4. **What are the limitations?** Authors often bury these in the last paragraph.\n5. **What would you do next?** Follow-up ideas are often more valuable than the paper itself.\n\n## Paper Recommendation Sites\n- Papers With Code (paperswithcode.com) — find code for any paper\n- Semantic Scholar — citation graphs and related work\n- arXiv Sanity (by Karpathy) — filter the noise on arXiv\n',
                'author_email': 'sarah@university.edu',
            },
        ],
    },
    {
        'community_slug': 'cmput301',
        'pages': [
            {
                'slug': 'project-guidelines',
                'title': 'Project Structure & Guidelines',
                'content': '# CMPUT 301 Project Guidelines\n\nA community-maintained guide to surviving (and thriving in) the course project.\n\n## Project Structure Overview\n\nYour Android app must follow the **MVC or MVP architecture**. The graders specifically look for separation of concerns.\n\n```\napp/\n├── model/          # Data classes and business logic\n│   ├── User.java\n│   ├── Event.java\n│   └── Repository.java\n├── view/           # Activities, Fragments, Adapters\n│   ├── MainActivity.java\n│   └── EventListFragment.java\n├── controller/     # Presenters or ViewModels\n└── database/       # Firestore helpers\n```\n\n## Firestore Tips\n\n- Use **subcollections** for one-to-many relationships (e.g., `users/{uid}/events/{eventId}`)\n- Always handle `onFailure` callbacks — the grader will try to break your app offline\n- Use `DocumentSnapshot.toObject(MyClass.class)` with a no-arg constructor\n\n## Common Grading Pitfalls\n\n1. **No input validation** — crash on empty fields = automatic deduction\n2. **Hardcoded device ID** — must use `Settings.Secure.ANDROID_ID`\n3. **Missing back navigation** — every screen must handle the back button\n4. **No loading states** — show a ProgressBar during Firestore operations\n5. **Landscape layout broken** — test rotation!\n\n## UML Diagrams\n\nSee the UML cheat sheet in the Resource Library for notation reference. Your class diagram should show:\n- All model classes with attributes and methods\n- All associations with multiplicities\n- Interface implementations (dashed arrow with hollow head)\n',
                'author_email': 'jordan@university.edu',
            },
        ],
    },
    {
        'community_slug': 'math-stats',
        'pages': [
            {
                'slug': 'proof-techniques',
                'title': 'Common Proof Techniques',
                'content': '# Proof Techniques Reference\n\nA guide to the most common proof strategies used across MATH courses.\n\n## 1. Direct Proof\nAssume the hypothesis. Apply definitions and theorems to reach the conclusion.\n\n**Use when:** The statement is of the form "If P then Q" and there\'s a natural chain of deductions.\n\n**Example:** Prove that if n is even, then n² is even.\n*Proof:* n = 2k for some integer k. So n² = 4k² = 2(2k²), which is even. □\n\n## 2. Proof by Contradiction\nAssume the negation. Derive a contradiction.\n\n**Use when:** The conclusion is an existence claim or the direct approach is blocked.\n\n**Example:** Prove √2 is irrational.\n*Proof:* Assume √2 = p/q in lowest terms. Then 2q² = p², so p is even. Write p = 2m. Then 2q² = 4m², so q is even. Contradicts gcd(p,q)=1. □\n\n## 3. Proof by Induction\nBase case + inductive step (assume P(k), prove P(k+1)).\n\n**Strong induction:** Assume P(1), P(2), ..., P(k) to prove P(k+1). Use when each case depends on multiple previous cases.\n\n**Well-ordering principle:** Every non-empty subset of ℕ has a least element. Sometimes cleaner than induction.\n\n## 4. Epsilon-Delta Arguments\n\nSee the separate wiki page on epsilon-delta proofs in the community or in the Resource Library.\n\n**Key tip:** Always scratch-work backwards — start from |f(x) - L| < ε and work out what δ should be. Then write the proof forwards.\n\n## 5. Proof by Contrapositive\nProve "not Q implies not P" instead of "P implies Q".\n\n**Use when:** The contrapositive is easier to work with directly.\n',
                'author_email': 'priya@university.edu',
            },
        ],
    },
    {
        'community_slug': 'cs-careers',
        'pages': [
            {
                'slug': 'interview-prep',
                'title': 'Technical Interview Preparation Guide',
                'content': '# Technical Interview Preparation\n\nA structured plan to land your CS internship or new grad role.\n\n## Timeline\n\n### 3 Months Out\n- Pick one language for interviews (Python recommended — concise and readable)\n- Start with LeetCode Easy problems to build fluency\n- Study array, string, and hash map patterns\n\n### 2 Months Out\n- Move to LeetCode Medium problems\n- Learn: Two pointers, sliding window, binary search, BFS/DFS, backtracking\n- Do 1–2 mock interviews with a friend per week\n\n### 1 Month Out\n- Tackle LeetCode Hard selectively (focus on patterns, not grinding)\n- Practice system design basics: load balancing, caching, databases, APIs\n- Behavioural stories: prepare 5 strong STAR examples\n\n## Problem-Solving Framework\n\n1. **Clarify** — ask about input size, constraints, edge cases (null, empty, duplicates)\n2. **Brute force first** — state the naive O(n²) solution, then optimise\n3. **Optimise out loud** — think through data structure choices verbally\n4. **Code cleanly** — meaningful variable names, no magic numbers\n5. **Test with examples** — walk through your code with the sample input\n6. **Analyse complexity** — state time and space complexity unprompted\n\n## Top Companies Currently Recruiting on Campus\n\n| Company | Timeline | Note |\n|---------|----------|------|\n| Google | Aug–Oct | Online assessment first |\n| Microsoft | Sep–Nov | Conversational style |\n| Amazon | Oct–Dec | Lots of LP questions |\n| Shopify | Sep–Nov | Very culture-focused |\n| RBC / TD | Aug–Sep | Coop-friendly |\n\n*Update this table as you get info!*\n',
                'author_email': 'alex@university.edu',
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed mock data for all new features: grades, resources, tutoring, planner, wiki'

    def handle(self, *args, **kwargs):
        from apps.analytics.models import CourseGrade
        from apps.resources.models import Resource, ResourceVote
        from apps.tutoring.models import TutorListing, TutoringRequest
        from apps.ai_assistant.models import StudyPlan
        from apps.communities.models import Community, WikiPage
        from datetime import date

        self.stdout.write('Seeding new feature data...\n')

        # ── Grade Tracker ──────────────────────────────────────────────────────
        self.stdout.write('📊 Seeding grades...')
        grade_count = 0
        for entry in COURSE_GRADES:
            try:
                user = User.objects.get(email=entry['email'])
            except User.DoesNotExist:
                continue
            for c in entry['courses']:
                CourseGrade.objects.get_or_create(
                    user=user,
                    course_name=c['course_name'],
                    defaults={
                        'target_grade': c['target_grade'],
                        'assessments': c['assessments'],
                    }
                )
                grade_count += 1
        self.stdout.write(f'  ✓ {grade_count} course grades created\n')

        # ── Resources ──────────────────────────────────────────────────────────
        self.stdout.write('📚 Seeding resources...')
        resource_count = 0
        all_users = list(User.objects.filter(email__in=[r['email'] for r in RESOURCES]))
        user_by_email = {u.email: u for u in all_users}

        created_resources = []
        for r in RESOURCES:
            creator = user_by_email.get(r['email'])
            if not creator:
                continue
            resource, created = Resource.objects.get_or_create(
                title=r['title'],
                defaults={
                    'description': r['description'],
                    'url': r.get('url', ''),
                    'content': r.get('content', ''),
                    'category': r['category'],
                    'tags': r['tags'],
                    'created_by': creator,
                }
            )
            if created:
                resource_count += 1
            created_resources.append(resource)

        # Add realistic upvotes
        all_demo_users = list(User.objects.filter(
            email__in=[u['email'] for u in [
                {'email': 'alex@university.edu'}, {'email': 'maya@university.edu'},
                {'email': 'jordan@university.edu'}, {'email': 'priya@university.edu'},
                {'email': 'luca@university.edu'}, {'email': 'sarah@university.edu'},
                {'email': 'omar@university.edu'}, {'email': 'emma@university.edu'},
            ]]
        ))
        for resource in created_resources:
            vote_count = random.randint(2, min(len(all_demo_users), 7))
            voters = random.sample(all_demo_users, k=vote_count)
            for voter in voters:
                if voter != resource.created_by:
                    ResourceVote.objects.get_or_create(resource=resource, user=voter)
            resource.upvotes = resource.votes.count()
            resource.save(update_fields=['upvotes'])

        self.stdout.write(f'  ✓ {resource_count} resources created with votes\n')

        # ── Tutor Listings ─────────────────────────────────────────────────────
        self.stdout.write('🎓 Seeding tutor listings...')
        listing_count = 0
        listing_map = {}
        for lt in TUTOR_LISTINGS:
            try:
                tutor = User.objects.get(email=lt['email'])
            except User.DoesNotExist:
                continue
            listing, created = TutorListing.objects.get_or_create(
                tutor=tutor,
                defaults={
                    'subjects': lt['subjects'],
                    'bio': lt['bio'],
                    'availability': lt['availability'],
                    'is_active': True,
                }
            )
            listing_map[lt['email']] = listing
            if created:
                listing_count += 1

        # ── Tutoring Requests ──────────────────────────────────────────────────
        request_count = 0
        for req_email, tutor_email, message, status in TUTORING_REQUESTS:
            listing = listing_map.get(tutor_email)
            if not listing:
                continue
            try:
                requester = User.objects.get(email=req_email)
            except User.DoesNotExist:
                continue
            if requester == listing.tutor:
                continue
            tr, created = TutoringRequest.objects.get_or_create(
                requester=requester,
                listing=listing,
                defaults={'message': message, 'status': status}
            )
            if not created:
                tr.status = status
                tr.save(update_fields=['status'])
            if created:
                request_count += 1

        self.stdout.write(f'  ✓ {listing_count} listings, {request_count} requests\n')

        # ── Study Plans ────────────────────────────────────────────────────────
        self.stdout.write('📅 Seeding study plans...')
        plan_count = 0
        for sp in STUDY_PLANS:
            try:
                user = User.objects.get(email=sp['email'])
            except User.DoesNotExist:
                continue
            week_start = date.today() + __import__('datetime').timedelta(days=sp['week_offset'])
            # Align to Monday
            week_start -= __import__('datetime').timedelta(days=week_start.weekday())
            plan, created = StudyPlan.objects.get_or_create(
                user=user,
                week_start=week_start,
                defaults={'goal': sp['goal'], 'plan_data': sp['plan']}
            )
            if created:
                plan_count += 1

        self.stdout.write(f'  ✓ {plan_count} study plans created\n')

        # ── Wiki Pages ─────────────────────────────────────────────────────────
        self.stdout.write('📖 Seeding wiki pages...')
        wiki_count = 0
        for community_data in WIKI_PAGES:
            try:
                community = Community.objects.get(slug=community_data['community_slug'])
            except Community.DoesNotExist:
                self.stdout.write(f'  ! Community {community_data["community_slug"]} not found, skipping')
                continue
            for page_data in community_data['pages']:
                try:
                    author = User.objects.get(email=page_data['author_email'])
                except User.DoesNotExist:
                    author = User.objects.filter(is_staff=True).first()
                _, created = WikiPage.objects.get_or_create(
                    community=community,
                    slug=page_data['slug'],
                    defaults={
                        'title': page_data['title'],
                        'content': page_data['content'],
                        'created_by': author,
                        'updated_by': author,
                    }
                )
                if created:
                    wiki_count += 1

        self.stdout.write(f'  ✓ {wiki_count} wiki pages created\n')

        self.stdout.write(self.style.SUCCESS('\n✅ All new feature data seeded successfully!'))
        self.stdout.write(f'   Grades: {grade_count} | Resources: {resource_count} | '
                          f'Listings: {listing_count} | Plans: {plan_count} | Wiki: {wiki_count}')
