from rest_framework import serializers

from classrooms.models import Classroom, Homework, Task, Solution
from users.models import CustomUser
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
    status = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Task
        fields = ["id", "title", "text", "answers", "tests", "status"]

    def get_status(self, obj):
        user = self.context["request"].user

        solutions = Solution.objects.filter(user = user, task = obj)
        if not solutions:
            return "unsolved"
        if not solutions.filter(tested = True):
            return "pending"
        if not solutions.filter(successful = True):
            return "wrong"
        return "solved"

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
                TaskSerializer(instance=obj, context=self.context).data
                for obj in data
            ]
        else:
            return [
                TaskSerializer(instance=obj, context=self.context).data
                for obj in data.all()
            ]

class HomeworkSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    classroom = serializers.UUIDField(write_only=True)
    tasks = TasksField()
    class Meta:
        model = Homework
        fields = ["id", "classroom", "title", "active_from", "active_until", "tasks"]

    def validate(self, attrs: dict):
        if attrs.get("active_until"):
            if attrs.get("active_from"):
                if attrs["active_until"] < attrs["active_from"]:
                    raise serializers.ValidationError({
                        'active_until': 'This field may not be before active_from.'
                    })
            if attrs["active_until"] < now():
                raise serializers.ValidationError({
                    'active_until': 'This field may not be before now.'
                })
        
        if attrs.get("active_from"):
            if attrs["active_from"] < now():
                raise serializers.ValidationError({
                    'active_from': 'This field may not be before now.'
                })
            
        try:
            classroom = Classroom.objects.get(id = attrs["classroom"])
        except:
            raise serializers.ValidationError({
                'classroom': 'Not found.'
            })
        
        user = self.context["request"].user

        if user not in classroom.teachers.all():
            raise serializers.ValidationError({
                'classroom': 'No permitions.'
            })


        return super().validate(attrs)

    def create_homework(self):
        homework = Homework(title=self.validated_data["title"], classroom=Classroom.objects.get(id = self.validated_data["classroom"]))

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
    tested = serializers.BooleanField(read_only=True)
    successful = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)
    date = serializers.DateTimeField(read_only=True)
    class Meta:
        model = Solution
        fields = ["id", "tested", "successful", "message", "file", "date"]

    def create_solution(self, task, user):
        solution = Solution(file=self.validated_data["file"], task=task, user=user)
        solution.save()
        return solution
    

class SuperTaskSerializer(TaskSerializer):
    solutions = serializers.SerializerMethodField()
    class Meta:
        model = Task
        fields = ["id", "title", "text", "answers", "tests", "status", "solutions"]

    def get_solutions(self, obj):
        offset = self.context["offset"]
        limit = self.context["limit"]

        user = self.context["request"].user
        solutions = Solution.objects.filter(user = user, task = obj).order_by("-date")[offset:offset+limit]
        serializers = SolutionSerializer(solutions, many=True)

        return serializers.data
    
class AdvancementSerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "first_name", "last_name", "tasks"]

    def get_tasks(self, obj: CustomUser):
        homework = self.context["homework"]

        data = list()

        for task in homework.tasks.all():
            solutions = Solution.objects.filter(user = obj, task = task).order_by("-date")

            if not solutions:
                status = "unsolved"
                last_solution = {}
            elif not solutions.filter(tested = True):
                status = "pending"
                last_solution = SolutionSerializer(solutions[0]).data
            elif not solutions.filter(successful = True):
                status = "wrong"
                last_solution = SolutionSerializer(solutions.filter(successful = False)[0]).data
            else:
                status = "solved"
                last_solution = SolutionSerializer(solutions.filter(successful = True)[0]).data

            
            task_data = {
                "id": task.id,
                "title": task.title,
                "status": status,
                "count": solutions.count(),
                "last_solution": last_solution

            }
            data.append(task_data)
        
        return data