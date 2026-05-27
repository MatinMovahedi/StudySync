from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_userfollow"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="plan",
            field=models.CharField(
                choices=[("free", "Free"), ("pro", "Pro"), ("team", "Team")],
                default="free",
                max_length=10,
            ),
        ),
    ]
