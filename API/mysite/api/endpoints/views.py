import json
from django.shortcuts import render
from rest_framework import generics, status
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt


#REMOVE!!!!!!! This is here because of csrf cookies, temp for api endpoint testing  
@csrf_exempt
def starter_view(request):
    print("-------------Request---------------")
    print(request)
    print("-----------------------------------")
    if request.method == "GET":
        mockData = {
            'name': 'Ze',
            'auth': True,
            'admin': False
        }
        return JsonResponse(mockData, status=status.HTTP_200_OK)
    elif request.method == "POST":
        jsonData = json.loads(request.body)
        name = jsonData.get('name')     
        mockDatas = {
            'name' : name,
            'test' : "123456789"
        }
        return JsonResponse(mockDatas, status=status.HTTP_201_CREATED)