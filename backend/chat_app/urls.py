from django.urls import path
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("healthy", status=200)

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    # ... other URL patterns ...
]
