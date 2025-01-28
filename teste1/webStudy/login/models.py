from django.db import models

# Create your models here.

class User(models.Model):
	first_name = models.CharField(max_length=20)
	last_name = models.CharField(max_length=20)
	age = models.IntegerField(default=0)
	password = models.CharField(default="")

	# Um email e o nickName so pode existir uma fez na base de dados
	nickName = models.CharField(max_length=20, unique=True)
	email = models.EmailField(max_length=255, unique=True)

	def __str__(self):
		return f'{self.first_name} {self.last_name}'

