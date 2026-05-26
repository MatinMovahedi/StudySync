from django.urls import path
from . import views

urlpatterns = [
    path('listings/', views.TutorListingListCreateView.as_view(), name='tutor-list'),
    path('listings/<int:pk>/', views.TutorListingDetailView.as_view(), name='tutor-detail'),
    path('listings/<int:pk>/request/', views.request_tutoring, name='tutor-request'),
    path('requests/incoming/', views.IncomingRequestsView.as_view(), name='tutor-incoming'),
    path('requests/outgoing/', views.OutgoingRequestsView.as_view(), name='tutor-outgoing'),
    path('requests/<int:pk>/respond/', views.respond_to_request, name='tutor-respond'),
]
