from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.new_homework, name="new_homework"),
    path("<uuid:hid>/", views.get_homework, name="get_homework"),
    path("<uuid:hid>/edit/", views.edit_homework, name="edit_homework"),
]

