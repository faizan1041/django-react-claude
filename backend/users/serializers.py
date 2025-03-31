from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer

User = get_user_model()


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename')


class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password')


class UserSerializer(BaseUserSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 
                  'is_staff', 'groups', 'date_joined', 'last_login')


class UserDetailSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    user_permissions = PermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 
                  'is_staff', 'is_superuser', 'groups', 'user_permissions', 
                  'date_joined', 'last_login')
        read_only_fields = ('is_superuser', 'date_joined', 'last_login')


class GroupDetailSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(source='permissions', many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = ('id', 'name', 'permissions')