from django.db import models

from django_minio_backend import MinioBackend, iso_date_prefix
from django.core.validators import MinLengthValidator, FileExtensionValidator
from .validators import tests_answers_validator
from django.utils.timezone import now
from users.models import CustomUser
from uuid import uuid4

class Classroom(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    title = models.CharField(max_length=30, blank=False, validators=(MinLengthValidator(1),))
    teachers = models.ManyToManyField(CustomUser, related_name="teachers_classes", blank=False)
    students = models.ManyToManyField(CustomUser, related_name="students_classes", blank=True)

    def __str__(self):
        return str(f"{self.title}")

class Homework(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    title = models.CharField(blank=False)
    active_from = models.DateTimeField(default=now)
    active_until = models.DateTimeField(default=None, blank=True, null=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="homeworks")

    def __str__(self):
        return str(f"{self.title}")

class Task(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    title = models.CharField(blank=False)
    text = models.TextField(blank=False)
    # image
    answers = models.JSONField(blank=False, validators=(tests_answers_validator, ))
    tests = models.JSONField(blank=False, validators=(tests_answers_validator, ))
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name="tasks")
    
    def __str__(self):
        return str(f"{self.title}")

class Solution(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    tested = models.BooleanField(default=False)
    successful = models.BooleanField(default=False)
    message = models.TextField(default="Not tested.", blank=False)
    file = models.FileField(storage=MinioBackend(bucket_name='solutions'), upload_to=iso_date_prefix, validators=(FileExtensionValidator(["py"]), ), blank=False, null=False)
    date = models.DateTimeField(default=now)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="solutions")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="solutions")

    def __str__(self):
        return str(f"{self.date}")
    
