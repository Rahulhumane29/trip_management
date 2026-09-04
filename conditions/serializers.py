from rest_framework import serializers
from .models import Inclusion, Exclusion, Policy, ImportantNote

class InclusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inclusion
        fields = '__all__'


class ExclusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exclusion
        fields = '__all__'


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = '__all__'


class ImportantNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantNote
        fields = '__all__'
