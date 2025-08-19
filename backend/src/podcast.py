import os
import re
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
import google.generativeai as genai
from google.cloud import texttospeech

router = APIRouter()

# ======================
# GEMINI LLM HELPER
# ======================
def get_llm_response(prompt: str):
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds_path or not os.path.exists(creds_path):
        raise RuntimeError("Google credentials not found or invalid.")

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
    genai.configure()

    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        text_output = (response.text or "").strip()
        text_output = re.sub(r"^```(?:\w+)?\s*|\s*```$", "", text_output, flags=re.MULTILINE)
        return text_output
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}")

# ======================
# TTS HELPER
# ======================
def text_to_speech(text: str, filename: str):
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds_path or not os.path.exists(creds_path):
        raise RuntimeError("Google credentials not found or invalid.")

    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Neural2-C"  # Friendly male voice
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    os.makedirs("static/audio", exist_ok=True)
    path = os.path.join("static/audio", filename)
    with open(path, "wb") as out:
        out.write(response.audio_content)

    return f"/static/audio/{filename}"

# ======================
# API ROUTE
# ======================
class PodcastRequest(BaseModel):
    insights: Dict

@router.post("/podcast")
def generate_podcast(req: PodcastRequest):
    # Step 1: Turn insights into a friendly podcast script
    insights_str = "\n".join(
        f"{key}: {', '.join(val)}"
        for key, val in req.insights.items() if isinstance(val, list)
    )

    prompt = (
        "You are a friendly podcast host. Turn the following insights into an engaging spoken podcast script "
        "that feels natural and conversational, lasting around 1-2 minutes. "
        "Do not include bullet points — make it sound like a human talking.\n\n"
        f"{insights_str}"
    )

    try:
        script = get_llm_response(prompt)
    except Exception as e:
        return {"error": str(e)}

    # Step 2: Convert script to audio
    try:
        audio_filename = f"podcast_{uuid.uuid4().hex}.mp3"
        audio_url = text_to_speech(script, audio_filename)
    except Exception as e:
        return {"error": f"TTS failed: {e}", "script": script}

    return {
        "script": script,
        "audio_url": audio_url
    }
