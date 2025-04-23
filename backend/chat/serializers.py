from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, Message, UserProfile
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'is_online', 'last_seen']

class RoomSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'name', 'description', 'creator', 'created_at', 'last_message']

    def get_last_message(self, obj):
        last_message = obj.messages.first()
        if last_message:
            return MessageSerializer(last_message).data
        return None

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'room', 'user', 'recipient', 'content', 'timestamp', 'is_direct_message']
        read_only_fields = ['user', 'recipient', 'timestamp']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
