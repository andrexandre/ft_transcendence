from django.urls import path
# from .endpoints import test_view
from .endpoints import views
from .endpoints import chat_view
from .endpoints.tokenGenerator import GenerateTokenView
from .endpoints.userCreation import CreateUserView
urlpatterns = {
    path("index/", views.starter_view, name="starter_view-cre"),
    path("chat_view/", chat_view.chat, name="chat_view_name"),
    path("generate-token/", GenerateTokenView.as_view(), name="generate_token"),
    path("create-user/", CreateUserView.as_view(), name="create_user")
}