from django.urls import path
from .endpoints.homeView import HomeView
from .endpoints.loginview import LoginView
from .endpoints.registerView import RegisterView
from .endpoints.tests import register, login
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


app_name = 'user_api'

urlpatterns = [
    path('login', login, name="login"),
    path('register', register, name="register"),
    path('home', HomeView.as_view(), name="home"), # tem que ter os tokens para funcionar bem
    path('login_validate', LoginView.as_view(), name="login_validate"),
    path('register_validate', RegisterView.as_view(), name="register_validate"),
	
	# path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
