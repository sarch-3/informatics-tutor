from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from application.utils import is_teacher

from classrooms.utils import correct_classroom
from .utils import correct_homework, correct_task
from .serializers import HomeworkSerializer, TaskSerializer
from classrooms.models import Homework, Task
from uuid import UUID

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@is_teacher(True)
@correct_classroom
def new_homework(request: Request, cid: UUID):
    serializer = HomeworkSerializer(data = request.data)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
        
    serializer.create_homework(cid)
    return Response({"status": "Ok"}, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@correct_classroom
@correct_homework
def get_homework(request: Request, cid: UUID, hid: UUID):
    homework = Homework.objects.get(id=hid)
    serializer = HomeworkSerializer(homework)
    return Response(serializer.data, status=200)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@correct_classroom
@correct_homework
@correct_task
def task_interaction(request: Request, cid: UUID, hid: UUID, tid: UUID):
    match request.method:
        case "GET":
            task = Task.objects.get(id=tid)
            serializer = TaskSerializer(task)
            return Response(serializer.data, status=200)
        case "POST":
            return Response({"status": "I`m a teapot"}, status=418)

# Удаление дз
# Редактирование дз??? Хз хз
# Отправка задания
# Просмотр дз учителем