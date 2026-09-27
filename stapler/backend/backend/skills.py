from gtts import gTTS
import base64
import io

def generate_tts_audio(text: str) -> str:
    """
    Skill: Generates an MP3 audio file from the AI's ad hook text using gTTS 
    and returns it as a base64 string for immediate dashboard playback.
    """
    try:
        tts = gTTS(text=text, lang='en', tld='com')
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return base64.b64encode(fp.read()).decode()
    except Exception as e:
        print(f"TTS Skill Error: {e}")
        return ""

def deploy_to_vercel(react_code: str, vercel_token: str = None) -> str:
    """
    Skill (Skeleton): Programmatically deploys the generated React component to Vercel.
    In a production app, this would use the Vercel REST API to push the code.
    """
    if not vercel_token:
        # Mock successful deployment URL for hackathon presentation
        return "https://stapler-fix-demo.vercel.app"
    
    # Real implementation would look like:
    # requests.post("https://api.vercel.com/v13/deployments", headers={"Authorization": f"Bearer {vercel_token}"}, json={"name": "stapler-ui", "files": [...]})
    return "https://stapler-deployed.vercel.app"
