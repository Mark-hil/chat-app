from django.urls import path
from django.http import HttpResponse
from chat.views import register_view, login_view, room_list, user_list, message_list, direct_message_list

def health_check(request):
    return HttpResponse("healthy", status=200)

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('api/register/', register_view, name='register'),
    path('api/login/', login_view, name='login'),
    path('api/rooms/', room_list, name='room_list'),
    path('api/users/', user_list, name='user_list'),
    path('api/messages/', message_list, name='message_list'),
    path('api/messages/direct/<int:user_id>/', direct_message_list, name='direct_message_list'),
]
