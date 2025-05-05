from rest_framework import serializers

from classrooms.models import Classroom, Homework, Task
from django.utils.timezone import now

class TaskSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    answer = serializers.JSONField(write_only=True)
    tests = serializers.JSONField(write_only=True)
    class Meta:
        model = Task
        fields = ["id", "title", "text", "answer", "tests"]

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
