from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import models
from rest_framework.authtoken.models import Token
from .models import Room, Message, UserProfile
from .serializers import RoomSerializer, MessageSerializer, UserSerializer, UserRegistrationSerializer, UserProfileSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.create(user=user)
        login(request, user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'username': user.username,
            'email': user.email,
            'token': token.key
        }, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_list(request):
    users = User.objects.exclude(id=request.user.id)
    user_data = []
    for user in users:
        profile = UserProfile.objects.get_or_create(user=user)[0]
        user_data.append({
            'id': user.id,
            'username': user.username,
            'is_online': profile.is_online,
            'last_seen': profile.last_seen
        })
    return Response(user_data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def direct_messages(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
        messages = Message.objects.filter(
            is_direct_message=True
        ).filter(
            models.Q(user=request.user, recipient=other_user) |
            models.Q(user=other_user, recipient=request.user)
        ).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Temporary for development

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]  # Temporary for development

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.AllowAny]  # Temporary for development

    def get_queryset(self):
        room_id = self.request.query_params.get('room', None)
        if room_id:
            return Message.objects.filter(room_id=room_id, is_direct_message=False).order_by('-timestamp')
        return Message.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
