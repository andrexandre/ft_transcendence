from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

class CreateUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        # Create the user
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return Response({"message": "User created successfully!"}, status=201)
