from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import UserManager
from .validators import password_validator
from django.core.validators import MinLengthValidator
from uuid import uuid4
from django.db import models


class CustomUser(AbstractBaseUser):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False, blank=False)
    first_name = models.CharField(max_length=20, validators=(MinLengthValidator(1), ))
    last_name = models.CharField(max_length=20, validators=(MinLengthValidator(1), ))
    email = models.EmailField(unique=True)
    password = models.CharField(validators=(password_validator, MinLengthValidator(8)))
    is_teacher = models.BooleanField(default=False)
    # image

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return str(f"{self.id} {self.first_name} {self.last_name}")