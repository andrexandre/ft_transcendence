#!/bin/bash

PROJECT_NAME=pongv4
PROJECT_DIR=teste1

# Verifica se o Django está instalado
django-admin --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Django was not installed!"
    exit 1  # Sai do script se o Django não estiver instalado
fi


# Verifica se o projeto já existe
if [ -d "$PROJECT_DIR" ]; then
    echo "Project already created!"
	cd $PROJECT_DIR || exit 1

else
    # Cria o projeto
    echo "Creating project"
    cd /teste1 || exit 1  # Se não conseguir mudar para /home/teste1, sai do script
    django-admin startproject $PROJECT_NAME

    # Entra no diretório do projeto
    cd $PROJECT_NAME || exit 1
fi

# Executa o projeto ou outro comando passado ao script
echo "Executing project!"
exec "$@"

# Creating suuper user so para desenvolvimento
# python manage.py createsuperuser
# UserName
# Email
# Password 2 times