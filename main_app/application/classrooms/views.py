from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from application.utils import is_teacher

from .serializers import ClassroomSerializer, RecipientSerializer, InviteCodeSerializer, PaginationSerializer
from homeworks.serializers import HomeworkSerializer
from .utils import correct_classroom
from django.core.cache import cache
from .models import Classroom
from uuid import UUID, uuid4

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_classrooms(request: Request):
    serializer = PaginationSerializer(data = request.GET)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
        
    offset = serializer.validated_data["offset"]
    limit = serializer.validated_data["limit"]

    if request.user.is_teacher:
        classrooms = Classroom.objects.filter(teachers__exact=request.user).order_by("title")
    else:
        classrooms = Classroom.objects.filter(students__exact=request.user).order_by("title")

    X_Total_Count = classrooms.count()

    classrooms = classrooms[offset:offset+limit]

    serializer = ClassroomSerializer(classrooms, many=True)
    
    return Response(serializer.data, status=200, headers={"X-Total-Count": X_Total_Count})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@is_teacher(True)
def new_classroom(request: Request):
    serializer = ClassroomSerializer(data = request.data)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
    
    classroom = serializer.create_classroom(request.user)

    serializer = ClassroomSerializer(classroom)

    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@is_teacher(True)
@correct_classroom
def invite_link(request: Request, cid: UUID):
    classroom = Classroom.objects.get(id=cid)

    if not request.user in classroom.teachers.all():
        return Response({"status": "No permissions"}, status=403)
    
    serializer = RecipientSerializer(data = request.data)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
    
    code = uuid4()

    match serializer.validated_data["recipient"]:
        case "student":
            cache.set(code, (cid, False), 86400)

        case "teacher":
            cache.set(code, (cid, True), 86400)

    return Response({"recipient": request.data["recipient"], "code": code}, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join(request: Request):
    serializer = InviteCodeSerializer(data = request.data)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
    
    classroom = cache.get(serializer.validated_data["code"])

    if classroom is None:
        return Response({"status": "Not found"}, status=404)

    if classroom[1] != request.user.is_teacher:
        return Response({"status": "No permissions"}, status=403)

    try:
        classroom = Classroom.objects.get(id=classroom[0])
    except:
        return Response({"status": "Not found"}, status=404)
    
    if request.user.is_teacher:
        classroom.teachers.add(request.user)
    else:
        classroom.students.add(request.user)

    return Response({"status": "Ok"}, status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@correct_classroom
def exit_classroom(request: Request, cid: UUID):
    classroom = Classroom.objects.get(id=cid)
    
    classroom.teachers.remove(request.user)
    classroom.students.remove(request.user)

    classroom.save()

    return Response({"status": "Ok"}, status=200)

@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
@correct_classroom
def edit_classroom(request: Request, cid: UUID):
    classroom = Classroom.objects.get(id=cid)

    match request.method:
        case "POST":
            return Response({"status": "I'm a teapot"}, status=418)
        
        case "DELETE":
            if not request.user in classroom.teachers.all():
                return Response({"status": "No permissions"}, status=403)
            classroom.delete()
            return Response({"status": "Ok"}, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@correct_classroom
def get_classroom(request: Request, cid: UUID):
    classroom = Classroom.objects.get(id=cid)

    homeworks = classroom.homeworks.all().order_by("-active_from")
    serializer = HomeworkSerializer(homeworks, many=True)
    return Response(serializer.data, status=200)


# Редактирование класса???
# Получение опред класса