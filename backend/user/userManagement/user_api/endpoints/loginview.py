# Temporario
from django.shortcuts import render

from ..models import User
import json
from django.http import JsonResponse
from rest_framework.views import APIView 
from rest_framework import status
# For hashing do password
from django.contrib.auth.hashers import make_password


from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .tokens import get_tokens_for_user


class LoginView(APIView):
	
	def get(self, request):
		return render(request, "login/login.html")
	
	def post(self, request):

		# body_unicode = request.body.decode("utf-8")  # Decodifica os dados recebidos como string
		body = json.loads(request.body)  # Converte a string para um dicionário Python
		
		# Agora você pode acessar os dados JSON enviados
		username = body.get("username")
		password = body.get("password")
		
		# Verificar se o user existe depois
		target_user = User.objects.get(username=username)
		# try:
		# except User.DoesNotExist:
		# 	return 
		myTokens = get_tokens_for_user(target_user)
			
		msg = {
			"msg": "Success",
			'Access': f'{myTokens['access']}',
			'Refresh': f'{myTokens['refresh']}',
		}
		
		hash_pass = make_password(password, "asd123")
		if (target_user.validate_password(hash_pass)):
			# Verificar se a palavra passe esta certa
			return JsonResponse({"msg": "deu merda"}, status=status.HTTP_401_UNAUTHORIZED)

		
		return JsonResponse(msg, status=status.HTTP_201_CREATED)





