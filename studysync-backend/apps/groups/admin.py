from django.contrib import admin
from .models import StudyGroup, GroupMembership


class GroupMembershipInline(admin.TabularInline):
    model = GroupMembership
    extra = 0
    readonly_fields = ('joined_at',)


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    inlines = [GroupMembershipInline]
    list_display = ('name', 'category', 'course_code', 'member_count', 'is_private', 'created_by', 'created_at')
    list_filter = ('category', 'is_private')
    search_fields = ('name', 'course_code', 'created_by__email')
    readonly_fields = ('invite_code', 'created_at', 'updated_at')

    def member_count(self, obj):
        return obj.memberships.count()
    member_count.short_description = 'Members'


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('user__email', 'group__name')
    readonly_fields = ('joined_at',)
