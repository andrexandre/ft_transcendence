FROM python:3.13.1-slim

#FROM python

EXPOSE 8000

RUN apt update && \
	python3 -m pip install --upgrade pip

RUN apt install -y netcat-openbsd 

RUN pip install django && \
	# Para o ENGINE do postgres
	pip install psycopg2 &&  \ 
	pip install djangorestframework && \
	pip install djangorestframework_simplejwt && \
	pip install markdown && \
	pip install django-filter && \
	pip install requests

COPY ./setup.sh /bin/
RUN chmod 777 /bin/setup.sh

ENTRYPOINT [ "/bin/setup.sh" ]

CMD [ "python" , "manage.py" , "runserver" , "0.0.0.0:8000" ]
# CMD ["tail", "-f", "/dev/null"]
# docker system df ve o tamanho total de tudo que o docker usa imagens volume cache