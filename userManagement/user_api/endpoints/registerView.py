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


class RegisterView(APIView):
	
	def get(self, request):
		return render(request, "login/create.html")
	
	def post(self, request):

		body_unicode = request.body.decode("utf-8")  # Decodifica os dados recebidos como string
		body = json.loads(body_unicode)  # Converte a string para um dicionário Python
		
		# Agora você pode acessar os dados JSON enviados
		first_name = body.get("first_name")
		last_name = body.get("last_name")
		age = body.get("age")
		username = body.get("username")
		email = body.get("email")
		password = body.get("password")
		
		# Verificar se a palavra passe tem os requisitos minimos
		# Encripita palavra passe para depois ser salva
		hashed_pass = make_password(password, "asd123")

		try:
			# se tentarem salvar um email ou username que ja existe
			User.objects.create(first_name=first_name, last_name=last_name, 
						age=age, username=username, email=email, password=hashed_pass)
		except IntegrityError: 
			return
		
		return JsonResponse({"msg": "tudo cool"},status=200)
