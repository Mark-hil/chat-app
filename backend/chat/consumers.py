import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message, Room, UserProfile

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs'].get('room_id')
        self.user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.user = self.scope['user']
        
        if self.room_id:
            self.room_group_name = f'chat_room_{self.room_id}'
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        elif self.user_id:
            # For direct messages, join both users' channels
            self.room_group_name = f'direct_{min(self.user.id, int(self.user_id))}_{max(self.user.id, int(self.user_id))}'
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

        if self.user.is_authenticated:
            await self.set_user_online(True)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        if self.user.is_authenticated:
            await self.set_user_online(False)

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            message_type = text_data_json.get('type', 'room_message')
            
            if message_type == 'direct_message':
                recipient_id = text_data_json['recipient_id']
                # Save direct message
                saved_message = await self.save_direct_message(
                    self.user.id,
                    recipient_id,
                    message
                )
                
                # Send message to the shared direct message group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'timestamp': saved_message['timestamp'],
                        'is_direct_message': True,
                        'recipient_id': recipient_id
                    }
                )
            else:
                # Save room message
                saved_message = await self.save_room_message(
                    self.user.id,
                    self.room_id,
                    message
                )
                
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'timestamp': saved_message['timestamp'],
                        'is_direct_message': False
                    }
                )
        except Exception as e:
            print(f'Error in receive: {str(e)}')
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_room_message(self, user_id, room_id, message):
        user = User.objects.get(id=user_id)
        room = Room.objects.get(id=room_id)
        message = Message.objects.create(
            user=user,
            room=room,
            content=message
        )
        return {
            'id': message.id,
            'timestamp': message.timestamp.isoformat()
        }

    @database_sync_to_async
    def save_direct_message(self, user_id, recipient_id, message):
        user = User.objects.get(id=user_id)
        recipient = User.objects.get(id=recipient_id)
        message = Message.objects.create(
            user=user,
            recipient=recipient,
            content=message,
            is_direct_message=True
        )
        return {
            'id': message.id,
            'timestamp': message.timestamp.isoformat()
        }

    @database_sync_to_async
    def set_user_online(self, is_online):
        UserProfile.objects.update_or_create(
            user=self.user,
            defaults={'is_online': is_online}
        )
