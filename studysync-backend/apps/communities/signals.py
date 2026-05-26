from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum

from .models import CommunityMembership, Post, PostVote, Comment, CommentVote
from .utils import compute_hot_score


@receiver(post_save, sender=CommunityMembership)
def on_membership_created(sender, instance, created, **kwargs):
    if created:
        instance.community.__class__.objects.filter(pk=instance.community_id).update(
            member_count=instance.community.__class__.objects.get(pk=instance.community_id).memberships.count()
        )


@receiver(post_delete, sender=CommunityMembership)
def on_membership_deleted(sender, instance, **kwargs):
    instance.community.__class__.objects.filter(pk=instance.community_id).update(
        member_count=instance.community.__class__.objects.get(pk=instance.community_id).memberships.count()
    )


def _update_post_score(post):
    agg = post.votes.aggregate(total=Sum('value'))
    score = agg['total'] or 0
    hot = compute_hot_score(score, post.created_at)
    Post.objects.filter(pk=post.pk).update(score=score, hot_score=hot)


@receiver(post_save, sender=PostVote)
def on_post_vote_saved(sender, instance, **kwargs):
    _update_post_score(instance.post)


@receiver(post_delete, sender=PostVote)
def on_post_vote_deleted(sender, instance, **kwargs):
    _update_post_score(instance.post)


def _update_comment_score(comment):
    agg = comment.votes.aggregate(total=Sum('value'))
    score = agg['total'] or 0
    Comment.objects.filter(pk=comment.pk).update(score=score)


@receiver(post_save, sender=CommentVote)
def on_comment_vote_saved(sender, instance, **kwargs):
    _update_comment_score(instance.comment)


@receiver(post_delete, sender=CommentVote)
def on_comment_vote_deleted(sender, instance, **kwargs):
    _update_comment_score(instance.comment)


@receiver(post_save, sender=Comment)
def on_comment_created(sender, instance, created, **kwargs):
    if created:
        Post.objects.filter(pk=instance.post_id).update(
            comment_count=instance.post.comments.count()
        )


@receiver(post_delete, sender=Comment)
def on_comment_deleted(sender, instance, **kwargs):
    try:
        Post.objects.filter(pk=instance.post_id).update(
            comment_count=Comment.objects.filter(post_id=instance.post_id).count()
        )
    except Exception:
        pass


@receiver(post_save, sender=Post)
def on_post_created(sender, instance, created, **kwargs):
    if created:
        instance.community.__class__.objects.filter(pk=instance.community_id).update(
            post_count=instance.community.__class__.objects.get(pk=instance.community_id).posts.count()
        )


@receiver(post_delete, sender=Post)
def on_post_deleted(sender, instance, **kwargs):
    try:
        instance.community.__class__.objects.filter(pk=instance.community_id).update(
            post_count=Post.objects.filter(community_id=instance.community_id).count()
        )
    except Exception:
        pass
