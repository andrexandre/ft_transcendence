from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework import status
from django.http import JsonResponse
from .models import User
from .serializer import UserSerializer



# Create your views here.

@api_view(['GET'])
def get_users(request, pk=0):

	if (pk > 0):
		target = User.objects.get(id=pk)
		serializer2 = UserSerializer(target)
		# return Response(serializer2.data)
		# json = JSONRenderer().render(serializer2.data)
		return JsonResponse(serializer2.data)
	
	all_Users = User.objects.all()
	serializer_tmp = UserSerializer(all_Users, many=True)
	return Response(serializer_tmp.data)


@api_view(['POST'])
def create_user(request):
	serializer_tmp = UserSerializer(data=request.data)
	if (serializer_tmp.is_valid()):
		serializer_tmp.save()
		return Response(serializer_tmp.data, status=status.HTTP_201_CREATED)
	return Response(serializer_tmp.errors, status=status.HTTP_400_BAD_REQUEST)