from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework import status

from django.http import JsonResponse
from django.http import HttpResponse
from ..models import User

import json
from rest_framework.views import APIView 
# For hashing do password
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication



class HomeView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		user = User.objects.get(user_id=request.user.user_id)
		
		return render(request, "login/profile.html", {'user': user 	})
	