from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_onboarded', 'is_active', 'created_at')
    list_filter = ('is_onboarded', 'is_active', 'is_staff')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('StudySynch', {'fields': ('is_onboarded',)}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'program', 'total_study_hours', 'total_sessions')
    search_fields = ('user__email', 'university', 'program')
    readonly_fields = ('total_study_hours', 'total_sessions')
