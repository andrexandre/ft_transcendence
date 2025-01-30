"""
ASGI config for pong_game project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from pong.consumers import PongGameConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_game.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handles HTTP requests
    "websocket": AuthMiddlewareStack(  # WebSocket handling
        URLRouter([
            path("ws/game/", PongGameConsumer.as_asgi()),  # Correct WebSocket path
        ])
    ),
})
