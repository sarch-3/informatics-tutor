from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.get_classrooms, name="get_classrooms"),
    path("create/", views.new_classroom, name="new_classroom"),
    path("join/", views.join, name="join"),
    path("<uuid:cid>/", views.get_classroom, name="get_classroom"),
    path("<uuid:cid>/homeworks/", views.get_homeworks, name="get_homeworks"),
    path("<uuid:cid>/exit/", views.exit_classroom, name="exit_classroom"),
    path("<uuid:cid>/edit/", views.edit_classroom, name="edit_classroom"),
    path("<uuid:cid>/invite-link/", views.invite_link, name="invite_link"),
]
