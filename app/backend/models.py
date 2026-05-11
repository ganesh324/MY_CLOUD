from sqlalchemy import Column, Integer, String, Boolean, Float
from .database import Base

class FileMetadata(Base):
    # This MUST match the table name in nas_scan.sh
    __tablename__ = "files"

    # Primary key is the full path to ensure no duplicates
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    path = Column(String, unique=True, index=True)
    parent_path = Column(String, index=True)
    name = Column(String)
    extension = Column(String)
    size = Column(Integer)
    mtime = Column(Float) # Modification time from shell is a float timestamp
    last_seen = Column(Integer)
    is_dir = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False, index=True)
    
    @property
    def filename(self):
        return self.name

    @property
    def is_directory(self):
        return self.is_dir

class DashboardSummary(Base):
    __tablename__ = "dashboard_summary"

    id = Column(Integer, primary_key=True, index=True)
    total_files = Column(Integer)
    total_folders = Column(Integer)
    total_images = Column(Integer)
    total_videos = Column(Integer)
    total_music = Column(Integer)
    recent_file_ids = Column(String) # Store as comma-separated paths now