from django.urls import path
from . import views

urlpatterns = [
    path("<uuid:tid>/", views.task_interaction, name="task_interaction"),
]

