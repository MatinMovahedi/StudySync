from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from .models import Notification


def push_notification(notification):
    try:
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        group_name = f"notifications_{notification.user_id}"
        async_to_sync(channel_layer.group_send)(group_name, {
            'type': 'notification_send',
            'data': {
                'id': notification.id,
                'notification_type': notification.notification_type,
                'title': notification.title,
                'body': notification.body,
                'created_at': notification.created_at.isoformat(),
            },
        })
    except Exception:
        pass


@receiver(post_save, sender='chat.Message')
def on_new_message(sender, instance, created, **kwargs):
    if not created or instance.message_type == 'system':
        return
    from apps.groups.models import GroupMembership
    members = GroupMembership.objects.filter(group=instance.group).exclude(user=instance.sender).select_related('user')
    for membership in members:
        notif = Notification.objects.create(
            user=membership.user,
            notification_type='new_message',
            title=f"New message in {instance.group.name}",
            body=f"{instance.sender.username}: {instance.content[:80]}",
            related_object_id=instance.group.id,
            related_object_type='group',
        )
        push_notification(notif)


@receiver(post_save, sender='sessions_app.StudySession')
def on_new_session(sender, instance, created, **kwargs):
    if not created:
        return
    from apps.groups.models import GroupMembership
    members = GroupMembership.objects.filter(group=instance.group).exclude(user=instance.created_by).select_related('user')
    for membership in members:
        notif = Notification.objects.create(
            user=membership.user,
            notification_type='session_created',
            title=f"New session: {instance.title}",
            body=f"A new study session has been scheduled in {instance.group.name}",
            related_object_id=instance.id,
            related_object_type='session',
        )
        push_notification(notif)
