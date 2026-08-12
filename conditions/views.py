from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Inclusion, Exclusion, Policy
from .serializers import InclusionSerializer, ExclusionSerializer, PolicySerializer

# --- INCLUSIONS VIEWS ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def inclusion_list_create_view(request):
    if request.method == 'GET':
        inclusions = Inclusion.objects.all()
        serializer = InclusionSerializer(inclusions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = InclusionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def inclusion_detail_view(request, pk):
    inclusion = get_object_or_404(Inclusion, pk=pk)
    
    if request.method == 'GET':
        serializer = InclusionSerializer(inclusion)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method in ['PUT', 'DELETE']:
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.method == 'PUT':
            serializer = InclusionSerializer(inclusion, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            inclusion.delete()
            return Response({"message": "Inclusion deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# --- EXCLUSIONS VIEWS ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def exclusion_list_create_view(request):
    if request.method == 'GET':
        exclusions = Exclusion.objects.all()
        serializer = ExclusionSerializer(exclusions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = ExclusionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def exclusion_detail_view(request, pk):
    exclusion = get_object_or_404(Exclusion, pk=pk)
    
    if request.method == 'GET':
        serializer = ExclusionSerializer(exclusion)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method in ['PUT', 'DELETE']:
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.method == 'PUT':
            serializer = ExclusionSerializer(exclusion, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            exclusion.delete()
            return Response({"message": "Exclusion deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# --- POLICIES VIEWS ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def policy_list_create_view(request):
    if request.method == 'GET':
        policies = Policy.objects.all()
        serializer = PolicySerializer(policies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = PolicySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def policy_detail_view(request, pk):
    policy = get_object_or_404(Policy, pk=pk)
    
    if request.method == 'GET':
        serializer = PolicySerializer(policy)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method in ['PUT', 'DELETE']:
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.method == 'PUT':
            serializer = PolicySerializer(policy, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            policy.delete()
            return Response({"message": "Policy deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
