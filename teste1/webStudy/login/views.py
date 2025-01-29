from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, redirect
# For hashing do password
from django.contrib.auth.hashers import make_password

from django.db import IntegrityError

from .models import User

def home(request):
	return HttpResponse("Welcome to my home page")

def error(request, msg):
	return render(request, "login/error.html", {'erro': msg})


def getAllUsers(request):
	users = User.objects.all()
	return render(request, "login/listUsers.html", {'usuarios' : users})


def login(request):
	
	if (request.method == 'POST'):
		username = request.POST['username']
		password = request.POST['password']
		try:
			target_user = User.objects.get(username=username)
		except User.DoesNotExist:
			return error(request, "USERNAME DONT EXIST")

		hashed_pass = make_password(password, "asd123")

		if (target_user.password != hashed_pass):
			return error(request, "WRONG PASS")

		return home(request)
	
	return render(request, "login/login.html")


def create(request):
	
	if (request.method == 'POST'):
		# Vai buscar os atributos do body da request
		first_name = request.POST['first_name']
		last_name = request.POST['last_name']
		age = request.POST['age']
		username = request.POST['username']
		email = request.POST['email']
		password = request.POST['password']

		# Verificar se a palavra passe tem os requisitos minimos
		# Encripita palavra passe para depois ser salva
		hashed_pass = make_password(password, "asd123")

		try:
			# se tentarem salvar um email ou username que ja existe
			User.objects.create(first_name=first_name, last_name=last_name, 
						age=age, username=username, email=email, password=hashed_pass)
		except IntegrityError: 
			return error(request, "Username or email already exist already exist!!")
		
		return HttpResponse("POST DONE")

	return render(request, "login/create.html")

