from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='testpass123'
        )
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_create_user(self):
        """Test creating a user is successful."""
        payload = {
            'email': 'user@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'Name',
        }
        url = reverse('user-list')
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', res.data)

    def test_user_authentication(self):
        """Test authentication is working."""
        payload = {
            'email': 'test@example.com',
            'password': 'testpass123',
        }
        url = reverse('jwt-create')
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_get_user_unauthorized(self):
        """Test that unauthenticated user cannot access user list."""
        self.client.force_authenticate(user=None)
        url = reverse('user-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_not_admin(self):
        """Test that non-admin user cannot access user list."""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_user_success(self):
        """Test retrieving a user."""
        url = reverse('user-detail', args=[self.user.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], self.user.email)
        self.assertEqual(res.data['first_name'], self.user.first_name)
        self.assertEqual(res.data['last_name'], self.user.last_name)

    def test_update_user(self):
        """Test updating user."""
        url = reverse('user-detail', args=[self.user.id])
        payload = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'is_active': True
        }
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, payload['first_name'])
        self.assertEqual(self.user.last_name, payload['last_name'])
        self.assertEqual(self.user.is_active, payload['is_active'])

    def test_delete_user(self):
        """Test deleting a user."""
        user_to_delete = User.objects.create_user(
            email='delete@example.com',
            password='testpass123'
        )
        url = reverse('user-detail', args=[user_to_delete.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=user_to_delete.id).exists())


class GroupTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_create_group(self):
        """Test creating a group."""
        payload = {
            'name': 'Test Group',
        }
        url = reverse('group-list')
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], payload['name'])

    def test_retrieve_groups(self):
        """Test retrieving a list of groups."""
        url = reverse('group-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)

    def test_set_user_groups(self):
        """Test setting groups for a user."""
        from django.contrib.auth.models import Group
        
        group = Group.objects.create(name='Test Group')
        user = User.objects.create_user(
            email='grouptest@example.com',
            password='testpass123'
        )
        
        url = reverse('user-set-groups', args=[user.id])
        payload = {
            'groups': [group.id]
        }
        res = self.client.post(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertIn(group, user.groups.all())

    def test_set_group_permissions(self):
        """Test setting permissions for a group."""
        from django.contrib.auth.models import Group, Permission
        from django.contrib.contenttypes.models import ContentType
        
        content_type = ContentType.objects.get_for_model(User)
        permission = Permission.objects.create(
            codename='test_permission',
            name='Test Permission',
            content_type=content_type
        )
        
        group = Group.objects.create(name='Permission Test Group')
        
        url = reverse('group-set-permissions', args=[group.id])
        payload = {
            'permissions': [permission.id]
        }
        res = self.client.post(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        group.refresh_from_db()
        self.assertIn(permission, group.permissions.all())