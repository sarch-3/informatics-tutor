from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.new_homework, name="new_homework"),
    path("<uuid:hid>/", views.get_homework, name="get_homework"),
    path("<uuid:hid>/tasks/<uuid:tid>/", views.task_interaction, name="task_interaction"),
]

