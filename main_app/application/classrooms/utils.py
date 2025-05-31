from rest_framework.response import Response
from functools import wraps

from .models import Classroom, Homework, Task

def correct_classroom(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            classroom = Classroom.objects.get(id=kwargs["cid"])

            if not (request.user in classroom.students.all() or request.user in classroom.teachers.all()):
                return Response({"status": "No permissions"}, status=403)
        except:
            return Response({"status": "Not found"}, status=404)

        return view_func(request, *args, **kwargs)
    return _wrapped_view

def correct_homework(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            homework = Homework.objects.get(id=kwargs["hid"])
            classroom = homework.classroom

            if not (request.user in classroom.students.all() or request.user in classroom.teachers.all()):
                return Response({"status": "No permissions"}, status=403)
        except:
            return Response({"status": "Not found"}, status=404)

        return view_func(request, *args, **kwargs)
    return _wrapped_view

def correct_task(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            task = Task.objects.get(id=kwargs["tid"])
            classroom = task.homework.classroom

            if not (request.user in classroom.students.all() or request.user in classroom.teachers.all()):
                return Response({"status": "No permissions"}, status=403)
        except:
            return Response({"status": "Not found"}, status=404)

        return view_func(request, *args, **kwargs)
    return _wrapped_view