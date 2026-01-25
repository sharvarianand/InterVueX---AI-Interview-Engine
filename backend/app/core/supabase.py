from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    """Initialize and return the Supabase client."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("Supabase URL and Service Role Key must be set in environment variables")
    
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

supabase: Client = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        supabase = get_supabase()
except Exception as e:
    print(f"Failed to initialize Supabase client: {e}")
