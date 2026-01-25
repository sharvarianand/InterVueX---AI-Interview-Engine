"""
InterVueX Core Configuration

Handles environment variables and global settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    APP_NAME: str = "InterVueX AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    GITHUB_TOKEN: Optional[str] = None  # For higher rate limits
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./intervuex.db"
    
    # Supabase Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # CORS
    ALLOWED_ORIGINS: str = "*"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
