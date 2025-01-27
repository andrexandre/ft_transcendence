import json, requests
from django.shortcuts import render
from rest_framework import generics, status
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse

#REMOVE!!!!!!! This is here because of csrf cookies, temp for api endpoint testing  
@csrf_exempt
def starter_view(request):
    mockData = {
        'name': 'Ze',
        'auth': True,
        'admin': False
    }
    if request.method == "GET":
        url = "http://127.0.0.1:8000/chat_view/"
        response = requests.get(url)
        if response.status_code == 200:
            return HttpResponse(response.content)
            #return JsonResponse(mockData, status=status.HTTP_200_OK)
    elif request.method == "POST":
        jsonData = json.loads(request.body)
        name = jsonData.get('name')
        date = jsonData.get('date')
        mockDatas = {
            'name' : name,
            'date' : date
        }
        return JsonResponse(mockDatas, status=status.HTTP_201_CREATED)
    else:
        return HttpResponse(status=status.HTTP_400_BAD_REQUEST)