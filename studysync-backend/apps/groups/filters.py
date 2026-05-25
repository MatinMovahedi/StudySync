import django_filters
from .models import StudyGroup


class StudyGroupFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(lookup_expr='exact')
    course_code = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = StudyGroup
        fields = ['category', 'course_code']
