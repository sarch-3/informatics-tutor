from rest_framework import serializers
from .models import CustomUser

from django.core.validators import MinLengthValidator
from .validators import password_validator

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=(password_validator, MinLengthValidator(8)))
    class Meta:
        model = CustomUser
        fields = ["first_name", "last_name", "email", "is_teacher", "password"]

    def create_user(self):
        if self.validated_data.get("is_teacher") is None:
            is_teacher = False
        else:
            is_teacher = self.validated_data.get("is_teacher")

        user = CustomUser(first_name=self.validated_data["first_name"],
                          last_name=self.validated_data["last_name"],
                          email=self.validated_data["email"],
                          is_teacher=is_teacher
        )
        user.set_password(self.validated_data["password"])

        user.save()

        return user