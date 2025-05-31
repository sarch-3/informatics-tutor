from rest_framework.response import Response
from functools import wraps

def is_teacher(status=True):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if request.user.is_teacher != status:
                return Response({"status": "No permissions"}, status=403)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator