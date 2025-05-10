from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from application.utils import is_teacher

from classrooms.serializers import HomeworkSerializer, GetClassroomSerializer
from classrooms.utils import correct_homework
from classrooms.models import Homework
from uuid import UUID

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@is_teacher(True)
def new_homework(request: Request):
    serializer = HomeworkSerializer(data = request.data)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
    
    serializer2 = GetClassroomSerializer(data = request.data)

    if not serializer2.is_valid():
        return Response({"status": "Bad", "messages": serializer2.errors}, status=400)
    
    classroom = serializer2.get()

    if classroom is None:
        return Response({"status": "Classroom not found"}, status=404)
    
    if not serializer2.permitions(request.user, True):
        return Response({"status": "No permissions"}, status=403)
        
    serializer.create_homework(classroom.id)
    return Response({"status": "Ok"}, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@correct_homework
def get_homework(request: Request, hid: UUID):
    homework = Homework.objects.get(id=hid)
    serializer = HomeworkSerializer(homework)
    return Response(serializer.data, status=200)

@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
@correct_homework
def edit_homework(request: Request, hid: UUID):
    match request.method:
        case "POST":
            return Response({"status": "I'm a teapot"}, status=418)

        case "DELETE":
            homework = Homework.objects.get(id=hid)
            homework.delete()
            return Response({"status": "Ok"}, status=200)

# Редактирование дз??? Хз хз
# Просмотр дз учителем