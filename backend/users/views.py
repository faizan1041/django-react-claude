from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import (
    UserDetailSerializer,
    GroupSerializer,
    GroupDetailSerializer,
    PermissionSerializer
)

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users management
    """
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminUser]
    

    @action(detail=True, methods=['post'])
    def set_groups(self, request, pk=None):
        user = self.get_object()
        groups = request.data.get('groups', [])
        
        user.groups.clear()
        for group_id in groups:
            try:
                group = Group.objects.get(id=group_id)
                user.groups.add(group)
            except Group.DoesNotExist:
                pass
        
        return Response({'status': 'groups set'})

    @action(detail=True, methods=['post'])
    def set_permissions(self, request, pk=None):
        user = self.get_object()
        permissions = request.data.get('permissions', [])
        
        user.user_permissions.clear()
        for perm_id in permissions:
            try:
                permission = Permission.objects.get(id=perm_id)
                user.user_permissions.add(permission)
            except Permission.DoesNotExist:
                pass
        
        return Response({'status': 'permissions set'})


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint for groups management
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return GroupDetailSerializer
        return GroupSerializer

    @action(detail=True, methods=['post'])
    def set_permissions(self, request, pk=None):
        group = self.get_object()
        permissions = request.data.get('permissions', [])
        
        group.permissions.clear()
        for perm_id in permissions:
            try:
                permission = Permission.objects.get(id=perm_id)
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                pass
        
        return Response({'status': 'permissions set'})


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for permissions (read-only)
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]