from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request

from application.utils import is_teacher
from classrooms.serializers import SuperTaskSerializer, SolutionSerializer, PaginationSerializer
from classrooms.utils import correct_task
from classrooms.models import Task
from .celery_tasks import test_file
from uuid import UUID

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@correct_task
def task_interaction(request: Request, tid: UUID):
    task = Task.objects.get(id=tid)

    match request.method:
        case "GET":
            serializer = PaginationSerializer(data = request.GET)
            if not serializer.is_valid():
                return Response({"status": "Bad", "messages": serializer.errors}, status=400)
            offset = serializer.validated_data["offset"]
            limit = serializer.validated_data["limit"]
            
            serializer = SuperTaskSerializer(task, context={"request": request, "offset": offset, "limit": limit})
            
            return Response(serializer.data, status=200)
        
        case "POST":
            serializer = SolutionSerializer(data = request.data)
            
            if not serializer.is_valid():
                return Response({"status": "Bad", "messages": serializer.errors}, status=400)
            
            solution = serializer.create_solution(task, request.user)

            test_file.delay(solution.id, task.id)
            
            return Response({"status": "Ok"}, status=200)
        
# Отправка задания
