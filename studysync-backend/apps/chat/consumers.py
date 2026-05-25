import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f"chat_{self.group_id}"
        token = self.scope['query_string'].decode().split('token=')[-1].split('&')[0]
        self.user = await self.get_user_from_token(token)
        if not self.user:
            await self.close()
            return
        is_member = await self.check_membership()
        if not is_member:
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'user_presence',
            'data': {'user_id': self.user.id, 'username': self.user.username, 'action': 'joined'},
        })

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'user_presence',
                'data': {'user_id': self.user.id, 'username': self.user.username, 'action': 'left'},
            })

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type')
        if event_type == 'message':
            message = await self.save_message(data.get('content', ''), data.get('message_type', 'text'))
            if message:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'chat_message',
                    'data': {
                        'id': message.id,
                        'sender': {'id': self.user.id, 'username': self.user.username, 'first_name': self.user.first_name},
                        'content': message.content,
                        'message_type': message.message_type,
                        'reactions': message.reactions,
                        'timestamp': message.created_at.isoformat(),
                    },
                })
        elif event_type == 'typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'typing_indicator',
                'data': {'user_id': self.user.id, 'username': self.user.username, 'is_typing': data.get('is_typing', False)},
            })
        elif event_type == 'reaction':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'message_reaction',
                'data': {'message_id': data.get('message_id'), 'emoji': data.get('emoji'), 'user_id': self.user.id},
            })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', 'data': event['data']}))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({'type': 'typing', 'data': event['data']}))

    async def user_presence(self, event):
        await self.send(text_data=json.dumps({'type': 'presence', 'data': event['data']}))

    async def message_reaction(self, event):
        await self.send(text_data=json.dumps({'type': 'reaction', 'data': event['data']}))

    @database_sync_to_async
    def get_user_from_token(self, token_str):
        try:
            token = AccessToken(token_str)
            return User.objects.get(id=token['user_id'])
        except Exception:
            return None

    @database_sync_to_async
    def check_membership(self):
        from apps.groups.models import GroupMembership
        return GroupMembership.objects.filter(user=self.user, group_id=self.group_id).exists()

    @database_sync_to_async
    def save_message(self, content, message_type='text'):
        from apps.chat.models import Message
        return Message.objects.create(group_id=self.group_id, sender=self.user, content=content, message_type=message_type)
