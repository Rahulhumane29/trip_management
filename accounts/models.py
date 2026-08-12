import uuid
from django.db import models

class Account(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    logo = models.FileField(upload_to='accounts/logos/', blank=True, null=True)
    address = models.TextField()
    telephone = models.CharField(max_length=20)
    fax = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
