import uuid
from typing import Optional, Dict, Any
from app.core.auth_config import DEMO_USERS, hash_password

class AuthService:
    _active_sessions: Dict[str, Dict[str, Any]] = {}
    # In-memory store for users registered at runtime (prototype only)
    _registered_users: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def register(cls, username: str, password: str, display_name: str, role: str, email: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Register a new user (prototype: in-memory only, not persisted across restarts)."""
        key = username.lower().strip()
        if not key or not password or not display_name:
            return None
        # Block duplicate usernames against demo accounts and registered users
        if key in DEMO_USERS or key in cls._registered_users:
            return None

        password_hash = hash_password(password)
        user_info = {
            "username": key,
            "display_name": display_name.strip(),
            "password_hash": password_hash,
            "role": role,
            "email": email
        }
        cls._registered_users[key] = user_info

        # Auto-login: create a session for the new user
        token = f"AUTH_TOKEN_{uuid.uuid4().hex[:16].upper()}"
        session_data = {
            "username": key,
            "display_name": display_name.strip(),
            "role": role,
            "token": token
        }
        cls._active_sessions[token] = session_data
        return session_data

    @classmethod
    def authenticate(cls, username: str, password: str) -> Optional[Dict[str, Any]]:
        if not username or not password:
            return None

        key = username.lower().strip()
        # Check demo users first, then runtime-registered users
        user_info = DEMO_USERS.get(key) or cls._registered_users.get(key)
        if not user_info:
            return None

        input_hash = hash_password(password)
        if input_hash != user_info["password_hash"]:
            return None

        token = f"AUTH_TOKEN_{uuid.uuid4().hex[:16].upper()}"
        session_data = {
            "username": user_info["username"],
            "display_name": user_info["display_name"],
            "role": user_info["role"],
            "token": token
        }
        cls._active_sessions[token] = session_data
        return session_data

    @classmethod
    def validate_token(cls, token: str) -> Optional[Dict[str, Any]]:
        if not token:
            return None
        return cls._active_sessions.get(token)

    @classmethod
    def logout(cls, token: str) -> bool:
        if token in cls._active_sessions:
            del cls._active_sessions[token]
            return True
        return False

auth_service = AuthService()
