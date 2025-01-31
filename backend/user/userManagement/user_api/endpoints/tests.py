from django.http import HttpResponse
from django.shortcuts import render, redirect

import json
import requests
from ..models import User
from django.db import IntegrityError
from django.http import HttpRequest, HttpRequest
# For hashing do password
from django.contrib.auth.hashers import make_password

from .tokens import get_tokens_for_user


def error(request, msg):
	return render(request, "login/error.html", {'erro': msg})

# def home(request):
# 	user = User.objects.get(username=request.POST['username'])
# 	return render(request, "login/profile.html", {'user': user})



def login(request):
	
	if (request.method == 'POST'):
		username = request.POST['username']
		password = request.POST['password']

		dados = {
            "username": username,
            "password": password
        }
		
		url = "http://127.0.0.1:8000/user_api/login_validate"

		response = requests.post(url=url, json=dados)

		if (response.status_code == 200):
			user = User.objects.get(username=username)
			myTokens = get_tokens_for_user(user)
			
			headers = {
				'Authorization': f'Bearer {myTokens['access']}',  # Exemplo de header de autorização
			}
			
			# res = render(request, "login/login.html")
			url = "http://127.0.0.1:8000/user_api/home"
			res = redirect(url)
			res['Authorization'] = f'Bearer {myTokens['access']}'

			return res
		elif (response.status_code == 404):
			return HttpResponse("POST ERROR")

		return error(request, 'merda no login')
	
	return render(request, "login/login.html")




def register(request):
	
	if (request.method == 'POST'):

		first_name = request.POST['first_name']
		last_name = request.POST['last_name']
		age = request.POST['age']
		username = request.POST['username']
		email = request.POST['email']
		password = request.POST['password']

		dados = {
            "first_name": first_name,
            "last_name": last_name,
            "age": age,
            "username": username,
            "email": email,
            "password": password
        }
		
		url = "http://127.0.0.1:8000/user_api/register_validate"

		response = requests.post(url=url, json=dados)

		if (response.status_code == 200):
			return redirect("http://127.0.0.1:8000/user_api/login")
		
		return HttpResponse("POST ERROR")

	return render(request, "login/create.html")
