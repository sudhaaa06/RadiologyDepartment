import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(f"PACS_SALT_2026_{password}".encode("utf-8")).hexdigest()

# Demo credentials configuration (Hashed for safety)
DEMO_USERS = {
    "radiologist": {
        "username": "radiologist",
        "password_hash": hash_password("Demo@123"),
        "display_name": "Dr. Demo",
        "role": "Radiologist"
    },
    "technician": {
        "username": "technician",
        "password_hash": hash_password("Demo@123"),
        "display_name": "Demo Technician",
        "role": "Technician"
    },
    "admin": {
        "username": "admin",
        "password_hash": hash_password("Admin@123"),
        "display_name": "System Admin",
        "role": "Admin"
    }
}
