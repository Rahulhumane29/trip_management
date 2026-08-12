from django.contrib import admin
from .models import Account

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'telephone', 'email', 'created_at')
    search_fields = ('name', 'telephone', 'email', 'address')
    ordering = ('-created_at',)
