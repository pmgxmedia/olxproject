from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.models import User
from app.dependencies import get_current_active_user
from app.services import upload_image_to_cloud, upload_video_to_cloud, delete_from_cloud
from app.services import validate_image, validate_video
from typing import List, Optional


router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided",
        )
    
    content = await file.read()
    file_size = len(content)
    
    if not validate_image(file_size, file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type or size. Allowed: JPEG, PNG, WebP, GIF (max 5MB)",
        )
    
    url = await upload_image_to_cloud(content, file.filename or "image.jpg")
    
    if not url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image",
        )
    
    return JSONResponse(content={"url": url})


@router.post("/images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
):
    urls = []
    errors = []
    
    for i, file in enumerate(files):
        content = await file.read()
        
        if not validate_image(len(content), file.content_type):
            errors.append(f"File {i}: Invalid type or size")
            continue
        
        url = await upload_image_to_cloud(content, file.filename or f"image_{i}.jpg")
        if url:
            urls.append(url)
        else:
            errors.append(f"File {i}: Upload failed")
    
    return {"urls": urls, "errors": errors if errors else None}


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided",
        )
    
    content = await file.read()
    
    if not validate_video(len(content), file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type or size. Allowed: MP4, WebM, QuickTime (max 50MB)",
        )
    
    result = await upload_video_to_cloud(content, file.filename or "video.mp4")
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload video",
        )
    
    return JSONResponse(content=result)


@router.delete("")
async def delete_file(
    url: str,
    current_user: User = Depends(get_current_active_user),
):
    success = await delete_from_cloud(url)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file",
        )
    
    return {"message": "File deleted"}