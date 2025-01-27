from django.urls import path
# from .endpoints import test_view
from .endpoints import views
from .endpoints import chat_view

urlpatterns = {
    path("index/", views.starter_view, name="starter_view-cre"),
    path("chat_view/", chat_view.chat, name="chat_view_name")
}