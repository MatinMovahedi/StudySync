from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("groups", "0003_whiteboard"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="whiteboard",
            name="active_viewers",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name="WhiteboardSnapshot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("state", models.JSONField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("whiteboard", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="snapshots", to="groups.whiteboard")),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "whiteboard_snapshots", "ordering": ["-created_at"]},
        ),
    ]
