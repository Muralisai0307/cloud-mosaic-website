import logging
from django.contrib.auth.models import Permission
from apps.accounts.models import Role, UserRole

logger = logging.getLogger("auth")


class AuthorizationService:
    """
    Decoupled service handling RBAC rules, permissions matching,
    role assignments, and object-level ownership verification.
    """

    @staticmethod
    def check_role(user, role_name):
        """
        Checks if the user has a specific role (or is superuser).
        """
        if not user or user.is_anonymous:
            return False

        if user.is_superuser:
            return True

        has_role = UserRole.objects.filter(user=user, role__name=role_name).exists()
        if not has_role:
            logger.warning(
                f"Role verification failed: user '{user.username}' does not have role '{role_name}'."
            )
        else:
            logger.info(
                f"Role verification passed: user '{user.username}' verified as '{role_name}'."
            )
        return has_role

    @staticmethod
    def has_permission(user, perm_name):
        """
        Wrapper to check if the user has a permission string (e.g. 'contact.view_contactmessage').
        """
        if not user or user.is_anonymous:
            return False

        if user.is_superuser:
            return True

        has_perm = user.has_perm(perm_name)
        if not has_perm:
            logger.warning(
                f"Permission denied: user '{user.username}' lacks permission '{perm_name}'."
            )
        else:
            logger.info(
                f"Permission granted: user '{user.username}' validated for '{perm_name}'."
            )
        return has_perm

    @staticmethod
    def check_permission(user, perm_name):
        return AuthorizationService.has_permission(user, perm_name)

    @staticmethod
    def has_object_permission(user, obj, action="edit"):
        """
        Validates object-level ownership checks.
        """
        if not user or user.is_anonymous:
            return False

        # Admin overrides
        if user.is_superuser or user.has_perm("accounts.manage_users"):
            logger.info(
                f"Admin permission override granted: user '{user.username}' allowed to '{action}' object '{obj}'."
            )
            return True

        # Check by profile user link
        if hasattr(obj, "user") and obj.user == user:
            logger.info(
                f"Ownership validation passed: user '{user.username}' owns '{obj}' via profile relation."
            )
            return True

        # Check by email matching
        if hasattr(obj, "email") and obj.email.lower() == user.email.lower():
            logger.info(
                f"Ownership validation passed: user '{user.username}' owns '{obj}' via email matching."
            )
            return True

        # Check testimonial name match (fallback if testimonial is not linked directly to user)
        if (
            obj.__class__.__name__ == "Testimonial"
            and hasattr(obj, "name")
            and (
                obj.name.lower() == user.get_full_name().lower()
                or obj.name.lower() == user.username.lower()
            )
        ):
            logger.info(
                f"Ownership validation passed: user '{user.username}' owns Testimonial '{obj}' via name match."
            )
            return True

        logger.warning(
            f"Object-level authorization denied: user '{user.username}' does not own '{obj}'."
        )
        return False

    @staticmethod
    def assign_role(user, role_name):
        """
        Idempotently assigns a role to a user.
        """
        role = Role.objects.filter(name=role_name).first()
        if not role:
            logger.error(
                f"Role assignment failed: role '{role_name}' does not exist in databases."
            )
            raise ValueError(f"Role '{role_name}' does not exist.")

        user_role, created = UserRole.objects.get_or_create(user=user, role=role)
        if created:
            logger.info(
                f"Role assigned successfully: role '{role_name}' mapped to user '{user.username}'."
            )
        return user_role

    @staticmethod
    def remove_role(user, role_name):
        """
        Idempotently removes a role mapping from a user.
        """
        deleted_count, _ = UserRole.objects.filter(
            user=user, role__name=role_name
        ).delete()
        if deleted_count > 0:
            logger.info(
                f"Role removed successfully: role '{role_name}' unmapped from user '{user.username}'."
            )
        return deleted_count > 0

    @staticmethod
    def assign_permission(role, permission_codename, app_label="auth"):
        """
        Assigns a permission to a Role.
        """
        permission = Permission.objects.filter(
            codename=permission_codename, content_type__app_label=app_label
        ).first()
        if not permission:
            logger.error(
                f"Permission assignment failed: permission '{app_label}.{permission_codename}' not found."
            )
            return False

        role.permissions.add(permission)
        logger.info(
            f"Permission mapped: permission '{app_label}.{permission_codename}' added to Role '{role.name}'."
        )
        return True

    @staticmethod
    def revoke_permission(role, permission_codename, app_label="auth"):
        """
        Removes a permission from a Role.
        """
        permission = Permission.objects.filter(
            codename=permission_codename, content_type__app_label=app_label
        ).first()
        if not permission:
            return False

        role.permissions.remove(permission)
        logger.info(
            f"Permission unmapped: permission '{app_label}.{permission_codename}' removed from Role '{role.name}'."
        )
        return True

    @staticmethod
    def get_user_permissions(user):
        if not user or user.is_anonymous:
            return []
        return list(UserRole.objects.filter(user=user).values_list("role__permissions__codename", flat=True))

    @staticmethod
    def get_role_permissions(role):
        return list(role.permissions.values_list("codename", flat=True))
