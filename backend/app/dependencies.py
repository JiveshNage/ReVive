from fastapi import HTTPException, status

from app.models import User


def verify_owner_or_admin(
    owner_id: int,
    current_user: User,
    detail: str = "Access forbidden: you do not own this resource.",
) -> None:
    """Verify that the current authenticated user is either the resource owner or an admin."""
    if current_user.role == "admin":
        return
    if current_user.id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )
