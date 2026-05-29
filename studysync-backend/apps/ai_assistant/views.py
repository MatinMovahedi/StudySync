import asyncio
import json
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.db import models as db_models
from .models import AIConversation, FlashCard, StudyPlan
from .serializers import AIConversationSerializer, FlashCardSerializer, StudyPlanSerializer
from .openai_client import chat_completion_stream, generate_quiz, generate_flashcards, summarize_notes, explain_concept, generate_study_plan, generate_diagram


class AIChatStreamView(APIView):
    def post(self, request):
        messages = request.data.get('messages', [])
        context = request.data.get('context', '')

        async def event_stream():
            async for chunk in chat_completion_stream(messages, context):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            yield "data: [DONE]\n\n"

        def sync_generator():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                gen = event_stream()
                while True:
                    try:
                        chunk = loop.run_until_complete(gen.__anext__())
                        yield chunk
                    except StopAsyncIteration:
                        break
            finally:
                loop.close()

        response = StreamingHttpResponse(sync_generator(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


class QuizGenerateView(APIView):
    def post(self, request):
        topic = request.data.get('topic', 'general knowledge')
        difficulty = request.data.get('difficulty', 'medium')
        count = min(int(request.data.get('count', 5)), 10)
        questions = generate_quiz(topic, difficulty, count)
        return Response({'questions': questions})


class FlashcardGenerateView(APIView):
    def post(self, request):
        topic = request.data.get('topic', '')
        count = min(int(request.data.get('count', 5)), 20)
        deck_name = request.data.get('deck_name', topic or 'My Deck')
        cards_data = generate_flashcards(topic, count)
        cards = []
        for card_data in cards_data:
            card = FlashCard.objects.create(
                user=request.user,
                deck_name=deck_name,
                front=card_data['front'],
                back=card_data['back'],
                ai_generated=True,
            )
            cards.append(card)
        return Response({'flashcards': FlashCardSerializer(cards, many=True).data})


class FlashcardListView(generics.ListAPIView):
    serializer_class = FlashCardSerializer

    def get_queryset(self):
        return FlashCard.objects.filter(user=self.request.user)


class FlashcardDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = FlashCardSerializer

    def get_queryset(self):
        return FlashCard.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        card = self.get_object()
        card.review_count = db_models.F('review_count') + 1
        card.save(update_fields=['review_count'])
        card.refresh_from_db()
        return Response(FlashCardSerializer(card).data)


class SummarizeView(APIView):
    def post(self, request):
        notes = request.data.get('notes', '')
        if not notes:
            return Response({'error': 'Notes are required'}, status=status.HTTP_400_BAD_REQUEST)
        summary = summarize_notes(notes)
        return Response({'summary': summary})


class ExplainView(APIView):
    def post(self, request):
        concept = request.data.get('concept', '')
        level = request.data.get('level', 'intermediate')
        if not concept:
            return Response({'error': 'Concept is required'}, status=status.HTTP_400_BAD_REQUEST)
        explanation = explain_concept(concept, level)
        return Response({'explanation': explanation})


class ConversationListView(generics.ListAPIView):
    serializer_class = AIConversationSerializer

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)


class DiagramView(APIView):
    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({'error': 'prompt required'}, status=400)
        result = generate_diagram(prompt)
        return Response(result)


class StudyPlannerView(APIView):
    def get(self, request):
        plans = StudyPlan.objects.filter(user=request.user)[:5]
        return Response(StudyPlanSerializer(plans, many=True).data)

    def post(self, request):
        goal = request.data.get('goal', '')
        hours_per_day = max(1, min(8, int(request.data.get('hours_per_day', 2))))
        week_start = request.data.get('week_start')
        courses = getattr(request.user.profile, 'courses', []) if hasattr(request.user, 'profile') else []
        plan_data = generate_study_plan(goal, hours_per_day, courses)
        plan = StudyPlan.objects.create(
            user=request.user,
            week_start=week_start or __import__('datetime').date.today().isoformat(),
            goal=goal,
            plan_data=plan_data,
        )
        return Response(StudyPlanSerializer(plan).data, status=status.HTTP_201_CREATED)
