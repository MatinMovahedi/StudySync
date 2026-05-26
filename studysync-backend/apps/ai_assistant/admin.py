from django.contrib import admin
from .models import AIConversation, FlashCard


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at')
    search_fields = ('user__email', 'title')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)


@admin.register(FlashCard)
class FlashCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'deck_name', 'short_front', 'ai_generated', 'review_count', 'created_at')
    list_filter = ('ai_generated', 'deck_name')
    search_fields = ('user__email', 'deck_name', 'front', 'back')
    readonly_fields = ('created_at',)

    def short_front(self, obj):
        return obj.front[:60]
    short_front.short_description = 'Front'
