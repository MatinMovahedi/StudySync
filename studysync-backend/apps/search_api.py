from rest_framework.views import APIView
from rest_framework.response import Response
from apps.groups.models import StudyGroup
from apps.communities.models import Community

try:
    from apps.resources.models import Resource
    HAS_RESOURCES = True
except Exception:
    HAS_RESOURCES = False


class GlobalSearchView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response({'groups': [], 'resources': [], 'communities': []})

        groups = StudyGroup.objects.filter(name__icontains=q)[:6]
        groups_data = [{'id': g.id, 'name': g.name, 'category': g.category, 'member_count': getattr(g, 'member_count', 0)} for g in groups]

        resources_data = []
        if HAS_RESOURCES:
            try:
                resources = Resource.objects.filter(title__icontains=q)[:6]
                resources_data = [{'id': r.id, 'title': r.title, 'category': r.category} for r in resources]
            except Exception:
                pass

        try:
            communities = Community.objects.filter(name__icontains=q)[:6]
            communities_data = [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in communities]
        except Exception:
            communities_data = []

        return Response({'groups': groups_data, 'resources': resources_data, 'communities': communities_data})
