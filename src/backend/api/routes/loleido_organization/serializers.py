from rest_framework import serializers
from api.models import LoleidoOrganization, UserJoinOrgInvitation, Consortium


class ConsortiumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consortium
        fields = "__all__"


class LoleidoOrganizationSerializer(serializers.ModelSerializer):
    consortiums = ConsortiumSerializer(many=True, read_only=True)

    class Meta:
        model = LoleidoOrganization
        fields = "__all__"


class UserJoinOrgInvitionSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    loleido_organization = LoleidoOrganizationSerializer()
    invitor = serializers.SerializerMethodField()

    class Meta:
        model = UserJoinOrgInvitation
        # fields = "__all__"
        exclude = ["create_at"]

    def get_date(self, obj):
        return obj.create_at.strftime("%Y-%m-%d %H:%M")

    def get_loleido_organization(self, obj):
        return {
            "name": obj.loleido_organization.name,
            "id": obj.loleido_organization.id,
        }

    def get_invitor(self, obj):
        return {"username": obj.invitor.username, "id": obj.invitor.id}
