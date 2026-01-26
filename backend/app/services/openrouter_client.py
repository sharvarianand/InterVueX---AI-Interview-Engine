"""
OpenRouter API Client
Alternative to Gemini for more reliable AI responses
"""

import httpx
from typing import Optional
from app.core.config import settings


class OpenRouterClient:
    """Client for OpenRouter API"""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "google/gemini-2.0-flash-exp:free"  # Free tier
        
    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Optional[str]:
        """Generate content using OpenRouter API"""
        
        if not self.api_key or "your_openrouter_api_key" in self.api_key:
            print("[OPENROUTER] No valid API key configured")
            return None
            
        try:
            print(f"[OPENROUTER] Sending request to {self.model}...")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://intervuex.app",  # Optional
                        "X-Title": "InterVueX AI Interview"  # Optional
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    print(f"[OPENROUTER] SUCCESS - Got response of length: {len(content)}")
                    return content
                else:
                    print(f"[OPENROUTER] ERROR: Status {response.status_code}")
                    print(f"[OPENROUTER] Response: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"[OPENROUTER] ERROR: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return None


# Global instance
openrouter_client = OpenRouterClient()
