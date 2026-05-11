import os
import subprocess
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from . import models, database, schemas

from . import models, database
from .database import engine

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"]
VIDEO_EXTENSIONS = ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"]
MUSIC_EXTENSIONS = ["mp3", "wav", "flac", "m4a", "ogg", "aac"]

app = FastAPI(title="Eeti-NAS API")

# Enable CORS for your React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DASHBOARD ENGINE ---

def refresh_dashboard_cache(db: Session):
    """
    Calculates stats and recent files based on the SSD metadata 
    and stores them in the summary table for instant UI loading.
    """
    # 1. Clear old summary
    db.query(models.DashboardSummary).delete()

    # 2. Get 5 most recent files based on modification time (mtime)
    # We filter for items that have an extension (actual files)
    recent_items = db.query(models.FileMetadata)\
        .filter(models.FileMetadata.is_dir == False)\
        .order_by(models.FileMetadata.mtime.desc())\
        .limit(5).all()
    
    recent_paths_str = ",".join([item.path for item in recent_items])

    # 3. Calculate general counts
    file_count = db.query(models.FileMetadata).filter(models.FileMetadata.is_dir == False).count()
    folder_count = db.query(models.FileMetadata).filter(models.FileMetadata.is_dir == True).count()
    
    # 3b. Calculate category counts
    image_count = db.query(models.FileMetadata).filter(models.FileMetadata.extension.in_(IMAGE_EXTENSIONS)).count()
    video_count = db.query(models.FileMetadata).filter(models.FileMetadata.extension.in_(VIDEO_EXTENSIONS)).count()
    music_count = db.query(models.FileMetadata).filter(models.FileMetadata.extension.in_(MUSIC_EXTENSIONS)).count()

    # 4. Save to the summary table
    summary = models.DashboardSummary(
        total_files=file_count,
        total_folders=folder_count,
        total_images=image_count,
        total_videos=video_count,
        total_music=music_count,
        recent_file_ids=recent_paths_str
    )
    db.add(summary)
    db.commit()

# --- ENDPOINTS ---

@app.get("/actions/scan")
def trigger_scan(db: Session = Depends(database.get_db)):
    """
    Triggers the high-speed Shell scanner.
    This replaces the slow os.walk logic.
    """
    SCAN_SCRIPT = os.getenv("SCAN_SCRIPT", "/home/ganesh/mycloud/app/scripts/nas_scan.sh")
    
    if not os.path.exists(SCAN_SCRIPT):
        raise HTTPException(status_code=500, detail="Scanner script not found at " + SCAN_SCRIPT)

    try:
        # Run the shell script and wait for it to finish
        result = subprocess.run([SCAN_SCRIPT], capture_output=True, text=True, check=True)
        
        # Once the shell script has updated the 'files' table, refresh our dashboard cache
        refresh_dashboard_cache(db)
        
        return {
            "status": "success",
            "message": "High-speed scan and cache refresh complete",
            "details": result.stdout.strip()
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {e.stderr}")

@app.get("/dashboard/load", response_model=schemas.DashboardResponse)
def load_dashboard(db: Session = Depends(database.get_db)):
    """
    Returns pre-calculated stats and the most recent files for the React home screen.
    """
    summary = db.query(models.DashboardSummary).first()
    
    # Calculate live counts (SQL is fast enough with indices)
    total_files = db.query(models.FileMetadata).filter(models.FileMetadata.is_dir == False).count()
    total_folders = db.query(models.FileMetadata).filter(models.FileMetadata.is_dir == True).count()
    image_count = db.query(models.FileMetadata).filter(models.FileMetadata.extension.in_(IMAGE_EXTENSIONS)).count()
    video_count = db.query(models.FileMetadata).filter(models.FileMetadata.extension.in_(VIDEO_EXTENSIONS)).count()
    music_count = db.query(models.FileMetadata).filter(models.FileMetadata.extension.in_(MUSIC_EXTENSIONS)).count()

    # Calculate live sizes (bytes)
    total_size = db.query(func.sum(models.FileMetadata.size)).filter(models.FileMetadata.is_dir == False).scalar() or 0
    image_size = db.query(func.sum(models.FileMetadata.size)).filter(models.FileMetadata.extension.in_(IMAGE_EXTENSIONS)).scalar() or 0
    video_size = db.query(func.sum(models.FileMetadata.size)).filter(models.FileMetadata.extension.in_(VIDEO_EXTENSIONS)).scalar() or 0
    music_size = db.query(func.sum(models.FileMetadata.size)).filter(models.FileMetadata.extension.in_(MUSIC_EXTENSIONS)).scalar() or 0

    # Reconstruct recent file objects from the cached paths
    path_list = summary.recent_file_ids.split(",") if (summary and summary.recent_file_ids) else []
    recent_files = db.query(models.FileMetadata).filter(models.FileMetadata.path.in_(path_list)).all()

    mount_point = os.getenv("MOUNT_POINT", "/mnt/Drive1")
    favorites = db.query(models.FileMetadata)\
        .filter(models.FileMetadata.parent_path == mount_point)\
        .filter(models.FileMetadata.is_dir == True).all()

    return {
        "recent_files": recent_files,
        "favorite_folders": favorites,
        "stats": {
            "files": total_files,
            "folders": total_folders,
            "images": image_count,
            "videos": video_count,
            "music": music_count,
            "total_size": total_size,
            "image_size": image_size,
            "video_size": video_size,
            "music_size": music_size,
            "capacity_bytes": 1400 * 1024 * 1024 * 1024 # 1.4TB for display
        }
    }

@app.get("/files", response_model=List[schemas.FileResponse])
def list_files(
    path: str = os.getenv("MOUNT_POINT", "/mnt/Drive1"), 
    category: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """
    List contents of a specific directory. 
    Can be filtered by category (Images, Videos, Music, etc).
    """
    mount_point = os.getenv("MOUNT_POINT", "/mnt/Drive1")
    if not path.startswith(mount_point):
        path = mount_point

    query = db.query(models.FileMetadata)

    if category:
        if category == "Images":
            query = query.filter((models.FileMetadata.extension.in_(IMAGE_EXTENSIONS)) | (models.FileMetadata.is_dir == True))
        elif category == "Videos":
            query = query.filter((models.FileMetadata.extension.in_(VIDEO_EXTENSIONS)) | (models.FileMetadata.is_dir == True))
        elif category == "Music":
            query = query.filter((models.FileMetadata.extension.in_(MUSIC_EXTENSIONS)) | (models.FileMetadata.is_dir == True))
        elif category == "Files":
            # Files that aren't images, videos, or music, and aren't folders
            all_cat_exts = IMAGE_EXTENSIONS + VIDEO_EXTENSIONS + MUSIC_EXTENSIONS
            query = query.filter((~models.FileMetadata.extension.in_(all_cat_exts)) & (models.FileMetadata.is_dir == False) | (models.FileMetadata.is_dir == True))
        elif category == "Folders":
            query = query.filter(models.FileMetadata.is_dir == True)
    
    # If a path is provided, we usually want to see contents of THAT path
    # But if we are in a global category view, maybe we ignore path?
    # Let's assume if category is set, we show ALL items of that category in the whole drive?
    # No, the user said "drill through", so let's keep it scoped to the path if possible, 
    # OR if path is root, show all?
    # Let's follow the "drill through" literally: show items in the path that match the category + folders.
    
    items = query.filter(models.FileMetadata.parent_path == path)\
        .order_by(models.FileMetadata.name.asc())\
        .all()
        
    return items

# --- STATIC FILES (Frontend) ---
# Mount the React build directory. We do this LAST so it doesn't shadow API routes.
app.mount("/", StaticFiles(directory="/app/frontend/dist", html=True), name="static")

@app.get("/health")
def health_check():
    return {"status": "online", "storage_root": os.getenv("MOUNT_POINT", "/mnt/Drive1")}