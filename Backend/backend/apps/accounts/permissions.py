from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.common.services.authorization_service import AuthorizationService


class RolePermission(BasePermission):
    """
    Checks if a user has any of the configured allowed roles.
    """

    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or request.user.is_anonymous:
            return False

        if request.user.is_superuser:
            return True

        for role in self.allowed_roles:
            if AuthorizationService.check_role(request.user, role):
                return True
        return False


class PermissionRequired(BasePermission):
    """
    Checks if a user holds a specific codename permission.
    """

    required_permission = None

    def has_permission(self, request, view):
        if not self.required_permission:
            return True
        return AuthorizationService.has_permission(request.user, self.required_permission)


# Reusable Specific Roles permission classes
class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class IsAdmin(RolePermission):
    allowed_roles = ["Super Admin", "Admin"]


class IsHR(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "HR Manager"]


class IsRecruiter(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Recruiter"]


class IsSales(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Sales Manager", "Sales Executive"]


class IsProjectManager(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Project Manager"]


class IsDeveloper(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Developer"]


class IsClient(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Client"]


class IsOwner(BasePermission):
    """
    Enforces object-level ownership checks.
    """

    def has_object_permission(self, request, view, obj):
        return AuthorizationService.has_object_permission(request.user, obj, action="read_write")


class IsOwnerOrAdmin(BasePermission):
    """
    Enforces object-level ownership checks while granting global Admin overrides.
    """

    def has_object_permission(self, request, view, obj):
        # Admin check
        if request.user and (request.user.is_superuser or AuthorizationService.check_role(request.user, "Admin") or AuthorizationService.check_role(request.user, "Super Admin")):
            return True
        return AuthorizationService.has_object_permission(request.user, obj, action="read_write")


class ReadOnly(BasePermission):
    """
    Allows read-only actions for public guests.
    """

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class AuthenticatedReadOnly(BasePermission):
    """
    Allows read-only actions for authenticated users only.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.method in SAFE_METHODS
        )


class IsClientUser(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Client"]


class IsClientAdmin(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Client Admin"]


class IsFinanceManager(RolePermission):
    allowed_roles = ["Super Admin", "Admin", "Finance Manager"]

