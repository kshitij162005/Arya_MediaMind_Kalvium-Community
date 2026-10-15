import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import JWT_SECRET, JWT_TTL_HOURS
from .db import get_conn, row_to_dict

_bearer = HTTPBearer(auto_error=False)
_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split("$", 1)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), _ITERATIONS)
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_TTL_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def public_user(user: dict) -> dict:
    return {k: user[k] for k in ("id", "email", "name", "role")}


def get_user_by_email(email: str):
    with get_conn() as conn:
        return row_to_dict(conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone())


def create_user(email: str, name: str, password: str, role: str = "journalist") -> dict:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,?)",
            (email.lower(), name, hash_password(password), role),
        )
        return row_to_dict(conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone())


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    with get_conn() as conn:
        user = row_to_dict(conn.execute("SELECT * FROM users WHERE id = ?", (int(payload["sub"]),)).fetchone())
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
    return user


def require_uploader(user: dict = Depends(current_user)) -> dict:
    if user["role"] not in ("admin", "archivist", "journalist"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed to upload")
    return user
