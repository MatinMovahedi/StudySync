from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.AIChatStreamView.as_view(), name='ai-chat'),
    path('quiz/', views.QuizGenerateView.as_view(), name='ai-quiz'),
    path('flashcards/', views.FlashcardGenerateView.as_view(), name='ai-flashcards-generate'),
    path('flashcards/list/', views.FlashcardListView.as_view(), name='ai-flashcards-list'),
    path('summarize/', views.SummarizeView.as_view(), name='ai-summarize'),
    path('explain/', views.ExplainView.as_view(), name='ai-explain'),
    path('conversations/', views.ConversationListView.as_view(), name='ai-conversations'),
]
