import json
from django.shortcuts import render
from rest_framework import generics, status
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

def chat(request):
    if request.method == "GET":
        return JsonResponse({"a":"b"}, status=status.HTTP_200_OK)