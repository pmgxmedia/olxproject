import os
import uuid
import aiofiles
from typing import Optional
import cloudinary
import cloudinary.uploader
from app.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB


def validate_image(file_size: int, content_type: str) -> bool:
    return content_type in ALLOWED_IMAGE_TYPES and file_size <= MAX_IMAGE_SIZE


def validate_video(file_size: int, content_type: str) -> bool:
    return content_type in ALLOWED_VIDEO_TYPES and file_size <= MAX_VIDEO_SIZE


async def upload_image_to_cloud(file_data: bytes, filename: str) -> Optional[str]:
    try:
        result = cloudinary.uploader.upload(
            file_data,
            folder="tradeflex/listings",
            public_id=f"{uuid.uuid4()}",
            transformation=[
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Image upload error: {e}")
        return None


async def upload_video_to_cloud(file_data: bytes, filename: str) -> Optional[dict]:
    try:
        result = cloudinary.uploader.upload(
            file_data,
            folder="tradeflex/videos",
            resource_type="video",
            public_id=f"{uuid.uuid4()}",
            transformation=[
                {"quality": "auto", "fetch_format": "mp4"}
            ]
        )
        return {
            "url": result.get("secure_url"),
            "thumbnail": result.get("secure_url", "").replace("/video/", "/image/").replace(".mp4", ".jpg")
        }
    except Exception as e:
        print(f"Video upload error: {e}")
        return None


async def delete_from_cloud(url: str) -> bool:
    try:
        public_id = url.split("/")[-1].split(".")[0]
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Delete error: {e}")
        return False