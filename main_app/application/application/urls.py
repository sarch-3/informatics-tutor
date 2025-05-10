from django.urls import path, include

urlpatterns = [
    path("api/ping/", include("ping.urls")),
    path("api/user/", include("users.urls")),
    path("api/classrooms/", include("classrooms.urls")),
    path("api/homeworks/", include("homeworks.urls")),
    path("api/tasks/", include("tasks.urls")),
]
