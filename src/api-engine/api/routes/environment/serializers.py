from rest_framework import serializers
from api.models import Environment

class EnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Environment
        fields = "__all__"