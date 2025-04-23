from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet)
router.register(r'messages', views.MessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('users/', views.user_list, name='user-list'),
    path('messages/direct/<int:user_id>/', views.direct_messages, name='direct-messages'),
]
