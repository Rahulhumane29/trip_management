from django.contrib import admin
from .models import Inclusion, Exclusion, Policy

@admin.register(Inclusion)
class InclusionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'created_at')
    search_fields = ('text',)
    ordering = ('-created_at',)


@admin.register(Exclusion)
class ExclusionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'created_at')
    search_fields = ('text',)
    ordering = ('-created_at',)


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'created_at')
    search_fields = ('text',)
    ordering = ('-created_at',)
