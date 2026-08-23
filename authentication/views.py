from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

import uuid
from .serializers import RegisterSerializer, UserSerializer, CompanyUserCreateSerializer
from .models import UserProfile


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        verification_token = uuid.uuid4().hex
        
        # Prepare registration data to store in Redis
        temp_user_data = {
            'username': data['username'],
            'email': data['email'],
            'password': data['password'],
            'token': verification_token
        }
        
        # Store in Redis cache for 10 minutes (600 seconds)
        cache.set(f"temp_user:{data['username']}", temp_user_data, timeout=600)
        cache.set(f"temp_user_token:{verification_token}", temp_user_data, timeout=600)
        
        # Send Verification Token link via email
        verify_url = f"http://127.0.0.1:8000/api/verify-email/?token={verification_token}"
        try:
            send_mail(
                subject='Verify your Email - Registration',
                message=(
                    f"Hi {data['username']},\n\n"
                    f"Thank you for registering. Please verify your email by clicking the link below:\n\n"
                    f"{verify_url}\n\n"
                    f"This link is valid for 10 minutes."
                ),
                from_email=None,
                recipient_list=[data['email']],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {str(e)}")

        print(f"\n======================================")
        print(f"Verification Token sent to {data['email']}: {verification_token}")
        print(f"======================================\n")
        
        return Response({
            "message": "Verification email sent. Please verify using the sent link to complete registration.",
            "username": data['username'],
            "token": verification_token, # returning for development/testing convenience
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _verify_token(token):
    if not token:
        return Response({"error": "Please provide a verification token."}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve user data from Redis using the token
    user_data = cache.get(f"temp_user_token:{token}")
    if not user_data:
        return Response({"error": "Invalid or expired verification token. Please register again."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user in sqlite database
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password']
        )
        # Create user profile
        UserProfile.objects.create(
            user=user,
            is_verified=True
        )
        
        # Clean up Redis keys
        cache.delete(f"temp_user:{user_data['username']}")
        cache.delete(f"temp_user_token:{token}")
        
        # Generate token on successful verification
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Email verified and registration completed successfully.",
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": f"Failed to register user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    if request.method == 'GET':
        token = request.query_params.get('token')
    else:
        token = request.data.get('token')
    return _verify_token(token)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username_or_email = request.data.get('username')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response({"detail": "Please provide both username/email and password."}, status=status.HTTP_400_BAD_REQUEST)

    # Resolve username from email if the user entered their email address
    username = username_or_email
    if '@' in username_or_email:
        try:
            resolved_user = User.objects.get(email__iexact=username_or_email)
            username = resolved_user.username
        except User.DoesNotExist:
            pass

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"detail": "No active account found with the given credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    if not hasattr(user, 'profile') or not user.profile.is_verified:
        return Response({
            "detail": "Your account is not verified.",
            "code": "user_not_verified"
        }, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        user = request.user
        data = request.data
        
        # Update User fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        user.save()
        
        # Update UserProfile fields
        profile = getattr(user, 'profile', None)
        if profile:
            if 'contact' in data:
                profile.contact = data['contact']
            profile.save()
            
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_company_user_view(request):
    admin_profile = getattr(request.user, 'profile', None)
    if not admin_profile or admin_profile.role != 'admin':
        return Response({
            "detail": "You do not have permission to perform this action. Only company admins can create users."
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = CompanyUserCreateSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Create User in DB
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        
        # Create UserProfile
        UserProfile.objects.create(
            user=user,
            is_verified=True,
            account=admin_profile.account,
            role=data['role'],
            contact=data.get('contact', '')
        )
        
        return Response({
            "message": "Company user created successfully.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
