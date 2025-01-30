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


class LoginView(APIView):
	
	def get(self, request):
		return render(request, "login/login.html")
	
	def post(self, request):

		body_unicode = request.body.decode("utf-8")  # Decodifica os dados recebidos como string
		body = json.loads(body_unicode)  # Converte a string para um dicionário Python
		
		# Agora você pode acessar os dados JSON enviados
		username = body.get("username")
		password = body.get("password")
		
		# Verificar se o user existe depois
		target_user = User.objects.get(username=username)
		# try:
		# except User.DoesNotExist:
		# 	return 
		
		hash_pass = make_password(password, "asd123")
		if (target_user.validate_password(hash_pass)):
			# Verificar se a palavra passe esta certa
			return

		
		return JsonResponse({"msg": "tudo cool"},status=200)

