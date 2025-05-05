from .models import Classroom
from django.core.validators import MinValueValidator
from rest_framework import serializers

class ClassroomSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    teachers = serializers.SerializerMethodField(read_only=True)
    students = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Classroom
        fields = ["id", "title", "teachers", "students"]

    def get_teachers(self, data):
        if isinstance(data, Classroom):
            return list(
                    {
                        "first_name": teacher.first_name,
                        "last_name": teacher.last_name
                    }
                    for teacher in data.teachers.all()
            )
        else:
            return list(
                    {
                        "first_name": "Unknown",
                        "last_name": "Unknown"
                    }
            )

    def get_students(self, data):
        if isinstance(data, Classroom):
            return list(
                    {
                        "first_name": student.first_name,
                        "last_name": student.last_name
                    }
                    for student in data.students.all()
            )
        else:
            return list(
                    {
                        "first_name": "Unknown",
                        "last_name": "Unknown"
                    }
            )

    def create_classroom(self, user):
        classroom = Classroom(title=self.validated_data["title"])
        classroom.save()
        classroom.teachers.add(user)
        classroom.save()
        return classroom

class RecipientSerializer(serializers.Serializer):
    recipient = serializers.ChoiceField(["student", "teacher"])

class InviteCodeSerializer(serializers.Serializer):
    code = serializers.UUIDField()

class PaginationSerializer(serializers.Serializer):
    offset = serializers.IntegerField(default=0, validators=[MinValueValidator(0)])
    limit = serializers.IntegerField(default=10, validators=[MinValueValidator(0)])