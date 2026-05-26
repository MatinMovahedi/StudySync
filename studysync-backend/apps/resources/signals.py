from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ResourceVote


@receiver(post_save, sender=ResourceVote)
def on_vote_save(sender, instance, created, **kwargs):
    if created:
        instance.resource.__class__.objects.filter(pk=instance.resource_id).update(
            upvotes=instance.resource.__class__.objects.get(pk=instance.resource_id).votes.count()
        )


@receiver(post_delete, sender=ResourceVote)
def on_vote_delete(sender, instance, **kwargs):
    instance.resource.__class__.objects.filter(pk=instance.resource_id).update(
        upvotes=instance.resource.__class__.objects.get(pk=instance.resource_id).votes.count()
    )
