import uuid
from django.db import models
from django.contrib.auth.models import User
import random
from django.utils import timezone

class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    account = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='user_profiles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    contact = models.CharField(max_length=20, blank=True, null=True)

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.otp_created_at = timezone.now()
        self.save()
        return self.otp

    def is_otp_valid(self):
        if not self.otp_created_at:
            return False
        # OTP is valid for 10 minutes
        expiry_time = self.otp_created_at + timezone.timedelta(minutes=10)
        return timezone.now() <= expiry_time

    def __str__(self):
        return f"{self.user.username} Profile"
