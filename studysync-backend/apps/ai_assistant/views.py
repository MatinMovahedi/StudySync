import asyncio
import json
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from .models import AIConversation, FlashCard
from .serializers import AIConversationSerializer, FlashCardSerializer
from .openai_client import chat_completion_stream, generate_quiz, generate_flashcards, summarize_notes, explain_concept


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
