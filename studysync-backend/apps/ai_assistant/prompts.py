MOCK_CHAT_RESPONSES = [
    "Great question! Let me break this down for you. This concept is fundamental to understanding the broader topic. First, you should consider the key principles involved, then think about how they interact with each other. The relationships between these ideas are what make this subject so fascinating. Would you like me to go deeper into any particular aspect?",
    "That's a fantastic topic to explore! Here's how I'd approach understanding this: Start with the foundational concepts, then layer in the more complex ideas. Think of it like building a mental model — each piece supports the next. The key insight here is that everything connects back to a few core principles. Let me know if you'd like examples!",
    "Excellent! This is one of my favorite topics to explain. The core idea is actually quite elegant once you see it from the right angle. Many students struggle with this initially, but once you understand the underlying pattern, it clicks immediately. Here's the key: focus on *why* rather than just *what*, and the *how* becomes intuitive.",
    "I'd love to help you understand this better! This topic has a few layers to it. At the surface level, it seems straightforward, but the deeper you go, the more interesting connections you discover. Let me walk you through it step by step, starting with what you likely already know and building from there.",
]

MOCK_QUIZ_QUESTIONS = [
    {
        "question": "What is the primary purpose of encapsulation in object-oriented programming?",
        "options": ["A) To speed up code execution", "B) To hide internal implementation details", "C) To allow multiple inheritance", "D) To reduce memory usage"],
        "answer": "B",
        "explanation": "Encapsulation bundles data and methods together while restricting direct access to internal state, promoting modularity and security."
    },
    {
        "question": "Which data structure offers O(1) average-case lookup time?",
        "options": ["A) Linked List", "B) Binary Tree", "C) Hash Table", "D) Stack"],
        "answer": "C",
        "explanation": "Hash tables use a hash function to map keys to indices, enabling constant-time average lookups, insertions, and deletions."
    },
    {
        "question": "What does the 'S' in SOLID principles stand for?",
        "options": ["A) Scalability", "B) Single Responsibility", "C) Static Typing", "D) Sequential Logic"],
        "answer": "B",
        "explanation": "Single Responsibility Principle states that a class should have only one reason to change, meaning it should have only one job."
    },
    {
        "question": "In SQL, what is the difference between INNER JOIN and LEFT JOIN?",
        "options": ["A) No difference", "B) INNER JOIN is faster", "C) LEFT JOIN includes unmatched rows from the left table", "D) INNER JOIN returns all rows"],
        "answer": "C",
        "explanation": "LEFT JOIN returns all rows from the left table and matched rows from the right table. Unmatched right-table rows are NULL."
    },
    {
        "question": "What is Big-O notation used to describe?",
        "options": ["A) The exact runtime of an algorithm", "B) The best-case performance", "C) The upper bound of algorithm complexity", "D) Memory usage only"],
        "answer": "C",
        "explanation": "Big-O notation describes the upper bound of an algorithm's time or space complexity relative to input size."
    },
]

MOCK_FLASHCARDS = [
    {"front": "What is polymorphism?", "back": "The ability of different objects to respond to the same interface in different ways. A key pillar of OOP that enables flexible, extensible code."},
    {"front": "Define recursion", "back": "A function that calls itself with a smaller input until reaching a base case. Elegant for tree traversal, factorial, and divide-and-conquer algorithms."},
    {"front": "What is a REST API?", "back": "Representational State Transfer — an architectural style for distributed systems using HTTP methods (GET, POST, PUT, DELETE) with stateless communication."},
    {"front": "Explain the CAP theorem", "back": "A distributed system can only guarantee 2 of 3: Consistency (all nodes see the same data), Availability (always responds), Partition Tolerance (survives network splits)."},
    {"front": "What is memoization?", "back": "An optimization technique that stores the results of expensive function calls and returns cached results when the same inputs occur again. Used in dynamic programming."},
]

MOCK_SUMMARY = """## Summary

### Key Concepts
- The material covers foundational principles that underpin the entire subject area
- Three main themes emerge: **theoretical framework**, **practical applications**, and **edge cases**
- The most important concept is the relationship between inputs and expected outputs

### Main Points
1. **Core Principle** — The fundamental rule that governs all behavior in this domain
2. **Key Mechanism** — How the system processes information and produces results  
3. **Common Pitfalls** — What students typically misunderstand and how to avoid those traps
4. **Real-World Application** — How this appears in production systems and industry

### Important Formulas / Patterns
```
Pattern: Input → Transform → Validate → Output
Formula: Result = f(variables) where constraints apply
```

### Quick Review Questions
- What is the primary goal of this concept?
- How does it differ from the related approach?
- When would you choose this over the alternative?

### Next Steps
Review the practical examples and try implementing a small version yourself — hands-on practice solidifies theoretical knowledge significantly faster than re-reading.
"""
