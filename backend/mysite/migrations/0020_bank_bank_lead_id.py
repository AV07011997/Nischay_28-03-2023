# Generated by Django 3.1.1 on 2023-05-03 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mysite', '0019_failed_digitization'),
    ]

    operations = [
        migrations.AddField(
            model_name='bank_bank',
            name='lead_id',
            field=models.CharField(default=0, max_length=30),
        ),
    ]