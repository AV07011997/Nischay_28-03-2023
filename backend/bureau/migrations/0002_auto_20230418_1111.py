# Generated by Django 3.1.1 on 2023-04-18 05:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bureau', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bureau',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
