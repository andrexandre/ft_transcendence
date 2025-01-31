from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework import status

class GenerateTokenView(APIView):
    permission_classes = [AllowAny]  # Make this open to the public (no login needed)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            # Authenticate the user manually
            user = User.objects.get(username=username)
            if user.check_password(password):
                # Create JWT token if authentication is successful
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                return Response({
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)