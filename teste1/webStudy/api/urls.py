from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.get_users, name="get_users"),
    path("users/<int:pk>/", views.get_users, name="get_users"),
    path("users/create", views.create_user, name="create_users")
]