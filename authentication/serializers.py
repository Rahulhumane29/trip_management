import re
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    is_verified = serializers.BooleanField(source='profile.is_verified', read_only=True)
    account_id = serializers.UUIDField(source='profile.account.id', read_only=True, allow_null=True)
    role = serializers.CharField(source='profile.role', read_only=True)
    contact = serializers.CharField(source='profile.contact', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'is_verified', 'account_id', 'role', 'contact')

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate_username(self, value):
        # 1. Alphanumeric and standard characters check
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                "Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters."
            )
        
        # 2. Reserved words check
        reserved_usernames = {'admin', 'administrator', 'root', 'superuser', 'null', 'undefined', 'system'}
        if value.lower() in reserved_usernames:
            raise serializers.ValidationError("This username is reserved and cannot be used.")
        
        # 3. DB unique check
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        return value

    def validate_email(self, value):
        # 1. Lowercase email
        email_normalized = value.strip().lower()
        
        # 2. Check format
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email_normalized):
            raise serializers.ValidationError("Enter a valid email address.")
        
        # 3. DB unique check
        if User.objects.filter(email__iexact=email_normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return email_normalized

    def validate_password(self, value):
        # 1. Length check
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        # 2. Complexity checks
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
            
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number.")
            
        # Check for at least one special character
        special_characters = r'[~!@#$%^&*()_+={}\[\]|\\:;"\'<>,.?/-]'
        if not re.search(special_characters, value):
            raise serializers.ValidationError("Password must contain at least one special character.")
            
        # 3. Run built-in Django password validators
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
            
        return value


class CompanyUserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    contact = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    role = serializers.ChoiceField(choices=(('admin', 'Admin'), ('member', 'Member')), default='member')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        email_normalized = value.strip().lower()
        if User.objects.filter(email__iexact=email_normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email_normalized

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
