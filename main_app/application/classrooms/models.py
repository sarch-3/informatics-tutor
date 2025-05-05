from django.db import models

from django.core.validators import MinLengthValidator
from .validators import tests_validator, answer_validator
from django.utils.timezone import now
from users.models import CustomUser
from uuid import uuid4

class Classroom(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    teachers = models.ManyToManyField(CustomUser, related_name="teachers_classes", blank=False)
    students = models.ManyToManyField(CustomUser, related_name="students_classes", blank=True)
    title = models.CharField(max_length=30, blank=False, validators=(MinLengthValidator(1),))

    def __str__(self):
        return str(f"{self.title}")

class Homework(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    title = models.CharField(blank=False)
    active_from = models.DateTimeField(default=now)
    active_until = models.DateTimeField(default=None, blank=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="homeworks")

    def __str__(self):
        return str(f"{self.title}")

class Task(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    title = models.CharField(blank=False)
    text = models.TextField(blank=False)
    # image
    answer = models.JSONField(blank=False, validators=(answer_validator, ))
    tests = models.JSONField(blank=False, validators=(tests_validator, ))
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name="tasks")
    
    def __str__(self):
        return str(f"{self.title}")

class Solution(models.Model):
    # file
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    successful = models.BooleanField(default=False)
    result = models.TextField(blank=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="solutions")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="solutions")
    date = models.DateTimeField(default=now)

    def __str__(self):
        return str(f"{self.date}")
    
