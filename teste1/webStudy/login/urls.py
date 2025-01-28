from django.urls import path
from . import views

app_name = 'login'

urlpatterns = [
    path("", views.login, name="login"),
    path("create", views.create, name="create"),
    path("home", views.home, name="home"),
    path("error", views.error, name="error"),
    path("get_user", views.getAllUsers, name="get_user"),
]