from rest_framework import serializers

from classrooms.models import Classroom, Homework, Task, Solution
from django.core.validators import MinValueValidator
from classrooms.validators import tests_answers_validator
from django.utils.timezone import now

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
    
class GetClassroomSerializer(serializers.Serializer):
    classroom = serializers.UUIDField()

    def get(self):
        try:
            return Classroom.objects.get(id = self.data["classroom"])
        except:
            return None

    def permitions(self, user, teacher: bool):
        match teacher:
            case True:
                if user in Classroom.objects.get(id = self.data["classroom"]).teachers.all():
                    return True
                else:
                    return False
                
            case False:
                if user in Classroom.objects.get(id = self.data["classroom"]).students.all():
                    return True
                else:
                    return False

class RecipientSerializer(serializers.Serializer):
    recipient = serializers.ChoiceField(["student", "teacher"])

class InviteCodeSerializer(serializers.Serializer):
    code = serializers.UUIDField()

class PaginationSerializer(serializers.Serializer):
    offset = serializers.IntegerField(default=0, validators=[MinValueValidator(0)])
    limit = serializers.IntegerField(default=10, validators=[MinValueValidator(0)])

class TaskSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    answers = serializers.JSONField(write_only=True, validators=(tests_answers_validator, ))
    tests = serializers.JSONField(write_only=True, validators=(tests_answers_validator, ))
    class Meta:
        model = Task
        fields = ["id", "title", "text", "answers", "tests"]

    def validate(self, attrs: dict):
        if len(attrs.get("answers")) != len(attrs.get("tests")):
            raise serializers.ValidationError({
                        'answers': 'This field must be the same length as tests.',
                        'tests': 'This field must be the same length as answers.'
                    })
        return super().validate(attrs)

class TasksField(serializers.Field):
    def to_internal_value(self, data):
        if not isinstance(data, list):
            raise serializers.ValidationError("Must be an array.")
        if not data:
            raise serializers.ValidationError("This field may not be blank.")

        result = []
        errors = {}

        for i in range(len(data)):
            serializer = TaskSerializer(data = data[i])
            if serializer.is_valid():
                result.append(serializer.validated_data)
            else:
                errors[i] = serializer.errors

        if errors:
            raise serializers.ValidationError(errors)
        
        return result

    def to_representation(self, data):
        if isinstance(data, list):
            return [
                TaskSerializer(instance=obj).data
                for obj in data
            ]
        else:
            return [
                TaskSerializer(instance=obj).data
                for obj in data.all()
            ]

class HomeworkSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    tasks = TasksField()
    class Meta:
        model = Homework
        fields = ["id", "title", "active_from", "active_until", "tasks"]

    def validate(self, attrs: dict):
        if attrs.get("active_until"):
            if attrs.get("active_from"):
                if attrs["active_until"] < attrs["active_from"]:
                    raise serializers.ValidationError({
                        'active_until': 'This field may not be before active_from.'
                    })
            else:
                if attrs["active_until"] < now():
                    raise serializers.ValidationError({
                        'active_until': 'This field may not be before now.'
                    })
        
        if attrs.get("active_from"):
            if attrs["active_from"] < now():
                raise serializers.ValidationError({
                    'active_from': 'This field may not be before now.'
                })

        return super().validate(attrs)

    def create_homework(self, cid):
        classroom = Classroom.objects.get(id = cid)
        homework = Homework(title=self.validated_data["title"], classroom=classroom)

        if not self.validated_data.get("active_from") is None:
            homework.active_from = self.validated_data["active_from"]
        if not self.validated_data.get("active_until") is None:
            homework.active_until = self.validated_data["active_until"]

        tasks = list()

        for task_data in self.validated_data["tasks"]:
            tasks.append(Task(**task_data, homework=homework))
        
        homework.save()

        for task in tasks:
            task.save()

class SolutionSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    successful = serializers.BooleanField(read_only=True)
    result = serializers.CharField(read_only=True)
    date = serializers.DateTimeField(read_only=True)
    class Meta:
        model = Solution
        fields = ["id", "successful", "result", "file", "date"]