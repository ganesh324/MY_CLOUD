from pydantic import BaseModel, computed_field
from typing import Optional, List

class FileResponse(BaseModel):
    id: int
    path: str
    parent_path: Optional[str] = ""
    name: str
    extension: str
    size: int
    mtime: float
    last_seen: int
    is_dir: bool
    is_favorite: bool = False

    @computed_field
    @property
    def filename(self) -> str:
        return self.name

    @computed_field
    @property
    def is_directory(self) -> bool:
        return self.is_dir

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    recent_files: List[FileResponse]
    favorite_folders: List[FileResponse]
    stats: dict

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    class Config:
        from_attributes = True