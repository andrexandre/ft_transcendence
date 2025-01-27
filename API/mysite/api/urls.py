from django.urls import path
# from .endpoints import test_view
from .endpoints import views

urlpatterns = {
    path("index/", views.starter_view, name="starter_view-cre"),
}