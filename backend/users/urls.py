from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, GroupViewSet, PermissionViewSet

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('groups', GroupViewSet)
router.register('permissions', PermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]