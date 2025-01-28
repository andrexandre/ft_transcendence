from django.db import models

# Create your models here.

class User(models.Model):
	nome = models.CharField(max_length=20)
	apelido = models.CharField(max_length=100)
	idade = models.IntegerField(default=0)

	def __str__(self):
		return f'{self.nome} {self.apelido}'