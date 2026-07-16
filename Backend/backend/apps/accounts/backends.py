from django.contrib.auth.backends import BaseBackend
from apps.accounts.models import UserRole


class RolePermissionBackend(BaseBackend):
    """
    Custom authentication backend that maps custom User Roles permissions
    into standard Django perm check systems.
    """

    def get_user_permissions(self, user_obj, obj=None):
        if not user_obj.is_active or user_obj.is_anonymous:
            return set()

        perms = set()
        user_roles = UserRole.objects.filter(user=user_obj).select_related("role")
        for ur in user_roles:
            role_perms = ur.role.permissions.all().select_related("content_type")
            for perm in role_perms:
                perms.add(f"{perm.content_type.app_label}.{perm.codename}")
        return perms

    def has_perm(self, user_obj, perm, obj=None):
        if not user_obj.is_active or user_obj.is_anonymous:
            return False
        return perm in self.get_user_permissions(user_obj, obj)
