FROM python

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir django \
    djangorestframework channels channels-redis

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "pong_game.asgi:application"]
