from typing import Literal, Optional
from pydantic import BaseModel, Field

UserRoleEnum = Literal["Radiologist", "Technician", "Admin"]

class UserLoginRequest(BaseModel):
    username: str = Field(..., json_schema_extra={"example": "radiologist"})
    password: str = Field(..., json_schema_extra={"example": "Demo@123"})

class UserRegisterRequest(BaseModel):
    username: str = Field(..., json_schema_extra={"example": "dr_sarah"})
    password: str = Field(..., json_schema_extra={"example": "SecurePass@123"})
    display_name: str = Field(..., json_schema_extra={"example": "Dr. Sarah Connor"})
    email: Optional[str] = Field(None, json_schema_extra={"example": "sarah.connor@hospital.org"})
    role: UserRoleEnum = Field(default="Radiologist")

class UserLoginResponse(BaseModel):
    status: str = "success"
    token: str
    username: str
    display_name: str
    role: UserRoleEnum
    message: str

class UserLogoutRequest(BaseModel):
    token: str
