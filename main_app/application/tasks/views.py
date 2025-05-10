from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request

from classrooms.serializers import TaskSerializer, SolutionSerializer
from classrooms.utils import correct_task
from classrooms.models import Task
from uuid import UUID

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@correct_task
def task_interaction(request: Request, tid: UUID):
    match request.method:
        case "GET":
            task = Task.objects.get(id=tid)
            serializer = TaskSerializer(task)
            return Response(serializer.data, status=200)
        
        case "POST":
            serializer = SolutionSerializer(data = request.data)
            print(serializer.is_valid(), serializer.validated_data, request.data)
            return Response({"status": "I`m a teapot", "messages": serializer.errors}, status=418)
        
# Отправка задания
