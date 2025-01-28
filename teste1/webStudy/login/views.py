from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, redirect
# For hashing do password
from django.contrib.auth.hashers import make_password

from .models import User

# from django.db.models import DoesNotExist
# Create your views here.

def home(request):
	return HttpResponse("Welcome to my home page")

def error(request, msg):
	return render(request, "login/error.html", {'erro': msg})

def getAllUsers(request):
	users = User.objects.all()
	return render(request, "login/listUsers.html", {'usuarios' : users})


def login(request):
	
	if (request.method == 'POST'):
		nickName = request.POST['username']
		password = request.POST['password']
		try:
			target_user = User.objects.get(nickName=nickName)
		except User.DoesNotExist:
			return error(request, "USERNAME DONT EXIST")

		hashed_pass = make_password(password, "asd123")

		if (target_user.password != hashed_pass):
			return error(request, "WRONG PASS")

		return home(request)
	
	return render(request, "login/login.html")


def create(request):
	
	if (request.method == 'POST'):
		first_name = request.POST['first_name']
		last_name = request.POST['last_name']
		age = request.POST['age']
		nickName = request.POST['nickName']
		email = request.POST['email']
		password = request.POST['password']

		# Encripita palavra passe
		hashed_pass = make_password(password, "asd123")

		User.objects.create(first_name=first_name, last_name=last_name, 
					  age=age, nickName=nickName, email=email, password=hashed_pass)
		return HttpResponse("POST DONE")

	return render(request, "login/create.html")

