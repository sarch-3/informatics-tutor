from rest_framework.response import Response
from functools import wraps

from classrooms.models import Homework, Task

def correct_homework(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            Homework.objects.get(id=kwargs["hid"])
        except:
            return Response({"status": "Not found"}, status=404)

        return view_func(request, *args, **kwargs)
    return _wrapped_view

def correct_task(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            Task.objects.get(id=kwargs["tid"])
        except:
            return Response({"status": "Not found"}, status=404)

        return view_func(request, *args, **kwargs)
    return _wrapped_view