from rest_framework import serializers
from .models import CustomUser

class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["first_name", "last_name", "email", "is_teacher", "password"]

    def create_user(self):
        if self.data.get("is_teacher") is None:
            is_teacher = False
        else:
            is_teacher = self.data.get("is_teacher")

        user = CustomUser(first_name=self.data["first_name"],
                          last_name=self.data["last_name"],
                          email=self.data["email"],
                          is_teacher=is_teacher
        )
        user.set_password(self.data["password"])

        user.save()

        return user