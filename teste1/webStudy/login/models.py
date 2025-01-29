from django.db import models
from django.core.validators import EmailValidator
# Create your models here.

class User(models.Model):
	user_id = models.BigAutoField(primary_key=True)
	first_name = models.CharField(max_length=20)
	last_name = models.CharField(max_length=20)
	age = models.IntegerField(default=0)
	password = models.CharField(default="")
	is_online = models.BooleanField(default=False)

	# Um email e o nickName so pode existir uma fez na base de dados
	username = models.CharField(max_length=20, unique=True)
	email = models.EmailField(max_length=254, unique=True, validators=[EmailValidator()])


	# Define o nome da tabela na base de dados
	class Meta:
		db_table = "user_table"

	def __str__(self):
		return f'{self.first_name} {self.last_name}'

