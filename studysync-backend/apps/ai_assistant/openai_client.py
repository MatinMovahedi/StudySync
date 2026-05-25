import asyncio
import random
from django.conf import settings
from .prompts import MOCK_CHAT_RESPONSES, MOCK_QUIZ_QUESTIONS, MOCK_FLASHCARDS, MOCK_SUMMARY


async def stream_mock_response(text: str, words_per_chunk: int = 2):
    """Yields the response word-by-word simulating LLM streaming."""
    words = text.split()
    for i in range(0, len(words), words_per_chunk):
        chunk = ' '.join(words[i:i + words_per_chunk])
        yield chunk + ' '
        await asyncio.sleep(0.04)


async def chat_completion_stream(messages: list, context: str = ''):
    """Main AI chat — uses mock or real OpenAI depending on settings."""
    if settings.USE_MOCK_AI:
        response = random.choice(MOCK_CHAT_RESPONSES)
        async for chunk in stream_mock_response(response):
            yield chunk
    else:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        system_prompt = f"You are StudySync AI, a helpful study assistant for university students. {context}"
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        async with client.chat.completions.stream(model="gpt-4o", messages=full_messages) as stream:
            async for text in stream.text_stream:
                yield text


def generate_quiz(topic: str, difficulty: str = 'medium', count: int = 5) -> list:
    if settings.USE_MOCK_AI:
        return MOCK_QUIZ_QUESTIONS[:count]
    from openai import OpenAI
    import json
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"Generate {count} {difficulty} quiz questions about: {topic}. Return JSON array with fields: question, options (array of 4), answer (A/B/C/D), explanation."
    response = client.chat.completions.create(model="gpt-4o", messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"})
    return json.loads(response.choices[0].message.content).get('questions', MOCK_QUIZ_QUESTIONS[:count])


def generate_flashcards(topic: str, count: int = 5) -> list:
    if settings.USE_MOCK_AI:
        return MOCK_FLASHCARDS[:count]
    from openai import OpenAI
    import json
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"Generate {count} flashcards about: {topic}. Return JSON array with 'front' and 'back' fields."
    response = client.chat.completions.create(model="gpt-4o", messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"})
    return json.loads(response.choices[0].message.content).get('flashcards', MOCK_FLASHCARDS[:count])


def summarize_notes(notes: str) -> str:
    if settings.USE_MOCK_AI:
        return MOCK_SUMMARY
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"Summarize these lecture notes in markdown with key concepts, main points, and formulas:\n\n{notes}"
    response = client.chat.completions.create(model="gpt-4o", messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content


def explain_concept(concept: str, level: str = 'intermediate') -> str:
    if settings.USE_MOCK_AI:
        return f"## {concept}\n\nThis is a fascinating topic! Let me explain it at the {level} level.\n\nThe core idea behind {concept} is that it provides a structured way to think about complex problems. At its heart, it's about understanding the relationships between components and how they interact.\n\n### Key Principles\n1. **Foundation** — Start with the basics and build up\n2. **Pattern Recognition** — Identify repeating structures\n3. **Application** — Connect theory to real-world scenarios\n\n### Why It Matters\nUnderstanding {concept} gives you mental tools that apply across many domains, making you a more versatile problem solver.\n\nWould you like me to dive deeper into any specific aspect?"
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"Explain '{concept}' for a {level}-level university student. Use clear language, examples, and markdown formatting."
    response = client.chat.completions.create(model="gpt-4o", messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content
