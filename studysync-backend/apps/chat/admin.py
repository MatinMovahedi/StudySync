from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'group', 'message_type', 'short_content', 'is_edited', 'created_at')
    list_filter = ('message_type', 'is_edited')
    search_fields = ('sender__email', 'group__name', 'content')
    readonly_fields = ('created_at', 'updated_at', 'reactions')
    ordering = ('-created_at',)

    def short_content(self, obj):
        return obj.content[:80]
    short_content.short_description = 'Content'
