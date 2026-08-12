from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Account
from .serializers import AccountSerializer

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def account_list_create_view(request):
    if request.method == 'GET':
        accounts = Account.objects.all()
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Authentication check
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = AccountSerializer(data=request.data)
        if serializer.is_valid():
            account = serializer.save()
            
            # Optionally automatically link the creating user's profile to this account if they don't have one
            profile = getattr(request.user, 'profile', None)
            if profile and not profile.account:
                profile.account = account
                profile.save()
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def account_detail_view(request, pk):
    account = get_object_or_404(Account, pk=pk)
    
    if request.method == 'GET':
        serializer = AccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method in ['PUT', 'DELETE']:
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.method == 'PUT':
            serializer = AccountSerializer(account, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            account.delete()
            return Response({"message": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def associate_account_view(request):
    account_id = request.data.get('account_id')
    if not account_id:
        return Response({"error": "Please provide an account_id."}, status=status.HTTP_400_BAD_REQUEST)
        
    account = get_object_or_404(Account, pk=account_id)
    profile = getattr(request.user, 'profile', None)
    if not profile:
        return Response({"error": "UserProfile not found."}, status=status.HTTP_404_NOT_FOUND)
        
    profile.account = account
    profile.save()
    return Response({
        "message": "User successfully linked to the account.",
        "username": request.user.username,
        "account_id": account.id,
        "account_name": account.name
    }, status=status.HTTP_200_OK)
