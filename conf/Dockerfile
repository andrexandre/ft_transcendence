FROM python

EXPOSE 8000

RUN apt update && \
	python3 -m pip install --upgrade pip

RUN apt install -y netcat-openbsd 

RUN pip install django && \
	# Para o ENGINE do postgres
	pip install psycopg2 &&  \ 
	pip install djangorestframework && \
	pip install markdown && \
	pip install django-filter

COPY ./setup.sh /bin/
RUN chmod 777 /bin/setup.sh

ENTRYPOINT [ "/bin/setup.sh" ]

CMD [ "python" , "manage.py" , "runserver" , "0.0.0.0:8000" ]
