from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.request import Request

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .serializers import UserSerializer

@api_view(["POST"])
def refresh(request: Request):
    token = request.data.get("refresh")
    if token is None:
        return Response({"status": "Bad", "messages": {"refresh": ["This field is required."]}}, status=400)

    try:
        token = RefreshToken(token)
        return Response({"access": str(token.access_token)}, status=200)
    except Exception as e:
        return Response({"status": "Bad", "messages": {"refresh": ["Invalid token."]}}, status=400)

@api_view(["POST"])
def sign_in(request: Request):
    email, password = request.data.get("email"), request.data.get("password")
    if email is None or password is None:
        messages = dict()
        if email is None:
            messages["email"] = ["This field is required."]
        if password is None:
            messages["password"] = ["This field is required."]
        return Response({"status": "Bad", "messages": messages}, status=400) 
    
    user = authenticate(email=email, password=password)

    if user is None:
        return Response({"status": "Bad", "messages": {"email": ["Invalid e-mail or password."], "password": ["Invalid e-mail or password."]}}, status=401)
    
    token = RefreshToken.for_user(user)
    return Response({"refresh": str(token), "access": str(token.access_token)}, status=200)

@api_view(["POST"])
def sign_up(request: Request):
    serializer = UserSerializer(data = request.data)
    if not serializer.is_valid():
        return Response({"status": "Bad", "messages": serializer.errors}, status=400)
    
    user = serializer.create_user()

    token = RefreshToken.for_user(user)
        
    return Response({"refresh": str(token), "access": str(token.access_token)}, status=201)
    
@api_view(["POST"])
def sign_out(request: Request):
    token = request.data.get("refresh")
    if token is None:
        return Response({"status": "Bad", "messages": {"refresh": ["This field is required."]}}, status=400)

    try:
        token = RefreshToken(token)
        token.blacklist()
        return Response({"status": "Ok"}, status=200)
    except Exception as e:
        return Response({"status": "Bad", "messages": {"refresh": ["Invalid token."]}}, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get(request: Request):
    serializer = UserSerializer(request.user)

    return Response(serializer.data, 200)

# Редактирование пользователя