from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

COMMUNITIES = [
    {
        'name': 'CS401 — Advanced Algorithms',
        'slug': 'cs401-algorithms',
        'description': 'Discussion hub for Advanced Algorithms. Share resources, ask about problem sets, collaborate on exam prep, and post internship tips related to algorithms.',
        'icon': '📘',
        'category': 'course',
    },
    {
        'name': 'Machine Learning @ University',
        'slug': 'machine-learning',
        'description': 'For ML enthusiasts: paper discussions, Kaggle competitions, model architectures, and everything from linear regression to transformers.',
        'icon': '🧠',
        'category': 'department',
    },
    {
        'name': 'CMPUT 301 — Software Engineering',
        'slug': 'cmput301',
        'description': 'Surviving CMPUT 301 together. Android projects, UML diagrams, design patterns, and the eternal question: why is my app crashing?',
        'icon': '💻',
        'category': 'course',
    },
    {
        'name': 'Math & Statistics Help Desk',
        'slug': 'math-stats',
        'description': 'Real analysis, linear algebra, probability, stats — post your questions here. Upper years and TAs hang around. No question is too basic.',
        'icon': '📐',
        'category': 'general',
    },
    {
        'name': 'CS Internship & Career Hub',
        'slug': 'cs-careers',
        'description': 'Interview prep, resume reviews, offer comparisons, company ratings, and co-op experiences. We help each other land great jobs.',
        'icon': '📋',
        'category': 'general',
    },
    {
        'name': 'Data Science Resources',
        'slug': 'data-science-resources',
        'description': 'Curated resources: datasets, notebooks, tutorials, and tools. Share what has helped you and discover hidden gems from the community.',
        'icon': '📊',
        'category': 'resources',
    },
    {
        'name': 'Freshman CS Survival',
        'slug': 'freshman-cs',
        'description': 'First year in CS? Welcome! This is your safe space. Ask anything — courses to take, profs to avoid, study strategies, and campus life.',
        'icon': '📖',
        'category': 'general',
    },
    {
        'name': 'Hackathon & Competitions',
        'slug': 'hackathons',
        'description': 'Team forming, event announcements, post-hack retrospectives, and everything about competitive programming. Hack the planet.',
        'icon': '⚙️',
        'category': 'events',
    },
    {
        'name': 'Campus Events & Social',
        'slug': 'campus-events',
        'description': 'What is happening on campus this week? Study group meetups, club events, department seminars, free food alerts, and more.',
        'icon': '📅',
        'category': 'events',
    },
    {
        'name': 'Graduate & Research Students',
        'slug': 'grad-research',
        'description': 'PhD students, Masters candidates, and research assistants. Thesis struggles, publication tips, supervisor relationships, and academic life.',
        'icon': '🔬',
        'category': 'department',
    },
    {
        'name': 'Web Dev & Open Source',
        'slug': 'web-dev',
        'description': 'Frontend, backend, full-stack, DevOps — all welcome. Side projects, framework debates, job postings, and open source contributions.',
        'icon': '🖥️',
        'category': 'resources',
    },
    {
        'name': 'Mental Health & Wellness',
        'slug': 'wellness',
        'description': 'A judgment-free space to talk about stress, burnout, imposter syndrome, and staying healthy during your degree. You are not alone.',
        'icon': '🤝',
        'category': 'general',
    },
]

POSTS = [
    # cs401-algorithms
    {
        'community_slug': 'cs401-algorithms',
        'title': 'Best resources for mastering dynamic programming before finals?',
        'body': 'I have been struggling with DP problems all semester. I can understand the concept when explained but freeze up on new problems. What resources or practice strategies finally made it click for you? Currently going through Leetcode but it feels scattered.',
        'post_type': 'question',
        'is_anonymous': False,
        'author_idx': 4,
        'score': 47,
        'comments': [
            ('Neetcode on YouTube is literally the GOAT for DP. He explains the intuition first then builds the solution. After watching his DP playlist twice it finally clicked for me.', 0, False, 23),
            ('Agree on Neetcode. Also recommend doing problems in patterns: coins/knapsack → LCS → palindromes → interval DP. Doing them in clusters makes the patterns obvious.', 1, False, 18),
            ('Atcoder educational DP contest. 26 problems, clean problem statements, ordered by difficulty. Probably the single best DP practice resource.', 2, False, 31),
            ('This! The Atcoder DP contest is underrated. Print the state definition and transition on paper. Physically writing it helps a lot.', 0, False, 12),
            ('I also found "Thinking Like a Programmer" helpful for the mindset shift. DP is mostly about identifying overlapping subproblems — once you see that, everything follows.', 3, False, 8),
        ],
    },
    {
        'community_slug': 'cs401-algorithms',
        'title': 'Assignment 3 clarification — is the time complexity O(n log n) or O(n²) for the merge step?',
        'body': 'The assignment spec says "efficient" but does not specify. The TA office hours are packed this week. Has anyone confirmed with the prof? My current approach is O(n log n) using a heap but I want to make sure I am not over-engineering it.',
        'post_type': 'question',
        'is_anonymous': False,
        'author_idx': 1,
        'score': 22,
        'comments': [
            ('Asked the prof on Piazza. She said O(n log n) is expected and heap is the intended approach. O(n²) will get partial credit.', 2, False, 19),
            ('Thank you! Piazza answer finally. I was about to implement a BST for no reason.', 1, False, 7),
            ('Worth noting: the follow-up part of the question asks you to improve it, so having the O(n log n) baseline correct is important for full marks.', 3, False, 5),
        ],
    },
    {
        'community_slug': 'cs401-algorithms',
        'title': '📚 Comprehensive Algorithm Cheat Sheet — Midterm Edition',
        'body': 'Hey everyone! I compiled everything from the first half of the course into a single cheat sheet. Covers: Big-O cheat table, sorting algorithms with trade-offs, graph traversal (BFS/DFS/Dijkstra/Bellman-Ford), DP patterns, and amortized analysis. Open for contributions — if you spot an error or want to add something, let me know.\n\nLink in the comments (posting here first to get feedback).',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 89,
        'comments': [
            ('This is incredible. You are a legend. Sharing with my study group immediately.', 1, False, 34),
            ('One small correction: Bellman-Ford is O(VE) not O(V²). Otherwise perfect!', 3, False, 15),
            ('Fixed! Good catch. Updated the doc.', 0, False, 8),
            ('Can you add network flow (Ford-Fulkerson, Dinic\'s)? Our prof said it might be on the final.', 2, False, 11),
            ('Adding now. Give me an hour.', 0, False, 6),
            ('You could also add the master theorem section — that trips people up a lot.', 5, False, 9),
        ],
    },
    {
        'community_slug': 'cs401-algorithms',
        'title': 'Final exam is 40% of our grade — is anyone else panicking?',
        'body': 'The prof just reminded us that the final is cumulative and counts for 40% of the final grade. I have been keeping up with assignments but I am terrified. How is everyone planning to prepare? Should we organize a group study session?',
        'post_type': 'discussion',
        'is_anonymous': True,
        'author_idx': 6,
        'score': 38,
        'comments': [
            ('You are not alone. Let\'s organize something. I can book a room in the engineering building for next Thursday 6pm?', 0, False, 22),
            ('Yes please! I will be there. Also suggesting we split topics — each person becomes the "expert" on 2-3 topics and explains them.', 1, False, 17),
            ('Jigsaw method! Great idea. I will take graph algorithms and DP.', 2, False, 8),
            ('I can do sorting, searching, and amortized analysis.', 3, False, 6),
            ('I got network flow and NP-completeness. See everyone Thursday!', 4, False, 9),
        ],
    },
    {
        'community_slug': 'cs401-algorithms',
        'title': '🎉 Passed my Google SWE interview! Algorithms knowledge was KEY',
        'body': 'Just got the offer from Google! I want to share what I think made the difference. The CS401 material — especially graph algorithms, DP patterns, and complexity analysis — came up directly in 3 of my 5 interviews. If you are grinding Leetcode, make sure you understand the WHY behind each pattern, not just the code. Happy to answer questions about the process!',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 2,
        'score': 124,
        'comments': [
            ('CONGRATULATIONS! This is so inspiring. Which graph problems came up?', 0, False, 28),
            ('Topological sort (course scheduling variant), shortest path with weights, and a tree DP problem. Nothing super exotic — it was the clarity of explanation that mattered.', 2, False, 21),
            ('Did they ask you to optimize on the spot? I always freeze when they say "can you do better?"', 1, False, 13),
            ('Yes. Tip: talk through your complexity before they ask. Say "This is O(n²), I think we can do better with a heap..." Shows initiative.', 2, False, 19),
            ('What about behavioral interviews? I always struggle with the STAR format.', 5, False, 7),
            ('Prepare 5-6 stories really well and rotate them. Amazon LP principles are a good framework even for Google.', 2, False, 11),
        ],
    },

    # machine-learning
    {
        'community_slug': 'machine-learning',
        'title': 'Attention Is All You Need — reading group discussion thread',
        'body': 'We just finished reading the original Transformer paper. Posting this thread to consolidate our discussion. What were the biggest "aha" moments? What is still confusing? I will start: the multi-head attention intuition of learning different representation subspaces in parallel finally made sense to me when I thought of it like running multiple "what is relevant to what" queries simultaneously.',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 1,
        'score': 56,
        'comments': [
            ('My aha moment: positional encoding. It is such a hack but it works so well. The sinusoidal encoding means the model can generalize to sequence lengths it has not seen before.', 0, False, 22),
            ('Still confused about why scaled dot-product attention divides by sqrt(d_k). I read the explanation but it still feels hand-wavy.', 3, False, 14),
            ('The intuition: in high dimensions, dot products get very large, pushing softmax into regions with tiny gradients. Scaling keeps the variance of the dot products at 1. Helps training stability.', 1, False, 18),
            ('The feed-forward layers between attention blocks are still mysterious to me. What are they actually learning?', 4, False, 9),
            ('Research suggests they act as key-value memories — each row in the first matrix is a "key" and the corresponding column in the second is a "value". Geva et al. 2021 is a good paper on this.', 0, False, 13),
        ],
    },
    {
        'community_slug': 'machine-learning',
        'title': 'Which GPU cloud provider for training? Lambda vs. Vast.ai vs. RunPod comparison',
        'body': 'Setting up for my thesis experiments and need GPU compute. Currently comparing Lambda Labs, Vast.ai, and RunPod. Lambda seems most stable, Vast.ai cheapest, RunPod has good documentation. Has anyone used these for actual research workloads? What are the gotchas?',
        'post_type': 'question',
        'is_anonymous': False,
        'author_idx': 5,
        'score': 33,
        'comments': [
            ('Used Lambda for 3 months. Rock solid, good latency, but expensive. Vast.ai I had an instance go offline mid-training twice — always checkpoint frequently.', 2, False, 21),
            ('RunPod has a persistent storage option that is great. Also their serverless endpoint feature is useful if you want to deploy later.', 0, False, 16),
            ('If your university has an allocation on Compute Canada / Digital Research Alliance, that is free and powerful. Worth checking before paying out of pocket.', 3, False, 24),
            ('Seconding the Canadian compute clusters! Applied through my supervisor and got 400 GPU-hours approved in a week.', 1, False, 9),
        ],
    },
    {
        'community_slug': 'machine-learning',
        'title': '🔥 Free ML Course Roundup — Best ones I have completed',
        'body': 'After going through dozens of courses, here are my honest ratings:\n\n**Top Tier:**\n- Fast.ai (practical, bottom-up, free) ⭐⭐⭐⭐⭐\n- CS231n (Stanford CNN course) ⭐⭐⭐⭐⭐\n- Andrej Karpathy\'s Neural Nets Zero to Hero ⭐⭐⭐⭐⭐\n\n**Great:**\n- DeepLearning.AI Specialization ⭐⭐⭐⭐\n- Hugging Face NLP Course ⭐⭐⭐⭐\n\n**Skip:**\n- Most Udemy ML courses (too surface level)\n\nHappy to give more detail on any of these.',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 78,
        'comments': [
            ('Karpathy\'s micrograd series is genuinely the best explanation of backprop I have ever seen. Implementing it from scratch was transformative.', 1, False, 31),
            ('Adding: Stanford CS224N for NLP and Lilian Weng\'s blog for excellent deep dives on specific topics.', 2, False, 19),
            ('Is CS231n still updated? I thought Stanford stopped maintaining it.', 4, False, 8),
            ('The lecture videos from 2017 are still the gold standard. The newer material is less polished. Watch the 2017 ones.', 0, False, 12),
        ],
    },

    # cmput301
    {
        'community_slug': 'cmput301',
        'title': 'App crashes on older Android API levels — anyone solved this?',
        'body': 'My CMPUT 301 project works perfectly on the emulator (API 34) but crashes on the TA\'s testing device (API 28). I think it is a backward compatibility issue with some View API I am using. Has anyone dealt with this? The error is a NoSuchMethodError.',
        'post_type': 'question',
        'is_anonymous': False,
        'author_idx': 2,
        'score': 29,
        'comments': [
            ('Classic issue! Check if you are using any method that was added after API 28. The Android docs show the "Added in API level X" for everything.', 0, False, 14),
            ('Specifically ViewCompat and ActivityCompat from the AndroidX compatibility library are your best friends. They handle the API version checks internally.', 1, False, 11),
            ('Also check your build.gradle — make sure minSdk is set to 26 or lower and you are not using features that are API 29+.', 3, False, 8),
            ('The NoSuchMethodError usually means you called a newer method. Use Log.e to print the full stack trace and paste it here — easier to diagnose.', 5, False, 6),
        ],
    },
    {
        'community_slug': 'cmput301',
        'title': 'Is the TA grading rubric for UI consistent? Mine looks different from the example',
        'body': 'The project rubric says "follows Material Design guidelines" but is never specific. My UI looks decent to me but my teammate is worried it will be marked down. Has anyone gotten feedback on what the TAs actually care about vs. what is just nice-to-have?',
        'post_type': 'question',
        'is_anonymous': True,
        'author_idx': 3,
        'score': 18,
        'comments': [
            ('Based on last year\'s rubrics (found them on GitHub): they mainly care about navigation (back stack correct, no dead ends), consistent typography, proper use of RecyclerView for lists, and no obvious crashes.', 1, False, 16),
            ('The Material You aesthetic is not strictly required. Clean and functional > pretty. Do not spend too long on colors.', 0, False, 11),
            ('Agreed. I spent a week on custom animations last year and got the same mark as a friend who did the bare minimum UI. Focus on functionality.', 2, False, 9),
        ],
    },
    {
        'community_slug': 'cmput301',
        'title': '📋 CMPUT 301 Project Checklist — Things people always forget',
        'body': 'Collected from TAs and past experience. Do not lose marks on these:\n\n✅ Proper Javadoc on all public methods\n✅ Unit tests with meaningful assertions (not just "it does not crash")\n✅ No hardcoded strings — use strings.xml\n✅ Handles rotation without data loss (ViewModel or savedInstanceState)\n✅ FireStore rules lock down user data properly\n✅ App works offline for cached data\n✅ No sensitive keys in your Git history\n✅ README with screenshots and setup instructions\n\nAnything I missed? Add in the comments.',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 4,
        'score': 94,
        'comments': [
            ('Add: proper loading states! An app that freezes without showing a spinner will lose UX marks.', 0, False, 28),
            ('And error states — what happens when the internet is down? Show a meaningful message, not a blank screen.', 1, False, 19),
            ('Also: test on different screen sizes. A layout that only works on Pixel 6 will cost you.', 2, False, 12),
            ('PIN THIS. Mods can we pin this?', 3, False, 17),
        ],
    },

    # math-stats
    {
        'community_slug': 'math-stats',
        'title': 'Can someone explain epsilon-delta proofs intuitively? I get the mechanics but not the meaning',
        'body': 'I can follow the steps of an epsilon-delta proof when I see one, but when I have to construct one from scratch I have no idea where to start. It feels like the epsilon and delta just appear from nowhere. Is there a way to think about it geometrically or visually?',
        'post_type': 'question',
        'is_anonymous': True,
        'author_idx': 7,
        'score': 41,
        'comments': [
            ('Think of it as a game. Your opponent picks ε (how close to the limit they want). You respond by picking δ (how close to the input you need to be). If you can always win, the limit exists.', 0, False, 29),
            ('3Blue1Brown has a brilliant video on this. Visualizing it as "zoom in enough and the function looks linear" was the breakthrough for me.', 1, False, 24),
            ('The key insight most textbooks miss: you work BACKWARDS. Given ε, you manipulate |f(x) - L| < ε algebraically until you have |x - a| < (something involving ε). That something becomes δ.', 2, False, 18),
            ('Prof. Francis Su\'s real analysis lectures on YouTube are clearer than any textbook I have read. Gentle but rigorous.', 3, False, 11),
            ('Also: the ε-δ definition is "for all ε there EXISTS δ". The quantifiers matter. Understanding that one direction is the prover, the other is the challenger, made it click for me.', 0, False, 14),
        ],
    },
    {
        'community_slug': 'math-stats',
        'title': 'Bayesian vs. Frequentist — which should I learn first?',
        'body': 'Starting STAT 302 next semester. The course is frequentist but I keep reading that Bayesian methods are more "correct" conceptually. Should I try to learn Bayesian thinking alongside the course, or master frequentist first and then switch? I want to eventually do ML research.',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 1,
        'score': 26,
        'comments': [
            ('For ML research: learn frequentist first (it\'s what the course tests), then learn Bayesian. Modern ML uses both — neural networks are frequentist, probabilistic models are Bayesian.', 2, False, 17),
            ('The debate is overhyped. Both are tools. p-values for quick A/B tests, Bayesian for when you have informative priors. Know both.', 0, False, 13),
            ('"Statistical Rethinking" by Richard McElreath is the best intro to Bayesian thinking I have read. It also makes frequentist stuff make more sense by contrast.', 3, False, 15),
        ],
    },

    # cs-careers
    {
        'community_slug': 'cs-careers',
        'title': 'Amazon vs. Google vs. Microsoft — honest comparison from someone who has offers from all three',
        'body': 'Got lucky this recruiting season. Writing this up because I could not find honest comparisons when I was deciding. Will share details in comments to keep this organized. TLDR: all three are great, the differences are mostly about culture and career trajectory, not comp (at this level they are similar).',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 2,
        'score': 203,
        'comments': [
            ('AMAZON: Intense LP culture (know all 16 principles, match every answer to one). TC is great. WLB is team-dependent — hugely variable. Promotion is hard, especially L5 to L6. Best if you want to "own" things end to end.', 2, False, 67),
            ('GOOGLE: Most prestigious brand for early career. Code quality culture is excellent. Promotion is also hard and slow. The 20% time is largely mythical now. Best for learning engineering excellence.', 2, False, 58),
            ('MICROSOFT: Best WLB of the three, genuinely. Culture has improved massively under Satya. Team matters a lot — Azure and GitHub teams are excellent. The Teams/Office teams less so in terms of growth.', 2, False, 49),
            ('Did the offers differ significantly in TC? Also, are these intern or new grad?', 0, False, 22),
            ('New grad L3/SDE1. TC within $10K of each other after accounting for signing bonus. Google RSU vesting schedule is front-loaded (4-year cliff with 25% cliff then monthly) vs Amazon back-loaded (5/15/40/40). Significantly different cash flow.', 2, False, 31),
            ('I choose Microsoft. WLB matters to me and the Azure team I interviewed with seemed genuinely excited about the work.', 2, False, 18),
        ],
    },
    {
        'community_slug': 'cs-careers',
        'title': 'Resume review thread — drop your resume for feedback',
        'body': 'Starting a community resume review thread. Post your resume (PDF or Google Docs link, redact personal info if you want) and get feedback from peers and upper years. I will also share the template I used that got me interviews at Google, Meta, and Stripe.\n\nRules: be constructive, be specific, and if you get feedback, pay it forward.',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 87,
        'comments': [
            ('Biggest resume mistake I see: describing what you did instead of the impact. "Built a REST API" → "Built a REST API that reduced checkout latency by 40%, serving 10K daily users". Numbers matter.', 1, False, 44),
            ('Second biggest: putting every class you took in the education section. They know what CS entails. Just list relevant coursework if it is impressive.', 2, False, 28),
            ('What is the ideal resume length for a 3rd year student? I have two internships.', 5, False, 12),
            ('One page, always. Even with two internships. Cut ruthlessly. Recruiters spend 6-10 seconds on initial screening.', 0, False, 19),
            ('Can confirm. I have reviewed hundreds of resumes. One page. No photo. ATS-friendly format (no tables, no columns if using a PDF parser).', 3, False, 21),
        ],
    },
    {
        'community_slug': 'cs-careers',
        'title': '📢 Recruiting season is open — share which companies you are targeting',
        'body': 'It is that time of year! Drop which companies you are applying to and your year/level so others can calibrate. Also a good way to coordinate on referrals — if someone has a referral to offer, comment below!',
        'post_type': 'announcement',
        'is_anonymous': False,
        'author_idx': 3,
        'score': 55,
        'comments': [
            ('3rd year, targeting: Shopify (top choice), Stripe, Airbnb, and a couple mid-stage startups. Anyone have a Shopify referral?', 0, False, 12),
            ('I have a Shopify referral! DM me your resume and I will submit.', 2, False, 18),
            ('2nd year, applying to Coinbase, Robinhood, and some Canadian fintech. The US market has been rough this year tbh.', 1, False, 9),
            ('Honest truth: the market IS rough but strong candidates are still getting offers. Keep applying and do not be discouraged by the noise on LinkedIn.', 3, False, 15),
        ],
    },

    # data-science-resources
    {
        'community_slug': 'data-science-resources',
        'title': 'The definitive list of free datasets for student projects',
        'body': 'Compiling the best free dataset sources I know. Add yours in the comments!\n\n🔢 **General:**\n- Kaggle Datasets (huge variety)\n- UCI ML Repository (classic ML benchmarks)\n- Google Dataset Search\n\n🌍 **Public/Government:**\n- Statistics Canada (Canadian data)\n- data.gov (US government data)\n- World Bank Open Data\n\n📊 **Specific Domains:**\n- MIMIC-III (medical, requires approval)\n- ImageNet (vision)\n- Common Crawl (NLP)\n- OpenStreetMap (geospatial)',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 1,
        'score': 72,
        'comments': [
            ('Adding: COCO dataset for object detection, LibriSpeech for speech recognition, and The Pile for large-scale NLP.', 0, False, 18),
            ('Quandl / Nasdaq Data Link for financial data (some free tiers). Also Yahoo Finance via the yfinance Python library.', 2, False, 14),
            ('Yelp and Twitter (X) used to have great academic datasets. Twitter\'s API situation has made that harder but Yelp still offers theirs.', 3, False, 9),
        ],
    },
    {
        'community_slug': 'data-science-resources',
        'title': 'My favorite pandas tricks that save me hours every week',
        'body': 'After 2 years of data science coursework and internships, here are the pandas operations I use constantly that took me forever to discover:\n\n```python\n# Chain operations cleanly\ndf = (df\n    .query("age > 18")\n    .assign(age_group=lambda x: pd.cut(x.age, bins=[18,30,50,100]))\n    .groupby("age_group")\n    .agg({"income": ["mean", "std"]})\n)\n\n# Fast value replacement\ndf["status"] = df["status"].map({"A": "active", "I": "inactive"})\n\n# Efficient multi-column filter\nmask = df[["col1", "col2"]].isnull().any(axis=1)\n```\n\nWhat are your favorites?',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 61,
        'comments': [
            ('df.pipe() for applying custom functions in a chain! Keeps everything readable.\n\n```python\ndef remove_outliers(df, col):\n    q1, q3 = df[col].quantile([.25, .75])\n    iqr = q3 - q1\n    return df[df[col].between(q1 - 1.5*iqr, q3 + 1.5*iqr)]\n\ndf.pipe(remove_outliers, "salary")\n```', 1, False, 24),
            ('pd.eval() for large DataFrames — evaluates expressions in C instead of Python, huge speedup on millions of rows.', 2, False, 16),
            ('Also: always use .copy() when slicing DataFrames if you plan to modify the result. Learned this the hard way after mysterious bugs.', 3, False, 13),
        ],
    },

    # freshman-cs
    {
        'community_slug': 'freshman-cs',
        'title': 'Honest advice I wish I had gotten in first year CS',
        'body': 'Finishing my 3rd year. Here is what I would tell my first-year self:\n\n1. **Your GPA matters less than your projects and internships** — recruiters look at GitHub more than transcripts\n2. **Learn Git from day one** — not just the basics, actually understand branching, rebasing, and PR workflows\n3. **Go to every career fair** — even if you think you are not ready, just to practice talking\n4. **Make friends in your cohort** — the connections last longer than any single course\n5. **Office hours are underused** — profs and TAs remember students who show up\n6. **Struggling is normal** — everyone feels like they do not belong at first. They do.\n\nWhat would you add?',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 4,
        'score': 156,
        'comments': [
            ('Learn to type properly. 80+ WPM will save you hundreds of hours over 4 years. Spend a week on Typing.com and just do it.', 0, False, 47),
            ('Use Anki for any memorization heavy content (networking protocols, OS concepts, algorithm complexities). Spaced repetition is genuinely magical.', 1, False, 38),
            ('Do not try to learn every tool at once. Pick one editor (VS Code is fine), one terminal setup, one language per course. Master your tools before exploring more.', 2, False, 31),
            ('Sleeping enough is not lazy, it is high performance. I wrecked my grades in first year pulling all-nighters. Sleep consolidates memory. Do not skip it.', 5, False, 55),
            ('This whole thread should be pinned. Genuinely the advice I needed in September.', 3, False, 22),
        ],
    },
    {
        'community_slug': 'freshman-cs',
        'title': 'Which programming language should I learn first? I know Python from high school',
        'body': 'I have done some Python (basic scripting, one data science course). Now I am starting CS at university. Should I learn C, Java, or something else alongside Python? I want to be employable but also actually understand how computers work.',
        'post_type': 'question',
        'is_anonymous': False,
        'author_idx': 7,
        'score': 34,
        'comments': [
            ('C. Not because jobs require it, but because pointers, memory management, and understanding what the computer is actually doing will make you a dramatically better programmer in every language.', 0, False, 29),
            ('Java is fine for learning OOP patterns (design patterns, interfaces, generics). Not as illuminating as C for systems thinking but useful for interview prep.', 1, False, 18),
            ('Honest take: it almost does not matter. The language skills transfer. Pick whatever your first CS course uses and get really good at the fundamentals — recursion, data structures, algorithmic thinking.', 2, False, 22),
            ('One thing I\'d add: once you know two languages well, picking up a third takes weeks not months. The paradigms are what matter, not syntax.', 3, False, 15),
        ],
    },
    {
        'community_slug': 'freshman-cs',
        'title': '📢 First Year CS Student Meetup — Friday 6pm, Student Union Room 201',
        'body': 'Organizing a casual meetup for all first year CS students! We will have pizza (covered by the CS student society), a few upper years willing to answer questions, and games/networking. No pressure, come as you are. If you are nervous about coming alone, just reply here and we will find you a buddy to come with.',
        'post_type': 'announcement',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 48,
        'comments': [
            ('This is so wholesome. Will definitely be there. How many people are we expecting?', 1, False, 10),
            ('Last semester we had about 40 people! This one might be bigger since we posted earlier.', 0, False, 8),
            ('Can people from outside CS come? My roommate is in Math and feels isolated.', 2, False, 7),
            ('Absolutely! The more the merrier. Everyone is welcome.', 0, False, 6),
        ],
    },

    # hackathons
    {
        'community_slug': 'hackathons',
        'title': 'HackED 2025 — Team formation thread',
        'body': 'HackED is in 3 weeks and I am looking for teammates! I am a 2nd year CS student focused on backend (Python/FastAPI, PostgreSQL) and some ML experience. Looking for:\n- 1 frontend person (React preferred)\n- 1 designer or another generalist\n\nProject idea I am excited about: AI-powered accessibility tool for students with disabilities. Open to other ideas too. DM or comment if interested!',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 3,
        'score': 29,
        'comments': [
            ('I do frontend (React/Next.js, some Three.js for fun). Interested in the accessibility angle — important problem. Sending DM!', 0, False, 11),
            ('I can do UI/UX design and also code (Flutter, some React). The accessibility project sounds great — I have a personal connection to that cause.', 1, False, 9),
            ('You found your team! Good luck everyone. The accessibility track has won best social impact at HackED for 2 years running.', 2, False, 7),
        ],
    },
    {
        'community_slug': 'hackathons',
        'title': 'Post-hack retrospective: what I learned from winning (and losing)',
        'body': 'Did 8 hackathons over 2 years. Won 3, placed top 5 in 5 others, completely bombed 2. Here is the honest breakdown of what actually predicts winning:\n\n**What wins hackathons:**\n1. Demo quality > code quality (build something that looks impressive)\n2. The story/narrative in the pitch matters as much as the product\n3. Execution speed: ship a working demo in hour 8, polish in hour 24\n4. Choose a scope you can complete 80% of in 20 hours\n\n**Common mistakes:**\n- Overbuilding the backend\n- Not practicing the pitch\n- Letting perfect be the enemy of shipped\n- Teams that have not worked together before and underestimate coordination cost',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 2,
        'score': 83,
        'comments': [
            ('The pitch advice is SO important. I have seen technically superior projects lose because the team mumbled through 3 minutes of jargon. Practice your demo 5 times.', 0, False, 35),
            ('Also: talk to the judges during the event, not just during judging. They are often mentors wandering around. Building rapport helps.', 1, False, 22),
            ('"Overbuilding the backend" is the death of so many hack projects. Use Firebase or Supabase and ship the product. Auth and databases from scratch in 24 hours is a trap.', 3, False, 28),
        ],
    },

    # wellness
    {
        'community_slug': 'wellness',
        'title': 'Struggling with imposter syndrome in CS — anyone else?',
        'body': 'I feel like everyone around me knows so much more than me. My groupmates seem to understand everything immediately, I struggle for hours on problems they solve in minutes. I am questioning whether I belong in this program. I do okay on exams (B+/A-) but I feel like a fraud. Is this normal?',
        'post_type': 'discussion',
        'is_anonymous': True,
        'author_idx': 7,
        'score': 92,
        'comments': [
            ('This is so normal it is almost a CS rite of passage. The people who "get it immediately" are either studying beforehand, have prior experience, or are performing confidence. Rarely is it as easy as it looks.', 0, False, 58),
            ('A professor once told me: "The Dunning-Kruger effect means beginners overestimate their competence and experts underestimate it. If you feel like you do not know enough, you know more than you think."', 1, False, 44),
            ('B+/A- is genuinely good. The students you are comparing yourself to might be struggling on other things you are not seeing. Social media and classroom behavior only shows the wins.', 2, False, 31),
            ('I am a TA. Every student who comes to office hours worried about not being good enough is invariably better than they think. The ones who never ask questions are often struggling more.', 3, False, 39),
            ('Talk to your university\'s counseling center too — imposter syndrome can feed into anxiety and depression. Getting ahead of it is a strength, not a weakness.', 4, False, 22),
            ('Thank you for posting this anonymously — it probably helped a dozen people who felt the same thing but could not say it.', 5, False, 27),
        ],
    },
    {
        'community_slug': 'wellness',
        'title': 'My burnout recovery story — took a semester off and here is what happened',
        'body': 'Last fall I was working 3 part-time jobs, carrying 5 courses, and volunteering for two clubs. I had panic attacks before every exam and cried after every coding session. In January I made the hardest decision of my university career: I withdrew from 3 courses and took a medical leave.\n\nWhat happened: I slept. I cooked food. I read books I wanted to read. I went to therapy. I came back this semester with a plan, boundaries, and a much clearer sense of what I actually want.\n\nIf you are burned out: the degree will be there. Your health is not guaranteed. A medical leave does not show on your transcript. It is okay.',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 5,
        'score': 178,
        'comments': [
            ('Thank you for sharing this. I needed to read it today. I have been white-knuckling through this semester and pretending I am fine.', 0, False, 63),
            ('This is incredibly brave to share. The stigma around taking time off is real and harmful. More people need to hear stories like this.', 1, False, 47),
            ('Important note: most universities have academic accommodation processes and medical leave policies that protect your GPA and enrollment status. Talk to your academic advisor BEFORE things get to crisis level.', 2, False, 34),
            ('Are you doing better now? How did you manage the return?', 3, False, 18),
            ('Much better! The key for me was not trying to "catch up" when I came back. I treated it as a fresh start and was intentional about what I committed to.', 5, False, 24),
        ],
    },

    # grad-research
    {
        'community_slug': 'grad-research',
        'title': 'Navigating a difficult supervisor relationship — advice needed',
        'body': 'My supervisor is not responsive. Emails go unanswered for weeks. When I do get meetings, feedback is vague ("make it better"). I am in year 2 of my PhD and feeling directionless. I do not want to switch supervisors (it would set me back a year) but I do not know how to improve things. Has anyone been in this situation?',
        'post_type': 'question',
        'is_anonymous': True,
        'author_idx': 5,
        'score': 47,
        'comments': [
            ('This is unfortunately very common. Some things that helped me: (1) Switch to short weekly written updates instead of waiting for meetings — creates a paper trail and forces responses. (2) Ask for explicit deliverables with deadlines. (3) Find a secondary mentor in the department (committee member, another prof you trust).', 0, False, 29),
            ('Document everything. Emails, meeting notes, agreed-upon deadlines. This protects you if things escalate and also helps clarify ambiguous feedback.', 1, False, 22),
            ('Your university has a graduate ombudsperson or grad student advocate. They exist precisely for situations like this. Talking to them is confidential and does not automatically create conflict — it just gets you advice.', 2, False, 18),
            ('The vague feedback problem: try submitting a written interpretation of the feedback and asking "Is this what you meant?" Forces them to be specific without making them feel criticized.', 3, False, 15),
        ],
    },
    {
        'community_slug': 'grad-research',
        'title': 'How to read 100+ papers a year without burning out',
        'body': 'PhD first year: spent 8 hours on my first paper and barely understood it. Third year now: I can triage 20 papers in an afternoon. Here is the system that got me there.\n\n**The 3-pass method:**\n1. Title + Abstract + Conclusion (5 min) — decide if worth reading\n2. Introduction + Figures + Results (20 min) — get the core claims\n3. Full read with notes in Zotero (1-2 hrs) — only for papers that matter\n\n**Tools:**\n- Zotero with BetterBibtex\n- Connected Papers for citation graphs\n- arxiv-sanity-lite for discovery\n- Obsidian for synthesis notes',
        'post_type': 'resource',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 64,
        'comments': [
            ('Semantic Scholar is also excellent for finding papers and has a good recommendation engine. Better than Google Scholar for deep dives.', 1, False, 24),
            ('The 3-pass method is from Keshav\'s "How to Read a Paper" — worth reading the original too, it is only 2 pages.', 2, False, 18),
            ('I would add: write a one-paragraph summary immediately after reading. Your future self will thank you when you are writing the related work section in year 4.', 3, False, 21),
        ],
    },

    # campus-events
    {
        'community_slug': 'campus-events',
        'title': 'Free coffee at the CS Building lobby — grad student thesis defense celebration',
        'body': 'One of our PhD students defended successfully this morning! The department is providing free coffee, tea, and snacks in the CS Building main lobby from 2-4pm today. Everyone welcome. Come celebrate with us!',
        'post_type': 'announcement',
        'is_anonymous': False,
        'author_idx': 0,
        'score': 67,
        'comments': [
            ('Ran there. Coffee is excellent. Also found 10 dollars on the ground. Best Tuesday ever.', 1, False, 44),
            ('WENT. Free croissants too. Highly recommend.', 2, False, 29),
            ('Why was I in a 3-hour lecture when this was happening 😭', 3, False, 18),
        ],
    },
    {
        'community_slug': 'campus-events',
        'title': 'Study session at the Main Library tonight? 8pm, level 3 group area',
        'body': 'Got finals stress? I will be at the library tonight from 8pm studying for CS301 and MATH201. Anyone who wants company is welcome. Bring headphones if you want to stay focused, or we can chat during breaks. See you there!',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 3,
        'score': 24,
        'comments': [
            ('I will be there! Also studying for MATH201. The level 3 group tables are usually free after 7.', 0, False, 9),
            ('Coming too! I will bring snacks — any requests?', 1, False, 7),
            ('Chips and those Trader Joe\'s dark chocolate almonds please, you legend.', 3, False, 11),
        ],
    },

    # web-dev
    {
        'community_slug': 'web-dev',
        'title': 'Next.js 15 vs. Remix — which would you choose for a new project in 2025?',
        'body': 'Starting a new side project (social app for students, coincidentally). Torn between Next.js 15 with App Router and Remix. I have used Next.js (Pages Router) before but the App Router mental model is different. Remix seems more principled but smaller ecosystem. Thoughts?',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 4,
        'score': 38,
        'comments': [
            ('Next.js App Router if ecosystem size matters. Remix if you want to really understand web primitives (it teaches you to think in web standards). Both are excellent.', 0, False, 19),
            ('For a social app with lots of real-time updates, consider if SSR is even your bottleneck. SvelteKit is worth a look for DX.', 1, False, 14),
            ('Honest take: the mental model shift in Next.js App Router (Server Components, client/server boundary, caching invalidation) is steep. If you are time constrained, the Pages Router is not dead.', 2, False, 11),
            ('I migrated a medium project from Pages to App Router. The data fetching story is much cleaner but debugging RSC hydration errors is painful. Budget time for it.', 3, False, 9),
        ],
    },
    {
        'community_slug': 'web-dev',
        'title': 'Show and Tell: What side project are you working on?',
        'body': 'Summer is the best time to build things. Drop your side project below — what it does, what stack you are using, and what you have learned so far. No judgment, works-in-progress welcome!',
        'post_type': 'discussion',
        'is_anonymous': False,
        'author_idx': 7,
        'score': 45,
        'comments': [
            ('Building a CLI tool in Rust that scrapes RateMyProfessors and formats it nicely in the terminal. Learning Rust async and tokio. Hardest thing so far: the borrow checker is not wrong, I am just wrong.', 0, False, 28),
            ('Full-stack flashcard app with spaced repetition (Anki-inspired). Next.js + Postgres + Drizzle ORM. Learned: Drizzle schema inference is magic, Postgres full-text search is way faster than I expected.', 1, False, 22),
            ('Browser extension that blocks distracting sites during Pomodoro sessions. Manifest V3 is a nightmare but it works. Learned: Chrome extensions are harder than they look, the API docs are inconsistent.', 2, False, 17),
            ('Discord bot for my CS server — auto-assigns roles based on courses registered, posts assignment due dates scraped from course sites. Python + nextcord. The scraping part is always the fun chaos.', 3, False, 19),
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed communities with rich demo data'

    def handle(self, *args, **kwargs):
        from apps.communities.models import (
            Community, CommunityMembership, Post, PostVote, Comment, CommentVote
        )
        from apps.communities.utils import compute_hot_score

        self.stdout.write('Seeding communities...')
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.ERROR('No users found. Run seed_demo first.'))
            return

        created_communities = {}
        for c in COMMUNITIES:
            community, _ = Community.objects.get_or_create(
                slug=c['slug'],
                defaults={
                    'name': c['name'],
                    'description': c['description'],
                    'icon': c['icon'],
                    'category': c['category'],
                    'created_by': users[0],
                },
            )
            # Add 4-9 members
            member_pool = random.sample(users, k=min(random.randint(4, 9), len(users)))
            for u in member_pool:
                CommunityMembership.objects.get_or_create(user=u, community=community)
            created_communities[c['slug']] = community
            self.stdout.write(f'  Community: {community.name} ({community.memberships.count()} members)')

        self.stdout.write('Seeding posts and comments...')
        for p in POSTS:
            community = created_communities.get(p['community_slug'])
            if not community:
                continue
            author = users[p['author_idx'] % len(users)]
            age_days = random.randint(0, 60)
            created_at = timezone.now() - timedelta(days=age_days, hours=random.randint(0, 23))

            post, created = Post.objects.get_or_create(
                community=community,
                title=p['title'],
                defaults={
                    'author': author,
                    'body': p.get('body', ''),
                    'post_type': p['post_type'],
                    'is_anonymous': p.get('is_anonymous', False),
                    'created_at': created_at,
                },
            )
            if not created:
                continue

            # Votes on post
            target_score = p.get('score', random.randint(1, 50))
            voter_pool = random.sample(users, k=min(target_score + 3, len(users)))
            upvote_count = min(target_score, len(voter_pool))
            for i, voter in enumerate(voter_pool):
                if voter == author:
                    continue
                value = 1 if i < upvote_count else -1
                PostVote.objects.get_or_create(post=post, user=voter, defaults={'value': value})

            # Recalculate score
            from django.db.models import Sum
            agg = post.votes.aggregate(total=Sum('value'))
            real_score = agg['total'] or 0
            hot = compute_hot_score(real_score, post.created_at)
            Post.objects.filter(pk=post.pk).update(score=real_score, hot_score=hot)

            # Comments
            for (body, author_rel_idx, is_anon, comment_score) in p.get('comments', []):
                comment_author = users[author_rel_idx % len(users)]
                comment_age = random.randint(0, age_days)
                comment_created = timezone.now() - timedelta(days=comment_age, hours=random.randint(0, 23))
                comment = Comment.objects.create(
                    post=post,
                    author=comment_author,
                    body=body,
                    is_anonymous=is_anon,
                    created_at=comment_created,
                )
                # Votes on comment
                voter_count = min(comment_score + 2, len(users))
                comment_voters = random.sample(users, k=voter_count)
                upvotes = min(comment_score, voter_count)
                for j, voter in enumerate(comment_voters):
                    if voter == comment_author:
                        continue
                    val = 1 if j < upvotes else -1
                    CommentVote.objects.get_or_create(comment=comment, user=voter, defaults={'value': val})
                agg2 = comment.votes.aggregate(total=Sum('value'))
                Comment.objects.filter(pk=comment.pk).update(score=agg2['total'] or 0)

            # Update comment_count on post
            Post.objects.filter(pk=post.pk).update(comment_count=post.comments.count())
            self.stdout.write(f'    Post: {post.title[:60]}...' if len(post.title) > 60 else f'    Post: {post.title}')

        # Recount all denormalized fields
        for community in created_communities.values():
            Community.objects.filter(pk=community.pk).update(
                member_count=community.memberships.count(),
                post_count=community.posts.count(),
            )

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! {Community.objects.count()} communities, '
            f'{Post.objects.count()} posts, '
            f'{Comment.objects.count()} comments.'
        ))
